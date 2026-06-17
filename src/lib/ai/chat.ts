/**
 * Calm AI chat pipeline (#11). Ported from the v6 classified-routing notebook:
 * a cheap classifier labels each turn, the label drives the system prompt, model,
 * temperature and how much history is sent, and high-stake turns escalate to a
 * stronger model and write a crisis hand-off record. All patient context is
 * privacy-gated via buildPatientContext. With no LLM key configured the caller
 * falls back to the transparent rule-based reply (see app/actions.ts).
 */
import { prisma } from '@/lib/prisma'
import { aiConfig, FREE_DAILY_LIMIT } from './config'
import { callModel, type ChatTurn } from './clients'
import { buildPatientContext, type PatientContext } from './context'
import {
  CLASSIFIER_MODEL,
  CRISIS_DEESCALATE_AFTER,
  HIGH_STAKE_LABELS,
  INTENSITY_SCORE,
  LABEL_HISTORY_TURNS,
  LABEL_MAX_TOKENS,
  LABEL_TEMPERATURE,
  MODELS,
  modelsForMembership,
  VALID_INTENSITY,
  VALID_INTENTS,
  VALID_LABELS,
} from './models'

const ICALL = aiConfig.iCall

const CLASSIFY_SYSTEM =
  'You are a message classifier for GetCalmly, a mental wellness chatbot.\n' +
  'Classify the message and return ONLY a JSON object with keys: label, intent, intensity.\n\n' +
  'LABELS (pick the most specific):\n' +
  'GREETING         - hi/hello/just checking in/short opener\n' +
  'MOOD_CHECKIN     - asking about their own mood or emotional trends\n' +
  'JOURNAL_INSIGHT  - questions about journal entries or patterns\n' +
  'SESSION_REFLECT  - questions about therapy sessions or therapist advice\n' +
  'VENT_MILD        - mild frustration or everyday stress\n' +
  'VENT_DISTRESS    - significant sadness, hopelessness, emotional pain (not crisis)\n' +
  'CRISIS           - self-harm, suicide, wanting to die, safety risk\n' +
  'ADVICE_SEEK      - wants coping tips, exercises, suggestions\n' +
  'RELATIONSHIP     - partner, family, friends, loneliness, social conflict\n' +
  'MEDICAL_QUESTION - medication, diagnosis, clinical questions\n' +
  'GENERIC_WELLNESS - sleep, exercise, nutrition, habits, general wellbeing\n' +
  'APP_SUPPORT      - billing, subscription, account, technical issues\n' +
  'BLOCKED          - completely off-topic (coding, recipes, travel, etc.)\n\n' +
  'INTENTS: vent | seek_advice | seek_info | just_talking | crisis\n' +
  'INTENSITY: low | medium | high | crisis\n\n' +
  'Short follow-ups (yes/ok/sure/not really) inherit the prior label from context.\n' +
  'Return ONLY valid JSON. Example:\n' +
  '{"label": "VENT_MILD", "intent": "vent", "intensity": "low"}'

const BLOCKED_REPLY =
  "I'm here for how you're feeling and what's going on for you — that's a bit outside what I can help with. Is there something on your mind I can support you with?"
const APP_REPLY = `For account, billing or technical help, the GetCalmly team can sort it out quickly — reach them at ${aiConfig.supportEmail}.`
const SUBSCRIBE_MSG =
  "You've reached today's free message limit. I'll be right here tomorrow — and GetCalmly Premium members can talk any time, with full access to their journal and session context. Upgrade at getcalmly.com/subscribe."

const CRISIS_KEYWORDS = [
  'suicid',
  'kill myself',
  'end my life',
  'end it all',
  'want to die',
  'self harm',
  'self-harm',
  'hurt myself',
]

// ── Natural-language helpers (no raw scores reach the model) ──────────────────
const SCORE_WORDS: Record<number, string> = {
  1: 'very low',
  2: 'very low',
  3: 'low',
  4: 'below average',
  5: 'average',
  6: 'okay',
  7: 'good',
  8: 'quite good',
  9: 'high',
  10: 'high',
}
const scoreToWords = (s: number) => SCORE_WORDS[Math.max(1, Math.min(10, Math.round(s)))] ?? 'unknown'
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const weekday = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : DAYS[(d.getDay() + 6) % 7]
}

function emotionalState(ctx: PatientContext): string {
  const recent = ctx.mood.slice(0, 7)
  if (recent.length === 0) {
    if (ctx.scores.length) {
      const latest = ctx.scores[ctx.scores.length - 1]
      return `${latest.scale}: ${latest.label ?? scoreToWords(latest.score)} — trend: ${ctx.trend ?? 'unknown'}`
    }
    return 'No mood data recorded.'
  }
  const scores = recent.map((m) => m.score)
  const trend = scores[0] > scores[scores.length - 1] ? 'improving' : scores[0] < scores[scores.length - 1] ? 'declining' : 'stable'
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  let out = `Overall ${scoreToWords(avg)}, ${trend} (low=${scoreToWords(Math.min(...scores))}, high=${scoreToWords(Math.max(...scores))})`
  if (ctx.scale && ctx.scores.length) {
    const latest = ctx.scores[ctx.scores.length - 1]
    out += ` | ${ctx.scale}: ${latest.label ?? scoreToWords(latest.score)} (clinical)`
  }
  const lastNote = recent[0]?.note
  if (lastNote) out += ` | latest note: ${lastNote}`
  return out
}

function moodDataBlock(ctx: PatientContext): string {
  const recent = [...ctx.mood].slice(0, 7).reverse()
  if (!recent.length) return 'No mood data.'
  const scores = recent.map((m) => m.score)
  const trend = scores[scores.length - 1] > scores[0] ? 'improving' : scores[scores.length - 1] < scores[0] ? 'declining' : 'stable'
  const rows = recent.map((m) => `${weekday(m.date)}: felt ${scoreToWords(m.score)}${m.note ? ` — ${m.note}` : ''}`)
  return `Trend: ${trend}\n${rows.join('\n')}`
}

const journalsBlock = (ctx: PatientContext, n = 4, chars = 120) =>
  ctx.journals.length
    ? ctx.journals.slice(0, n).map((j) => `[${j.date}] ${j.entry.slice(0, chars)}`).join(' | ')
    : 'No journal entries.'

const sessionsBlock = (ctx: PatientContext, n = 3, chars = 150) =>
  ctx.sessions.length
    ? ctx.sessions.slice(0, n).map((s) => `[${s.date}] ${s.note.slice(0, chars)}`).join(' | ')
    : 'No session notes.'

function assessmentBlock(
  ctx: PatientContext,
  { helped = true, triggers = true, risk = true } = {}
): string {
  const parts: string[] = []
  if (helped && ctx.whatHasHelped.length) parts.push('What has genuinely helped this patient: ' + ctx.whatHasHelped.slice(0, 4).join(' | '))
  if (ctx.whatHasNotHelped.length) parts.push('What has NOT helped: ' + ctx.whatHasNotHelped.slice(0, 2).join(' | '))
  if (triggers && ctx.recurringTriggers.length) parts.push('Known recurring triggers: ' + ctx.recurringTriggers.slice(0, 3).join(' | '))
  if (risk) {
    const flags: string[] = []
    if (ctx.risk.passiveSiHistory) flags.push('passive SI history: YES')
    if (ctx.risk.sleepDisturbance) flags.push('sleep disturbance noted')
    if (ctx.risk.safetyPlanActive) flags.push('safety plan active — contact: ' + (ctx.risk.safetyPlanContact ?? ''))
    if (flags.length) parts.push('Risk flags: ' + flags.join(', '))
  }
  if (ctx.currentSituation) parts.push('Current situation: ' + ctx.currentSituation)
  return parts.length ? parts.join('\n') + '\n' : ''
}

function counsellorLine(ctx: PatientContext): string {
  if (ctx.membership === 'paid' && ctx.therapistName) {
    return `If professional support is needed, warmly encourage them to connect with their counsellor ${ctx.therapistName} through the GetCalmly app.`
  }
  return 'If professional support seems needed, gently encourage them to subscribe to GetCalmly to access a dedicated counsellor.'
}

const NON_NEG =
  '- You are Calmly, a warm mental wellness companion. NOT a therapist or doctor.\n' +
  '- Never diagnose, never recommend or comment on medication, never make decisions for them.\n' +
  '- Read the FULL conversation before replying. Short replies (yes/ok/sure) continue the prior thread.\n' +
  '- Be specific and human. Avoid hollow openers like "I hear you" or "That must be hard".'

function buildPrompt(label: string, ctx: PatientContext, moodSpike: string): string {
  const base =
    `You are Calmly, a warm mental wellness companion for ${ctx.firstName} on GetCalmly.\n` +
    `Patient: ${ctx.firstName} | ${ctx.diagnosis ?? 'Not specified'} | Membership: ${ctx.membership.toUpperCase()}\n` +
    `Emotional state: ${emotionalState(ctx)}\n` +
    (moodSpike ? `ALERT: ${moodSpike}\n` : '') +
    '\n' +
    assessmentBlock(ctx) +
    '\n'

  if (label === 'GREETING') {
    return base + 'RULES:\n- Respond warmly in 1-2 sentences only.\n- Do NOT mention mood scores, past incidents, or clinical data.\n- Just open the door — let them lead.'
  }
  if (label === 'GENERIC_WELLNESS') {
    return base + 'RULES:\n- Answer the wellness question briefly and practically.\n- Tie it lightly to their current state if it adds value.\n- 1-2 sentences. No clinical language.'
  }

  const baseNn = base + 'NON-NEGOTIABLE RULES:\n' + NON_NEG + '\n'

  if (label === 'MOOD_CHECKIN') {
    return baseNn + 'MOOD DATA (7-day):\n' + moodDataBlock(ctx) + '\n\nRULES:\n- Answer specifically using the mood data.\n- Name the trend, the low point, and the high point with days.\n- If declining, gently acknowledge it without alarming.\n- 1-2 sentences max.'
  }
  if (label === 'JOURNAL_INSIGHT') {
    const teaser = ctx.membership !== 'paid'
      ? '\n\nFREE TIER NOTE: Give a brief helpful insight (2 sentences), then add: Your full journal pattern analysis is available to GetCalmly Premium members. Upgrade at getcalmly.com/subscribe.'
      : ''
    return baseNn + 'JOURNAL ENTRIES:\n' + journalsBlock(ctx, 4, 120) + '\n\nRULES:\n- Reference specific journal entries by date or content.\n- Identify themes or patterns across entries.\n- Reflect, do not advise. Let them see themselves clearly.\n- 1-2 sentences.' + teaser
  }
  if (label === 'SESSION_REFLECT') {
    const sb = ctx.membership === 'paid' ? 'SESSION NOTES:\n' + sessionsBlock(ctx, 3, 160) + '\n\n' : ''
    const teaser = ctx.membership === 'free'
      ? "\n\nFREE TIER NOTE: Acknowledge you don't have their session notes, ask what they remember, then add: GetCalmly Premium members get full session note access. Upgrade at getcalmly.com/subscribe."
      : ''
    return baseNn + sb + 'RULES:\n- Reference the session notes directly and specifically.\n- If no notes available, acknowledge that and ask what they remember.\n- Do not invent session content.\n- 1-2 sentences.' + teaser
  }
  if (label === 'VENT_MILD') {
    const helped = assessmentBlock(ctx, { helped: true, triggers: true, risk: false })
    return baseNn + 'RECENT JOURNALS:\n' + journalsBlock(ctx, 2, 80) + '\n\n' + (helped ? 'PERSONALISED CONTEXT:\n' + helped + '\n' : '') + 'RULES:\n- Validate first, advise second.\n- Use what_has_helped above for any coping suggestion — not a generic tip.\n- 1-2 sentences. Do not over-escalate.\n- If they say nothing helps — name one specific thing from their history.'
  }
  if (label === 'VENT_DISTRESS') {
    const sessions = ctx.membership === 'paid' ? sessionsBlock(ctx, 2, 130) : 'Not available.'
    return baseNn + 'RECENT JOURNALS:\n' + journalsBlock(ctx, 3, 110) + '\n\nSESSION NOTES:\n' + sessions + '\n\nPERSONALISED CONTEXT:\n' + assessmentBlock(ctx, { helped: true, triggers: true, risk: true }) + '\nRULES:\n- Lead with warmth and validation. Use their specific words back to them.\n- Do not minimise or rush to solutions.\n- After validating, offer one specific grounding suggestion from what_has_helped above.\n- ' + counsellorLine(ctx) + '\n- 2-3 sentences.'
  }
  if (label === 'CRISIS') {
    const sessions = ctx.membership === 'paid' ? sessionsBlock(ctx, 2, 130) : 'Not available.'
    return baseNn + 'JOURNALS:\n' + journalsBlock(ctx, 2, 100) + '\n\nSESSION NOTES:\n' + sessions + '\n\nRISK CONTEXT:\n' + assessmentBlock(ctx, { helped: false, triggers: true, risk: true }) + '\nRULES:\n- PRIORITY: Ask directly "are you safe right now" if not already established.\n- Provide iCall helpline: ' + ICALL + ' — say it clearly.\n- ' + counsellorLine(ctx) + '\n- If passive SI history is YES — take extra care; do not minimise.\n- If safety plan is active — remind them gently.\n- Do NOT ask multiple questions at once.\n- Stay calm, warm, and present. Do not lecture or over-explain.\n- Validate the pain without dramatising it.'
  }
  if (label === 'ADVICE_SEEK') {
    const helped = assessmentBlock(ctx, { helped: true, triggers: true, risk: false })
    return baseNn + 'RECENT JOURNALS:\n' + journalsBlock(ctx, 2, 80) + '\n\n' + (helped ? 'WHAT HAS WORKED FOR THIS PATIENT:\n' + helped + '\n' : '') + 'RULES:\n- Give one clear, concrete suggestion drawn from what_has_helped above.\n- If empty, use one journal-grounded suggestion.\n- Never give a generic list. One thing, specific to them.\n- 1-2 sentences.'
  }
  if (label === 'RELATIONSHIP') {
    const sit = ctx.currentSituation ? `CURRENT SITUATION: ${ctx.currentSituation}\n\n` : ''
    return baseNn + sit + 'RECENT JOURNALS:\n' + journalsBlock(ctx, 3, 100) + '\n\nRULES:\n- Stay neutral. Do not take sides or judge the other person.\n- Reflect their feelings back using their own words.\n- Do NOT suggest partner/relationship actions if patient is separated, divorced, or not in a relationship.\n- Help them think through it, not decide for them.\n- 1-2 sentences.'
  }
  if (label === 'MEDICAL_QUESTION') {
    return baseNn + 'RULES:\n- Do NOT answer medical or diagnostic questions.\n- ' + counsellorLine(ctx) + '\n- 1-2 warm sentences only.'
  }
  return baseNn + 'RULES:\n' + NON_NEG
}

function dedupe(turns: ChatTurn[], threshold = 0.92): ChatTurn[] {
  if (turns.length < 2) return turns
  const out = [turns[0]]
  for (const t of turns.slice(1)) {
    const a = new Set(out[out.length - 1].content.toLowerCase().split(/\s+/))
    const b = new Set(t.content.toLowerCase().split(/\s+/))
    if (!a.size || !b.size) {
      out.push(t)
      continue
    }
    const overlap = [...a].filter((w) => b.has(w)).length / Math.max(a.size, b.size)
    if (overlap < threshold) out.push(t)
  }
  return out
}

function buildMessages(label: string, question: string, ctx: PatientContext): ChatTurn[] {
  const budget = LABEL_HISTORY_TURNS[label] ?? 6
  if (budget === 0) return [{ role: 'user', content: question }]
  const history: ChatTurn[] = ctx.chat
    .filter((c) => c.role === 'user' || c.role === 'assistant')
    .map((c) => ({ role: c.role, content: c.content.slice(0, 350) }))
  const trimmed = dedupe(history.slice(-budget))
  return [...trimmed, { role: 'user', content: question }]
}

// Heuristic classifier used when no OpenAI key is configured — crisis-safe.
function heuristicClassify(text: string): { label: string; intent: string; intensity: string } {
  const t = text.toLowerCase()
  if (CRISIS_KEYWORDS.some((k) => t.includes(k))) return { label: 'CRISIS', intent: 'crisis', intensity: 'crisis' }
  if (['hopeless', 'worthless', "can't go on", 'empty', 'numb'].some((k) => t.includes(k)))
    return { label: 'VENT_DISTRESS', intent: 'vent', intensity: 'high' }
  if (['anxious', 'anxiety', 'panic', 'worried', 'stress'].some((k) => t.includes(k)))
    return { label: 'VENT_MILD', intent: 'vent', intensity: 'medium' }
  if (t.length < 15) return { label: 'GREETING', intent: 'just_talking', intensity: 'low' }
  return { label: 'VENT_MILD', intent: 'seek_advice', intensity: 'medium' }
}

async function classify(
  question: string,
  ctx: PatientContext
): Promise<{ label: string; intent: string; intensity: string }> {
  if (!aiConfig.openAiKey) return heuristicClassify(question)
  const recent = ctx.chat
    .slice(-4)
    .map((c) => `${c.role === 'user' ? 'Patient' : 'Bot'}: ${c.content.slice(0, 60)}`)
    .join(' | ')
  const priorLabel = ctx.chat.filter((c) => c.role === 'assistant').slice(-1)[0] ? '' : ''
  const msg = `${priorLabel}Recent conversation: ${recent || 'Start of conversation'}\nNew message: ${question}`
  const res = await callModel(CLASSIFIER_MODEL, CLASSIFY_SYSTEM, [{ role: 'user', content: msg }], {
    temperature: 0,
    maxTokens: 30,
    jsonMode: true,
  })
  if (!res.answer) return heuristicClassify(question)
  try {
    const p = JSON.parse(res.answer)
    let label = String(p.label ?? 'VENT_MILD').toUpperCase()
    let intent = String(p.intent ?? 'seek_advice').toLowerCase()
    let intensity = String(p.intensity ?? 'medium').toLowerCase()
    if (!VALID_LABELS.has(label)) label = 'VENT_MILD'
    if (!VALID_INTENTS.has(intent)) intent = 'seek_advice'
    if (!VALID_INTENSITY.has(intensity)) intensity = 'medium'
    return { label, intent, intensity }
  } catch {
    return heuristicClassify(question)
  }
}

function detectMoodSpike(ctx: PatientContext): string {
  if (ctx.mood.length < 3) return ''
  const today = new Date().toISOString().slice(0, 10)
  const todayEntry = ctx.mood.find((m) => m.date === today)
  if (!todayEntry) return ''
  const recent = ctx.mood.filter((m) => m.date !== today).slice(0, 8).map((m) => m.score)
  if (!recent.length) return ''
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length
  if (avg - todayEntry.score >= 2.0)
    return "MOOD ALERT: Today feels significantly lower than this patient's recent baseline. Be especially attentive."
  return ''
}

// De-escalation derived from stored labels: after CRISIS_DEESCALATE_AFTER calm
// turns following a high-stake turn, drop back to normal routing.
function checkDeescalation(ctx: PatientContext, label: string): boolean {
  if (HIGH_STAKE_LABELS.has(label)) return false
  const userLabels = ctx.chat.filter((c) => c.role === 'user' && c.label != null).map((c) => c.label as string)
  if (!userLabels.length) return false
  const lastHighIdx = userLabels.map((l) => HIGH_STAKE_LABELS.has(l)).lastIndexOf(true)
  if (lastHighIdx === -1) return false
  const calmSince = userLabels.length - 1 - lastHighIdx
  return calmSince >= CRISIS_DEESCALATE_AFTER - 1
}

async function freeLimitReached(ctx: PatientContext): Promise<boolean> {
  if (ctx.membership === 'paid') return false
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const count = await prisma.calmAiMessage.count({
    where: { userId: ctx.userId, role: 'USER', createdAt: { gte: start } },
  })
  return count >= FREE_DAILY_LIMIT
}

async function saveCrisisAlert(ctx: PatientContext, question: string, answer: string, label: string) {
  const recentScores = ctx.mood.slice(0, 7).map((m) => m.score)
  const avgMood = recentScores.length ? Math.round((recentScores.reduce((a, b) => a + b, 0) / recentScores.length) * 10) / 10 : 'N/A'
  const latestScale = ctx.scores[ctx.scores.length - 1]
  const handoff =
    `PATIENT: ${ctx.name} | Diagnosis: ${ctx.diagnosis ?? 'N/A'}\n` +
    `WHAT THEY SAID: ${question.slice(0, 200)}\n` +
    `WHAT CALMLY RESPONDED: ${answer.slice(0, 200)}\n` +
    `EMOTIONAL STATE THIS WEEK: Avg mood ${avgMood}/10 | ` +
    `Clinical scale: ${ctx.scale ?? 'N/A'} — ${latestScale?.label ?? 'N/A'} | ` +
    `SI history: ${ctx.risk.passiveSiHistory ? 'YES' : 'no'}\n` +
    `ACTION NEEDED: Please follow up with ${ctx.name} before their next scheduled session.`
  await prisma.crisisAlert.create({
    data: {
      userId: ctx.userId,
      patientName: ctx.name,
      therapistName: ctx.therapistName ?? null,
      therapistEmail: ctx.therapistEmail ?? null,
      label,
      question,
      answer,
      handoffNote: handoff,
    },
  })
}

export type ChatResult = {
  reply: string
  label: string
  intent: string
  intensity: string
  highStake: boolean
  model: string
  deescalated: boolean
  spike: boolean
}

/**
 * Run the full chat pipeline for a signed-in patient and persist both turns
 * (with classifier metadata) plus any crisis hand-off. Returns null when no LLM
 * is configured so the caller can use the rule-based stand-in instead.
 */
export async function runChat(userId: string, question: string): Promise<ChatResult | null> {
  if (!aiConfig.openAiKey && !aiConfig.anthropicKey) return null
  const ctx = await buildPatientContext(userId)
  if (!ctx) return null

  if (await freeLimitReached(ctx)) {
    await prisma.calmAiMessage.create({ data: { userId, role: 'USER', content: question } })
    await prisma.calmAiMessage.create({
      data: { userId, role: 'ASSISTANT', content: SUBSCRIBE_MSG, label: 'LIMIT', model: 'limit' },
    })
    return { reply: SUBSCRIBE_MSG, label: 'LIMIT', intent: '--', intensity: '--', highStake: false, model: 'limit', deescalated: false, spike: false }
  }

  const cls = await classify(question, ctx)
  let { label } = cls
  const { intent } = cls
  let { intensity } = cls

  const deescalated = checkDeescalation(ctx, label)
  if (deescalated) {
    label = 'VENT_MILD'
    intensity = 'low'
  }
  const isHs = HIGH_STAKE_LABELS.has(label)

  const persistTurn = async (reply: string, modelUsed: string) => {
    await prisma.calmAiMessage.create({
      data: { userId, role: 'USER', content: question, label, intent, intensity, highStake: isHs },
    })
    await prisma.calmAiMessage.create({
      data: { userId, role: 'ASSISTANT', content: reply, label, intent, intensity, highStake: isHs, model: modelUsed },
    })
  }

  if (label === 'BLOCKED') {
    await persistTurn(BLOCKED_REPLY, 'blocked')
    return { reply: BLOCKED_REPLY, label, intent, intensity, highStake: false, model: 'none', deescalated, spike: false }
  }
  if (label === 'APP_SUPPORT') {
    await persistTurn(APP_REPLY, 'app_support')
    return { reply: APP_REPLY, label, intent, intensity, highStake: false, model: 'none', deescalated, spike: false }
  }

  const moodSpike = detectMoodSpike(ctx)
  const system = buildPrompt(label, ctx, moodSpike)
  const messages = buildMessages(label, question, ctx)
  const { routine, highStake } = modelsForMembership(ctx.membership)
  const modelKey = isHs ? highStake : routine

  const res = await callModel(modelKey, system, messages, {
    temperature: LABEL_TEMPERATURE[label] ?? 0.7,
    maxTokens: LABEL_MAX_TOKENS[label] ?? 120,
  })

  let answer = res.answer
  if (!answer) {
    answer = isHs
      ? `I'm here with you. Please reach out to ${ctx.therapistName ?? 'a professional'} or call iCall at ${ICALL} — you don't have to handle this alone.`
      : 'Something went wrong on my end. Please try again in a moment.'
  }

  const modelUsed = MODELS[modelKey]
  await persistTurn(answer, modelUsed)
  if (isHs) {
    try {
      await saveCrisisAlert(ctx, question, answer, label)
    } catch {
      // hand-off logging is best-effort; never block the patient's reply
    }
  }
  // Touch intensity score for any downstream trajectory use.
  void INTENSITY_SCORE
  return { reply: answer, label, intent, intensity, highStake: isHs, model: modelUsed, deescalated, spike: Boolean(moodSpike) }
}
