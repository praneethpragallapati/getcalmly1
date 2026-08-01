'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'
import { deletePatient, deleteClinician } from '@/app/admin/actions'

const red = '#C0504B'

/**
 * Danger-zone control to permanently delete a patient or clinician. Two-step:
 * a click reveals a confirm row, so it can't be triggered by a single stray
 * click. On success it routes back to the relevant list.
 */
export function DeleteAccount({ kind, userId, name }: { kind: 'patient' | 'clinician'; userId: string; name: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const doDelete = () => {
    setError(null)
    startTransition(async () => {
      const res = kind === 'patient'
        ? await deletePatient({ userId })
        : await deleteClinician({ userId })
      if (res.ok) {
        router.push(kind === 'patient' ? '/admin/patients' : '/admin/therapists')
        router.refresh()
      } else {
        setError(res.error ?? 'Could not delete this account.')
        setConfirming(false)
      }
    })
  }

  return (
    <div className="card" style={{ border: `1px solid ${red}33` }}>
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, color: red }}>
        <AlertTriangle size={16} /> Danger zone
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
        {kind === 'patient'
          ? 'Permanently delete this patient and all of their data — check-ins, journals, tasks, packages, payments and sessions. This cannot be undone.'
          : 'Permanently delete this clinician account. Only possible while they have no sessions on record; otherwise deactivate them so patient history is preserved.'}
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => { setError(null); setConfirming(true) }}
          disabled={pending}
          className="btn"
          style={{ border: `1.5px solid ${red}`, color: red, background: '#fff', display: 'inline-flex', alignItems: 'center', gap: 7 }}
        >
          <Trash2 size={15} /> Delete {kind}
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1C2B3A' }}>Delete {name} permanently?</span>
          <button
            type="button"
            onClick={doDelete}
            disabled={pending}
            className="btn"
            style={{ background: red, color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, opacity: pending ? 0.6 : 1 }}
          >
            <Trash2 size={15} /> {pending ? 'Deleting…' : 'Yes, delete'}
          </button>
          <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="btn" style={{ border: '1.5px solid #E2E8F0', background: '#fff' }}>
            Cancel
          </button>
        </div>
      )}

      {error && <p style={{ fontSize: 13.5, color: red, marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} />{error}</p>}
    </div>
  )
}
