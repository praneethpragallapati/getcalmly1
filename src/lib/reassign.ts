/**
 * Clinician-departure handling. When a therapist is deactivated or removed, or a
 * patient is manually reassigned, their patients must not be left stranded:
 *   - every patient assigned to the old clinician is moved onto a new fit
 *     clinician for each affected care type (or cleared to "being matched" when
 *     no replacement exists), and
 *   - all of that patient's UPCOMING sessions with the old clinician are
 *     cancelled, with each reserved session restored to its package wallet so the
 *     patient never loses a paid session because their clinician left.
 */
import { prisma } from '@/lib/prisma'
import { matchAndAssignForTrack, type CareTrack } from '@/lib/matching'

const COL: Record<CareTrack, 'assignedTherapistIndividualId' | 'assignedTherapistCouplesId' | 'assignedTherapistPsychiatryId'> = {
  therapy: 'assignedTherapistIndividualId',
  couples: 'assignedTherapistCouplesId',
  psychiatry: 'assignedTherapistPsychiatryId',
}

/**
 * Cancel UPCOMING (future, non-terminal) sessions with a therapist — for one
 * patient, or for all their patients when patientUserId is omitted — restoring
 * each consumed session to its package. Returns how many were cancelled.
 */
export async function cancelUpcomingWithTherapist(therapistProfileId: string, patientUserId?: string): Promise<number> {
  try {
    const appts = await prisma.appointment.findMany({
      where: {
        therapistId: therapistProfileId,
        ...(patientUserId ? { patientId: patientUserId } : {}),
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        scheduledAt: { gte: new Date() },
      },
      select: { id: true, consumedSubscriptionId: true },
    })
    for (const a of appts) {
      await prisma.$transaction([
        prisma.appointment.update({ where: { id: a.id }, data: { status: 'CANCELLED', consumedSubscriptionId: null } }),
        ...(a.consumedSubscriptionId
          ? [prisma.subscription.updateMany({ where: { id: a.consumedSubscriptionId, sessionsUsed: { gt: 0 } }, data: { sessionsUsed: { decrement: 1 } } })]
          : []),
      ])
    }
    return appts.length
  } catch (e) {
    console.error('[cancelUpcomingWithTherapist] failed', e)
    return 0
  }
}

/**
 * A therapist is going inactive / being removed: move every patient assigned to
 * them onto a new fit clinician (per affected care type) and cancel all their
 * upcoming sessions. Call this AFTER the therapist has been marked inactive (or
 * with it excluded) so the re-matcher can't pick the departing clinician again.
 */
export async function reassignAwayFromTherapist(therapistProfileId: string): Promise<{ patients: number; cancelled: number }> {
  const [profiles, subs] = await Promise.all([
    prisma.patientProfile.findMany({
      where: {
        OR: [
          { assignedTherapistId: therapistProfileId },
          { assignedTherapistIndividualId: therapistProfileId },
          { assignedTherapistCouplesId: therapistProfileId },
          { assignedTherapistPsychiatryId: therapistProfileId },
        ],
      },
      select: {
        userId: true,
        assignedTherapistId: true,
        assignedTherapistIndividualId: true,
        assignedTherapistCouplesId: true,
        assignedTherapistPsychiatryId: true,
      },
    }),
    prisma.subscription.findMany({ where: { therapistId: therapistProfileId, status: 'ACTIVE' }, select: { userId: true, trackSlug: true } }),
  ])

  const affected = new Map<string, Set<CareTrack>>()
  const globalUsers = new Set<string>()
  const add = (uid: string, t: CareTrack) => {
    const s = affected.get(uid) ?? new Set<CareTrack>()
    s.add(t)
    affected.set(uid, s)
  }
  for (const p of profiles) {
    if (p.assignedTherapistIndividualId === therapistProfileId) add(p.userId, 'therapy')
    if (p.assignedTherapistCouplesId === therapistProfileId) add(p.userId, 'couples')
    if (p.assignedTherapistPsychiatryId === therapistProfileId) add(p.userId, 'psychiatry')
    if (p.assignedTherapistId === therapistProfileId) { globalUsers.add(p.userId); add(p.userId, 'therapy') }
  }
  for (const s of subs) {
    if (s.trackSlug === 'therapy' || s.trackSlug === 'couples' || s.trackSlug === 'psychiatry') add(s.userId, s.trackSlug)
  }

  let cancelled = 0
  for (const [userId, tracks] of affected) {
    if (globalUsers.has(userId)) {
      await prisma.patientProfile.update({ where: { userId }, data: { assignedTherapistId: null } }).catch(() => {})
    }
    for (const track of tracks) {
      // Re-match a NEW fit clinician; the departing one is excluded (it's inactive
      // by the time we run). matchAndAssignForTrack overwrites the per-type column
      // and the package's attached expert with the new match.
      const matched = await matchAndAssignForTrack(userId, track)
      if (!matched) {
        // No replacement available — clear the dangling pointer so the care team
        // shows "being matched" instead of a departed clinician.
        await prisma.patientProfile.update({ where: { userId }, data: { [COL[track]]: null } }).catch(() => {})
        await prisma.subscription.updateMany({
          where: { userId, trackSlug: track, status: 'ACTIVE', therapistId: therapistProfileId },
          data: { therapistId: null },
        }).catch(() => {})
      }
    }
    cancelled += await cancelUpcomingWithTherapist(therapistProfileId, userId)
  }

  // Safety net: cancel any remaining upcoming sessions with this therapist that
  // weren't tied to an assignment record (e.g. appointment-only history).
  cancelled += await cancelUpcomingWithTherapist(therapistProfileId)
  return { patients: affected.size, cancelled }
}
