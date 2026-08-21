'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeMemberProfile } from '@/app/(auth)/welcome/actions'

/**
 * The mandatory-details form. Every field here is required — the server checks
 * the same list, so submitting a partial payload is rejected rather than
 * silently accepted.
 *
 * Email is asked for only when the account was created by phone (and vice
 * versa): demanding both would lock out whoever used the other sign-in route.
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

  // Only ask for an email when we don't already have one and the account came
  // in by phone; otherwise contact is already satisfied.
  const needsEmail = !initial.email

  const submit = () => {
    setError(null)
    start(async () => {
      const res = await completeMemberProfile({
        name, email: needsEmail ? email : null, dateOfBirth: dob,
        emergencyName: emName, emergencyPhone: emPhone, emergencyRelation: emRel,
      })
      if (res.ok) router.replace('/app')
      else setError(res.error ?? 'Could not save your details.')
    })
  }

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

      <div>
        <label style={label}>Date of birth</label>
        <input style={input} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
      </div>

      <div style={{ borderTop: '1px solid #EDEFF2', paddingTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#5F6E7D', marginBottom: 10 }}>
          Emergency contact
        </div>
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
