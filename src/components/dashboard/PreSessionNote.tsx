'use client'

import { useState, useTransition } from 'react'
import { Check, FileText } from 'lucide-react'
import { savePreSessionNote } from '@/app/(dashboard)/app/actions'

/**
 * The note a patient prepares before a session, shared with the expert (#9).
 * Persists via the savePreSessionNote server action (ownership enforced there).
 */
export function PreSessionNote({
  appointmentId,
  initial,
}: {
  appointmentId: string
  initial: string
}) {
  const [note, setNote] = useState(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const res = await savePreSessionNote(appointmentId, note)
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 1600)
      } else {
        setError(res.error ?? 'Could not save.')
      }
    })
  }

  return (
    <div className="card">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileText size={17} /> Notes for your expert
      </div>
      <p className="muted" style={{ margin: '6px 0 14px' }}>
        Jot down what you’d like to focus on. Your expert sees this before the session so your time
        together starts where it matters.
      </p>
      <textarea
        className="note-area"
        rows={6}
        placeholder="e.g. The work anxiety has been worse this week, especially Sunday nights…"
        value={note}
        onChange={(e) => {
          setNote(e.target.value)
          setSaved(false)
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <button className="btn btn-primary" type="button" onClick={save} disabled={pending}>
          {saved ? (
            <>
              <Check size={15} /> Saved
            </>
          ) : pending ? (
            'Saving…'
          ) : (
            'Save note'
          )}
        </button>
        <span className="muted" style={{ fontSize: 12 }}>
          {error ?? 'Shared with your expert · private to your care team'}
        </span>
      </div>
    </div>
  )
}
