'use client'

import { useState, useTransition } from 'react'
import { Sparkles } from 'lucide-react'
import { completeSession, getNoteDraft } from '@/app/(dashboard)/expert/actions'

/**
 * Completing a session: the therapist jots quick bullets, optionally asks the
 * AI co-pilot to expand them into a structured note, edits the draft, then
 * saves — the edited text (never the raw AI output unreviewed) is what's
 * persisted to Appointment.summary.
 */
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
  const [bullets, setBullets] = useState('')
  const [summary, setSummary] = useState(initialSummary)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDraft() {
    setError(null)
    startTransition(async () => {
      const draft = await getNoteDraft(bullets)
      if (draft) setSummary(draft)
      else setError('Could not generate a draft — write the note directly below.')
    })
  }

  return (
    <form action={completeSession} className="stack" style={{ gap: 10 }}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="patientId" value={patientId} />
      <label className="muted" style={{ fontSize: 12 }}>
        Quick bullets (optional — for the AI draft)
        <textarea
          className="entry-input"
          style={{ marginTop: 4, minHeight: 60 }}
          value={bullets}
          onChange={(e) => setBullets(e.target.value)}
          placeholder="e.g. talked through work deadline anxiety, practised reframing, homework: thought log"
        />
      </label>
      <button type="button" className="btn btn-outline btn-sm" onClick={handleDraft} disabled={pending || !bullets.trim()}>
        <Sparkles size={14} /> {pending ? 'Drafting…' : 'Draft with AI'}
      </button>
      {error && <div className="muted" style={{ color: 'var(--c-coral)' }}>{error}</div>}
      <label className="muted" style={{ fontSize: 12 }}>
        Session note (saved to the patient&apos;s record)
        <textarea
          className="entry-input"
          style={{ marginTop: 4, minHeight: 100 }}
          name="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write or edit the session summary…"
          required
        />
      </label>
      <button type="submit" className="btn btn-primary btn-sm" disabled={!summary.trim()}>
        {submitLabel}
      </button>
    </form>
  )
}
