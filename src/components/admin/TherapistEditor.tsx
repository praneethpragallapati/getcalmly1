'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Star, X, UserPlus } from 'lucide-react'
import { updateTherapistSettings, assignSupervisor, removeSupervisionLink } from '@/app/admin/actions'
import type { ClinicianDetail } from '@/lib/admin'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'

const field: React.CSSProperties = { width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 14, fontFamily: 'inherit', color: charcoal, boxSizing: 'border-box' }
const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#5A6B7A', marginBottom: 5 }
const numOrEmpty = (n: number | null) => (n === null ? '' : String(n))

export function TherapistEditor({ c }: { c: ClinicianDetail }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [employmentType, setEmploymentType] = useState(c.employmentType)
  const [isActive, setIsActive] = useState(c.isActive)
  const [isVerified, setIsVerified] = useState(c.isVerified)
  const [feeInd, setFeeInd] = useState(numOrEmpty(c.baseFeeIndividual))
  const [feeCpl, setFeeCpl] = useState(numOrEmpty(c.baseFeeCouples))
  const [feePsy, setFeePsy] = useState(numOrEmpty(c.baseFeePsychiatry))
  const [bonus2, setBonus2] = useState(numOrEmpty(c.secondSessionBonus))
  const [bonus3, setBonus3] = useState(numOrEmpty(c.thirdOnwardsBonus))
  const [bonusMisc, setBonusMisc] = useState(numOrEmpty(c.miscBonus))
  const [bonusNight, setBonusNight] = useState(numOrEmpty(c.nightSessionBonus))
  const [supId, setSupId] = useState('')

  const numOrBlank = (v: string): number | '' => (v === '' ? '' : Number(v))

  function save() {
    setMsg(null)
    startTransition(async () => {
      const res = await updateTherapistSettings({
        profileId: c.profileId,
        employmentType,
        isActive, isVerified,
        baseFeeIndividual: numOrBlank(feeInd),
        baseFeeCouples: numOrBlank(feeCpl),
        baseFeePsychiatry: numOrBlank(feePsy),
        secondSessionBonus: numOrBlank(bonus2),
        thirdOnwardsBonus: numOrBlank(bonus3),
        miscBonus: numOrBlank(bonusMisc),
        nightSessionBonus: numOrBlank(bonusNight),
      })
      setMsg(res.ok ? { ok: true, text: 'Saved.' } : { ok: false, text: res.error ?? 'Failed.' })
      if (res.ok) router.refresh()
    })
  }

  function addSupervisor() {
    if (!supId) return
    startTransition(async () => { await assignSupervisor({ superviseeId: c.profileId, supervisorId: supId }); setSupId(''); router.refresh() })
  }
  function removeSup(linkId: string) {
    startTransition(async () => { await removeSupervisionLink({ linkId, profileId: c.profileId }); router.refresh() })
  }

  const feeHint = (v: string, global: number) => (v === '' ? `default ₹${global.toLocaleString('en-IN')}` : '')

  return (
    <div className="stack">
      {/* Settings */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Pay structure &amp; rates</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
          Exactly what {c.name.split(' ')[0]} sees in their own earnings ledger. Every field is a per-therapist override — leave it blank to use the platform default.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Row>
            <Col><label style={label}>Engagement</label>
              <select style={{ ...field, background: '#fff' }} value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
                <option value="FULL_TIME">Full-time (salaried)</option>
                <option value="PART_TIME">Part-time (per session)</option>
              </select>
            </Col>
          </Row>

          <div>
            <div className="muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>Base fee per session</div>
            <Row>
              <Col><label style={label}>Individual (₹)</label><input type="number" min={0} style={field} value={feeInd} onChange={(e) => setFeeInd(e.target.value)} placeholder={feeHint(feeInd, c.globalFees.individual) || undefined} /></Col>
              <Col><label style={label}>Couples (₹)</label><input type="number" min={0} style={field} value={feeCpl} onChange={(e) => setFeeCpl(e.target.value)} placeholder={feeHint(feeCpl, c.globalFees.couples) || undefined} /></Col>
              <Col><label style={label}>Psychiatry (₹)</label><input type="number" min={0} style={field} value={feePsy} onChange={(e) => setFeePsy(e.target.value)} placeholder={feeHint(feePsy, c.globalFees.psychiatry) || undefined} /></Col>
            </Row>
          </div>

          <div>
            <div className="muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>Bonuses</div>
            <Row>
              <Col><label style={label}>2nd session (₹)</label><input type="number" min={0} style={field} value={bonus2} onChange={(e) => setBonus2(e.target.value)} placeholder={feeHint(bonus2, c.globalBonuses.second) || undefined} /></Col>
              <Col><label style={label}>3rd onwards (₹)</label><input type="number" min={0} style={field} value={bonus3} onChange={(e) => setBonus3(e.target.value)} placeholder={feeHint(bonus3, c.globalBonuses.thirdOnwards) || undefined} /></Col>
              <Col><label style={label}>Night session (₹)</label><input type="number" min={0} style={field} value={bonusNight} onChange={(e) => setBonusNight(e.target.value)} placeholder={feeHint(bonusNight, c.globalBonuses.night) || undefined} /></Col>
              <Col><label style={label}>Misc (₹)</label><input type="number" min={0} style={field} value={bonusMisc} onChange={(e) => setBonusMisc(e.target.value)} placeholder={feeHint(bonusMisc, c.globalBonuses.misc) || undefined} /></Col>
            </Row>
          </div>

          <div>
            <label style={label}>Patient rating <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(from reviews — not editable)</span></label>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(28,43,58,.04)', borderRadius: 10, padding: '9px 14px' }}>
              <Star size={16} style={{ color: '#C9973A', fill: c.totalReviews > 0 ? '#C9973A' : 'none' }} />
              <span style={{ fontSize: 15, fontWeight: 800, color: charcoal }}>{c.totalReviews > 0 ? c.rating.toFixed(1) : '—'}</span>
              <span className="muted" style={{ fontSize: 12.5 }}>{c.totalReviews} review{c.totalReviews === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Toggle label="Active" checked={isActive} onChange={setIsActive} />
            <Toggle label="Verified" checked={isVerified} onChange={setIsVerified} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={save} disabled={pending} className="btn btn-primary" style={{ opacity: pending ? 0.6 : 1 }}>Save changes</button>
            {msg && <span style={{ fontSize: 13.5, color: msg.ok ? '#2C7A57' : coral, display: 'inline-flex', alignItems: 'center', gap: 5 }}>{msg.ok && <Check size={14} />}{msg.text}</span>}
          </div>
        </div>
      </div>

      {/* Patient reviews (read-only) */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={15} style={{ color: '#C9973A', fill: c.totalReviews > 0 ? '#C9973A' : 'none' }} />
          Patient reviews · {c.totalReviews > 0 ? `${c.rating.toFixed(1)} avg` : 'no ratings yet'} ({c.totalReviews})
        </div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Real ratings from patients after their sessions. This drives the profile rating and can&apos;t be edited here.</p>
        {c.reviews.length === 0 && <p className="muted" style={{ fontSize: 13.5 }}>No reviews yet.</p>}
        <div className="stack" style={{ gap: 8 }}>
          {c.reviews.map((r) => (
            <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '9px 0', borderTop: '1px solid rgba(28,43,58,.06)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, minWidth: 46 }}>
                <Star size={13} style={{ color: '#C9973A', fill: '#C9973A' }} />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: charcoal }}>{r.rating}</span>
              </span>
              <span style={{ flex: 1, fontSize: 13, color: '#3A4A5A', lineHeight: 1.5 }}>{r.comment || <span className="muted">No comment</span>}</span>
              <span className="muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>{r.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Onboarding attachments */}
      {c.documentUrls.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 4 }}>Attachments ({c.documentUrls.length})</div>
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Documents captured at onboarding — certificates, registration proof, ID.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {c.documentUrls.map((u, i) => (
              <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 13 }}>
                Attachment {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Supervision */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Supervision</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Who clinically supervises {c.name.split(' ')[0]}.</p>
        {c.supervisors.length === 0 && <p className="muted" style={{ fontSize: 13.5, marginBottom: 12 }}>No supervisor assigned.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {c.supervisors.map((s) => (
            <div key={s.linkId} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(28,43,58,.04)', borderRadius: 10, padding: '9px 12px' }}>
              <Star size={14} style={{ color: '#C9973A' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: charcoal, flex: 1 }}>{s.name}</span>
              <button onClick={() => removeSup(s.linkId)} disabled={pending} className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: coral }}><X size={13} /> Remove</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={supId} onChange={(e) => setSupId(e.target.value)} style={{ ...field, width: 'auto', minWidth: 220, background: '#fff' }}>
            <option value="">Assign a supervisor…</option>
            {c.allTherapists.map((t) => <option key={t.profileId} value={t.profileId}>{t.name}</option>)}
          </select>
          <button onClick={addSupervisor} disabled={pending || !supId} className="btn" style={{ border: `1.5px solid ${coral}`, color: coral, display: 'inline-flex', alignItems: 'center', gap: 6, opacity: !supId ? 0.5 : 1 }}>
            <UserPlus size={14} /> Assign
          </button>
        </div>
        {c.supervisees.length > 0 && (
          <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>Also supervises: {c.supervisees.map((s) => s.name).join(', ')}</p>
        )}
      </div>

      {/* Patients */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Patients ({c.patients.length})</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Open a patient to reassign them or manage their packages.</p>
        {c.patients.length === 0 && <p className="muted" style={{ fontSize: 13.5 }}>No patients yet.</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {c.patients.map((p) => (
            <Link key={p.userId} href={`/admin/patients/${p.userId}`} className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 13 }}>{p.name}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) { return <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{children}</div> }
function Col({ children }: { children: React.ReactNode }) { return <div style={{ flex: '1 1 180px', minWidth: 150 }}>{children}</div> }
function Toggle({ label: l, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: charcoal, fontWeight: 600 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 17, height: 17, accentColor: coral }} />
      {l}
    </label>
  )
}
