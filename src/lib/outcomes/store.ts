/**
 * Read/write layer for outcome scores. Uses raw SQL throughout so it works
 * regardless of whether the Prisma client has been regenerated with the new
 * AssessmentScore columns yet (the schema is self-healed at runtime).
 *
 * One store, three sources: patient self-report (PROM), clinician-rated
 * (ClinRO) and derived signals — every row carries its `source`, `recordedAt`
 * and (for derived) a rules `version`, which is what makes the progress view
 * both provenance-aware and auditable.
 */
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ensureOutcomesSchema } from './schema'
import { INSTRUMENTS, bandFor } from './instruments'
import { classify, riskTier, type OutcomePoint, type OutcomeVerdict } from './classify'

export type ScoreSource = 'patient' | 'clinician' | 'derived'

/**
 * When the "note + clinician assessment" pay gate takes effect. Sessions held
 * before this instant are grandfathered (note-only), so introducing the gate
 * never retroactively un-pays already-delivered sessions.
 */
export const OUTCOMES_LAUNCH = new Date('2026-09-11T00:00:00.000Z')

export type RecordScoreInput = {
  userId: string
  scale: string
  score: number
  source: ScoreSource
  sessionId?: string | null
  version?: string | null
  recordedAt?: Date
}

/** Persist one score, computing its severity band (and risk tier for C-SSRS). */
export async function recordScore(input: RecordScoreInput): Promise<void> {
  await ensureOutcomesSchema()
  const band = bandFor(input.scale, input.score)
  const label = band?.label ?? null
  const risk = input.scale === 'CSSRS' ? riskTier(input.score).tier : null
  const id = crypto.randomUUID()
  const at = input.recordedAt ?? new Date()
  await prisma.$executeRaw`
    INSERT INTO "AssessmentScore"
      ("id", "userId", "scale", "score", "label", "source", "sessionId", "band", "riskTier", "version", "recordedAt")
    VALUES
      (${id}, ${input.userId}, ${input.scale}, ${Math.round(input.score)}, ${label},
       ${input.source}, ${input.sessionId ?? null}, ${label}, ${risk}, ${input.version ?? null}, ${at})`
}

type ScoreRow = { scale: string; score: number; recordedAt: Date; source: string | null }

/** All scores for a patient, oldest first, grouped by instrument id. */
export async function getSeries(userId: string): Promise<Map<string, OutcomePoint[]>> {
  await ensureOutcomesSchema()
  const out = new Map<string, OutcomePoint[]>()
  try {
    const rows = await prisma.$queryRaw<ScoreRow[]>`
      SELECT "scale", "score", "recordedAt", "source"
      FROM "AssessmentScore"
      WHERE "userId" = ${userId}
      ORDER BY "recordedAt" ASC`
    for (const r of rows) {
      const list = out.get(r.scale) ?? []
      list.push({ score: r.score, recordedAt: r.recordedAt.toISOString(), source: r.source ?? 'patient' })
      out.set(r.scale, list)
    }
  } catch (e) {
    console.error('[getSeries] failed', e)
  }
  return out
}

export type InstrumentProgress = {
  instrumentId: string
  verdict: OutcomeVerdict
  series: OutcomePoint[]
  /** Whose data this is, for the provenance badge. */
  source: string
  lastUpdated: string | null
}

/** The full outcome picture for one patient: a verdict + series per instrument
 *  that has data, most-recently-updated first. */
export async function getOutcomeState(userId: string): Promise<InstrumentProgress[]> {
  const series = await getSeries(userId)
  const items: InstrumentProgress[] = []
  for (const [scale, points] of series) {
    if (!INSTRUMENTS[scale] || points.length === 0) continue
    items.push({
      instrumentId: scale,
      verdict: classify(scale, points),
      series: points,
      source: points[points.length - 1].source,
      lastUpdated: points[points.length - 1].recordedAt,
    })
  }
  items.sort((a, b) => (b.lastUpdated ?? '').localeCompare(a.lastUpdated ?? ''))
  return items
}

/**
 * Which of these sessions already have at least one clinician-recorded
 * assessment. Drives the "note + assessment" pay gate.
 */
export async function sessionsWithClinicianAssessment(sessionIds: string[]): Promise<Set<string>> {
  const set = new Set<string>()
  if (sessionIds.length === 0) return set
  await ensureOutcomesSchema()
  try {
    const rows = await prisma.$queryRaw<{ sessionId: string }[]>`
      SELECT DISTINCT "sessionId" FROM "AssessmentScore"
      WHERE "source" = 'clinician' AND "sessionId" IN (${Prisma.join(sessionIds)})`
    for (const r of rows) if (r.sessionId) set.add(r.sessionId)
  } catch (e) {
    console.error('[sessionsWithClinicianAssessment] failed', e)
  }
  return set
}

/** True if this one session has a clinician assessment on file. */
export async function hasClinicianAssessment(sessionId: string): Promise<boolean> {
  const set = await sessionsWithClinicianAssessment([sessionId])
  return set.has(sessionId)
}
