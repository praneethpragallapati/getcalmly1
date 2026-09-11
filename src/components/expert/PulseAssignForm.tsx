'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assignPulseCheck, removePulseCheck } from '@/app/(dashboard)/expert/pulse-actions'
import { INSTRUMENTS } from '@/lib/outcomes/instruments'
import { RECURRENCES, RECURRENCE_LABEL, ASSIGNABLE } from '@/lib/outcomes/pulseMeta'

export type AssignedPulse = { instrumentId: string; recurrence: string; expiresAt: string | null }

function fmt(iso: string | null): string {
  if (!iso) return 'no expiry'
  return `till ${new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export function PulseAssignForm({ patientId, assigned }: { patientId: string; assigned: AssignedPulse[] }) {
  const router = useRouter()
  const [instrumentId, setInstrumentId] = useState<string>(ASSIGNABLE[0])
  const [recurrence, setRecurrence] = useState('WEEKLY')
  const [expiry, setExpiry] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function assign() {
    setBusy(true); setMsg(null)
    const res = await assignPulseCheck(patientId, instrumentId, recurrence, expiry || null)
    setBusy(false)
    if (res.ok) { setMsg({ ok: true, text: 'Assigned.' }); router.refresh() }
    else setMsg({ ok: false, text: res.error ?? 'Could not assign.' })
  }
  async function remove(id: string) {
    setBusy(true); setMsg(null)
    const res = await removePulseCheck(patientId, id)
    setBusy(false)
    if (res.ok) router.refresh()
    else setMsg({ ok: false, text: res.error ?? 'Could not remove.' })
  }

  return (
    <div>
      <div className="grid-2" style={{ gap: 10 }}>
        <label className="muted" style={{ fontSize: 12 }}>
          Check
          <select className="entry-input" style={{ marginTop: 4 }} value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
            {ASSIGNABLE.map((id) => <option key={id} value={id}>{INSTRUMENTS[id]?.short ?? id}</option>)}
          </select>
        </label>
        <label className="muted" style={{ fontSize: 12 }}>
          Frequency
          <select className="entry-input" style={{ marginTop: 4 }} value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
            {RECURRENCES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
      </div>
      <label className="muted" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
        Expiry (optional)
        <input className="entry-input" type="date" style={{ marginTop: 4 }} value={expiry} onChange={(e) => setExpiry(e.target.value)} />
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-sm" disabled={busy} onClick={assign}>{busy ? 'Saving…' : 'Assign check'}</button>
        {msg && <span style={{ fontSize: 12.5, fontWeight: 600, color: msg.ok ? '#1B7F4D' : '#B3261E' }}>{msg.text}</span>}
      </div>

      {assigned.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="section-title" style={{ fontSize: 12.5 }}>Assigned</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {assigned.map((a) => (
              <div key={a.instrumentId} className="task-row">
                <span className="task-row-t">{INSTRUMENTS[a.instrumentId]?.short ?? a.instrumentId}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>
                    {RECURRENCE_LABEL[a.recurrence] ?? a.recurrence} · {fmt(a.expiresAt)}
                  </span>
                  <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => remove(a.instrumentId)} style={{ padding: '3px 8px', fontSize: 12 }}>Remove</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
