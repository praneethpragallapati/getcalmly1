// Central pricing model. One source of truth for the pricing page, the home
// teaser, and anywhere else fees are shown. Package prices and validity come
// straight from the commercial plan.

export type SessionPack = {
  sessions: number
  months: number // validity
  total: number
}

// Therapy (psychology), from ₹999 / session at the 16-pack.
export const therapyPacks: SessionPack[] = [
  { sessions: 1, months: 1, total: 1499 },
  { sessions: 2, months: 2, total: 2798 }, // ₹1,399 / session
  { sessions: 4, months: 4, total: 5196 }, // ₹1,299 / session
  { sessions: 8, months: 8, total: 8792 }, // ₹1,099 / session
  { sessions: 16, months: 12, total: 15984 }, // ₹999 / session
]

// Couples therapy, from ₹1,699 / session at the 4-pack.
export const couplesPacks: SessionPack[] = [
  { sessions: 1, months: 1, total: 2299 },
  { sessions: 2, months: 2, total: 3998 }, // ₹1,999 / session
  { sessions: 4, months: 4, total: 6796 }, // ₹1,699 / session
]

// Psychiatry, from ₹1,199 / session at the 4-pack.
export const psychiatryPacks: SessionPack[] = [
  { sessions: 1, months: 1, total: 1599 },
  { sessions: 2, months: 2, total: 2798 }, // ₹1,399 / session
  { sessions: 4, months: 4, total: 4796 }, // ₹1,199 / session
]

// Fixed first-session price per track. Never discounted, never bundled: this is
// the only thing a new patient sees until their first session is done.
export const FIRST_SESSION: Record<'therapy' | 'psychiatry' | 'couples', number> = {
  therapy: 799,
  psychiatry: 999,
  couples: 1499,
}

export type AppPack = { label: string; months: number; total: number }

// Calm+, app-only / AI plan, billed by validity.
export const calmPlusPacks: AppPack[] = [
  { label: '1 month', months: 1, total: 399 },
  { label: '4 months', months: 4, total: 799 },
  { label: '6 months', months: 6, total: 999 },
  { label: '1 year', months: 12, total: 1199 },
]

export const perSession = (p: SessionPack) => Math.round(p.total / p.sessions)
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN')

// Tracks a patient can buy packs for in-app. (Calm+ is a subscription, handled
// separately.) Kept here, alongside the packs, so client components can read
// them without importing server-only billing code.
export type BuyableTrack = 'therapy' | 'psychiatry' | 'couples'
export type BuyablePack = SessionPack & { trackSlug: BuyableTrack; index: number; perSession: number }

/** The packs offered for a track, with derived per-session price (default prices). */
export function packsFor(track: BuyableTrack): BuyablePack[] {
  const packs =
    track === 'psychiatry' ? psychiatryPacks : track === 'couples' ? couplesPacks : therapyPacks
  return packs.map((p, index) => ({
    ...p,
    trackSlug: track,
    index,
    perSession: Math.round(p.total / p.sessions),
  }))
}

// Standalone "list" price per single session. Pack prices are shown as a
// discount against these so the saving is always visible.
// MRP per session (the struck-through list price every pack discounts from).
export const THERAPY_BASE = 1999
export const PSYCHIATRY_BASE = 1999
export const COUPLES_BASE = 3999
export const CALMPLUS_BASE = 499

export const TRACK_BASE = {
  therapy: THERAPY_BASE,
  psychiatry: PSYCHIATRY_BASE,
  couples: COUPLES_BASE,
} as const

export const discountVsBase = (perSessionPrice: number, base: number) =>
  Math.round((1 - perSessionPrice / base) * 100)

// Lowest per-session figures used for "from ₹X" copy.
export const THERAPY_FROM = perSession(therapyPacks[therapyPacks.length - 1]) // 999
export const PSYCHIATRY_FROM = perSession(psychiatryPacks[psychiatryPacks.length - 1]) // 1199
export const COUPLES_FROM = perSession(couplesPacks[couplesPacks.length - 1]) // 1699

export const freeFeatures = {
  included: ['Daily mood tracker', 'Smart journaling', 'Moderated community access', 'A few Calm AI conversations to get started'],
  missing: ['Unlimited Calm AI chat', 'Daily and weekly insights', 'Sessions with a professional'],
}

export const calmPlusFeatures = {
  included: [
    'Unlimited Calm AI chat and insights',
    'Daily mood tracker',
    'Smart journaling with reflections',
    'Daily and weekly insights',
    'A constant guide for the everyday moments',
  ],
  missing: ['Sessions with a professional'],
}

export const therapyFeatures = [
  '50-minute sessions with an RCI-verified clinical psychologist',
  'Full Calm+ app included — AI companion, journaling & mood tracker',
  'A clear summary after every session',
  'Daily and weekly insights on your progress',
  'A constant guide who stays with you the whole way',
  'Priority matching and easy rescheduling',
]

export const couplesFeatures = [
  '50-minute sessions for you and your partner together',
  'An EFT & Gottman-informed couples therapist',
  'Full Calm+ app for both of you — AI, journaling & mood tracker',
  'A clear summary after every session',
  'Shared exercises and check-ins between sessions',
  'Priority matching and easy rescheduling',
]

export const psychiatryFeatures = [
  'Consultations with an NMC-registered psychiatrist',
  'Full Calm+ app included — AI companion, journaling & mood tracker',
  'Medication support and a built-in tracker',
  'Digital prescriptions after your consultation',
  'Coordinated with your therapist when needed',
  'Session summaries and a constant guide throughout',
]

// ── Editable pricing model ──────────────────────────────────────────────────
// Everything an admin can re-price. The constants above are its defaults; a DB
// PricingConfig row (lib/pricingConfig) overrides them at runtime. Kept as a
// plain shape so client components can receive it as a prop without importing
// any server-only code.
export type PricingValues = {
  firstSession: Record<BuyableTrack, number>
  therapyPacks: SessionPack[]
  psychiatryPacks: SessionPack[]
  couplesPacks: SessionPack[]
  calmPlusPacks: AppPack[]
  therapyBase: number
  psychiatryBase: number
  couplesBase: number
  calmPlusBase: number
}

// The commercial defaults, gathered from the constants above. Doubles as the
// fallback whenever the DB row is absent or unreadable.
export const PRICING_DEFAULTS: PricingValues = {
  firstSession: FIRST_SESSION,
  therapyPacks,
  psychiatryPacks,
  couplesPacks,
  calmPlusPacks,
  therapyBase: THERAPY_BASE,
  psychiatryBase: PSYCHIATRY_BASE,
  couplesBase: COUPLES_BASE,
  calmPlusBase: CALMPLUS_BASE,
}

/** The session packs for a track within a resolved pricing model. */
export function packsForIn(pricing: PricingValues, track: BuyableTrack): SessionPack[] {
  return track === 'psychiatry'
    ? pricing.psychiatryPacks
    : track === 'couples'
      ? pricing.couplesPacks
      : pricing.therapyPacks
}

/** The struck-through MRP for a track within a resolved pricing model. */
export function baseForIn(pricing: PricingValues, track: BuyableTrack): number {
  return track === 'psychiatry'
    ? pricing.psychiatryBase
    : track === 'couples'
      ? pricing.couplesBase
      : pricing.therapyBase
}

/** Packs for a track, with derived per-session price + index, from a pricing model. */
export function buyablePacksIn(pricing: PricingValues, track: BuyableTrack): BuyablePack[] {
  return packsForIn(pricing, track).map((p, index) => ({
    ...p,
    trackSlug: track,
    index,
    perSession: Math.round(p.total / p.sessions),
  }))
}
