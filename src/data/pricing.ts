// Central pricing model. One source of truth for the pricing page, the home
// teaser, and anywhere else fees are shown. Package prices and validity come
// straight from the commercial plan.

export type SessionPack = {
  sessions: number
  months: number // validity
  total: number
}

// Therapy (psychology) — from ₹999 / session at the 6-pack.
export const therapyPacks: SessionPack[] = [
  { sessions: 1, months: 1, total: 1398 },
  { sessions: 2, months: 2, total: 2399 },
  { sessions: 4, months: 4, total: 4396 },
  { sessions: 6, months: 6, total: 5994 },
]

// Psychiatry — from ₹1,099 / session at the 6-pack.
export const psychiatryPacks: SessionPack[] = [
  { sessions: 1, months: 1, total: 1499 },
  { sessions: 2, months: 2, total: 2798 },
  { sessions: 4, months: 4, total: 5196 },
  { sessions: 6, months: 6, total: 6594 },
]

export type AppPack = { label: string; months: number; total: number }

// Calm+ — app-only / AI plan, billed by validity.
export const calmPlusPacks: AppPack[] = [
  { label: '1 month', months: 1, total: 399 },
  { label: '4 months', months: 4, total: 799 },
  { label: '6 months', months: 6, total: 999 },
  { label: '1 year', months: 12, total: 1199 },
]

export const perSession = (p: SessionPack) => Math.round(p.total / p.sessions)
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN')

// Tracks a patient can buy packs for in-app. (Calm+ is a subscription, handled
// separately.) Kept here — alongside the packs — so client components can read
// them without importing server-only billing code.
export type BuyableTrack = 'therapy' | 'psychiatry'
export type BuyablePack = SessionPack & { trackSlug: BuyableTrack; index: number; perSession: number }

/** The packs offered for a track, with derived per-session price. */
export function packsFor(track: BuyableTrack): BuyablePack[] {
  const packs = track === 'psychiatry' ? psychiatryPacks : therapyPacks
  return packs.map((p, index) => ({
    ...p,
    trackSlug: track,
    index,
    perSession: Math.round(p.total / p.sessions),
  }))
}

// Standalone "list" price per single session. Pack prices are shown as a
// discount against these so the saving is always visible.
export const THERAPY_BASE = 1899
export const PSYCHIATRY_BASE = 1999
export const CALMPLUS_BASE = 499

export const discountVsBase = (perSessionPrice: number, base: number) =>
  Math.round((1 - perSessionPrice / base) * 100)

// Lowest per-session figures used for "from ₹X" copy.
export const THERAPY_FROM = perSession(therapyPacks[therapyPacks.length - 1]) // 999
export const PSYCHIATRY_FROM = perSession(psychiatryPacks[psychiatryPacks.length - 1]) // 1099

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
    'Guided exercises and what to expect next',
    'A constant guide for the everyday moments',
  ],
  missing: ['Sessions with a professional'],
}

export const therapyFeatures = [
  '50-minute sessions with an RCI-verified psychologist',
  'Everything in Calm+, included',
  'A clear summary after every session',
  'Daily and weekly insights on your progress',
  'A constant guide who stays with you the whole way',
  'Priority matching and easy rescheduling',
]

export const psychiatryFeatures = [
  'Consultations with an NMC-registered psychiatrist',
  'Everything in Calm+, included',
  'Medication support and a built-in tracker',
  'Prescriptions and medicines delivered to your door',
  'Coordinated with your therapist when needed',
  'Session summaries and a constant guide throughout',
]
