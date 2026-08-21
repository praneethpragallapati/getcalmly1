'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pencil } from 'lucide-react'
import { saveDisplayName } from '@/app/(dashboard)/app/actions'

/**
 * Inline editor for the patient's name in Settings. OTP sign-up captures only an
 * email/phone, so this is where a patient adds the name shown across the app.
 */
export function NameEditor({ fullName, displayName }: { fullName: string; displayName: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(fullName)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function save() {
    const clean = value.trim()
    if (!clean) {
      setError('Enter your name.')
      return
    }
    setError(null)
    start(async () => {
      const res = await saveDisplayName(clean)
      if (res.ok) {
        setEditing(false)
        router.refresh()
      } else {
        setError(res.error ?? 'Could not save.')
      }
    })
  }

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="doc-name" style={{ fontSize: 15 }}>
          {fullName || displayName}
          {!fullName && (
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-gray)', marginLeft: 8 }}>
              (add your name)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setValue(fullName); setEditing(true) }}
          aria-label="Edit name"
          style={{ background: 'none', border: 'none', color: 'var(--c-coral-d)', cursor: 'pointer', display: 'inline-flex', padding: 2 }}
        >
          <Pencil size={14} />
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save() }}
          placeholder="Your full name"
          maxLength={80}
          style={{
            padding: '9px 12px', border: '1.5px solid var(--c-line)', borderRadius: 10,
            fontSize: 14.5, color: 'var(--c-charcoal)', background: 'var(--c-white)', outline: 'none', minWidth: 200,
          }}
        />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="btn btn-primary"
          style={{ padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Check size={15} /> {pending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setError(null) }}
          disabled={pending}
          style={{ background: 'none', border: 'none', color: 'var(--c-gray-d)', cursor: 'pointer', fontSize: 13.5, fontWeight: 600 }}
        >
          Cancel
        </button>
      </div>
      {error && <span style={{ fontSize: 12.5, color: 'var(--c-coral-d)', fontWeight: 600 }}>{error}</span>}
    </div>
  )
}
