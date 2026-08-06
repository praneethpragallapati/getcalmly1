'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Minus, Plus, XCircle } from 'lucide-react'
import { reassignPatient, cancelSubscription, adjustSessionsTotal, adjustSessionsUsed, assignCategoryClinician, grantSessionsByType, extendValidity } from '@/app/admin/actions'
import type { PatientDetail, SubscriptionRow, CareCategoryKey } from '@/lib/admin'
import { clinicianMatchesTrack, CATEGORY_TO_TRACK } from '@/lib/clinicianScope'

type TherapistOpt = { profileId: string; name: string; clinicianType: string | null; specializations: string[] }

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
        <div className="section-title" style={{ marginBottom: 4 }}>Assigned clinicians</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
          Assign an expert per care type. This is who the patient books with and whose caseload they appear in for that type. Leave a type unset to fall back to the default assignment.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
          {(['individual', 'couples', 'psychiatry'] as CareCategoryKey[]).map((cat) => (
            <AssignCategory key={cat} category={cat} current={p.assignments[cat]} therapists={p.therapists} userId={p.userId} field={field} pending={pending} run={run} />
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(28,43,58,.08)', paddingTop: 14 }}>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>
            Default assignment (used when a care type above is unset): <b>{p.assignedTherapistName ?? 'derived from latest appointment'}</b>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={assignId} onChange={(e) => setAssignId(e.target.value)} style={{ ...field, minWidth: 240 }}>
              <option value="">— No override (use latest appointment) —</option>
              {p.therapists.map((t) => <option key={t.profileId} value={t.profileId}>{t.name}</option>)}
            </select>
            <button onClick={() => run(() => reassignPatient({ userId: p.userId, therapistProfileId: assignId || null }), 'Default assignment updated.')} disabled={pending} className="btn btn-primary">Update default</button>
          </div>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Packages &amp; subscriptions</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
          Add or remove sessions by package type and set validity; credit back a session the clinician didn&apos;t join, or cancel a package.
        </p>

        <GrantByType userId={p.userId} field={field} pending={pending} run={run} />

        {p.subscriptions.length === 0 && <p className="muted" style={{ fontSize: 13.5, marginTop: 12 }}>No packages on file.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {p.subscriptions.map((s) => {
            const cancelled = s.status === 'CANCELLED'
            return (
              <div key={s.id} style={{ border: '1px solid rgba(28,43,58,.1)', borderRadius: 12, padding: '14px 16px', opacity: cancelled ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: charcoal }}>{s.planName} <span className="muted" style={{ fontWeight: 400 }}>· {s.trackSlug}</span></div>
                    <div className="muted" style={{ fontSize: 12.5 }}>
                      Started {s.createdAt} · {s.status.toLowerCase()}
                      {s.validUntil ? <> · <span style={{ color: s.expired ? coral : undefined, fontWeight: s.expired ? 700 : 400 }}>{s.expired ? 'expired' : 'valid until'} {s.validUntil}</span></> : ' · no expiry'}
                    </div>
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
                      <div>
                        <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Validity</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, padding: '6px 10px' }} disabled={pending}
                            onClick={() => run(() => extendValidity({ id: s.id, months: 1 }), 'Validity extended.')}>+1 month</button>
                          <button className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, padding: '6px 10px' }} disabled={pending}
                            onClick={() => run(() => extendValidity({ id: s.id, months: 3 }), 'Validity extended.')}>+3 months</button>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(28,43,58,.08)' }}>
                      <div className="muted" style={{ fontSize: 12 }}>
                        Expert:{' '}
                        {s.therapistName
                          ? <b style={{ color: charcoal }}>{s.therapistName}</b>
                          : <span>none yet — set it in “Assigned clinicians” above</span>}
                      </div>
                    </div>
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

const CATEGORY_LABEL: Record<CareCategoryKey, string> = {
  individual: 'Individual therapy',
  couples: 'Couples',
  psychiatry: 'Psychiatry',
}

/** Assign the clinician a patient sees for one care type (individual / couples / psychiatry). */
function AssignCategory({ category, current, therapists, userId, field, pending, run }: {
  category: CareCategoryKey
  current: { id: string | null; name: string | null }
  therapists: TherapistOpt[]
  userId: string
  field: React.CSSProperties
  pending: boolean
  run: (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg?: string) => void
}) {
  const [id, setId] = useState(current.id ?? '')
  // Only offer clinicians who fit THIS care type (Psychiatrists under Psychiatry,
  // couples specialists under Couples, therapists under Individual).
  const track = CATEGORY_TO_TRACK[category]
  const options = therapists.filter((t) => clinicianMatchesTrack(t.clinicianType, t.specializations, track))
  // Keep the current assignment visible even if it wouldn't pass the filter.
  if (current.id && !options.some((t) => t.profileId === current.id)) {
    options.unshift({ profileId: current.id, name: current.name ?? 'Assigned clinician', clinicianType: null, specializations: [] })
  }
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: charcoal, minWidth: 140 }}>{CATEGORY_LABEL[category]}</span>
      <select value={id} onChange={(e) => setId(e.target.value)} style={{ ...field, minWidth: 220 }}>
        <option value="">— Not assigned —</option>
        {options.map((t) => <option key={t.profileId} value={t.profileId}>{t.name}</option>)}
      </select>
      <button
        onClick={() => run(() => assignCategoryClinician({ userId, category, therapistProfileId: id || null }), `${CATEGORY_LABEL[category]} clinician updated.`)}
        disabled={pending}
        className="btn"
        style={{ border: '1.5px solid #E2E8F0' }}
      >
        Save
      </button>
    </div>
  )
}

/** Add/remove sessions of a specific package type, with validity. Creates the package if none exists. */
function GrantByType({ userId, field, pending, run }: {
  userId: string
  field: React.CSSProperties
  pending: boolean
  run: (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg?: string) => void
}) {
  const [track, setTrack] = useState('therapy')
  const [sessions, setSessions] = useState('4')
  const [months, setMonths] = useState('6')
  return (
    <div style={{ border: '1px dashed #D8DEE6', borderRadius: 12, padding: '12px 14px', marginBottom: 14, background: 'rgba(28,43,58,.02)' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: charcoal, marginBottom: 8 }}>Add / remove sessions by package type</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Type</div>
          <select value={track} onChange={(e) => setTrack(e.target.value)} style={{ ...field, minWidth: 150 }}>
            <option value="therapy">Individual therapy</option><option value="couples">Couples</option><option value="psychiatry">Psychiatry</option>
          </select></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Sessions (±)</div>
          <input type="number" value={sessions} onChange={(e) => setSessions(e.target.value)} style={{ ...field, width: 90 }} /></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Validity (months)</div>
          <input type="number" min={0} value={months} onChange={(e) => setMonths(e.target.value)} style={{ ...field, width: 90 }} /></div>
        <button className="btn btn-primary" disabled={pending}
          onClick={() => run(() => grantSessionsByType({ userId, trackSlug: track, sessions: Number(sessions), validityMonths: Number(months) }), 'Package updated.')}>
          Apply
        </button>
      </div>
      <p className="muted" style={{ fontSize: 11, marginTop: 7 }}>Positive adds sessions (and extends validity by the months given); negative removes. Creates the package if the patient has none of that type.</p>
    </div>
  )
}

/** Per-package expert attach: this clinician becomes the one the patient sees for this pack. */

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
