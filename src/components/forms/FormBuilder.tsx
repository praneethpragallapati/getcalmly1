'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus2, Plus, Trash2, X } from 'lucide-react'
import { createPlatformForm, removePlatformForm } from '@/app/admin/actions'
import { createMyForm, removeMyForm } from '@/app/(dashboard)/expert/actions'
import type { CustomFormRow } from '@/lib/forms'

const charcoal = '#1C2B3A'

type Draft = {
  label: string
  type: string
  required: boolean
  /** Comma-separated, only read for `select`. */
  options: string
}

const TYPE_LABEL: { value: string; label: string }[] = [
  { value: 'text', label: 'Short answer' },
  { value: 'textarea', label: 'Long answer' },
  { value: 'select', label: 'Choose one (dropdown)' },
  { value: 'checkbox', label: 'Tick box' },
  { value: 'date', label: 'Date' },
  { value: 'tel', label: 'Phone number' },
  { value: 'email', label: 'Email' },
]

const KIND_LABEL: Record<string, string> = {
  INFO: 'Information', CONSENT: 'Consent', FEEDBACK: 'Feedback', INTAKE: 'Intake',
}

const blank = (): Draft => ({ label: '', type: 'text', required: false, options: '' })

/**
 * Build a new form question by question, then use it anywhere a built-in form can
 * go — sent to a patient, or picked in an automatic rule. Used at both admin
 * (platform-wide) and expert (their own) scope; `scope` picks the server actions.
 *
 * `embedded` drops the card chrome and the list of existing forms, so the same
 * builder can sit inside a form picker — you create the form you need without
 * leaving the patient you were about to send it to. Saving refreshes the route,
 * which re-runs the server component that feeds the picker, so the new form
 * appears in the dropdown straight away.
 */
export function FormBuilder({ scope, forms = [], embedded = false }: {
  scope: 'admin' | 'expert'
  forms?: CustomFormRow[]
  embedded?: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [kind, setKind] = useState('INFO')
  const [fields, setFields] = useState<Draft[]>([blank()])
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const field: React.CSSProperties = {
    border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontSize: 13.5,
    fontFamily: 'inherit', color: charcoal, background: '#fff', width: '100%',
  }

  const setField = (i: number, patch: Partial<Draft>) =>
    setFields((f) => f.map((row, n) => (n === i ? { ...row, ...patch } : row)))

  const reset = () => {
    setTitle(''); setDescription(''); setKind('INFO'); setFields([blank()]); setError(null)
  }

  const save = () => {
    setError(null); setDone(null)
    if (!title.trim()) { setError('Give the form a title.'); return }
    const payload = {
      title,
      description,
      kind,
      fields: fields
        .filter((f) => f.label.trim())
        .map((f) => ({
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.type === 'select' ? f.options.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
        })),
    }
    if (payload.fields.length === 0) { setError('Add at least one question.'); return }
    start(async () => {
      const res = scope === 'admin' ? await createPlatformForm(payload) : await createMyForm(payload)
      if (res.ok) {
        setDone(`"${payload.title.trim()}" is ready to send.`)
        reset()
        setOpen(false)
        router.refresh()
      } else {
        setError(res.error || 'Could not save the form.')
      }
    })
  }

  const remove = (id: string) => start(async () => {
    const res = scope === 'admin' ? await removePlatformForm(id) : await removeMyForm(id)
    if (!res.ok) setError(res.error || 'Could not remove the form.')
    router.refresh()
  })

  return (
    <div className={embedded ? undefined : 'card'}>
      {embedded ? (
        <button onClick={() => { setOpen((o) => !o); setDone(null) }} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, padding: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          {open ? <X size={13} /> : <FilePlus2 size={13} />} {open ? 'Cancel' : 'Need a different form? Build one'}
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <FilePlus2 size={16} /> Your own forms
            </div>
            <p className="muted" style={{ fontSize: 12.5, margin: 0 }}>
              {scope === 'admin'
                ? 'Forms you build here join the library for every clinician to send.'
                : 'Forms you build here are yours to send, and can be used in your automatic rules.'}
            </p>
          </div>
          <button onClick={() => { setOpen((o) => !o); setDone(null) }} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {open ? <X size={14} /> : <Plus size={14} />} {open ? 'Cancel' : 'New form'}
          </button>
        </div>
      )}

      {done && <p style={{ fontSize: 12.5, color: '#2C7A57', marginTop: 10 }}>{done}</p>}

      {/* Existing custom forms */}
      {!embedded && forms.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {forms.map((f) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid rgba(28,43,58,.06)', opacity: f.active ? 1 : 0.55 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: charcoal }}>{f.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {KIND_LABEL[f.kind] ?? f.kind} · {f.fieldCount} question{f.fieldCount === 1 ? '' : 's'}
                  {f.createdByName && scope === 'admin' ? ` · by ${f.createdByName}` : ''}
                  {f.active ? '' : ' · retired'}
                </div>
              </div>
              {f.mine && f.active && (
                <button onClick={() => remove(f.id)} disabled={pending} aria-label={`Remove ${f.title}`} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0504B', display: 'inline-flex' }}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Builder */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(28,43,58,.08)', marginTop: 12, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }} data-embedded={embedded || undefined}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ flex: '2 1 240px' }}>
              <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Form title</div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sleep diary check-in" style={field} />
            </label>
            <label style={{ flex: '1 1 150px' }}>
              <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Type</div>
              <select value={kind} onChange={(e) => setKind(e.target.value)} style={field}>
                <option value="INFO">Information</option>
                <option value="CONSENT">Consent</option>
                <option value="FEEDBACK">Feedback</option>
              </select>
            </label>
          </div>
          <label>
            <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>What the patient sees under the title (optional)</div>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A line of context before they start." style={field} />
          </label>

          <div>
            <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>Questions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fields.map((f, i) => (
                <div key={i} style={{ border: '1px solid rgba(28,43,58,.09)', borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="muted" style={{ fontSize: 12, fontWeight: 700, width: 16 }}>{i + 1}.</span>
                    <input
                      value={f.label}
                      onChange={(e) => setField(i, { label: e.target.value })}
                      placeholder="Question"
                      style={{ ...field, flex: '2 1 220px', width: 'auto' }}
                    />
                    <select value={f.type} onChange={(e) => setField(i, { type: e.target.value })} style={{ ...field, flex: '1 1 160px', width: 'auto' }}>
                      {TYPE_LABEL.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <label className="muted" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={f.required} onChange={(e) => setField(i, { required: e.target.checked })} />
                      Required
                    </label>
                    {fields.length > 1 && (
                      <button onClick={() => setFields((rows) => rows.filter((_, n) => n !== i))} aria-label={`Remove question ${i + 1}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0504B', display: 'inline-flex' }}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  {f.type === 'select' && (
                    <input
                      value={f.options}
                      onChange={(e) => setField(i, { options: e.target.value })}
                      placeholder="Choices, separated by commas — e.g. Never, Sometimes, Often"
                      style={{ ...field, fontSize: 12.5 }}
                    />
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setFields((f) => [...f, blank()])} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Plus size={13} /> Add question
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={save} disabled={pending} className="btn btn-primary btn-sm">
              {pending ? 'Saving…' : 'Save form'}
            </button>
            <span className="muted" style={{ fontSize: 11.5 }}>You can send it as soon as it&apos;s saved.</span>
          </div>
        </div>
      )}

      {error && <p style={{ fontSize: 12.5, color: '#C0504B', marginTop: 8 }}>{error}</p>}
    </div>
  )
}
