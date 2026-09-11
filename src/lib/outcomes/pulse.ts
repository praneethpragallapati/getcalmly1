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

// Re-exported so existing importers of these from './pulse' keep working; the
// definitions live in the client-safe pulseMeta module.
export { RECURRENCES, RECURRENCE_LABEL, ASSIGNABLE } from './pulseMeta'
export type { Recurrence } from './pulseMeta'

export type PulseAssignment = {
  id: string
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
      SELECT "id", "patientId", "instrumentId", "recurrence", "expiresAt", "therapistId", "active"
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
    INSERT INTO "PulseAssignment" ("id","patientId","instrumentId","recurrence","expiresAt","therapistId","active")
    VALUES (${crypto.randomUUID()}, ${patientId}, ${instrumentId}, ${recurrence}, ${expiresAt}, ${therapistId}, ${true})
    ON CONFLICT ("patientId","instrumentId")
    DO UPDATE SET "recurrence" = ${recurrence}, "expiresAt" = ${expiresAt}, "therapistId" = ${therapistId}, "active" = ${true}`
}

/** Remove a Pulse assignment entirely. */
export async function removePulse(patientId: string, instrumentId: string): Promise<void> {
  await ensureOutcomesSchema()
  await prisma.$executeRaw`
    DELETE FROM "PulseAssignment" WHERE "patientId" = ${patientId} AND "instrumentId" = ${instrumentId}`
}

type FillRow = { scale: string; cnt: number; recordedAt: Date }

/** Instrument ids the patient should complete now, most clinically important first. */
export async function dueInstruments(patientId: string): Promise<string[]> {
  await ensureOutcomesSchema()
  const now = Date.now()
  const assignments = (await getAssignments(patientId)).filter(
    (a) => !a.expiresAt || a.expiresAt.getTime() > now,
  )
  if (assignments.length === 0) return []

  // Last self-report time and total fills per instrument.
  let fills: FillRow[] = []
  try {
    fills = await prisma.$queryRaw<FillRow[]>`
      SELECT "scale", COUNT(*)::int AS "cnt", MAX("recordedAt") AS "recordedAt"
      FROM "AssessmentScore" WHERE "userId" = ${patientId} AND "source" = 'patient'
      GROUP BY "scale"`
  } catch { /* empty */ }
  const lastBy = new Map(fills.map((f) => [f.scale, f.recordedAt.getTime()]))
  const cntBy = new Map(fills.map((f) => [f.scale, Number(f.cnt)]))

  // Session count only needed for session-based frequencies.
  const sessionBased = assignments.some((a) => ['EVERY', 'EVEN', 'ODD'].includes(a.recurrence))
  let sessions = 0
  if (sessionBased) {
    try {
      sessions = await prisma.appointment.count({
        where: { patientId, status: { not: 'CANCELLED' }, scheduledAt: { lt: new Date() } },
      })
    } catch { /* leave 0 */ }
  }

  const order = ['PHQ9', 'GAD7', 'K10', 'WHO5', 'GAS']
  const due = assignments
    .filter((a) => {
      const fillCount = cntBy.get(a.instrumentId) ?? 0
      const days = intervalDays(a.recurrence)
      if (days != null) {
        const lastAt = lastBy.get(a.instrumentId)
        return lastAt == null || now - lastAt >= days * DAY
      }
      // Session-based: due when qualifying sessions exceed fills.
      const qualifying =
        a.recurrence === 'EVERY' ? sessions
        : a.recurrence === 'EVEN' ? Math.floor(sessions / 2)
        : Math.ceil(sessions / 2) // ODD
      return qualifying > fillCount
    })
    .map((a) => a.instrumentId)
  return due.sort((x, y) => order.indexOf(x) - order.indexOf(y))
}
