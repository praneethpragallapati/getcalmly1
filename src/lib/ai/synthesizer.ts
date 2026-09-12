/**
 * Information synthesizer (backend job). Ported from the synthesizer notebook:
 * compresses raw text into either a clinical summary (session notes) or a warm
 * narrative (journals/chat/general). Runs server-side only and feeds the patient's
 * AiProfile, the "abridged AI version" (#13) the chat + insight pipelines read
 * instead of raw records. All inputs are already privacy-gated by buildPatientContext.
 */
import { callModel } from './clients'
import { SYNTH_MODEL } from './models'
import { recordAiUsage } from './usage'
import type { PatientContext } from './context'

export type SourceType = 'session_note' | 'journal' | 'chat_log' | 'general'

const PROMPTS: Record<SourceType, string> = {
  // Deliberately detailed: a session note must keep every clinically important
  // fact, so this is a structured summary (120-160 words), not a one-liner.
  session_note:
    'Compress this therapy session note into a structured clinical summary.\n' +
    'Use short sentences (max 12 words each), not just keywords and not full paragraphs.\n' +
    'Keep every clinically important detail. Do not over-compress or drop key facts.\n' +
    'Output format (use exactly these headings, one per line):\n' +
    'Date: [date if present, else NONE]\n' +
    'Scores: [PHQ-9 / GAD-7 / CGI / C-SSRS or other scores if present, else NONE]\n' +
    'Themes: [2 to 3 short sentences on the key emotional and clinical themes]\n' +
    'Treatment: [1 to 2 sentences on the current approach or technique]\n' +
    'Tasks: [what was assigned to the patient, or NONE]\n' +
    'Risk: [any suicidal ideation, self-harm, or safety flags, or NONE]\n' +
    'Plan: [the next step, in one or two sentences]\n' +
    'Aim for 120 to 160 words total. Clinical but readable. Never use em dashes.',
  journal:
    'Compress this journal entry into a warm narrative summary an AI wellness companion can reference. ' +
    'Write in second person (you/your). Capture: emotional state, key events or thoughts, any progress or struggles. ' +
    'Max 50 words. One flowing paragraph. Human, not clinical.',
  chat_log:
    'Compress this conversation log into a warm narrative summary an AI wellness companion can reference as context. ' +
    'Write in second person. Cover: emotional arc, main topics, any breakthroughs or concerns. ' +
    'Max 60 words. One flowing paragraph.',
  general:
    'Compress this text into a warm narrative summary suitable for an AI wellness companion to reference as context. ' +
    'Write in second person where possible. Capture the emotional core and key information. ' +
    'Max 60 words. One flowing paragraph.',
}

// Session notes get more room so detail survives; the narrative modes stay tight.
const MAX_TOKENS: Record<SourceType, number> = { session_note: 320, journal: 160, chat_log: 180, general: 180 }

/** Compress one block of raw text. Returns null on empty input or failure. */
export async function synthesize(rawText: string, sourceType: SourceType, userId?: string): Promise<string | null> {
  const text = rawText.trim()
  if (!text) return null
  const res = await callModel(SYNTH_MODEL, PROMPTS[sourceType], [{ role: 'user', content: text.slice(0, 12000) }], {
    temperature: 0,
    maxTokens: MAX_TOKENS[sourceType],
  })
  await recordAiUsage('synth', SYNTH_MODEL, res.inp, res.out, userId)
  return res.answer
}

/** Convenience: synthesize a single session note into the structured summary. */
export function synthesizeSessionNote(rawText: string, userId?: string): Promise<string | null> {
  return synthesize(rawText, 'session_note', userId)
}

export type SynthResult = { summary: string | null; sessionSummary: string | null; journalDigest: string | null }

/**
 * Synthesize a patient's allowed journals + session notes into a compact profile.
 * Only categories permitted by ctx.allowed are compressed, a disallowed category
 * yields null and never reaches the model.
 */
export async function synthesizeProfile(ctx: PatientContext): Promise<SynthResult> {
  let sessionSummary: string | null = null
  let journalDigest: string | null = null

  if (ctx.allowed.sessions && ctx.sessions.length) {
    const combined = ctx.sessions.map((s) => `[${s.date}] ${s.note}`).join('\n\n')
    sessionSummary = await synthesize(combined, 'session_note', ctx.userId)
  }
  if (ctx.allowed.journals && ctx.journals.length) {
    const combined = ctx.journals.map((j) => `[${j.date}] ${j.entry}`).join('\n\n')
    journalDigest = await synthesize(combined, 'journal', ctx.userId)
  }

  const parts = [
    sessionSummary ? `Sessions: ${sessionSummary}` : '',
    journalDigest ? `Journals: ${journalDigest}` : '',
  ].filter(Boolean)

  return { summary: parts.length ? parts.join('\n\n') : null, sessionSummary, journalDigest }
}
