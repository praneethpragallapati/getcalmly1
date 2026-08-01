'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Minus, Plus, XCircle } from 'lucide-react'
import { reassignPatient, cancelSubscription, adjustSessionsTotal, adjustSessionsUsed, attachSubscriptionExpert } from '@/app/admin/actions'
import type { PatientDetail, SubscriptionRow } from '@/lib/admin'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'

export function PatientAdmin({ p }: { p: PatientDetail }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [assignId, setAssignId] = useState(p.assignedTherapistId ?? '')
  const [msg, setMsg] = useState<string | null>(null)

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg?: string) => {
    setMsg(null)
    startTransition(async () => {
      const res = await fn()
      setMsg(res.ok ? okMsg ?? 'Done.' : res.error ?? 'Failed.')
      if (res.ok) router.refresh()
    })
  }

  const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 14, fontFamily: 'inherit', color: charcoal, background: '#fff' }
  const iconBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', color: charcoal }

  return (
    <div className="stack">
      {/* Assignment */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Assigned clinician</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
          Currently: <b>{p.assignedTherapistName ?? 'derived from latest appointment'}</b>. Overriding this changes who the patient books with and whose caseload they appear in.
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={assignId} onChange={(e) => setAssignId(e.target.value)} style={{ ...field, minWidth: 240 }}>
            <option value="">— No override (use latest appointment) —</option>
            {p.therapists.map((t) => <option key={t.profileId} value={t.profileId}>{t.name}</option>)}
          </select>
          <button onClick={() => run(() => reassignPatient({ userId: p.userId, therapistProfileId: assignId || null }), 'Assignment updated.')} disabled={pending} className="btn btn-primary">Update assignment</button>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Packages &amp; subscriptions</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
          Add or remove sessions, credit back a session the clinician didn&apos;t join, or cancel a package.
        </p>
        {p.subscriptions.length === 0 && <p className="muted" style={{ fontSize: 13.5 }}>No packages on file.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {p.subscriptions.map((s) => {
            const cancelled = s.status === 'CANCELLED'
            return (
              <div key={s.id} style={{ border: '1px solid rgba(28,43,58,.1)', borderRadius: 12, padding: '14px 16px', opacity: cancelled ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: charcoal }}>{s.planName} <span className="muted" style={{ fontWeight: 400 }}>· {s.trackSlug}</span></div>
                    <div className="muted" style={{ fontSize: 12.5 }}>Started {s.createdAt} · {s.status.toLowerCase()}</div>
                  </div>
                  {!cancelled && (
                    <button onClick={() => run(() => cancelSubscription({ id: s.id }), 'Package cancelled.')} disabled={pending} className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: coral }}>
                      <XCircle size={14} /> Cancel package
                    </button>
                  )}
                </div>
                {!cancelled && (
                  <>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
                      <Stepper
                        label="Total sessions" value={s.sessionsTotal} pending={pending} iconBtn={iconBtn}
                        onMinus={() => run(() => adjustSessionsTotal({ id: s.id, delta: -1 }))}
                        onPlus={() => run(() => adjustSessionsTotal({ id: s.id, delta: 1 }))}
                      />
                      <Stepper
                        label="Sessions used" value={s.sessionsUsed} pending={pending} iconBtn={iconBtn}
                        minusTitle="Credit back a session (didn't happen)"
                        onMinus={() => run(() => adjustSessionsUsed({ id: s.id, delta: -1 }), 'Session credited back.')}
                        onPlus={() => run(() => adjustSessionsUsed({ id: s.id, delta: 1 }))}
                      />
                      <div>
                        <div className="muted" style={{ fontSize: 12 }}>Remaining</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: charcoal }}>{s.sessionsLeft}</div>
                      </div>
                    </div>
                    <AttachExpert sub={s} therapists={p.therapists} field={field} pending={pending} run={run} />
                  </>
                )}
              </div>
            )
          })}
        </div>
        {msg && <p style={{ fontSize: 13.5, color: msg.includes('Failed') || msg.includes('not') ? coral : '#2C7A57', marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Check size={14} />{msg}</p>}
      </div>
    </div>
  )
}

/** Per-package expert attach: this clinician becomes the one the patient sees for this pack. */
function AttachExpert({ sub, therapists, field, pending, run }: {
  sub: SubscriptionRow
  therapists: { profileId: string; name: string }[]
  field: React.CSSProperties
  pending: boolean
  run: (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg?: string) => void
}) {
  const [id, setId] = useState(sub.therapistId ?? '')
  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(28,43,58,.08)' }}>
      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
        Attached expert {sub.therapistName ? <>· currently <b>{sub.therapistName}</b></> : '· none yet'}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={id} onChange={(e) => setId(e.target.value)} style={{ ...field, minWidth: 220 }}>
          <option value="">— No expert attached —</option>
          {therapists.map((t) => <option key={t.profileId} value={t.profileId}>{t.name}</option>)}
        </select>
        <button
          onClick={() => run(() => attachSubscriptionExpert({ id: sub.id, therapistProfileId: id || null }), 'Expert updated.')}
          disabled={pending}
          className="btn btn-primary"
        >
          Attach expert
        </button>
      </div>
    </div>
  )
}

function Stepper({ label, value, onMinus, onPlus, pending, iconBtn, minusTitle }: {
  label: string; value: number; onMinus: () => void; onPlus: () => void; pending: boolean; iconBtn: React.CSSProperties; minusTitle?: string
}) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onMinus} disabled={pending} title={minusTitle} style={iconBtn}><Minus size={15} /></button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#1C2B3A', minWidth: 22, textAlign: 'center' }}>{value}</span>
        <button onClick={onPlus} disabled={pending} style={iconBtn}><Plus size={15} /></button>
      </div>
    </div>
  )
}
