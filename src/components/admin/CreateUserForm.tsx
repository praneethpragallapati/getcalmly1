'use client'

import { useState, useTransition } from 'react'
import { Stethoscope, ShieldCheck, Copy, Check } from 'lucide-react'
import { createTherapist, createAdmin, type CreateResult } from '@/app/admin/actions'
import type { TherapistPrefill } from '@/lib/admin'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'

const field: React.CSSProperties = {
  width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px',
  fontSize: 14, fontFamily: 'inherit', color: charcoal, boxSizing: 'border-box',
}
const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#5A6B7A', marginBottom: 5 }

type Kind = 'therapist' | 'admin'

export function CreateUserForm({ prefill }: { prefill?: TherapistPrefill | null }) {
  const [kind, setKind] = useState<Kind>('therapist')
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<CreateResult | null>(null)
  const [copied, setCopied] = useState(false)

  // Therapist fields
  const [name, setName] = useState(prefill?.name ?? '')
  const [email, setEmail] = useState(prefill?.email ?? '')
  const [phone, setPhone] = useState(prefill?.phone ?? '')
  const [council, setCouncil] = useState(prefill?.council ?? 'RCI')
  const [registrationNo, setRegistrationNo] = useState(prefill?.registrationNo ?? '')
  const [yearsExp, setYearsExp] = useState(prefill?.yearsExp ? String(prefill.yearsExp) : '')
  const [qualifications, setQualifications] = useState(prefill?.qualifications ?? '')
  const [languages, setLanguages] = useState(prefill?.languages ?? '')
  const [specializations, setSpecializations] = useState(prefill?.specializations ?? '')
  const [bio, setBio] = useState(prefill?.bio ?? '')
  const [employmentType, setEmploymentType] = useState<'FULL_TIME' | 'PART_TIME'>('FULL_TIME')
  const [feeInd, setFeeInd] = useState('')
  const [feeCpl, setFeeCpl] = useState('')
  const [feePsy, setFeePsy] = useState('')
  const [bonus2, setBonus2] = useState('')
  const [bonus3, setBonus3] = useState('')
  const [bonusNight, setBonusNight] = useState('')
  const [bonusMisc, setBonusMisc] = useState('')
  const [docs, setDocs] = useState<{ name: string; url: string }[]>([])
  const [docError, setDocError] = useState('')

  // Admin fields
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')

  const numOrBlank = (v: string): number | '' => (v === '' ? '' : Number(v))

  function addFiles(files: FileList | null) {
    setDocError('')
    if (!files) return
    for (const file of Array.from(files)) {
      // Inline small files as data URLs (same approach as blog covers). Larger
      // files should be linked instead of embedded.
      if (file.size > 2_500_000) { setDocError(`${file.name} is over 2.5 MB — add a link instead.`); continue }
      const reader = new FileReader()
      reader.onload = () => setDocs((d) => [...d, { name: file.name, url: String(reader.result) }].slice(0, 12))
      reader.readAsDataURL(file)
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    startTransition(async () => {
      const res = kind === 'therapist'
        ? await createTherapist({
            name, email, phone, council, registrationNo,
            yearsExp: yearsExp ? Number(yearsExp) : undefined,
            qualifications, languages, specializations, bio,
            employmentType,
            baseFeeIndividual: numOrBlank(feeInd),
            baseFeeCouples: numOrBlank(feeCpl),
            baseFeePsychiatry: numOrBlank(feePsy),
            secondSessionBonus: numOrBlank(bonus2),
            thirdOnwardsBonus: numOrBlank(bonus3),
            miscBonus: numOrBlank(bonusMisc),
            nightSessionBonus: numOrBlank(bonusNight),
            documentUrls: docs.map((d) => d.url),
          })
        : await createAdmin({ name: adminName, email: adminEmail })
      setResult(res)
    })
  }

  function copyCreds() {
    if (!result?.tempPassword) return
    navigator.clipboard?.writeText(`Email: ${result.email}\nTemporary password: ${result.tempPassword}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  if (result?.ok) {
    return (
      <div className="card" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2C7A57', fontWeight: 700, marginBottom: 6 }}>
          <Check size={17} /> Account created
        </div>
        <p className="muted" style={{ marginBottom: 16, lineHeight: 1.6 }}>
          Share these credentials with the {kind === 'therapist' ? 'clinician' : 'admin'} securely. They&apos;ll be asked to set a new password on first sign-in.
        </p>
        <div style={{ background: '#FBF3F0', border: '1px solid #EADFD9', borderRadius: 12, padding: '16px 18px', fontSize: 14.5 }}>
          <div style={{ marginBottom: 8 }}><span className="muted">Email</span><div style={{ fontWeight: 700, color: charcoal }}>{result.email}</div></div>
          <div><span className="muted">Temporary password</span><div style={{ fontWeight: 800, color: coral, fontFamily: 'monospace', fontSize: 16, letterSpacing: '.5px' }}>{result.tempPassword}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={copyCreds} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy credentials</>}
          </button>
          <button onClick={() => { setResult(null); setName(''); setEmail(''); setRegistrationNo(''); setAdminName(''); setAdminEmail('') }} className="btn" style={{ border: '1.5px solid #E2E8F0' }}>
            Create another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card" style={{ maxWidth: 720 }}>
      {/* Kind toggle */}
      <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(28,43,58,.05)', padding: 4, borderRadius: 10, marginBottom: 20 }}>
        {([['therapist', 'Clinician', <Stethoscope key="t" size={15} />], ['admin', 'Admin', <ShieldCheck key="a" size={15} />]] as const).map(([k, lbl, icon]) => (
          <button key={k} type="button" onClick={() => setKind(k as Kind)} style={{
            border: 'none', cursor: 'pointer', padding: '9px 18px', borderRadius: 7, fontSize: 13.5, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
            background: kind === k ? '#fff' : 'transparent', color: kind === k ? coral : '#8E9EAE',
            boxShadow: kind === k ? '0 1px 5px rgba(28,43,58,.12)' : 'none',
          }}>{icon}{lbl}</button>
        ))}
      </div>

      {kind === 'therapist' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Row>
            <Col><label style={label}>Full name</label><input style={field} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. Ananya Sharma" /></Col>
            <Col><label style={label}>Email</label><input type="email" style={field} value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="clinician@example.com" /></Col>
          </Row>
          <Row>
            <Col><label style={label}>Phone</label><input style={field} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" /></Col>
            <Col><label style={label}>Council</label>
              <select style={{ ...field, background: '#fff' }} value={council} onChange={(e) => setCouncil(e.target.value)}>
                <option>RCI</option><option>NMC</option><option>RCI+NMC</option><option value="None">None</option>
              </select>
            </Col>
          </Row>
          <Row>
            <Col><label style={label}>Registration number{council === 'None' && <span style={{ color: '#A0ADB8', fontWeight: 400 }}> (optional)</span>}</label><input style={field} value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} required={council !== 'None'} placeholder={council === 'None' ? 'Not required' : 'e.g. A012345'} /></Col>
            <Col><label style={label}>Years of experience</label><input type="number" min={0} style={field} value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} placeholder="e.g. 8" /></Col>
          </Row>
          <div><label style={label}>Specialisations <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(comma-separated)</span></label><input style={field} value={specializations} onChange={(e) => setSpecializations(e.target.value)} placeholder="Anxiety, CBT, Trauma" /></div>
          <div><label style={label}>Languages <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(comma-separated)</span></label><input style={field} value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Hindi" /></div>
          <div><label style={label}>Qualifications <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(comma-separated)</span></label><input style={field} value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="M.Phil Clinical Psychology" /></div>
          <div><label style={label}>Bio</label><textarea rows={3} style={{ ...field, resize: 'vertical' }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="How they work and who they help best." /></div>

          <div style={{ borderTop: '1px solid rgba(28,43,58,.08)', paddingTop: 14, marginTop: 2 }}>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 2 }}>Pay structure</div>
            <p className="muted" style={{ fontSize: 12, marginBottom: 10 }}>Exactly what the clinician sees in their earnings ledger. Leave any field blank to use the platform default.</p>
            <Row>
              <Col><label style={label}>Engagement</label>
                <select style={{ ...field, background: '#fff' }} value={employmentType} onChange={(e) => setEmploymentType(e.target.value as 'FULL_TIME' | 'PART_TIME')}>
                  <option value="FULL_TIME">Full-time (salaried)</option>
                  <option value="PART_TIME">Part-time (per session)</option>
                </select>
              </Col>
            </Row>
            <p className="muted" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', margin: '12px 0 6px' }}>Base fee per session</p>
            <Row>
              <Col><label style={label}>Individual (₹)</label><input type="number" min={0} style={field} value={feeInd} onChange={(e) => setFeeInd(e.target.value)} placeholder="default" /></Col>
              <Col><label style={label}>Couples (₹)</label><input type="number" min={0} style={field} value={feeCpl} onChange={(e) => setFeeCpl(e.target.value)} placeholder="default" /></Col>
              <Col><label style={label}>Psychiatry (₹)</label><input type="number" min={0} style={field} value={feePsy} onChange={(e) => setFeePsy(e.target.value)} placeholder="default" /></Col>
            </Row>
            <p className="muted" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', margin: '12px 0 6px' }}>Bonuses</p>
            <Row>
              <Col><label style={label}>2nd session (₹)</label><input type="number" min={0} style={field} value={bonus2} onChange={(e) => setBonus2(e.target.value)} placeholder="default" /></Col>
              <Col><label style={label}>3rd onwards (₹)</label><input type="number" min={0} style={field} value={bonus3} onChange={(e) => setBonus3(e.target.value)} placeholder="default" /></Col>
              <Col><label style={label}>Night session (₹)</label><input type="number" min={0} style={field} value={bonusNight} onChange={(e) => setBonusNight(e.target.value)} placeholder="default" /></Col>
              <Col><label style={label}>Misc (₹)</label><input type="number" min={0} style={field} value={bonusMisc} onChange={(e) => setBonusMisc(e.target.value)} placeholder="default" /></Col>
            </Row>
          </div>

          <div style={{ borderTop: '1px solid rgba(28,43,58,.08)', paddingTop: 14, marginTop: 2 }}>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 2 }}>Attachments</div>
            <p className="muted" style={{ fontSize: 12, marginBottom: 10 }}>Certificates, registration proof, ID. Upload small files (≤ 2.5 MB each) or leave empty.</p>
            <input type="file" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} style={{ fontSize: 13 }} />
            {docError && <p style={{ color: coral, fontSize: 12.5, marginTop: 6 }}>{docError}</p>}
            {docs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                {docs.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(28,43,58,.04)', borderRadius: 8, padding: '7px 11px' }}>
                    <span style={{ flex: 1, fontSize: 13, color: charcoal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                    <button type="button" onClick={() => setDocs((prev) => prev.filter((_, idx) => idx !== i))} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', color: coral, fontSize: 12.5 }}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p className="muted" style={{ lineHeight: 1.6 }}>Admins get full access to this console. Create sparingly.</p>
          <Row>
            <Col><label style={label}>Full name</label><input style={field} value={adminName} onChange={(e) => setAdminName(e.target.value)} required placeholder="Platform Admin" /></Col>
            <Col><label style={label}>Email</label><input type="email" style={field} value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required placeholder="admin@getcalmly.com" /></Col>
          </Row>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
        <button type="submit" disabled={pending} className="btn btn-primary" style={{ opacity: pending ? 0.6 : 1 }}>
          {pending ? 'Creating…' : `Create ${kind === 'therapist' ? 'clinician' : 'admin'}`}
        </button>
        {result && !result.ok && <span style={{ fontSize: 13.5, color: coral }}>{result.error}</span>}
      </div>
    </form>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{children}</div>
}
function Col({ children }: { children: React.ReactNode }) {
  return <div style={{ flex: '1 1 200px', minWidth: 160 }}>{children}</div>
}
