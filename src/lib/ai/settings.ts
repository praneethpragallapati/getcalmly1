/**
 * Admin-configurable AI settings: which features run for which user type, which
 * model each feature uses (including the two chatbot calls — classification and
 * reply, the reply split by routine vs high-stake and by user type), the daily
 * chat limit, and a monthly token cap. Stored as one JSON row; runtime reads it
 * through getAiConfig() and falls back to code defaults when unset.
 */
import { prisma } from '@/lib/prisma'
import { MODELS, type ModelKey } from './models'
import { userTypeFor } from './usage'

export type UserType = 'free' | 'paid' | 'couples'
export const USER_TYPES: UserType[] = ['free', 'paid', 'couples']
export type FeatureKey = 'chatbot' | 'daily' | 'weekly' | 'synthesizer' | 'copilot'
export const FEATURE_KEYS: FeatureKey[] = ['chatbot', 'daily', 'weekly', 'synthesizer', 'copilot']
export const MODEL_KEYS = Object.keys(MODELS) as ModelKey[]

export type AiConfig = {
  features: Record<UserType, Record<FeatureKey, boolean>>
  models: {
    classifier: ModelKey
    chatReply: Record<UserType, { routine: ModelKey; highStake: ModelKey }>
    daily: ModelKey
    weekly: ModelKey
    synthesizer: ModelKey
    copilot: ModelKey
  }
  limits: {
    chatsPerDay: Record<UserType, number>       // 0 = unlimited
    monthlyTokenCap: Record<UserType, number>   // 0 = unlimited
  }
}

const allOn = (): Record<FeatureKey, boolean> => ({ chatbot: true, daily: true, weekly: true, synthesizer: true, copilot: true })

/** Defaults mirror the current hardcoded routing: nano everywhere, Sonnet for
 *  high-stake chat and the weekly insight. */
export const DEFAULT_AI_CONFIG: AiConfig = {
  features: { free: allOn(), paid: allOn(), couples: allOn() },
  models: {
    classifier: 'nano',
    chatReply: {
      free: { routine: 'nano', highStake: 'sonnet' },
      paid: { routine: 'nano', highStake: 'sonnet' },
      couples: { routine: 'nano', highStake: 'sonnet' },
    },
    daily: 'nano', weekly: 'sonnet', synthesizer: 'nano', copilot: 'nano',
  },
  limits: {
    chatsPerDay: { free: 10, paid: 0, couples: 0 },
    monthlyTokenCap: { free: 0, paid: 0, couples: 0 },
  },
}

let schemaReady = false
async function ensureSchema(): Promise<void> {
  if (schemaReady) return
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AiSettings" ("id" TEXT PRIMARY KEY, "config" JSONB NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  schemaReady = true
}

const isModel = (m: unknown): m is ModelKey => typeof m === 'string' && (MODEL_KEYS as string[]).includes(m)

/** Deep-merge a stored (possibly partial / older) config over the defaults, and
 *  coerce any invalid model id back to its default so runtime never breaks. */
function coerce(raw: unknown): AiConfig {
  const d = DEFAULT_AI_CONFIG
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<AiConfig>
  const feat = (t: UserType) => ({ ...allOn(), ...(r.features?.[t] ?? {}) })
  const reply = (t: UserType) => ({
    routine: isModel(r.models?.chatReply?.[t]?.routine) ? r.models!.chatReply![t]!.routine : d.models.chatReply[t].routine,
    highStake: isModel(r.models?.chatReply?.[t]?.highStake) ? r.models!.chatReply![t]!.highStake : d.models.chatReply[t].highStake,
  })
  const numOr = (v: unknown, def: number) => (typeof v === 'number' && v >= 0 ? Math.round(v) : def)
  return {
    features: { free: feat('free'), paid: feat('paid'), couples: feat('couples') },
    models: {
      classifier: isModel(r.models?.classifier) ? r.models!.classifier : d.models.classifier,
      chatReply: { free: reply('free'), paid: reply('paid'), couples: reply('couples') },
      daily: isModel(r.models?.daily) ? r.models!.daily : d.models.daily,
      weekly: isModel(r.models?.weekly) ? r.models!.weekly : d.models.weekly,
      synthesizer: isModel(r.models?.synthesizer) ? r.models!.synthesizer : d.models.synthesizer,
      copilot: isModel(r.models?.copilot) ? r.models!.copilot : d.models.copilot,
    },
    limits: {
      chatsPerDay: { free: numOr(r.limits?.chatsPerDay?.free, d.limits.chatsPerDay.free), paid: numOr(r.limits?.chatsPerDay?.paid, d.limits.chatsPerDay.paid), couples: numOr(r.limits?.chatsPerDay?.couples, d.limits.chatsPerDay.couples) },
      monthlyTokenCap: { free: numOr(r.limits?.monthlyTokenCap?.free, 0), paid: numOr(r.limits?.monthlyTokenCap?.paid, 0), couples: numOr(r.limits?.monthlyTokenCap?.couples, 0) },
    },
  }
}

let cache: { cfg: AiConfig; at: number } | null = null
export async function getAiConfig(): Promise<AiConfig> {
  if (cache && Date.now() - cache.at < 60_000) return cache.cfg
  try {
    await ensureSchema()
    const rows = await prisma.$queryRaw<{ config: unknown }[]>`SELECT "config" FROM "AiSettings" WHERE "id" = 'singleton' LIMIT 1`
    const cfg = coerce(rows[0]?.config)
    cache = { cfg, at: Date.now() }
    return cfg
  } catch {
    return DEFAULT_AI_CONFIG
  }
}

/** The user's type as a valid config key (unknown -> free), for indexing config. */
export async function configTypeFor(userId?: string | null): Promise<UserType> {
  const t = await userTypeFor(userId)
  return t === 'paid' || t === 'couples' ? t : 'free'
}

export async function setAiConfig(input: unknown): Promise<void> {
  await ensureSchema()
  const cfg = coerce(input)
  await prisma.$executeRaw`
    INSERT INTO "AiSettings" ("id","config","updatedAt") VALUES ('singleton', ${cfg as object}::jsonb, NOW())
    ON CONFLICT ("id") DO UPDATE SET "config" = ${cfg as object}::jsonb, "updatedAt" = NOW()`
  cache = { cfg, at: Date.now() }
}
