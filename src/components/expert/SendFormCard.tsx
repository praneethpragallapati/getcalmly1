'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Send, X } from 'lucide-react'
import { sendFormToPatient, createMyFormRule, readMyForm } from '@/app/(dashboard)/expert/actions'
import { FormBuilder } from '@/components/forms/FormBuilder'
import {
  FormFieldsEditor, FIELD_TYPE_LABEL, draftsToInput, fieldsToDrafts, type FieldDraft,
} from '@/components/forms/FormFieldsEditor'
import type { CustomFormDetail } from '@/lib/forms'

const charcoal = '#1C2B3A'

const KIND_LABEL: Record<string, string> = {
  INFO: 'Information', CONSENT: 'Consent', FEEDBACK: 'Feedback', INTAKE: 'Intake',
}

type Template = { id: string; title: string; kind?: string }

/**
 * Send a form to one patient — now, or as a rule that fires after they book.
 *
 * Choosing a form opens it: the questions are shown before anything is sent, and
 * "Edit before sending" makes them editable. That edit goes with THIS send only
 * — the patient gets the adjusted questions and the shared form is untouched.
 * The alternative, duplicating the form into a private copy first, meant a new
 * near-identical form in the picker every time anyone reworded a question.
 *
 * An automatic rule sends the standard form, since the rule fires later and has
 * no one sitting in front of it to adjust anything; the card says so.
 */
export function SendFormCard({ patientId, templates }: { patientId: string; templates: Template[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [templateId, setTemplateId] = useState('')
  const [when, setWhen] = useState<'now' | 'ONCE' | 'EVERY' | 'EVEN' | 'ODD'>('now')
  const [sessionNumber, setSessionNumber] = useState('1')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  /** The chosen form's questions, loaded when it's picked. */
  const [preview, setPreview] = useState<CustomFormDetail | null>(null)
  const [loading, setLoading] = useState(false)
  /** Non-null once "Edit before sending" is opened — the questions to send. */
  const [draft, setDraft] = useState<FieldDraft[] | null>(null)

  const choose = (id: string) => {
    setTemplateId(id); setPreview(null); setDraft(null); setMsg(null); setErr(null)
    if (!id) return
    setLoading(true)
    start(async () => {
      const d = await readMyForm(id)
      setLoading(false)
      if (!d) { setErr('Could not open that form.'); return }
      setPreview(d)
    })
  }

  const submit = () => {
    setMsg(null); setErr(null)
    if (!templateId) { setErr('Choose a form.'); return }
    const edited = draft ? draftsToInput(draft) : null
    if (edited && edited.length === 0) { setErr('The form needs at least one question.'); return }
    start(async () => {
      if (when === 'now') {
        const fd = new FormData()
        fd.set('patientId', patientId)
        fd.set('templateId', templateId)
        if (edited) fd.set('fields', JSON.stringify(edited))
        await sendFormToPatient(fd)
        setMsg(edited ? 'Edited form sent.' : 'Form sent.')
      } else {
        const res = await createMyFormRule({ templateId, trackSlug: 'any', recurrence: when, sessionNumber: Number(sessionNumber) || 1, patientId })
        if (res.ok) setMsg('Automatic rule saved for this patient.')
        else { setErr(res.error || 'Could not save the rule.'); return }
      }
      setTemplateId(''); setPreview(null); setDraft(null)
      router.refresh()
    })
  }

  return (
    <div className="stack" style={{ gap: 10, marginTop: 14 }}>
      <div className="grid-2" style={{ gap: 10 }}>
        <label className="muted" style={{ fontSize: 12 }}>
          Form
          <select className="entry-input" style={{ marginTop: 4 }} value={templateId} onChange={(e) => choose(e.target.value)}>
            <option value="">Choose a form…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.kind ? `${t.title} (${KIND_LABEL[t.kind] ?? t.kind})` : t.title}
              </option>
            ))}
          </select>
        </label>
        <label className="muted" style={{ fontSize: 12 }}>
          When
          <select className="entry-input" style={{ marginTop: 4 }} value={when} onChange={(e) => setWhen(e.target.value as typeof when)}>
            <option value="now">Send now (one-off)</option>
            <option value="ONCE">Automatically — once, at session…</option>
            <option value="EVERY">Automatically — every session</option>
            <option value="EVEN">Automatically — every even session</option>
            <option value="ODD">Automatically — every odd session</option>
          </select>
        </label>
      </div>
      {when === 'ONCE' && (
        <label className="muted" style={{ fontSize: 12, maxWidth: 160 }}>
          Session #
          <input className="entry-input" style={{ marginTop: 4 }} type="number" min={1} value={sessionNumber} onChange={(e) => setSessionNumber(e.target.value)} />
        </label>
      )}

      {loading && <span className="muted" style={{ fontSize: 12 }}>Opening the form…</span>}

      {/* Preview: what the patient will actually be asked. */}
      {preview && (
        <div style={{ border: '1px solid rgba(28,43,58,.09)', borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: charcoal }}>{preview.title}</div>
            {when === 'now' && (
              draft
                ? <button type="button" onClick={() => setDraft(null)} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, padding: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <X size={13} /> Discard changes
                  </button>
                : <button type="button" onClick={() => setDraft(fieldsToDrafts(preview.fields))} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, padding: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Pencil size={13} /> Edit before sending
                  </button>
            )}
          </div>
          {preview.description && <p className="muted" style={{ fontSize: 12.5, margin: '2px 0 0' }}>{preview.description}</p>}

          {draft ? (
            <div style={{ marginTop: 10 }}>
              <FormFieldsEditor value={draft} onChange={setDraft} />
              <p className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
                These changes apply to this patient&rsquo;s copy only. {preview.shared ? 'The standard form stays as it is for everyone else.' : 'Your saved form stays as it is.'}
              </p>
            </div>
          ) : (
            <ol style={{ margin: '10px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {preview.fields.map((q) => (
                <li key={q.key} style={{ fontSize: 13, color: charcoal }}>
                  {q.label}
                  {q.required && <span style={{ color: 'var(--c-coral-d)' }}> *</span>}
                  <span className="muted" style={{ fontSize: 12 }}>
                    {' · '}{FIELD_TYPE_LABEL.find((t) => t.value === q.type)?.label ?? q.type}
                  </span>
                  {q.options && q.options.length > 0 && (
                    <div className="muted" style={{ fontSize: 12 }}>{q.options.join(' · ')}</div>
                  )}
                </li>
              ))}
            </ol>
          )}

          {when !== 'now' && (
            <p className="muted" style={{ fontSize: 11.5, marginTop: 10, marginBottom: 0 }}>
              An automatic rule sends this form as it stands — there is no one here to adjust it when it fires later.
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={submit} disabled={pending} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Send size={14} /> {when === 'now' ? 'Send form' : 'Save rule'}
        </button>
        {msg && <span className="muted" style={{ fontSize: 12.5, color: '#2C7A57' }}>{msg}</span>}
        {err && <span className="muted" style={{ fontSize: 12.5, color: '#C0504B' }}>{err}</span>}
      </div>
      {when !== 'now' && <span className="muted" style={{ fontSize: 11.5 }}>Applies to this patient only, sent automatically after they book.</span>}
      {/* Nothing in the library fits? Build the form here — it lands in the
          dropdown above without leaving this patient. */}
      <FormBuilder scope="expert" embedded />
    </div>
  )
}
