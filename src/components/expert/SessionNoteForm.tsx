'use client'

import { useMemo, useState } from 'react'
import { completeSession } from '@/app/(dashboard)/expert/actions'

/**
 * Structured clinical session note (SOAP-style: Subjective, Objective,
 * Assessment, Risk, Plan, Next focus). Therapists fill fixed fields instead of a
 * blank box, so every note follows the same standard format. The fields are
 * composed into one formatted note saved to `summary` (a hidden input), which
 * keeps the patient-facing readback and everything downstream unchanged.
 */
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
  submitLabel = 'Save & mark complete',
}: {
  appointmentId: string
  patientId: string
  initialSummary?: string
  submitLabel?: string
}) {
  // If re-opening an old free-text note, seed it into the first field so nothing
  // is lost (already-structured notes just re-appear there for editing).
  const [focus, setFocus] = useState(initialSummary)
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

      <button type="submit" className="btn btn-primary btn-sm" disabled={!canSubmit} style={{ alignSelf: 'flex-start' }}>
        {submitLabel}
      </button>
      {!canSubmit && <span className="muted" style={{ fontSize: 11.5 }}>Presenting concerns and a plan are required.</span>}
    </form>
  )
}
