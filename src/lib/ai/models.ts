/**
 * Model registry + cost-routed selection. Ported from the v6 routing notebook,
 * with model IDs updated to current releases. The design is preserved: a cheap
 * classifier picks a label, then routine vs. high-stake turns route to different
 * models, and paid vs. free patients get different tiers.
 */
export type Provider = 'openai' | 'anthropic'
export type ModelKey =
  | 'nano'
  | 'mini'
  | 'gpt4'
  | 'haiku'
  | 'sonnet'
  | 'opus'

export const MODELS: Record<ModelKey, string> = {
  nano: 'gpt-4.1-nano',
  mini: 'gpt-4.1-mini',
  gpt4: 'gpt-4.1',
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6',
  opus: 'claude-opus-4-8',
}

export const PROVIDERS: Record<ModelKey, Provider> = {
  nano: 'openai',
  mini: 'openai',
  gpt4: 'openai',
  haiku: 'anthropic',
  sonnet: 'anthropic',
  opus: 'anthropic',
}

// USD per million tokens [input, output] — used for cost estimates only.
export const COST_TABLE: Record<string, [number, number]> = {
  'gpt-4.1-nano': [0.1, 0.4],
  'gpt-4.1-mini': [0.4, 1.6],
  'gpt-4.1': [2.0, 8.0],
  'claude-haiku-4-5-20251001': [0.8, 4.0],
  'claude-sonnet-4-6': [3.0, 15.0],
  'claude-opus-4-8': [15.0, 75.0],
}

// ── Routing knobs (change models here) ───────────────────────────────────────
export const CLASSIFIER_MODEL: ModelKey = 'nano'
export const PAID_ROUTINE: ModelKey = 'haiku'
export const PAID_HIGHSTAKE: ModelKey = 'sonnet'
export const FREE_ROUTINE: ModelKey = 'nano'
export const FREE_HIGHSTAKE: ModelKey = 'haiku'
// Models used by the non-chat jobs.
export const SYNTH_MODEL: ModelKey = 'nano'
export const INSIGHT_MODEL: ModelKey = 'nano'

/** Routine + high-stake model for a membership ("paid" | "free"). */
export function modelsForMembership(membership: string): { routine: ModelKey; highStake: ModelKey } {
  if (membership === 'paid') return { routine: PAID_ROUTINE, highStake: PAID_HIGHSTAKE }
  return { routine: FREE_ROUTINE, highStake: FREE_HIGHSTAKE }
}

export function estCost(model: string, inp: number, out: number): number {
  const [ri, ro] = COST_TABLE[model] ?? [1.0, 4.0]
  return Math.round(((inp * ri + out * ro) / 1_000_000) * 1e8) / 1e8
}

// ── Per-label generation parameters (from the v6 notebook) ───────────────────
export const VALID_LABELS = new Set([
  'GREETING',
  'MOOD_CHECKIN',
  'JOURNAL_INSIGHT',
  'SESSION_REFLECT',
  'VENT_MILD',
  'VENT_DISTRESS',
  'CRISIS',
  'ADVICE_SEEK',
  'RELATIONSHIP',
  'MEDICAL_QUESTION',
  'GENERIC_WELLNESS',
  'APP_SUPPORT',
  'BLOCKED',
])
export const HIGH_STAKE_LABELS = new Set(['CRISIS', 'VENT_DISTRESS'])

export const LABEL_TEMPERATURE: Record<string, number> = {
  GREETING: 0.9,
  MOOD_CHECKIN: 0.75,
  JOURNAL_INSIGHT: 0.75,
  SESSION_REFLECT: 0.7,
  VENT_MILD: 0.8,
  VENT_DISTRESS: 0.7,
  CRISIS: 0.6,
  ADVICE_SEEK: 0.75,
  RELATIONSHIP: 0.7,
  MEDICAL_QUESTION: 0.4,
  GENERIC_WELLNESS: 0.9,
  APP_SUPPORT: 0.0,
  BLOCKED: 0.0,
}
export const LABEL_MAX_TOKENS: Record<string, number> = {
  GREETING: 70,
  MOOD_CHECKIN: 100,
  JOURNAL_INSIGHT: 150,
  SESSION_REFLECT: 150,
  VENT_MILD: 150,
  VENT_DISTRESS: 200,
  CRISIS: 200,
  ADVICE_SEEK: 150,
  RELATIONSHIP: 100,
  MEDICAL_QUESTION: 80,
  GENERIC_WELLNESS: 100,
}
export const LABEL_HISTORY_TURNS: Record<string, number> = {
  GREETING: 0,
  MOOD_CHECKIN: 2,
  JOURNAL_INSIGHT: 0,
  SESSION_REFLECT: 0,
  VENT_MILD: 6,
  ADVICE_SEEK: 4,
  GENERIC_WELLNESS: 0,
  MEDICAL_QUESTION: 0,
  RELATIONSHIP: 8,
  VENT_DISTRESS: 12,
  CRISIS: 16,
}
export const INTENSITY_SCORE: Record<string, number> = {
  low: 2,
  medium: 5,
  high: 8,
  crisis: 10,
}
export const VALID_INTENTS = new Set(['vent', 'seek_advice', 'seek_info', 'just_talking', 'crisis'])
export const VALID_INTENSITY = new Set(['low', 'medium', 'high', 'crisis'])
// Consecutive non-crisis turns before exiting crisis-mode routing.
export const CRISIS_DEESCALATE_AFTER = 3
