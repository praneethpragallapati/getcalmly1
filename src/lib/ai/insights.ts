/**
 * Daily (#10) and weekly (#12) insight generators. Ported from the daily-patterns
 * and weekly-insights notebooks, with two adaptations the dashboard needs:
 *  - Output is reshaped to the existing card types: DashInsight { title, body }
 *    plus Pattern[] (title/sub/tone), produced in a single structured JSON call.
 *  - No raw scores ever reach the model (natural language only), preserving the
 *    notebooks' privacy posture; all inputs are already privacy-gated.
 * Rows are written to AiInsight (kind DAILY|WEEKLY); the dashboard reads the latest.
 */
import { prisma } from '@/lib/prisma'
import type { InsightKind } from '@prisma/client'
import { hasLlm } from './config'
import { callModel } from './clients'
import { INSIGHT_MODEL } from './models'
import { buildPatientContext, type PatientContext } from './context'
import { trackFallback } from './tracks'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const dowOf = (iso: string) => (new Date(iso).getDay() + 6) % 7 // 0 = Monday
const scoreWord = (s: number) =>
  s <= 2 ? 'very low' : s <= 3 ? 'low' : s <= 4 ? 'below average' : s <= 5 ? 'average' : s <= 6 ? 'okay' : s <= 7 ? 'good' : s <= 8 ? 'quite good' : 'high'

type Tone = 'coral' | 'green' | 'gold' | 'purple'
export type InsightPayload = {
  title: string
  body: string
  patterns: { title: string; sub: string; tone: Tone }[]
  meta: Record<string, unknown>
}

const VALID_TONES = new Set<Tone>(['coral', 'green', 'gold', 'purple'])

function parseJson(raw: string): { title?: string; body?: string; patterns?: unknown[] } | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function normPatterns(arr: unknown[] | undefined): { title: string; sub: string; tone: Tone }[] {
  if (!Array.isArray(arr)) return []
  return arr
    .slice(0, 3)
    .map((p) => {
      const o = p as { title?: unknown; sub?: unknown; tone?: unknown }
      const tone = String(o.tone ?? 'purple').toLowerCase() as Tone
      return {
        title: String(o.title ?? '').slice(0, 60),
        sub: String(o.sub ?? '').slice(0, 80),
        tone: VALID_TONES.has(tone) ? tone : 'purple',
      }
    })
    .filter((p) => p.title)
}

// ── Daily ─────────────────────────────────────────────────────────────────────

function dailyContextBlocks(ctx: PatientContext) {
  const today = new Date()
  const todayDow = (today.getDay() + 6) % 7
  const cutoff30 = new Date(today.getTime() - 30 * 864e5).toISOString().slice(0, 10)

  const dowScores: number[] = []
  const dowNotes: string[] = []
  const allScores: number[] = []
  for (const m of ctx.mood) {
    if (m.date < cutoff30) continue
    allScores.push(m.score)
    if (dowOf(m.date) === todayDow) {
      dowScores.push(m.score)
      if (m.note) dowNotes.push(m.note)
    }
  }
  const overallAvg = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null
  const todayAvg = dowScores.length ? dowScores.reduce((a, b) => a + b, 0) / dowScores.length : null

  let dayQuality: string | null = null
  if (todayAvg != null && overallAvg != null) {
    const diff = todayAvg - overallAvg
    dayQuality =
      diff <= -1.5 ? 'consistently one of your harder days'
      : diff <= -0.5 ? 'usually a bit lower for you than the rest of the week'
      : diff >= 1.5 ? 'consistently one of your better days'
      : diff >= 0.5 ? 'usually a lighter, easier day for you'
      : 'fairly typical for you, neither your best nor your hardest'
  }

  const cutoff7 = new Date(today.getTime() - 7 * 864e5).toISOString().slice(0, 10)
  const lwNotes = ctx.mood.filter((m) => m.date >= cutoff7 && m.note).map((m) => m.note as string).slice(0, 4)
  const dataSufficient = dowScores.length >= 2 || allScores.length >= 5

  // Suggestion source, priority order: helped → journals → last-week notes → fallback.
  let suggestion: string
  let suggSource: string
  if (ctx.whatHasHelped.length) {
    suggestion = ctx.whatHasHelped.join('; ')
    suggSource = 'personal'
  } else if (ctx.journals.length) {
    suggestion = ctx.journals.slice(0, 3).map((j) => j.entry.slice(0, 160)).join('; ')
    suggSource = 'personal'
  } else if (lwNotes.length) {
    suggestion = lwNotes.join('; ')
    suggSource = 'personal'
  } else {
    suggestion = trackFallback(ctx.track, ctx.subTrack)
    suggSource = 'fallback'
  }

  return {
    today: DAYS[todayDow],
    dayQuality,
    dowNotes: dowNotes.slice(-3),
    lwNotes,
    dataSufficient,
    suggestion,
    suggSource,
    totalWin: allScores.length,
  }
}

export async function generateDailyInsight(userId: string): Promise<InsightPayload | null> {
  if (!hasLlm()) return null
  const ctx = await buildPatientContext(userId)
  if (!ctx) return null
  const b = dailyContextBlocks(ctx)

  const patternInstruction = b.dataSufficient && b.dayQuality
    ? `Their ${b.today}s have been: ${b.dayQuality}. Notes on past ${b.today}s: ${b.dowNotes.length ? b.dowNotes.map((n) => `"${n}"`).join(', ') : 'none'}. This week's notes: ${b.lwNotes.length ? b.lwNotes.map((n) => `"${n}"`).join(', ') : 'none'}.`
    : `There isn't enough ${b.today} mood history yet, be honest about that and gently encourage logging mood today.`

  const sit = ctx.currentSituation
    ? `PATIENT CONTEXT (read before writing): ${ctx.currentSituation}\nNever suggest partner/relationship actions if they are separated, divorced, widowed, or not in a relationship.\n`
    : ''

  const prompt =
    `You are writing a daily check-in for ${ctx.firstName} on the '${ctx.trackLabel}' therapy track.\n` +
    sit +
    `Mood pattern source: ${patternInstruction}\n` +
    (b.suggSource === 'personal'
      ? `Suggestion must be drawn from this personal history: ${b.suggestion}. Name the actual technique; reference their own experience.\n`
      : `Use exactly this suggestion: "${b.suggestion}".\n`) +
    'Return ONLY a JSON object: {"title": short headline (max 8 words, warm, no scores), ' +
    '"body": exactly two sentences, sentence 1 the mood pattern, sentence 2 the suggestion, second person, no numbers, ' +
    '"patterns": up to 3 items [{"title": <=6 words, "sub": short evidence <=8 words, "tone": one of coral|green|gold|purple}] ' +
    '(coral=concern, green=positive, gold=improvement, purple=observation), drawn from their mood/journal data, no scores}. ' +
    'Never use em dashes (—) in any text; use a comma, period, or colon instead.'

  const res = await callModel(INSIGHT_MODEL, 'You output only valid JSON.', [{ role: 'user', content: prompt }], {
    temperature: 0.6,
    maxTokens: 300,
    jsonMode: true,
  })
  if (!res.answer) return null
  const parsed = parseJson(res.answer)
  if (!parsed?.body) return null

  return {
    title: String(parsed.title ?? 'Today').slice(0, 90),
    body: String(parsed.body),
    patterns: normPatterns(parsed.patterns),
    meta: { suggSource: b.suggSource, dataSufficient: b.dataSufficient },
  }
}

// ── Weekly ──────────────────────────────────────────────────────────────────

function weeklyBlocks(ctx: PatientContext, days = 7) {
  const cutoff = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10)
  const week = ctx.mood.filter((m) => m.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date))
  const scores = week.map((m) => m.score)

  let arc: string | null = null
  if (scores.length === 1) arc = `only one entry, felt ${scoreWord(scores[0])}`
  else if (scores.length > 1) {
    const mid = Math.floor(scores.length / 2)
    const first = scores.slice(0, mid)
    const second = scores.slice(mid)
    const diff = second.reduce((a, b) => a + b, 0) / second.length - first.reduce((a, b) => a + b, 0) / first.length
    const overall = scores.reduce((a, b) => a + b, 0) / scores.length
    const direction = diff > 1 ? 'started harder and lifted toward the end' : diff < -1 ? 'started better and got heavier toward the end' : 'stayed fairly consistent through the week'
    const quality = overall >= 7 ? 'generally a good week' : overall >= 5 ? 'a mixed week overall' : overall >= 3 ? 'a difficult week overall' : 'a very hard week overall'
    arc = `${quality}, ${direction}`
  }

  const narrative = week.map((m) => `${DAYS[dowOf(m.date)]}: felt ${scoreWord(m.score)}${m.note ? `, ${m.note}` : ''}`).join('\n')
  const toWords = (e?: (typeof week)[number]) => (e ? `${DAYS[dowOf(e.date)]} (${scoreWord(e.score)})${e.note ? `, ${e.note}` : ''}` : null)
  const low = week.length ? toWords(week.reduce((a, b) => (a.score <= b.score ? a : b))) : null
  const high = week.length ? toWords(week.reduce((a, b) => (a.score >= b.score ? a : b))) : null

  const journalsWeek = ctx.journals.filter((j) => j.date >= cutoff)
  const journalColour = journalsWeek.map((j) => `${DAYS[dowOf(j.date)]}: ${j.entry.slice(0, 120)}`).join(' | ')
  const sessionColour = ctx.sessions.filter((s) => s.date >= cutoff).map((s) => s.note.slice(0, 150)).join(' | ')
  const dataSufficient = week.length >= 3 || (week.length >= 2 && journalsWeek.length >= 1)

  return { narrative, arc, low, high, journalColour, sessionColour, dataSufficient, moodCount: week.length }
}

export async function generateWeeklyInsight(userId: string): Promise<InsightPayload | null> {
  if (!hasLlm()) return null
  const ctx = await buildPatientContext(userId)
  if (!ctx) return null
  const w = weeklyBlocks(ctx)

  if (!w.dataSufficient) {
    return {
      title: 'Building your weekly picture',
      body: `There isn't enough mood data from this week to give you a proper picture yet, ${ctx.firstName}. The more days you log, even a quick note, the more I can reflect back. Try logging today and the next few days.`,
      patterns: [],
      meta: { dataSufficient: false, moodCount: w.moodCount },
    }
  }

  const sit = ctx.currentSituation
    ? `PATIENT CONTEXT (read before writing): ${ctx.currentSituation}\nDo not suggest partner/relationship activities if they are separated, divorced, widowed, or not in a relationship.\n`
    : ''
  const colour =
    (w.journalColour ? `JOURNAL NOTES (supporting colour only):\n${w.journalColour}\n` : '') +
    (ctx.membership === 'paid' && w.sessionColour ? `SESSION NOTES (supporting colour only):\n${w.sessionColour}\n` : '')

  const prompt =
    `Write a short weekly wellness summary for ${ctx.firstName} on the '${ctx.trackLabel}' track.\n` +
    sit +
    `MOOD TRACKER THIS WEEK (primary source, lead with this):\n${w.narrative}\nWeek arc: ${w.arc}\n` +
    (w.low ? `Lowest point: ${w.low}\n` : '') +
    (w.high ? `Highest point: ${w.high}\n` : '') +
    colour +
    'Return ONLY a JSON object: {"title": short headline (max 8 words, no scores), ' +
    '"body": 3-4 sentences, second person, no numbers/scores, how the week felt (use the arc), one moment that stood out (named by day), one specific thing to carry forward grounded in what helped, "patterns": ' +
    'up to 3 items [{"title": <=6 words, "sub": short evidence <=8 words, "tone": coral|green|gold|purple}] drawn from journals/mood, no scores}.'

  const res = await callModel(INSIGHT_MODEL, 'You output only valid JSON.', [{ role: 'user', content: prompt }], {
    temperature: 0.6,
    maxTokens: 360,
    jsonMode: true,
  })
  if (!res.answer) return null
  const parsed = parseJson(res.answer)
  if (!parsed?.body) return null

  return {
    title: String(parsed.title ?? 'Your week').slice(0, 90),
    body: String(parsed.body),
    patterns: normPatterns(parsed.patterns),
    meta: { dataSufficient: true, moodCount: w.moodCount },
  }
}

/**
 * Generate insights for every patient, the unit of work a scheduler triggers via
 * the cron route handlers (daily each morning, weekly each Sunday). Patients whose
 * privacy settings disallow everything, or who lack a model/data, are skipped
 * (the generators return null). Processed serially to stay within rate limits.
 */
export async function runInsightBatch(kind: InsightKind): Promise<{ generated: number; skipped: number }> {
  if (!hasLlm()) return { generated: 0, skipped: 0 }
  const patients = await prisma.user.findMany({
    where: { role: 'PATIENT', patientProfile: { isNot: null } },
    select: { id: true },
  })
  let generated = 0
  let skipped = 0
  for (const p of patients) {
    try {
      if (await storeInsight(p.id, kind)) generated++
      else skipped++
    } catch {
      skipped++
    }
  }
  return { generated, skipped }
}

/** Generate and persist an insight for one patient. Returns true on success. */
export async function storeInsight(userId: string, kind: InsightKind): Promise<boolean> {
  const payload = kind === 'DAILY' ? await generateDailyInsight(userId) : await generateWeeklyInsight(userId)
  if (!payload) return false
  await prisma.aiInsight.create({
    data: {
      userId,
      kind,
      title: payload.title,
      body: payload.body,
      meta: { ...payload.meta, patterns: payload.patterns },
    },
  })
  return true
}
