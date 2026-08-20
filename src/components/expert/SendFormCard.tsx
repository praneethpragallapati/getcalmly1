'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { sendFormToPatient, createMyFormRule } from '@/app/(dashboard)/expert/actions'
import { FormBuilder } from '@/components/forms/FormBuilder'

type Template = { id: string; title: string; kind?: string }

/**
 * Send a form to one patient — either right now (one-off) or as an automatic
 * rule scoped to just this patient (once at session N, or every / even / odd
 * session). The recurring options create a patient-scoped FormAutoRule; "Send
 * now" dispatches immediately.
 */
export function SendFormCard({ patientId, templates }: { patientId: string; templates: Template[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [templateId, setTemplateId] = useState('')
  const [when, setWhen] = useState<'now' | 'ONCE' | 'EVERY' | 'EVEN' | 'ODD'>('now')
  const [sessionNumber, setSessionNumber] = useState('1')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const submit = () => {
    setMsg(null); setErr(null)
    if (!templateId) { setErr('Choose a form.'); return }
    start(async () => {
      if (when === 'now') {
        const fd = new FormData()
        fd.set('patientId', patientId)
        fd.set('templateId', templateId)
        await sendFormToPatient(fd)
        setMsg('Form sent.')
      } else {
        const res = await createMyFormRule({ templateId, trackSlug: 'any', recurrence: when, sessionNumber: Number(sessionNumber) || 1, patientId })
        if (res.ok) setMsg('Automatic rule saved for this patient.')
        else { setErr(res.error || 'Could not save the rule.'); return }
      }
      setTemplateId('')
      router.refresh()
    })
  }

  const field: React.CSSProperties = { }

  return (
    <div className="stack" style={{ gap: 10, marginTop: 14 }}>
      <div className="grid-2" style={{ gap: 10 }}>
        <label className="muted" style={{ fontSize: 12 }}>
          Form
          <select className="entry-input" style={{ marginTop: 4 }} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            <option value="">Choose a form…</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </label>
        <label className="muted" style={{ fontSize: 12 }}>
          When
          <select className="entry-input" style={{ ...field, marginTop: 4 }} value={when} onChange={(e) => setWhen(e.target.value as typeof when)}>
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
