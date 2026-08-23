import { prisma } from '@/lib/prisma'
import { clinicianMatchesTrack, type CareTrack } from '@/lib/clinicianScope'

/**
 * Which care types a clinician is actually responsible for, per patient.
 *
 * A patient can hold several packages at once — individual therapy, couples,
 * psychiatry — each usually delivered by a different person. Showing all of
 * them to every clinician means a psychiatrist reads "16 sessions left" off a
 * therapy package they will never deliver a session from, and a couples
 * therapist reads a number that has nothing to do with the couple in front of
 * them. Neither can act on it and both can be misled by it.
 *
 * So the clinician's view is scoped to the care types they are on the hook for
 * with THIS patient, and a clinician who does two — individual and couples —
 * sees both, separately, rather than one sum that hides which is which. An
 * admin is the exception and keeps the whole picture: they are the one who has
 * to reconcile it.
 *
 * Responsibility is read from the record rather than guessed, in three ways:
 *
 *   1. The admin assigned them for that care type (the per-type columns on
 *      PatientProfile).
 *   2. A package of that type is attached to them.
 *   3. They have delivered a session that drew on a package of that type.
 *
 * Only when none of those says anything does it fall back to what this
 * clinician could deliver at all — a psychiatrist to psychiatry, a couples
 * therapist to couples and individual, anyone else to individual. That case is
 * a patient assigned to them with nothing bought yet, where showing the care
 * types they work in is the honest answer.
 */

const TRACKS: CareTrack[] = ['therapy', 'couples', 'psychiatry']

/** The assignment column that names the clinician for each care type. */
const COLUMN_TRACK: { column: 'assignedTherapistIndividualId' | 'assignedTherapistCouplesId' | 'assignedTherapistPsychiatryId'; track: CareTrack }[] = [
  { column: 'assignedTherapistIndividualId', track: 'therapy' },
  { column: 'assignedTherapistCouplesId', track: 'couples' },
  { column: 'assignedTherapistPsychiatryId', track: 'psychiatry' },
]

function asTrack(slug: string): CareTrack | null {
  return (TRACKS as string[]).includes(slug) ? (slug as CareTrack) : null
}

/**
 * Care types this clinician covers for each of these patients. Patients with
 * nothing recorded get the fallback set, so the map always has an entry for
 * every id passed in.
 */
export async function tracksForClinicianOnPatients(
  therapistProfileId: string,
  patientIds: string[],
): Promise<Map<string, Set<CareTrack>>> {
  const out = new Map<string, Set<CareTrack>>(patientIds.map((id) => [id, new Set<CareTrack>()]))
  if (patientIds.length === 0) return out
  const add = (patientId: string, track: CareTrack | null) => {
    if (!track) return
    out.get(patientId)?.add(track)
  }

  // 1. Assigned for that care type.
  try {
    const rows = await prisma.patientProfile.findMany({
      where: { userId: { in: patientIds } },
      select: {
        userId: true,
        assignedTherapistIndividualId: true,
        assignedTherapistCouplesId: true,
        assignedTherapistPsychiatryId: true,
      },
    })
    for (const r of rows) {
      for (const { column, track } of COLUMN_TRACK) {
        if (r[column] === therapistProfileId) add(r.userId, track)
      }
    }
  } catch { /* 0016 not applied — the other two signals still stand */ }

  // 2. A package of that type is attached to them, and 3. sessions they
  //    delivered that drew on one. Both read the package's own track, so
  //    neither depends on guessing a care type from a job title.
  const subs = await prisma.subscription
    .findMany({
      where: { userId: { in: patientIds } },
      select: { id: true, userId: true, trackSlug: true, therapistId: true },
    })
    .catch(() => [] as { id: string; userId: string; trackSlug: string; therapistId: string | null }[])

  const subById = new Map(subs.map((s) => [s.id, s]))
  for (const s of subs) {
    if (s.therapistId === therapistProfileId) add(s.userId, asTrack(s.trackSlug))
  }

  const delivered = await prisma.appointment
    .findMany({
      where: {
        therapistId: therapistProfileId,
        patientId: { in: patientIds },
        consumedSubscriptionId: { not: null },
      },
      select: { patientId: true, consumedSubscriptionId: true },
      distinct: ['consumedSubscriptionId'],
    })
    .catch(() => [] as { patientId: string; consumedSubscriptionId: string | null }[])
  for (const a of delivered) {
    const s = a.consumedSubscriptionId ? subById.get(a.consumedSubscriptionId) : undefined
    if (s) add(a.patientId, asTrack(s.trackSlug))
  }

  // Fallback for anyone the record says nothing about.
  const unknown = patientIds.filter((id) => (out.get(id)?.size ?? 0) === 0)
  if (unknown.length > 0) {
    const me = await prisma.therapistProfile
      .findUnique({ where: { id: therapistProfileId }, select: { clinicianType: true, specializations: true } })
      .catch(() => null)
    const canDeliver = TRACKS.filter((t) => clinicianMatchesTrack(me?.clinicianType ?? null, me?.specializations ?? [], t))
    for (const id of unknown) out.set(id, new Set(canDeliver))
  }

  return out
}

/** The single-patient case. */
export async function tracksForClinicianOnPatient(
  therapistProfileId: string,
  patientId: string,
): Promise<Set<CareTrack>> {
  const map = await tracksForClinicianOnPatients(therapistProfileId, [patientId])
  return map.get(patientId) ?? new Set<CareTrack>()
}
