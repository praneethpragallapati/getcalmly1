'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeMemberProfile } from '@/app/(auth)/welcome/actions'

/**
 * The one-time details form, shown once before a member reaches the dashboard.
 *
 * It collects everything the profile page holds, so nobody has to be chased for
 * an address six weeks later. Required and optional are separated visually and
 * enforced separately: only name, contact, date of birth and an emergency
 * contact block entry — the server checks that same list, so a partial payload
 * is rejected rather than silently accepted. The rest is asked for now because
 * a form at signup is far cheaper than a follow-up email.
 *
 * Preferred language is not filler: matchTherapistForTrack scores on it, so
 * answering it here measurably improves the first clinician match.
 *
 * Email is asked for only when the account was created by phone, and phone only
 * when it was created by email — demanding both would lock out whoever used the
 * other sign-in route.
 */

const input: React.CSSProperties = {
  width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '12px 14px',
  fontSize: 15, fontFamily: 'inherit', color: '#1C2B3A', background: '#fff', boxSizing: 'border-box',
}
const label: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#5F6E7D', marginBottom: 6,
}

export function MemberEssentialsForm({
  initial,
}: {
  initial: {
    name: string
    email: string | null
    hasPhone: boolean
    dateOfBirth: string | null
    emergencyName: string | null
    emergencyPhone: string | null
  }
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initial.name)
  const [email, setEmail] = useState(initial.email ?? '')
  const [dob, setDob] = useState(initial.dateOfBirth ?? '')
  const [emName, setEmName] = useState(initial.emergencyName ?? '')
  const [emPhone, setEmPhone] = useState(initial.emergencyPhone ?? '')
  const [emRel, setEmRel] = useState('')

  // Everything the profile page holds, so it is captured once.
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [language, setLanguage] = useState('')
  const [marital, setMarital] = useState('')
  const [occupation, setOccupation] = useState('')
  const [addr1, setAddr1] = useState('')
  const [addr2, setAddr2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pin, setPin] = useState('')

  // Only ask for an email when we don't already have one and the account came
  // in by phone; otherwise contact is already satisfied.
  const needsEmail = !initial.email
  const needsPhone = !initial.hasPhone

  const submit = () => {
    setError(null)
    start(async () => {
      const res = await completeMemberProfile({
        name, email: needsEmail ? email : null, dateOfBirth: dob,
        emergencyName: emName, emergencyPhone: emPhone, emergencyRelation: emRel,
        phone: needsPhone ? phone : null,
        gender, preferredLanguage: language, maritalStatus: marital, occupation,
        country: 'IN', state, city, addressLine1: addr1, addressLine2: addr2, postalCode: pin,
      })
      if (res.ok) router.replace('/app')
      else setError(res.error ?? 'Could not save your details.')
    })
  }

  const optional = <span style={{ fontWeight: 400, color: '#8E9EAE' }}>(optional)</span>
  const sectionHead: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
    color: '#5F6E7D', marginBottom: 10,
  }
  const row: React.CSSProperties = { display: 'flex', gap: 12, flexWrap: 'wrap' }
  const half: React.CSSProperties = { flex: '1 1 45%', minWidth: 140 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={label}>Full name</label>
        <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" />
      </div>

      {needsEmail && (
        <div>
          <label style={label}>Email</label>
          <input
            style={input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          {initial.hasPhone && (
            <p style={{ fontSize: 12, color: '#5F6E7D', marginTop: 6 }}>
              For receipts and session reminders.
            </p>
          )}
        </div>
      )}

      {needsPhone && (
        <div>
          <label style={label}>Phone {optional}</label>
          <input style={input} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          <p style={{ fontSize: 12, color: '#5F6E7D', marginTop: 6 }}>
            So your expert can reach you about a session.
          </p>
        </div>
      )}

      <div>
        <label style={label}>Date of birth</label>
        <input style={input} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
      </div>

      <div style={row}>
        <div style={half}>
          <label style={label}>Gender {optional}</label>
          <select style={input} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Prefer not to say</option>
            <option>Female</option><option>Male</option>
            <option>Non-binary</option><option>Other</option>
          </select>
        </div>
        <div style={half}>
          {/* Not filler — the matcher scores on this. */}
          <label style={label}>Preferred language {optional}</label>
          <input style={input} value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. Hindi, English" />
        </div>
      </div>

      <div style={row}>
        <div style={half}>
          <label style={label}>Marital status {optional}</label>
          <select style={input} value={marital} onChange={(e) => setMarital(e.target.value)}>
            <option value="">Prefer not to say</option>
            <option>Single</option><option>Married</option>
            <option>Partnered</option><option>Separated</option>
            <option>Divorced</option><option>Widowed</option>
          </select>
        </div>
        <div style={half}>
          <label style={label}>Occupation {optional}</label>
          <input style={input} value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Software engineer" />
        </div>
      </div>

      <div style={{ borderTop: '1px solid #EDEFF2', paddingTop: 14 }}>
        <div style={sectionHead}>Address {optional}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={input} value={addr1} onChange={(e) => setAddr1(e.target.value)} placeholder="Flat / house no., building, street" />
          <input style={input} value={addr2} onChange={(e) => setAddr2(e.target.value)} placeholder="Area, landmark" />
          <div style={row}>
            <input style={{ ...input, ...half }} value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            <input style={{ ...input, ...half }} value={state} onChange={(e) => setState(e.target.value)} placeholder="State" />
          </div>
          <input style={{ ...input, maxWidth: 180 }} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN code" />
        </div>
      </div>

      <div style={{ borderTop: '1px solid #EDEFF2', paddingTop: 14 }}>
        <div style={sectionHead}>Emergency contact</div>
        <p style={{ fontSize: 12.5, color: '#5F6E7D', lineHeight: 1.6, margin: '0 0 12px' }}>
          Someone we can reach if we&apos;re ever worried about your safety. We won&apos;t contact
          them for anything else.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={label}>Their name</label>
            <input style={input} value={emName} onChange={(e) => setEmName(e.target.value)} placeholder="Who should we call?" />
          </div>
          <div>
            <label style={label}>Their phone number</label>
            <input style={input} type="tel" value={emPhone} onChange={(e) => setEmPhone(e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label style={label}>Relationship <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <input style={input} value={emRel} onChange={(e) => setEmRel(e.target.value)} placeholder="Parent, partner, friend…" />
          </div>
        </div>
      </div>

      {error && <p style={{ fontSize: 13, color: '#B8482F', margin: 0 }}>{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        style={{
          width: '100%', padding: '14px', borderRadius: 12, border: 'none',
          background: '#B8482F', color: '#fff', fontSize: 15, fontWeight: 700,
          cursor: pending ? 'wait' : 'pointer', fontFamily: 'inherit', marginTop: 4,
        }}
      >
        {pending ? 'Saving…' : 'Continue to my dashboard →'}
      </button>
    </div>
  )
}
