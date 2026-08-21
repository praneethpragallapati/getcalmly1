'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { completeSession, saveSessionNoteDraft } from '@/app/(dashboard)/expert/actions'

/**
 * Structured clinical session note (SOAP-style: Subjective, Objective,
 * Assessment, Risk, Plan, Next focus). Therapists fill fixed fields instead of a
 * blank box, so every note follows the same standard format. The fields are
 * composed into one formatted note saved to `summary` (a hidden input), which
 * keeps the patient-facing readback and everything downstream unchanged.
 *
 * The note autosaves as a DRAFT while it is being written. The draft is a
 * separate column from `summary` on purpose: writing `summary` is what marks a
 * session written-up, so autosaving into it would mark every half-finished note
 * as complete. Nothing is submitted until the clinician presses the button.
 */

/** How long to wait after the last keystroke before saving. */
const AUTOSAVE_IDLE_MS = 1500
const RISK_LEVELS = ['None', 'Low', 'Moderate', 'High'] as const

function composeNote(f: {
  focus: string; observations: string; assessment: string; risk: string; riskNotes: string; plan: string; nextFocus: string
}): string {
  const parts: string[] = []
  if (f.focus.trim()) parts.push(`SUBJECTIVE — Presenting concerns & session focus:\n${f.focus.trim()}`)
  if (f.observations.trim()) parts.push(`OBJECTIVE — Observations / mental status:\n${f.observations.trim()}`)
  if (f.assessment.trim()) parts.push(`ASSESSMENT — Clinical impression & progress:\n${f.assessment.trim()}`)
  parts.push(`RISK: ${f.risk}${f.riskNotes.trim() ? ` — ${f.riskNotes.trim()}` : ''}`)
  if (f.plan.trim()) parts.push(`PLAN — Interventions & homework:\n${f.plan.trim()}`)
  if (f.nextFocus.trim()) parts.push(`NEXT SESSION FOCUS:\n${f.nextFocus.trim()}`)
  return parts.join('\n\n')
}

export function SessionNoteForm({
  appointmentId,
  patientId,
  initialSummary = '',
  initialDraft = '',
  submitLabel = 'Save & mark complete',
}: {
  appointmentId: string
  patientId: string
  initialSummary?: string
  /** An autosaved draft to pick back up, if this note was left half-written. */
  initialDraft?: string
  submitLabel?: string
}) {
  // If re-opening an old free-text note, seed it into the first field so nothing
  // is lost (already-structured notes just re-appear there for editing).
  const [focus, setFocus] = useState(initialSummary || initialDraft)
  const [observations, setObservations] = useState('')
  const [assessment, setAssessment] = useState('')
  const [risk, setRisk] = useState<string>('None')
  const [riskNotes, setRiskNotes] = useState('')
  const [plan, setPlan] = useState('')
  const [nextFocus, setNextFocus] = useState('')

  const composed = useMemo(
    () => composeNote({ focus, observations, assessment, risk, riskNotes, plan, nextFocus }),
    [focus, observations, assessment, risk, riskNotes, plan, nextFocus]
  )
  const canSubmit = focus.trim().length > 0 && plan.trim().length > 0

  // Autosave: debounce on idle, and skip the very first render so simply
  // opening a note doesn't write a draft identical to what's already stored.
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const lastSaved = useRef(composed)
  const firstRun = useRef(true)

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; lastSaved.current = composed; return }
    if (composed === lastSaved.current) return
    const t = setTimeout(() => {
      const snapshot = composed
      setSaving(true)
      void saveSessionNoteDraft(appointmentId, snapshot).then((r) => {
        setSaving(false)
        if (r.ok) { lastSaved.current = snapshot; setSavedAt(r.savedAt ?? new Date().toISOString()) }
      })
    }, AUTOSAVE_IDLE_MS)
    return () => clearTimeout(t)
  }, [composed, appointmentId])

  const field = (label: string, node: React.ReactNode, hint?: string) => (
    <label className="muted" style={{ fontSize: 12, display: 'block' }}>
      {label}{hint && <span style={{ opacity: 0.7 }}> · {hint}</span>}
      <div style={{ marginTop: 4 }}>{node}</div>
    </label>
  )

  return (
    <form action={completeSession} className="stack" style={{ gap: 12 }}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="summary" value={composed} />

      {field('Presenting concerns & session focus', (
        <textarea className="entry-input" style={{ minHeight: 64 }} value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="What the patient brought in; what this session focused on…" />
      ), 'Subjective')}

      {field('Observations / mental status', (
        <textarea className="entry-input" style={{ minHeight: 56 }} value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Affect, mood, engagement, appearance…" />
      ), 'Objective')}

      {field('Clinical impression & progress', (
        <textarea className="entry-input" style={{ minHeight: 56 }} value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder="Your assessment and how the patient is progressing…" />
      ), 'Assessment')}

      <div className="grid-2" style={{ gap: 10 }}>
        {field('Risk', (
          <select className="entry-input" value={risk} onChange={(e) => setRisk(e.target.value)}>
            {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        ))}
        {field('Risk notes', (
          <input className="entry-input" value={riskNotes} onChange={(e) => setRiskNotes(e.target.value)} placeholder="Only if any risk noted" />
        ))}
      </div>

      {field('Plan — interventions & homework', (
        <textarea className="entry-input" style={{ minHeight: 56 }} value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Techniques used, tasks assigned, referrals…" />
      ), 'Plan')}

      {field('Focus for next session', (
        <input className="entry-input" value={nextFocus} onChange={(e) => setNextFocus(e.target.value)} placeholder="What to pick up next time" />
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={!canSubmit}>
          {submitLabel}
        </button>
        <span className="muted" style={{ fontSize: 11.5 }} aria-live="polite">
          {saving ? 'Saving draft…' : savedAt ? 'Draft saved' : 'Drafts save automatically'}
        </span>
      </div>
      {!canSubmit && <span className="muted" style={{ fontSize: 11.5 }}>Presenting concerns and a plan are required.</span>}
    </form>
  )
}
