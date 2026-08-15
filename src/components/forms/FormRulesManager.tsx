'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, Trash2, Plus } from 'lucide-react'
import {
  createPlatformFormRule, deletePlatformFormRule, togglePlatformFormRule,
} from '@/app/admin/actions'
import {
  createMyFormRule, deleteMyFormRule, toggleMyFormRule,
} from '@/app/(dashboard)/expert/actions'
import type { FormAutoRuleRow, FormRecurrence } from '@/lib/forms'

const charcoal = '#1C2B3A'

const TRACK_LABEL: Record<string, string> = {
  any: 'All types', therapy: 'Individual therapy', psychiatry: 'Psychiatry', couples: 'Couples',
}

function recurrenceLabel(r: FormRecurrence, n: number | null): string {
  if (r === 'EVERY') return 'every session'
  if (r === 'EVEN') return 'every even session'
  if (r === 'ODD') return 'every odd session'
  return `on session ${n ?? 1}`
}

type TemplateOpt = { id: string; title: string }
type PatientOpt = { id: string; name: string }

/**
 * Set up rules that auto-send a form after a booking, by package/session type and
 * session number (once at N, or every / even / odd session). Every rule targets a
 * specific patient or all patients in scope. Used at both admin (platform-wide)
 * and expert (their own patients) scope — the `scope` prop picks which server
 * actions to call.
 */
export function FormRulesManager({ scope, rules, templates, patients }: {
  scope: 'admin' | 'expert'
  rules: FormAutoRuleRow[]
  templates: TemplateOpt[]
  patients: PatientOpt[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [templateId, setTemplateId] = useState('')
  const [track, setTrack] = useState('any')
  const [recurrence, setRecurrence] = useState<FormRecurrence>('ONCE')
  const [sessionNumber, setSessionNumber] = useState('1')
  const [patientId, setPatientId] = useState('') // '' = all patients
  const [error, setError] = useState<string | null>(null)

  const field: React.CSSProperties = {
    border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontSize: 13.5,
    fontFamily: 'inherit', color: charcoal, background: '#fff',
  }

  const add = () => {
    setError(null)
    if (!templateId) { setError('Pick a form.'); return }
    startTransition(async () => {
      const input = { templateId, trackSlug: track, recurrence, sessionNumber: Number(sessionNumber) || 1, patientId: patientId || null }
      const res = scope === 'admin' ? await createPlatformFormRule(input) : await createMyFormRule(input)
      if (res.ok) { setTemplateId(''); setPatientId(''); router.refresh() }
      else setError(res.error || 'Could not save the rule.')
    })
  }

  const remove = (id: string) => startTransition(async () => {
    if (scope === 'admin') await deletePlatformFormRule({ id }); else await deleteMyFormRule(id)
    router.refresh()
  })

  const toggle = (id: string, active: boolean) => startTransition(async () => {
    if (scope === 'admin') await togglePlatformFormRule({ id, active }); else await toggleMyFormRule(id, active)
    router.refresh()
  })

  return (
    <div className="card">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <CalendarClock size={16} /> Automatic form rules
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
        Send a form automatically after a booking, based on the package type and the session number for that type.
        {scope === 'admin'
          ? ' These apply platform-wide, on top of each clinician’s own rules.'
          : ' These apply to your own patients, on top of any platform rules.'}
      </p>

      {rules.length === 0 && <p className="muted" style={{ fontSize: 13 }}>No rules yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rules.map((r) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid rgba(28,43,58,.06)', opacity: r.active ? 1 : 0.5 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: charcoal }}>{r.templateTitle}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {r.patientName ?? 'All patients'} · {TRACK_LABEL[r.trackSlug] ?? r.trackSlug} · {recurrenceLabel(r.recurrence, r.sessionNumber)}
              </div>
            </div>
            <button onClick={() => toggle(r.id, !r.active)} disabled={pending} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5 }}>
              {r.active ? 'Disable' : 'Enable'}
            </button>
            <button onClick={() => remove(r.id)} disabled={pending} aria-label="Delete rule" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0504B', display: 'inline-flex' }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Create */}
      <div style={{ borderTop: '1px solid rgba(28,43,58,.08)', marginTop: 8, paddingTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Patient</div>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} style={{ ...field, minWidth: 170 }}>
            <option value="">All patients</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Form</div>
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} style={{ ...field, minWidth: 190 }}>
            <option value="">Choose a form…</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
        <div>
          <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Package type</div>
          <select value={track} onChange={(e) => setTrack(e.target.value)} style={{ ...field, minWidth: 140 }}>
            <option value="any">All types</option>
            <option value="therapy">Individual therapy</option>
            <option value="psychiatry">Psychiatry</option>
            <option value="couples">Couples</option>
          </select>
        </div>
        <div>
          <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>When</div>
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as FormRecurrence)} style={{ ...field, minWidth: 150 }}>
            <option value="ONCE">Once, at session…</option>
            <option value="EVERY">Every session</option>
            <option value="EVEN">Every even session</option>
            <option value="ODD">Every odd session</option>
          </select>
        </div>
        {recurrence === 'ONCE' && (
          <div>
            <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Session #</div>
            <input type="number" min={1} value={sessionNumber} onChange={(e) => setSessionNumber(e.target.value)} style={{ ...field, width: 80 }} />
          </div>
        )}
        <button onClick={add} disabled={pending} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Plus size={14} /> Add rule
        </button>
      </div>
      {error && <p style={{ fontSize: 12.5, color: '#C0504B', marginTop: 8 }}>{error}</p>}
    </div>
  )
}
