/**
 * AI token/cost usage logging + aggregation. Every model call records a row so
 * the admin can see spend and tokens over time, by user type, and per patient.
 * Best-effort throughout: logging must never fail the thing that triggered it.
 */
import { prisma } from '@/lib/prisma'
import { MODELS, PROVIDERS, estCost, type ModelKey } from './models'

export type UsageFeature = 'chat_classify' | 'chat_reply' | 'daily' | 'weekly' | 'synth' | 'copilot'

// The table is created here on demand so this works before the migration runs.
let usageSchemaReady = false
async function ensureUsageSchema(): Promise<void> {
  if (usageSchemaReady) return
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AiUsage" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT,
    "userType" TEXT,
    "feature" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AiUsage_createdAt_idx" ON "AiUsage"("createdAt")`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AiUsage_userId_createdAt_idx" ON "AiUsage"("userId","createdAt")`)
  usageSchemaReady = true
}

// Cheap per-process cache: a user's type rarely changes within a run.
const typeCache = new Map<string, { type: string; at: number }>()
export async function userTypeFor(userId?: string | null): Promise<string> {
  if (!userId) return 'unknown'
  const c = typeCache.get(userId)
  if (c && Date.now() - c.at < 300_000) return c.type
  let type = 'free'
  try {
    const subs = await prisma.subscription.findMany({ where: { userId, status: 'ACTIVE' }, select: { trackSlug: true, category: true } })
    if (subs.some((s) => s.trackSlug === 'couples' || s.category === 'COUPLE')) type = 'couples'
    else if (subs.length) type = 'paid'
  } catch { /* default free */ }
  typeCache.set(userId, { type, at: Date.now() })
  return type
}

/** Record one model call's tokens and cost. Never throws. */
export async function recordAiUsage(
  feature: UsageFeature,
  modelKey: ModelKey,
  inp: number,
  out: number,
  userId?: string | null,
): Promise<void> {
  try {
    await ensureUsageSchema()
    const model = MODELS[modelKey]
    const userType = await userTypeFor(userId)
    await prisma.$executeRaw`
      INSERT INTO "AiUsage" ("id","userId","userType","feature","model","provider","inputTokens","outputTokens","costUsd")
      VALUES (${crypto.randomUUID()}, ${userId ?? null}, ${userType}, ${feature}, ${model}, ${PROVIDERS[modelKey]}, ${inp}, ${out}, ${estCost(model, inp, out)})`
  } catch { /* best-effort */ }
}

// ── Aggregation for the admin analytics ──────────────────────────────────────

export type Totals = { calls: number; tokens: number; cost: number }
type Row = { calls: bigint; tokens: bigint | null; cost: number | null }

async function totalsSince(days: number, userId?: string): Promise<Totals> {
  try {
    await ensureUsageSchema()
    const rows = userId
      ? await prisma.$queryRaw<Row[]>`SELECT COUNT(*) AS calls, SUM("inputTokens"+"outputTokens") AS tokens, SUM("costUsd") AS cost FROM "AiUsage" WHERE "userId" = ${userId} AND "createdAt" >= NOW() - (${days} || ' days')::interval`
      : await prisma.$queryRaw<Row[]>`SELECT COUNT(*) AS calls, SUM("inputTokens"+"outputTokens") AS tokens, SUM("costUsd") AS cost FROM "AiUsage" WHERE "createdAt" >= NOW() - (${days} || ' days')::interval`
    const r = rows[0]
    return { calls: Number(r?.calls ?? 0), tokens: Number(r?.tokens ?? 0), cost: Number(r?.cost ?? 0) }
  } catch {
    return { calls: 0, tokens: 0, cost: 0 }
  }
}

export type UsageOverview = {
  day: Totals; week: Totals; month: Totals; year: Totals
  byType: { userType: string; calls: number; tokens: number; cost: number }[]
  byFeature: { feature: string; calls: number; tokens: number; cost: number }[]
  daily: { day: string; tokens: number; cost: number }[]
  avgCostPerDay30: number
}

export async function getUsageOverview(): Promise<UsageOverview> {
  const [day, week, month, year] = await Promise.all([totalsSince(1), totalsSince(7), totalsSince(30), totalsSince(365)])
  let byType: UsageOverview['byType'] = []
  let byFeature: UsageOverview['byFeature'] = []
  let daily: UsageOverview['daily'] = []
  try {
    await ensureUsageSchema()
    const t = await prisma.$queryRaw<{ userType: string | null; calls: bigint; tokens: bigint | null; cost: number | null }[]>`
      SELECT "userType", COUNT(*) AS calls, SUM("inputTokens"+"outputTokens") AS tokens, SUM("costUsd") AS cost
      FROM "AiUsage" WHERE "createdAt" >= NOW() - INTERVAL '30 days' GROUP BY "userType" ORDER BY cost DESC NULLS LAST`
    byType = t.map((r) => ({ userType: r.userType ?? 'unknown', calls: Number(r.calls), tokens: Number(r.tokens ?? 0), cost: Number(r.cost ?? 0) }))
    const f = await prisma.$queryRaw<{ feature: string; calls: bigint; tokens: bigint | null; cost: number | null }[]>`
      SELECT "feature", COUNT(*) AS calls, SUM("inputTokens"+"outputTokens") AS tokens, SUM("costUsd") AS cost
      FROM "AiUsage" WHERE "createdAt" >= NOW() - INTERVAL '30 days' GROUP BY "feature" ORDER BY cost DESC NULLS LAST`
    byFeature = f.map((r) => ({ feature: r.feature, calls: Number(r.calls), tokens: Number(r.tokens ?? 0), cost: Number(r.cost ?? 0) }))
    const d = await prisma.$queryRaw<{ day: Date; tokens: bigint | null; cost: number | null }[]>`
      SELECT date_trunc('day', "createdAt") AS day, SUM("inputTokens"+"outputTokens") AS tokens, SUM("costUsd") AS cost
      FROM "AiUsage" WHERE "createdAt" >= NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day ASC`
    daily = d.map((r) => ({ day: r.day.toISOString().slice(0, 10), tokens: Number(r.tokens ?? 0), cost: Number(r.cost ?? 0) }))
  } catch { /* leave empty */ }
  return { day, week, month, year, byType, byFeature, daily, avgCostPerDay30: month.cost / 30 }
}

/** Tokens this user has consumed in the current calendar month (for the cap). */
export async function monthlyTokensFor(userId: string): Promise<number> {
  try {
    await ensureUsageSchema()
    const rows = await prisma.$queryRaw<{ tokens: bigint | null }[]>`
      SELECT SUM("inputTokens"+"outputTokens") AS tokens FROM "AiUsage"
      WHERE "userId" = ${userId} AND "createdAt" >= date_trunc('month', NOW())`
    return Number(rows[0]?.tokens ?? 0)
  } catch {
    return 0
  }
}

export type PatientUsage = { total: Totals; last30: Totals; avgCostPerDay: number; avgTokensPerDay: number; firstDay: string | null }

/** One patient's token/cost consumption, with a per-day average. */
export async function getPatientUsage(userId: string): Promise<PatientUsage> {
  const [total, last30] = await Promise.all([totalsSince(100000, userId), totalsSince(30, userId)])
  let firstDay: string | null = null
  let spanDays = 30
  try {
    await ensureUsageSchema()
    const rows = await prisma.$queryRaw<{ first: Date | null }[]>`SELECT MIN("createdAt") AS first FROM "AiUsage" WHERE "userId" = ${userId}`
    if (rows[0]?.first) {
      firstDay = rows[0].first.toISOString().slice(0, 10)
      spanDays = Math.max(1, Math.round((Date.now() - rows[0].first.getTime()) / 864e5))
    }
  } catch { /* ignore */ }
  return {
    total, last30,
    avgCostPerDay: total.cost / Math.max(1, spanDays),
    avgTokensPerDay: total.tokens / Math.max(1, spanDays),
    firstDay,
  }
}
