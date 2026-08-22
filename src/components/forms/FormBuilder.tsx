'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Eye, FilePlus2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { createPlatformForm, removePlatformForm, readPlatformForm, editPlatformForm, copyPlatformForm } from '@/app/admin/actions'
import { createMyForm, removeMyForm, readMyForm, editMyForm, copyFormForMe } from '@/app/(dashboard)/expert/actions'
import type { CustomFormRow, CustomFormDetail } from '@/lib/forms'

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
 * `embedded` drops the card chrome, so the same builder can sit inside a form
 * picker — you create the form you need without leaving the patient you were
 * about to send it to. Saving refreshes the route, which re-runs the server
 * component that feeds the picker, so the new form appears in the dropdown
 * straight away. Embedded callers pass the single form currently selected in
 * that picker as `forms`, which is what puts view/edit/copy on the form you are
 * about to send instead of only on the forms page.
 *
 * `onCopied` fires with the new form's id after "make my own copy", so a picker
 * can move the selection onto the copy — otherwise you would edit the copy and
 * then send the original.
 */
export function FormBuilder({ scope, forms = [], embedded = false, onCopied }: {
  scope: 'admin' | 'expert'
  forms?: CustomFormRow[]
  embedded?: boolean
  onCopied?: (id: string) => void
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
  /** Set while editing an existing form; null means the builder creates a new one. */
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingSent, setEditingSent] = useState(0)
  /** Which form is expanded for a read-only look at its questions. */
  const [viewing, setViewing] = useState<CustomFormDetail | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const field: React.CSSProperties = {
    border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontSize: 13.5,
    fontFamily: 'inherit', color: charcoal, background: '#fff', width: '100%',
  }

  const setField = (i: number, patch: Partial<Draft>) =>
    setFields((f) => f.map((row, n) => (n === i ? { ...row, ...patch } : row)))

  const reset = () => {
    setTitle(''); setDescription(''); setKind('INFO'); setFields([blank()]); setError(null)
    setEditingId(null); setEditingSent(0)
  }

  /** Open a form read-only. Fetches on demand — the list only carries counts. */
  const view = (id: string) => start(async () => {
    setBusyId(id); setError(null)
    const d = scope === 'admin' ? await readPlatformForm(id) : await readMyForm(id)
    setBusyId(null)
    if (!d) { setError('Could not open that form.'); return }
    setViewing((cur) => (cur?.id === id ? null : d))
  })

  /** Load a form into the builder for editing. */
  const edit = (id: string) => start(async () => {
    setBusyId(id); setError(null); setDone(null)
    const d = scope === 'admin' ? await readPlatformForm(id) : await readMyForm(id)
    setBusyId(null)
    if (!d) { setError('Could not open that form.'); return }
    setViewing(null)
    setEditingId(d.id)
    setEditingSent(d.sentCount)
    setTitle(d.title)
    setDescription(d.description ?? '')
    setKind(d.kind)
    setFields(
      d.fields.length
        ? d.fields.map((f) => ({
            label: f.label,
            type: f.type,
            required: Boolean(f.required),
            options: (f.options ?? []).join(', '),
          }))
        : [blank()],
    )
    setOpen(true)
  })

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
    // Renaming a question re-derives its key, so answers already collected under
    // the old key stay with the old label. Worth a heads-up, not a block.
    if (editingId && editingSent > 0 &&
        !confirm(`This form has already been sent to ${editingSent} patient${editingSent === 1 ? '' : 's'}. Their existing answers are kept as they were filled in. Save changes?`)) {
      return
    }
    const wasEditing = editingId
    start(async () => {
      const res = wasEditing
        ? (scope === 'admin' ? await editPlatformForm(wasEditing, payload) : await editMyForm(wasEditing, payload))
        : (scope === 'admin' ? await createPlatformForm(payload) : await createMyForm(payload))
      if (res.ok) {
        setDone(wasEditing ? `"${payload.title.trim()}" updated.` : `"${payload.title.trim()}" is ready to send.`)
        reset()
        setOpen(false)
        router.refresh()
      } else {
        setError(res.error || 'Could not save the form.')
      }
    })
  }

  /**
   * Duplicate a form into one this person owns, then open it in the builder.
   *
   * This is the route for changing a standard form: the copy is theirs to edit
   * and send, and the shared original is left as it is for everyone else.
   */
  const copyForMe = (id: string) => start(async () => {
    setBusyId(id); setError(null); setDone(null)
    const res = scope === 'admin' ? await copyPlatformForm(id) : await copyFormForMe(id)
    setBusyId(null)
    if (!res.ok || !res.id) { setError(res.error ?? 'Could not copy that form.'); return }
    router.refresh()
    onCopied?.(res.id)
    // Copying is only ever a prelude to changing something, so open it.
    edit(res.id)
  })

  const remove = (id: string) => start(async () => {
    const res = scope === 'admin' ? await removePlatformForm(id) : await removeMyForm(id)
    if (!res.ok) setError(res.error || 'Could not remove the form.')
    router.refresh()
  })

  return (
    <div className={embedded ? undefined : 'card'}>
      {!embedded && (
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
          <button onClick={() => { if (open) reset(); setOpen((o) => !o); setDone(null) }} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {open ? <X size={14} /> : <Plus size={14} />} {open ? 'Cancel' : 'New form'}
          </button>
        </div>
      )}

      {!embedded && done && <p style={{ fontSize: 12.5, color: '#2C7A57', marginTop: 10 }}>{done}</p>}

      {/* Existing forms. Embedded, this is the one form the picker has selected,
          so it can be looked at, edited or copied before it is sent. */}
      {forms.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {forms.map((f) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid rgba(28,43,58,.06)', opacity: f.active ? 1 : 0.55 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: charcoal }}>{f.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {KIND_LABEL[f.kind] ?? f.kind} · {f.fieldCount} question{f.fieldCount === 1 ? '' : 's'}
                  {f.builtIn ? ' · standard form' : ''}
                  {f.createdByName && scope === 'admin' ? ` · by ${f.createdByName}` : ''}
                  {f.active ? '' : ' · retired'}
                </div>
              </div>
              <button
                onClick={() => view(f.id)}
                disabled={pending}
                aria-label={`View ${f.title}`}
                aria-expanded={viewing?.id === f.id}
                title="View questions"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-coral-d)', display: 'inline-flex' }}
              >
                <Eye size={15} />
              </button>
              {/* An admin edits a standard form in place — the shared library is
                  theirs. A clinician gets a copy instead, so adjusting a consent
                  form for one person cannot rewrite it for every colleague. */}
              {f.mine && f.active && (
                <button onClick={() => edit(f.id)} disabled={pending} aria-label={`Edit ${f.title}`} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-coral-d)', display: 'inline-flex' }}>
                  <Pencil size={15} />
                </button>
              )}
              {f.active && (
                <button
                  onClick={() => copyForMe(f.id)}
                  disabled={pending}
                  aria-label={`Make my own copy of ${f.title}`}
                  title={f.mine ? 'Duplicate' : 'Make my own copy to edit'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-coral-d)', display: 'inline-flex' }}
                >
                  <Copy size={15} />
                </button>
              )}
              {f.mine && f.active && !f.builtIn && (
                <button onClick={() => remove(f.id)} disabled={pending} aria-label={`Remove ${f.title}`} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0504B', display: 'inline-flex' }}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
          {busyId && <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Opening…</p>}

          {/* Read-only preview of the questions, exactly as stored. */}
          {viewing && (
            <div style={{ borderTop: '1px solid rgba(28,43,58,.06)', marginTop: 4, paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: charcoal }}>{viewing.title}</div>
                <button onClick={() => setViewing(null)} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, padding: 0 }}>
                  Close
                </button>
              </div>
              {viewing.description && (
                <p className="muted" style={{ fontSize: 12.5, margin: '2px 0 0' }}>{viewing.description}</p>
              )}
              <p className="muted" style={{ fontSize: 12, margin: '6px 0 10px' }}>
                {KIND_LABEL[viewing.kind] ?? viewing.kind} · sent to {viewing.sentCount} patient{viewing.sentCount === 1 ? '' : 's'}
              </p>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {viewing.fields.map((q) => (
                  <li key={q.key} style={{ fontSize: 13.5, color: charcoal }}>
                    <span style={{ fontWeight: 600 }}>{q.label}</span>
                    {q.required && <span style={{ color: 'var(--c-coral-d)' }}> *</span>}
                    <span className="muted" style={{ fontSize: 12 }}>
                      {' · '}{TYPE_LABEL.find((t) => t.value === q.type)?.label ?? q.type}
                    </span>
                    {q.options && q.options.length > 0 && (
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{q.options.join(' · ')}</div>
                    )}
                    {q.help && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{q.help}</div>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {embedded && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => { if (open) reset(); setOpen((o) => !o); setDone(null) }} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, padding: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {open ? <X size={13} /> : <FilePlus2 size={13} />} {open ? 'Cancel' : 'Need a different form? Build one'}
          </button>
          {done && <span style={{ fontSize: 12.5, color: '#2C7A57' }}>{done}</span>}
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
              {pending ? 'Saving…' : editingId ? 'Save changes' : 'Save form'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { reset(); setOpen(false) }} disabled={pending} className="btn btn-outline btn-sm">
                Cancel
              </button>
            )}
            <span className="muted" style={{ fontSize: 11.5 }}>
              {editingId
                ? editingSent > 0
                  ? `Already sent to ${editingSent} patient${editingSent === 1 ? '' : 's'} — their answers stay as filled in.`
                  : 'Not sent to anyone yet.'
                : 'You can send it as soon as it\u2019s saved.'}
            </span>
          </div>
        </div>
      )}

      {error && <p style={{ fontSize: 12.5, color: '#C0504B', marginTop: 8 }}>{error}</p>}
    </div>
  )
}
