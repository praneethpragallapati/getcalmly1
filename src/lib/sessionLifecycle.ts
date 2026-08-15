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

/** Minutes the clinician must wait for a no-show patient before it's billable. */
export const NO_SHOW_WAIT_MINUTES = 15

/**
 * Ensure the presence heartbeat columns exist (self-heal, so the feature works
 * without the migration run by hand). Idempotent; a no-op once present.
 */
let presenceSchemaReady = false
export async function ensureSessionPresenceSchema(): Promise<void> {
  if (presenceSchemaReady) return
  await prisma.$executeRawUnsafe(`ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "patientLastSeenAt" TIMESTAMP(3)`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "therapistLastSeenAt" TIMESTAMP(3)`)
  presenceSchemaReady = true
}

type PresenceRow = {
  patientJoinedAt: Date | null
  therapistJoinedAt: Date | null
  patientLastSeenAt: Date | null
  therapistLastSeenAt: Date | null
}

/**
 * Real presence from the room heartbeat. "Together" time is measured from when
 * the second person joined to when the FIRST person stopped being seen (left) —
 * so a call that ends after 2 minutes measures ~2 minutes, not the whole slot.
 * lastSeen falls back to the join time when a side never sent a heartbeat, so a
 * connection that never really happened measures ~0 (and never counts as billable).
 */
export function computePresence(a: PresenceRow): {
  bothJoined: boolean
  minutesTogether: number
  clinicianJoined: boolean
  patientJoined: boolean
  clinicianWaitedMinutes: number
} {
  const pJoin = a.patientJoinedAt?.getTime() ?? null
  const tJoin = a.therapistJoinedAt?.getTime() ?? null
  const pLast = a.patientLastSeenAt?.getTime() ?? pJoin
  const tLast = a.therapistLastSeenAt?.getTime() ?? tJoin
  const bothJoined = pJoin != null && tJoin != null
  const togetherMs = bothJoined ? Math.max(0, Math.min(pLast!, tLast!) - Math.max(pJoin!, tJoin!)) : 0
  const clinicianWaitedMs = tJoin != null ? Math.max(0, (tLast! - tJoin!)) : 0
  return {
    bothJoined,
    minutesTogether: togetherMs / 60_000,
    clinicianJoined: tJoin != null,
    patientJoined: pJoin != null,
    clinicianWaitedMinutes: clinicianWaitedMs / 60_000,
  }
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
    await ensureSessionPresenceSchema()
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
        patientLastSeenAt: true, therapistLastSeenAt: true,
        therapist: { select: { clinicianType: true, specializations: true } },
      },
    })

    for (const a of due) {
      const psych = isPsychiatrist(a.therapist?.clinicianType ?? null, a.therapist?.specializations ?? [])
      const durMs = (a.durationMins || sessionDurationMins(psych)) * 60_000
      const windowEnd = a.scheduledAt.getTime() + durMs
      if (now < windowEnd) continue // session still in progress — leave it

      const minMinutes = sessionMinMinutes(psych)
      const p = computePresence(a)

      // Settlement follows the exact rules:
      //  4. both joined AND together >= min time      → COMPLETED, clinician paid, session kept
      //  2. clinician waited >= 15m, patient no-show   → COMPLETED, clinician paid, patient charged
      //  4(short). both joined but under min time       → voided & refunded (the 2-minute case)
      //  3. clinician never joined (patient did)        → voided & refunded (clinician no-show)
      //     clinician joined but bailed, patient absent  → voided & refunded
      //     neither joined (patient didn't cancel)       → patient charged, not paid
      let status: 'COMPLETED' | 'CANCELLED'
      let refund: boolean
      let stamp: string
      if (p.bothJoined && p.minutesTogether >= minMinutes) {
        status = 'COMPLETED'; refund = false
        stamp = `Auto-completed: both attended (${Math.round(p.minutesTogether)} min together)`
      } else if (p.clinicianJoined && !p.patientJoined && p.clinicianWaitedMinutes >= NO_SHOW_WAIT_MINUTES) {
        status = 'COMPLETED'; refund = false
        stamp = `Auto-completed: patient no-show, clinician waited ${Math.round(p.clinicianWaitedMinutes)} min — charged`
      } else if (p.bothJoined && p.minutesTogether < minMinutes) {
        status = 'CANCELLED'; refund = true
        stamp = `Auto-voided: only ${Math.round(p.minutesTogether)} min together (needs ${minMinutes}) — refunded`
      } else if (p.patientJoined && !p.clinicianJoined) {
        status = 'CANCELLED'; refund = true
        stamp = 'Auto-voided: clinician did not join — refunded'
      } else if (p.clinicianJoined && !p.patientJoined) {
        status = 'CANCELLED'; refund = true
        stamp = 'Auto-voided: patient no-show but clinician did not wait 15 min — refunded'
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
