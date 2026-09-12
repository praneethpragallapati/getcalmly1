'use server'

import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { aiConfig, hasLlm } from '@/lib/ai/config'
import { callModel } from '@/lib/ai/clients'
import { MODELS, PROVIDERS, INSIGHT_MODEL, PAID_ROUTINE, WEEKLY_MODEL, type ModelKey } from '@/lib/ai/models'
import { storeInsight } from '@/lib/ai/insights'
import { seedDemoActivity } from '@/lib/demoSeed'

async function isAdmin(): Promise<boolean> {
  const u = await getSessionUser()
  return Boolean(u?.id && u.role === 'ADMIN')
}

export type ProbeResult = {
  label: string
  model: string
  provider: string
  ok: boolean
  error: string | null
  sample: string | null
}

export type AiProbeReport = {
  ok: boolean
  error?: string
  keys?: { openai: boolean; anthropic: boolean; cron: boolean }
  hasLlm?: boolean
  probes?: ProbeResult[]
}

/**
 * Make a real, minimal call to each provider and report exactly what came back.
 * This is the one thing that turns the pipeline's silent degradation into a
 * concrete answer: no_openai_key (missing), openai_401 (bad key), openai_429
 * (no quota/billing), anthropic_404 (invalid model id), or OK.
 */
export async function runAiProbe(): Promise<AiProbeReport> {
  if (!(await isAdmin())) return { ok: false, error: 'Not authorized.' }

  const targets: [string, ModelKey][] = [
    ['Daily insight / classifier / routine chat', INSIGHT_MODEL],
    ['Routine chat', PAID_ROUTINE],
    ['High-stake chat + weekly insight', WEEKLY_MODEL],
  ]
  // De-duplicate when several roles map to the same model key.
  const seen = new Set<ModelKey>()
  const uniqueTargets = targets.filter(([, k]) => (seen.has(k) ? false : (seen.add(k), true)))
  const probes: ProbeResult[] = []
  for (const [label, key] of uniqueTargets) {
    const r = await callModel(
      key,
      'You output only valid JSON.',
      [{ role: 'user', content: 'Return exactly {"ok":true} and nothing else.' }],
      { temperature: 0, maxTokens: 20, jsonMode: true },
    )
    probes.push({
      label,
      model: MODELS[key],
      provider: PROVIDERS[key],
      ok: Boolean(r.answer),
      error: r.error,
      sample: r.answer ? r.answer.slice(0, 60) : null,
    })
  }

  return {
    ok: true,
    keys: { openai: Boolean(aiConfig.openAiKey), anthropic: Boolean(aiConfig.anthropicKey), cron: Boolean(aiConfig.cronSecret) },
    hasLlm: hasLlm(),
    probes,
  }
}

export type GenerateReport = { ok: boolean; error?: string; daily?: boolean; weekly?: boolean }

/**
 * Regenerate one patient's daily + weekly insight rows on demand, so a fix can
 * be verified without waiting for the scheduled cron. Admin-only.
 */
export async function generateInsightsNow(email: string): Promise<GenerateReport> {
  if (!(await isAdmin())) return { ok: false, error: 'Not authorized.' }
  const clean = (email ?? '').trim().toLowerCase()
  if (!clean) return { ok: false, error: 'Enter a patient email.' }
  if (!hasLlm()) return { ok: false, error: 'No LLM key configured in this environment.' }

  const user = await prisma.user.findUnique({ where: { email: clean }, select: { id: true, role: true } })
  if (!user) return { ok: false, error: 'No user with that email.' }
  if (user.role !== 'PATIENT') return { ok: false, error: 'That account is not a patient.' }

  try {
    const daily = await storeInsight(user.id, 'DAILY')
    const weekly = await storeInsight(user.id, 'WEEKLY')
    return { ok: true, daily, weekly }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Generation failed.' }
  }
}

export type SeedReport = { ok: boolean; error?: string; mood?: number; journals?: number; daily?: boolean; weekly?: boolean }

/**
 * Seed ~4 weeks of demo mood + journal activity and profile context for one
 * patient, then regenerate their insights — so the daily/weekly cards have
 * consistent material. Admin-only; the seeded rows are tagged and removable.
 */
export async function seedDemoAndGenerate(email: string): Promise<SeedReport> {
  if (!(await isAdmin())) return { ok: false, error: 'Not authorized.' }
  const clean = (email ?? '').trim().toLowerCase()
  if (!clean) return { ok: false, error: 'Enter a patient email.' }

  const user = await prisma.user.findUnique({ where: { email: clean }, select: { id: true, role: true } })
  if (!user) return { ok: false, error: 'No user with that email.' }
  if (user.role !== 'PATIENT') return { ok: false, error: 'That account is not a patient.' }

  try {
    const seeded = await seedDemoActivity(user.id, 4)
    if (!hasLlm()) {
      return { ok: true, mood: seeded.mood, journals: seeded.journals, daily: false, weekly: false }
    }
    const daily = await storeInsight(user.id, 'DAILY')
    const weekly = await storeInsight(user.id, 'WEEKLY')
    return { ok: true, mood: seeded.mood, journals: seeded.journals, daily, weekly }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Seeding failed.' }
  }
}
