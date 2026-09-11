/**
 * "Pulse" = the patient-facing, therapist-scheduled self-report checks.
 *
 * A Pulse assignment says "this patient should complete instrument X on this
 * cadence." The cadence vocabulary mirrors the existing FormAutoRule so the two
 * feel consistent:
 *   EVERY      every session (~weekly)
 *   EVEN/ODD   even / odd numbered sessions
 *   ONCE       once, at a specific session number
 *   EVERY_N    at baseline and every N sessions (sessionNumber holds N)
 *   BIWEEKLY   every 14 days, by date
 *   WEEKLY     weekly, on a chosen weekday
 *
 * Defaults follow the CHO Outcome-Measurement spec: PHQ-9 and GAD-7 at baseline
 * and roughly every 4th session; WHO-5 biweekly. K10 and GAS are opt-in, added
 * by the clinician when relevant.
 *
 * Due-detection is date-based (a pragmatic proxy for session cadence): an
 * instrument is due if it has never been taken, or the interval for its
 * recurrence has elapsed since the last score. Exact session linkage is set
 * when a score is recorded against a session.
 */
import { prisma } from '@/lib/prisma'
import { notify } from '@/lib/notifications'
import { ensureOutcomesSchema } from './schema'
import { INSTRUMENTS } from './instruments'

export type Recurrence = 'EVERY' | 'EVEN' | 'ODD' | 'ONCE' | 'EVERY_N' | 'BIWEEKLY' | 'WEEKLY'

export type PulseAssignment = {
  id: string
  patientId: string
  instrumentId: string
  recurrence: Recurrence
  sessionNumber: number | null
  weekday: number | null
  therapistId: string | null
  active: boolean
}

const DEFAULTS: Array<{ instrumentId: string; recurrence: Recurrence; sessionNumber: number | null }> = [
  { instrumentId: 'PHQ9', recurrence: 'EVERY_N', sessionNumber: 4 },
  { instrumentId: 'GAD7', recurrence: 'EVERY_N', sessionNumber: 4 },
  { instrumentId: 'WHO5', recurrence: 'BIWEEKLY', sessionNumber: null },
]

/** How many days before a recurrence is "due" again. */
function intervalDays(a: Pick<PulseAssignment, 'recurrence' | 'sessionNumber'>): number {
  switch (a.recurrence) {
    case 'EVERY': return 7
    case 'EVEN':
    case 'ODD': return 14
    case 'EVERY_N': return Math.max(1, a.sessionNumber ?? 4) * 7
    case 'BIWEEKLY': return 14
    case 'WEEKLY': return 7
    case 'ONCE': return Number.POSITIVE_INFINITY // only when never taken
    default: return 14
  }
}

export async function getAssignments(patientId: string): Promise<PulseAssignment[]> {
  await ensureOutcomesSchema()
  try {
    const rows = await prisma.$queryRaw<PulseAssignment[]>`
      SELECT "id", "patientId", "instrumentId", "recurrence", "sessionNumber", "weekday", "therapistId", "active"
      FROM "PulseAssignment" WHERE "patientId" = ${patientId} AND "active" = true`
    return rows.filter((r) => INSTRUMENTS[r.instrumentId])
  } catch {
    return []
  }
}

/** Seed the CHO default schedule the first time a patient has none. */
export async function seedDefaultAssignments(patientId: string, therapistId: string | null): Promise<void> {
  await ensureOutcomesSchema()
  const existing = await getAssignments(patientId)
  if (existing.length > 0) return
  for (const d of DEFAULTS) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "PulseAssignment" ("id","patientId","instrumentId","recurrence","sessionNumber","weekday","therapistId","active")
        VALUES (${crypto.randomUUID()}, ${patientId}, ${d.instrumentId}, ${d.recurrence}, ${d.sessionNumber}, ${null}, ${therapistId}, ${true})
        ON CONFLICT ("patientId","instrumentId") DO NOTHING`
    } catch { /* best-effort */ }
  }
  // Let the patient know their check-ins are ready, so it also lands in the
  // notifications list, not only on the Pulse page.
  await notify(patientId, {
    type: 'form',
    title: 'Your check-ins are ready',
    body: 'Take your first Pulse to start tracking how you are doing over time.',
    href: '/app/pulse',
  }).catch(() => {})
}

export async function upsertAssignment(a: Omit<PulseAssignment, 'id' | 'active'> & { active?: boolean }): Promise<void> {
  await ensureOutcomesSchema()
  await prisma.$executeRaw`
    INSERT INTO "PulseAssignment" ("id","patientId","instrumentId","recurrence","sessionNumber","weekday","therapistId","active")
    VALUES (${crypto.randomUUID()}, ${a.patientId}, ${a.instrumentId}, ${a.recurrence}, ${a.sessionNumber ?? null}, ${a.weekday ?? null}, ${a.therapistId ?? null}, ${a.active ?? true})
    ON CONFLICT ("patientId","instrumentId")
    DO UPDATE SET "recurrence" = ${a.recurrence}, "sessionNumber" = ${a.sessionNumber ?? null}, "weekday" = ${a.weekday ?? null}, "active" = ${a.active ?? true}`
}

export async function setAssignmentActive(patientId: string, instrumentId: string, active: boolean): Promise<void> {
  await ensureOutcomesSchema()
  await prisma.$executeRaw`
    UPDATE "PulseAssignment" SET "active" = ${active}
    WHERE "patientId" = ${patientId} AND "instrumentId" = ${instrumentId}`
}

type LastRow = { scale: string; recordedAt: Date }

/** Instrument ids the patient should complete now, most clinically important first. */
export async function dueInstruments(patientId: string): Promise<string[]> {
  await ensureOutcomesSchema()
  const assignments = await getAssignments(patientId)
  if (assignments.length === 0) return []
  let last: LastRow[] = []
  try {
    last = await prisma.$queryRaw<LastRow[]>`
      SELECT "scale", MAX("recordedAt") AS "recordedAt"
      FROM "AssessmentScore" WHERE "userId" = ${patientId} AND "source" = 'patient'
      GROUP BY "scale"`
  } catch { /* table may be empty */ }
  const lastBy = new Map(last.map((r) => [r.scale, r.recordedAt.getTime()]))
  const now = Date.now()
  const order = ['PHQ9', 'GAD7', 'K10', 'WHO5', 'GAS']
  const due = assignments
    .filter((a) => {
      const lastAt = lastBy.get(a.instrumentId)
      if (lastAt == null) return true // never taken
      const days = intervalDays(a)
      if (!Number.isFinite(days)) return false // ONCE, already taken
      return now - lastAt >= days * 86_400_000
    })
    .map((a) => a.instrumentId)
  return due.sort((x, y) => order.indexOf(x) - order.indexOf(y))
}
