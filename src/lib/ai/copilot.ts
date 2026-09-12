/**
 * Clinician Copilot: a concise, factual pre-session brief for the treating
 * clinician about a patient's progress SINCE THE LAST SESSION (or, for a first
 * session, everything leading up to today). It draws on the measures, the
 * synthesized notes of prior sessions, mood/journal engagement and what has
 * helped, then has nano write it up.
 *
 * This is a clinical view for the clinician, so it is NOT gated by the patient's
 * AI-personalisation privacy switches (those govern the patient's own chatbot and
 * insights). Numbers are allowed here — the reader is the clinician.
 */
import { prisma } from '@/lib/prisma'
import { callModel } from './clients'
import { hasLlm } from './config'
import { recordAiUsage } from './usage'
import { getAiConfig, configTypeFor } from './settings'
import { fmtIST } from '@/lib/tz'

export type CopilotBrief = { ok: boolean; brief?: string; firstSession?: boolean; error?: string }

const SCALE_LABEL: Record<string, string> = {
  PHQ9: 'PHQ-9 (depression)', GAD7: 'GAD-7 (anxiety)', K10: 'K10 (distress)',
  WHO5: 'WHO-5 (wellbeing)', GAS: 'GAS (goals/alliance)', CGI: 'CGI (clinician)', CSSRS: 'C-SSRS (safety)',
}

export async function generateClinicianCopilot(patientId: string): Promise<CopilotBrief> {
  if (!hasLlm()) return { ok: false, error: 'No AI model is configured.' }
  const [cfg, type] = await Promise.all([getAiConfig(), configTypeFor(patientId)])
  if (!cfg.features[type].copilot) return { ok: false, error: 'The Copilot is turned off for this plan.' }

  const [user, completed, scoreRows, moods, journalCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: patientId }, select: { name: true, patientProfile: { select: { trackLabel: true, diagnosis: true, currentSituation: true } } } }).catch(() => null),
    prisma.appointment.findMany({
      where: { patientId, status: 'COMPLETED' },
      orderBy: { scheduledAt: 'desc' }, take: 4,
      select: { scheduledAt: true, summary: true, aiSummary: true },
    }).catch(() => []),
    prisma.assessmentScore.findMany({ where: { userId: patientId }, orderBy: { recordedAt: 'asc' }, take: 60, select: { scale: true, score: true, label: true, recordedAt: true } }).catch(() => []),
    prisma.moodEntry.findMany({ where: { userId: patientId }, orderBy: { createdAt: 'desc' }, take: 60, select: { mood: true, createdAt: true } }).catch(() => []),
    prisma.journalEntry.count({ where: { userId: patientId } }).catch(() => 0),
  ])
  if (!user) return { ok: false, error: 'Patient not found.' }

  const lastSession = completed[0] ?? null
  const firstSession = !lastSession
  const since = lastSession?.scheduledAt ?? new Date(0)
  const sinceLabel = lastSession ? fmtIST(lastSession.scheduledAt, { day: 'numeric', month: 'short', year: 'numeric' }) : null

  // Score changes per scale: earliest vs latest overall, plus movement since the
  // last session where there is a reading on each side.
  const byScale = new Map<string, { score: number; label: string | null; at: Date }[]>()
  for (const s of scoreRows) {
    const arr = byScale.get(s.scale) ?? []
    arr.push({ score: s.score, label: s.label, at: s.recordedAt })
    byScale.set(s.scale, arr)
  }
  const scoreLines: string[] = []
  for (const [scale, arr] of byScale) {
    const first = arr[0]
    const last = arr[arr.length - 1]
    const name = SCALE_LABEL[scale] ?? scale
    if (arr.length === 1) {
      scoreLines.push(`${name}: ${last.score}${last.label ? ` (${last.label})` : ''}, one reading`)
    } else {
      const dir = last.score === first.score ? 'no change' : last.score < first.score ? 'down' : 'up'
      scoreLines.push(`${name}: ${first.score} to ${last.score} (${dir})${last.label ? `, now ${last.label}` : ''}`)
    }
  }

  const moodsSince = moods.filter((m) => m.createdAt >= since)
  const moodBefore = moods.filter((m) => m.createdAt < since)
  const avg = (xs: { mood: number }[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b.mood, 0) / xs.length) * 10) / 10 : null)
  const moodLine = firstSession
    ? (avg(moods) != null ? `Average mood ${avg(moods)}/10 across ${moods.length} check-ins.` : 'No mood check-ins yet.')
    : (avg(moodsSince) != null
        ? `Average mood since last session ${avg(moodsSince)}/10 (${moodsSince.length} check-ins)` + (avg(moodBefore) != null ? `, was ${avg(moodBefore)}/10 before.` : '.')
        : 'No mood check-ins since the last session.')

  const priorNotes = completed
    .map((c) => c.aiSummary ?? c.summary)
    .filter(Boolean)
    .slice(0, 3)
    .join('\n---\n')

  const profile = user.patientProfile
  const context =
    `PATIENT: ${user.name ?? 'the patient'}${profile?.trackLabel ? ` | Track: ${profile.trackLabel}` : ''}${profile?.diagnosis ? ` | Diagnosis: ${profile.diagnosis}` : ''}\n` +
    (profile?.currentSituation ? `Current situation: ${profile.currentSituation}\n` : '') +
    `\nSCORE CHANGES:\n${scoreLines.length ? scoreLines.join('\n') : 'No measures recorded.'}\n` +
    `\nMOOD & ENGAGEMENT:\n${moodLine} Journals written to date: ${journalCount}.\n` +
    `\nPREVIOUS SESSION NOTES (most recent first):\n${priorNotes || 'None on record.'}\n`

  const framing = firstSession
    ? 'This is effectively the first session. Summarise what is known leading up to today so the clinician can walk in prepared.'
    : `Summarise progress since the last session on ${sinceLabel}.`

  const prompt =
    `Write a concise pre-session brief for a CLINICIAN about their patient, for today's session.\n${framing}\n\n` +
    context +
    '\nWrite it under these exact headings, each a short paragraph or a few bullet-style short sentences:\n' +
    'Since last session:\nScore changes:\nFrom previous sessions:\nWhat may be helping:\nWatch for:\n\n' +
    'Be factual and clinical. Numbers and scores are fine (the reader is the clinician). ' +
    'Do not invent anything not supported by the data above. Keep it under 200 words. Never use em dashes.'

  const res = await callModel(cfg.models.copilot, 'You write concise, factual clinical briefs.', [{ role: 'user', content: prompt }], {
    temperature: 0.3, maxTokens: 380,
  })
  await recordAiUsage('copilot', cfg.models.copilot, res.inp, res.out, patientId)
  if (!res.answer) return { ok: false, error: 'The model did not return a brief. Check AI health.' }
  return { ok: true, brief: res.answer, firstSession }
}
