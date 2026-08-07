/**
 * Session duration + settlement rules.
 *
 * Slot / duration:
 *   - Therapy & couples sessions run 45 minutes (booked in 1-hour slots).
 *   - Psychiatry sessions run 30 minutes (booked in 30-minute slots).
 *
 * Minimum billable time (the clinician is paid only once this much has elapsed
 * from when they joined):
 *   - 30 minutes for therapy / couples
 *   - 10 minutes for psychiatry
 *
 * When a session's window has fully elapsed and it was never manually completed,
 * resolveDueAppointments() settles it automatically:
 *   - clinician present ≥ minimum      → COMPLETED, clinician paid, session kept
 *     (this also covers a patient no-show where the clinician still waited)
 *   - clinician joined but under the minimum → refunded, not paid
 *   - clinician never joined (patient did)   → refunded, not paid (clinician no-show)
 *   - neither joined (patient didn't cancel) → session kept (patient charged), not paid
 */
import { prisma } from '@/lib/prisma'
import { isPsychiatrist } from '@/lib/clinicianScope'

/** How long a session runs, by clinician kind. */
export function sessionDurationMins(psych: boolean): number {
  return psych ? 30 : 45
}

/** Minimum minutes a clinician must be present before the session is billable. */
export function sessionMinMinutes(psych: boolean): number {
  return psych ? 10 : 30
}

/**
 * Settle every appointment whose scheduled window has fully elapsed but which is
 * still in a live (non-terminal) state. Idempotent — resolved sessions become
 * terminal (COMPLETED / CANCELLED) and are skipped next time. Scope it to a
 * patient or a clinician so a page only settles its own sessions. Never throws.
 */
export async function resolveDueAppointments(scope: { patientId?: string; therapistId?: string }): Promise<void> {
  if (!scope.patientId && !scope.therapistId) return
  try {
    const now = Date.now()
    const due = await prisma.appointment.findMany({
      where: {
        ...(scope.patientId ? { patientId: scope.patientId } : {}),
        ...(scope.therapistId ? { therapistId: scope.therapistId } : {}),
        status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] },
        scheduledAt: { lt: new Date() },
      },
      select: {
        id: true, scheduledAt: true, durationMins: true, notes: true,
        patientJoinedAt: true, therapistJoinedAt: true, endedAt: true, consumedSubscriptionId: true,
        therapist: { select: { clinicianType: true, specializations: true } },
      },
    })

    for (const a of due) {
      const psych = isPsychiatrist(a.therapist?.clinicianType ?? null, a.therapist?.specializations ?? [])
      const durMs = (a.durationMins || sessionDurationMins(psych)) * 60_000
      const windowEnd = a.scheduledAt.getTime() + durMs
      if (now < windowEnd) continue // session still in progress — leave it

      const thresholdMs = sessionMinMinutes(psych) * 60_000
      const endRef = a.endedAt ? a.endedAt.getTime() : windowEnd
      const therJoin = a.therapistJoinedAt?.getTime() ?? null
      const patJoined = Boolean(a.patientJoinedAt)
      const therapistMetTime = therJoin != null && endRef - therJoin >= thresholdMs

      let status: 'COMPLETED' | 'CANCELLED'
      let refund: boolean
      let stamp: string
      if (therJoin != null && therapistMetTime) {
        status = 'COMPLETED'; refund = false
        stamp = patJoined ? 'Auto-completed: both attended' : 'Auto-completed: patient no-show, clinician waited — charged'
      } else if (therJoin != null && !therapistMetTime) {
        status = 'CANCELLED'; refund = true
        stamp = 'Auto-voided: under the minimum billable time — refunded'
      } else if (therJoin == null && patJoined) {
        status = 'CANCELLED'; refund = true
        stamp = 'Auto-voided: clinician did not join — refunded'
      } else {
        status = 'CANCELLED'; refund = false
        stamp = 'No-show: neither party joined — patient charged (not cancelled in time)'
      }

      const note = `[${new Date().toISOString().slice(0, 10)} ${stamp}]`
      await prisma.$transaction([
        prisma.appointment.update({
          where: { id: a.id },
          data: {
            status,
            endedAt: a.endedAt ?? new Date(windowEnd),
            notes: a.notes ? `${a.notes}\n${note}` : note,
            ...(refund ? { consumedSubscriptionId: null } : {}),
          },
        }),
        ...(refund && a.consumedSubscriptionId
          ? [prisma.subscription.updateMany({ where: { id: a.consumedSubscriptionId, sessionsUsed: { gt: 0 } }, data: { sessionsUsed: { decrement: 1 } } })]
          : []),
      ])
    }
  } catch (e) {
    console.error('[resolveDueAppointments] failed', e)
  }
}
