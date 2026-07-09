/**
 * Information synthesizer (backend job). Ported from the synthesizer notebook:
 * compresses raw text into either a clinical summary (session notes) or a warm
 * narrative (journals/chat/general). Runs server-side only and feeds the patient's
 * AiProfile, the "abridged AI version" (#13) the chat + insight pipelines read
 * instead of raw records. All inputs are already privacy-gated by buildPatientContext.
 */
import { callModel } from './clients'
import { SYNTH_MODEL } from './models'
import type { PatientContext } from './context'

export type SourceType = 'session_note' | 'journal' | 'chat_log' | 'general'

const PROMPTS: Record<SourceType, string> = {
  session_note:
    'Compress this therapy session note into a structured clinical summary.\n' +
    'Use short sentences (max 10 words each), not just keywords, not full paragraphs.\n' +
    'Output format (use exactly these headings):\n' +
    'Date: [date]\nScores: [PHQ/GAD scores if present, else NONE]\n' +
    'Themes: [2-3 sentences on key emotional/clinical themes]\n' +
    'Treatment: [1 sentence on current approach or technique]\n' +
    'Homework: [what was assigned, or NONE]\n' +
    'Risk: [any SI, self-harm, or safety flags, NONE if absent]\n' +
    'Plan: [next step in one sentence]\n' +
    'Max 90 words total. Short sentences. Clinical but readable.',
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

/** Compress one block of raw text. Returns null on empty input or failure. */
export async function synthesize(rawText: string, sourceType: SourceType): Promise<string | null> {
  const text = rawText.trim()
  if (!text) return null
  const res = await callModel(SYNTH_MODEL, PROMPTS[sourceType], [{ role: 'user', content: text }], {
    temperature: 0,
    maxTokens: 180,
  })
  return res.answer
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
    sessionSummary = await synthesize(combined, 'session_note')
  }
  if (ctx.allowed.journals && ctx.journals.length) {
    const combined = ctx.journals.map((j) => `[${j.date}] ${j.entry}`).join('\n\n')
    journalDigest = await synthesize(combined, 'journal')
  }

  const parts = [
    sessionSummary ? `Sessions: ${sessionSummary}` : '',
    journalDigest ? `Journals: ${journalDigest}` : '',
  ].filter(Boolean)

  return { summary: parts.length ? parts.join('\n\n') : null, sessionSummary, journalDigest }
}
