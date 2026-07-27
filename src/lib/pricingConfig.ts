/**
 * Customer-facing pricing. Stored as a single DB row (id = "default") so an admin
 * can re-price packs and first sessions without a deploy; the values in
 * data/pricing.ts are the commercial defaults and double as the fallback when the
 * row is missing or unreadable.
 *
 * The packs and first-session prices live in JSON columns so packs can be
 * re-priced (or added/removed) without a schema change. Everything is validated
 * on read against the expected shape, falling back to defaults per-field, so a
 * malformed row can never crash a pricing surface.
 */
import { prisma } from '@/lib/prisma'
import {
  PRICING_DEFAULTS,
  type PricingValues,
  type SessionPack,
  type AppPack,
  type BuyableTrack,
} from '@/data/pricing'

export type { PricingValues } from '@/data/pricing'

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const nn = (n: number) => Math.max(0, Math.round(n))

/** Coerce an unknown JSON value into a SessionPack[], falling back when invalid. */
function toSessionPacks(v: unknown, fallback: SessionPack[]): SessionPack[] {
  if (!Array.isArray(v) || v.length === 0) return fallback
  const out: SessionPack[] = []
  for (const item of v) {
    if (!item || typeof item !== 'object') return fallback
    const p = item as Record<string, unknown>
    if (!isNum(p.sessions) || !isNum(p.months) || !isNum(p.total)) return fallback
    out.push({ sessions: nn(p.sessions), months: nn(p.months), total: nn(p.total) })
  }
  return out
}

/** Coerce an unknown JSON value into an AppPack[], falling back when invalid. */
function toAppPacks(v: unknown, fallback: AppPack[]): AppPack[] {
  if (!Array.isArray(v) || v.length === 0) return fallback
  const out: AppPack[] = []
  for (const item of v) {
    if (!item || typeof item !== 'object') return fallback
    const p = item as Record<string, unknown>
    if (typeof p.label !== 'string' || !isNum(p.months) || !isNum(p.total)) return fallback
    out.push({ label: p.label, months: nn(p.months), total: nn(p.total) })
  }
  return out
}

/** Coerce an unknown JSON value into a first-session price record. */
function toFirstSession(v: unknown, fallback: Record<BuyableTrack, number>): Record<BuyableTrack, number> {
  if (!v || typeof v !== 'object') return fallback
  const p = v as Record<string, unknown>
  return {
    therapy: isNum(p.therapy) ? nn(p.therapy) : fallback.therapy,
    psychiatry: isNum(p.psychiatry) ? nn(p.psychiatry) : fallback.psychiatry,
    couples: isNum(p.couples) ? nn(p.couples) : fallback.couples,
  }
}

/** The live pricing model: DB row over defaults, per-field validated. */
export async function getPricingConfig(): Promise<PricingValues> {
  try {
    const row = await prisma.pricingConfig.findUnique({ where: { id: 'default' } })
    if (!row) return PRICING_DEFAULTS
    return {
      firstSession: toFirstSession(row.firstSession, PRICING_DEFAULTS.firstSession),
      therapyPacks: toSessionPacks(row.therapyPacks, PRICING_DEFAULTS.therapyPacks),
      psychiatryPacks: toSessionPacks(row.psychiatryPacks, PRICING_DEFAULTS.psychiatryPacks),
      couplesPacks: toSessionPacks(row.couplesPacks, PRICING_DEFAULTS.couplesPacks),
      calmPlusPacks: toAppPacks(row.calmPlusPacks, PRICING_DEFAULTS.calmPlusPacks),
      therapyBase: row.therapyBase ?? PRICING_DEFAULTS.therapyBase,
      psychiatryBase: row.psychiatryBase ?? PRICING_DEFAULTS.psychiatryBase,
      couplesBase: row.couplesBase ?? PRICING_DEFAULTS.couplesBase,
      calmPlusBase: row.calmPlusBase ?? PRICING_DEFAULTS.calmPlusBase,
    }
  } catch {
    return PRICING_DEFAULTS
  }
}

/** Persist edited pricing (admin only, caller must gate on role). */
export async function updatePricingConfig(values: PricingValues, updatedBy: string | null): Promise<void> {
  const cleanSessionPacks = (packs: SessionPack[]): SessionPack[] =>
    packs.map((p) => ({ sessions: nn(p.sessions), months: nn(p.months), total: nn(p.total) }))
  const cleanAppPacks = (packs: AppPack[]): AppPack[] =>
    packs.map((p) => ({ label: String(p.label).trim() || '—', months: nn(p.months), total: nn(p.total) }))

  const data = {
    firstSession: {
      therapy: nn(values.firstSession.therapy),
      psychiatry: nn(values.firstSession.psychiatry),
      couples: nn(values.firstSession.couples),
    },
    therapyPacks: cleanSessionPacks(values.therapyPacks),
    psychiatryPacks: cleanSessionPacks(values.psychiatryPacks),
    couplesPacks: cleanSessionPacks(values.couplesPacks),
    calmPlusPacks: cleanAppPacks(values.calmPlusPacks),
    therapyBase: nn(values.therapyBase),
    psychiatryBase: nn(values.psychiatryBase),
    couplesBase: nn(values.couplesBase),
    calmPlusBase: nn(values.calmPlusBase),
    updatedBy,
  }
  await prisma.pricingConfig.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  })
}
