'use client'

import { useState } from 'react'
import { completeSession } from '@/app/(dashboard)/expert/actions'

/**
 * Completing a session: the therapist writes the clinical note and saves;
 * the session is only counted (and paid) once its note is on record.
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
  const [summary, setSummary] = useState(initialSummary)

  return (
    <form action={completeSession} className="stack" style={{ gap: 10 }}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="patientId" value={patientId} />
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
