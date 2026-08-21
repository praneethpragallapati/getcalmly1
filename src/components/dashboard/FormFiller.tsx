'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import type { FormField } from '@/data/forms'
import { submitAssignedForm } from '@/app/(dashboard)/app/actions'

type Props = {
  assignmentId: string
  fields: FormField[]
  readOnly: boolean
  initial: Record<string, string | boolean> | null
}

/**
 * Renders an assigned form from its field schema and submits the responses.
 * Read-only once completed (the patient can review their answers). Validation is
 * light: required text fields must be non-empty, required checkboxes must be ticked.
 */
export function FormFiller({ assignmentId, fields, readOnly, initial }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const base: Record<string, string | boolean> = {}
    for (const f of fields) base[f.key] = initial?.[f.key] ?? (f.type === 'checkbox' ? false : '')
    return base
  })
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function set(key: string, val: string | boolean) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  function handleSubmit() {
    setError('')
    for (const f of fields) {
      if (!f.required) continue
      const v = values[f.key]
      if (f.type === 'checkbox' ? v !== true : !String(v ?? '').trim()) {
        setError(`Please complete: ${f.label}`)
        return
      }
    }
    startTransition(async () => {
      const res = await submitAssignedForm(assignmentId, values)
      if (res.ok) router.push('/app/forms')
      else setError(res.error ?? 'Could not submit this form.')
    })
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      {fields.map((f) => (
        <div key={f.key}>
          {f.type === 'checkbox' ? (
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, cursor: readOnly ? 'default' : 'pointer' }}>
              <input
                type="checkbox"
                checked={values[f.key] === true}
                disabled={readOnly}
                onChange={(e) => set(f.key, e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span>
                {f.label}
                {f.required && <span style={{ color: 'var(--c-coral-d)' }}> *</span>}
              </span>
            </label>
          ) : (
            <>
              <label className="muted" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                {f.label}
                {f.required && <span style={{ color: 'var(--c-coral-d)' }}> *</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  className="entry-input"
                  rows={3}
                  value={String(values[f.key] ?? '')}
                  disabled={readOnly}
                  onChange={(e) => set(f.key, e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              ) : f.type === 'select' ? (
                <select
                  className="entry-input"
                  value={String(values[f.key] ?? '')}
                  disabled={readOnly}
                  onChange={(e) => set(f.key, e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select…</option>
                  {(f.options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="entry-input"
                  type={f.type}
                  value={String(values[f.key] ?? '')}
                  disabled={readOnly}
                  onChange={(e) => set(f.key, e.target.value)}
                  style={{ width: '100%' }}
                />
              )}
            </>
          )}
          {f.help && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{f.help}</div>}
        </div>
      ))}

      {error && <p style={{ color: 'var(--c-coral-d)', fontSize: 13, margin: 0 }}>{error}</p>}

      {!readOnly && (
        <button className="btn btn-primary" onClick={handleSubmit} disabled={pending} style={{ alignSelf: 'flex-start' }}>
          <Check size={16} /> {pending ? 'Submitting…' : 'Submit form'}
        </button>
      )}
    </div>
  )
}
