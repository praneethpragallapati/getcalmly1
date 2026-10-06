/**
 * "Pulse" = the patient-facing, therapist-assigned self-report checks.
 *
 * Nothing is auto-assigned: a patient can only fill an instrument (PHQ-9,
 * GAD-7, K10, WHO-5, GAS) once a therapist has assigned it, with a frequency
 * and an optional expiry. Frequencies:
 *   DAILY / WEEKLY / FORTNIGHTLY / MONTHLY   date-based cadence
 *   EVERY / EVEN / ODD                       every / even / odd session
 *
 * Due-detection: date-based frequencies are due when the interval has elapsed
 * since the last self-report (or it was never taken). Session frequencies are
 * due when the number of qualifying sessions exceeds the number of times the
 * patient has filled it. Expired assignments are never due.
 */
import { prisma } from '@/lib/prisma'
import { ensureOutcomesSchema } from './schema'
import { INSTRUMENTS } from './instruments'
import { startOfDayIn } from '@/lib/tz'
import { userTz } from '@/lib/userTz'

// Re-exported so existing importers of these from './pulse' keep working; the
// definitions live in the client-safe pulseMeta module.
export { RECURRENCES, RECURRENCE_LABEL, ASSIGNABLE } from './pulseMeta'
export type { Recurrence } from './pulseMeta'

export type PulseAssignment = {
  id: string
  /** When it was (re)assigned: fills before this do not count toward it. */
  createdAt: Date
  patientId: string
  instrumentId: string
  recurrence: string
  expiresAt: Date | null
  therapistId: string | null
  active: boolean
}

const DAY = 86_400_000
function intervalDays(r: string): number | null {
  switch (r) {
    case 'DAILY': return 1
    case 'WEEKLY': return 7
    case 'FORTNIGHTLY': return 14
    case 'MONTHLY': return 30
    default: return null // session-based
  }
}

export async function getAssignments(patientId: string): Promise<PulseAssignment[]> {
  await ensureOutcomesSchema()
  try {
    const rows = await prisma.$queryRaw<PulseAssignment[]>`
      SELECT "id", "patientId", "instrumentId", "recurrence", "expiresAt", "therapistId", "active", "createdAt"
      FROM "PulseAssignment" WHERE "patientId" = ${patientId} AND "active" = true
      ORDER BY "createdAt" ASC`
    return rows.filter((r) => INSTRUMENTS[r.instrumentId])
  } catch {
    return []
  }
}

/** Assign (or update) a Pulse check for a patient. */
export async function assignPulse(
  patientId: string,
  instrumentId: string,
  recurrence: string,
  expiresAt: Date | null,
  therapistId: string | null,
): Promise<void> {
  await ensureOutcomesSchema()
  await prisma.$executeRaw`
    INSERT INTO "PulseAssignment" ("id","patientId","instrumentId","recurrence","expiresAt","therapistId","active","createdAt")
    VALUES (${crypto.randomUUID()}, ${patientId}, ${instrumentId}, ${recurrence}, ${expiresAt}, ${therapistId}, ${true}, ${new Date()})
    ON CONFLICT ("patientId","instrumentId")
    DO UPDATE SET "recurrence" = ${recurrence}, "expiresAt" = ${expiresAt}, "therapistId" = ${therapistId}, "active" = ${true}, "createdAt" = ${new Date()}`
}

/** Remove a Pulse assignment entirely. */
export async function removePulse(patientId: string, instrumentId: string): Promise<void> {
  await ensureOutcomesSchema()
  await prisma.$executeRaw`
    DELETE FROM "PulseAssignment" WHERE "patientId" = ${patientId} AND "instrumentId" = ${instrumentId}`
}


/**
 * Where each live assignment stands for the patient: due now, due again on a
 * date (calendar frequencies, counted from the last time it was filled), or
 * waiting for a session (session frequencies only come due once a session has
 * taken place). Shown to both sides so "assigned" never looks like "lost".
 */
export type PulseStatus = {
  instrumentId: string
  recurrence: string
  dueNow: boolean
  /** Calendar frequencies: when it is next due (ISO), if not due now. */
  nextDueIso: string | null
  /** Session frequencies: not due until after a coming session. */
  waitsForSession: boolean
}

export async function pulseSchedule(patientId: string): Promise<PulseStatus[]> {
  await ensureOutcomesSchema()
  const tz = await userTz(patientId)
  const now = Date.now()
  const assignments = (await getAssignments(patientId)).filter(
    (a) => !a.expiresAt || a.expiresAt.getTime() > now,
  )
  if (assignments.length === 0) return []

  // Every self-report time per instrument. Only fills since the check was
  // (re)assigned count: assigning a check asks for it now, whatever was filled
  // before, and its frequency runs from there.
  let fills: { scale: string; recordedAt: Date }[] = []
  try {
    fills = await prisma.$queryRaw<{ scale: string; recordedAt: Date }[]>`
      SELECT "scale", "recordedAt"
      FROM "AssessmentScore" WHERE "userId" = ${patientId} AND "source" = 'patient'`
  } catch { /* empty */ }
  const since = (a: PulseAssignment) =>
    fills.filter((f) => f.scale === a.instrumentId && f.recordedAt.getTime() >= new Date(a.createdAt).getTime())

  // Session-based frequencies count sessions held since the assignment.
  const sessionBased = assignments.some((a) => ['EVERY', 'EVEN', 'ODD'].includes(a.recurrence))
  let sessionTimes: number[] = []
  if (sessionBased) {
    try {
      sessionTimes = (await prisma.appointment.findMany({
        where: { patientId, status: { not: 'CANCELLED' }, scheduledAt: { lt: new Date() } },
        select: { scheduledAt: true },
      })).map((s) => s.scheduledAt.getTime())
    } catch { /* none */ }
  }

  const order = ['PHQ9', 'GAD7', 'K10', 'WHO5', 'GAS']
  return assignments
    .map((a) => {
      const mine = since(a)
      const days = intervalDays(a.recurrence)
      if (days != null) {
        // On the patient's own calendar: filled on the 6th, a daily check is
        // due again from midnight on the 7th, a weekly one from the 13th.
        const lastAt = mine.length ? Math.max(...mine.map((f) => f.recordedAt.getTime())) : undefined
        // Midnight (patient's zone) of the day `days` after the day it was filled;
        // stepping from that day's noon keeps daylight-saving shifts harmless.
        const next = lastAt == null ? now
          : startOfDayIn(tz, new Date(startOfDayIn(tz, new Date(lastAt)) + 12 * 3_600_000 + days * DAY))
        const dueNow = next <= now
        return { instrumentId: a.instrumentId, recurrence: a.recurrence, dueNow, nextDueIso: dueNow ? null : new Date(next).toISOString(), waitsForSession: false }
      }
      // Session-based: due when qualifying sessions (since assigned) exceed fills.
      const fillCount = mine.length
      const sessions = sessionTimes.filter((t) => t >= new Date(a.createdAt).getTime()).length
      const qualifying =
        a.recurrence === 'EVERY' ? sessions
        : a.recurrence === 'EVEN' ? Math.floor(sessions / 2)
        : Math.ceil(sessions / 2) // ODD
      const dueNow = qualifying > fillCount
      return { instrumentId: a.instrumentId, recurrence: a.recurrence, dueNow, nextDueIso: null, waitsForSession: !dueNow }
    })
    .sort((x, y) => order.indexOf(x.instrumentId) - order.indexOf(y.instrumentId))
}

/** Instrument ids the patient should complete now, most clinically important first. */
export async function dueInstruments(patientId: string): Promise<string[]> {
  return (await pulseSchedule(patientId)).filter((s) => s.dueNow).map((s) => s.instrumentId)
}
