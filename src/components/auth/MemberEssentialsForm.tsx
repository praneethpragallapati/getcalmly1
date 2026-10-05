'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { completeMemberProfile } from '@/app/(public)/welcome/actions'
import { GENDER_OPTIONS } from '@/lib/memberOnboardingShared'
import DobPicker from '@/components/ui/DobPicker'

/**
 * The five one-time details: full name, email, phone, date of birth, gender.
 * Styled as one more step of the assessment (same ground, same fields and
 * pills, same Continue button), not as a separate formal form.
 *
 * Whichever of email or phone the member signed in with is shown but locked:
 * it is the one they proved they own.
 */
export function MemberEssentialsForm({
  nextUrl = '/app',
  initial,
}: {
  nextUrl?: string
  initial: { name: string; email: string | null; phone: string | null; dateOfBirth: string | null; gender: string | null }
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(initial.name)
  const [email, setEmail] = useState(initial.email ?? '')
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [dob, setDob] = useState(initial.dateOfBirth ?? '')
  const [gender, setGender] = useState(initial.gender ?? '')

  const complete = name.trim() && email.trim() && phone.trim() && dob && gender

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await completeMemberProfile({ name, email, phone, dateOfBirth: dob, gender })
      if (res.ok) router.replace(nextUrl)
      else setError(res.error ?? 'Could not save your details. Please try again.')
    })
  }

  const label =
    nextUrl.startsWith('/assess/results') || nextUrl === '/app/therapist'
      ? 'See my matches'
      : nextUrl.startsWith('/app/therapist/browse')
        ? 'Confirm my clinician'
        : nextUrl.startsWith('/checkout')
          ? 'Continue to booking'
          : 'Continue'

  return (
    <form onSubmit={submit} className="pa-form">
      <label className="pa-field">
        <span className="pa-pref-l">Full name</span>
        <input className="pa-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Priya Sharma" />
      </label>

      <div className="pa-field-row">
        <label className="pa-field">
          <span className="pa-pref-l">Email</span>
          <input
            className="pa-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            readOnly={Boolean(initial.email)} autoComplete="email" placeholder="you@example.com"
          />
        </label>
        <label className="pa-field">
          <span className="pa-pref-l">Phone</span>
          <input
            className="pa-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            readOnly={Boolean(initial.phone)} autoComplete="tel" placeholder="+91 98765 43210"
          />
        </label>
      </div>

      <div className="pa-field">
        <span className="pa-pref-l">Date of birth</span>
        <DobPicker value={dob} onChange={setDob} />
      </div>

      <div className="pa-field">
        <span className="pa-pref-l">Gender</span>
        <div className="pa-pills" role="radiogroup" aria-label="Gender">
          {GENDER_OPTIONS.map((g) => (
            <button key={g} type="button" role="radio" aria-checked={gender === g} className={`pa-pill${gender === g ? ' on' : ''}`} onClick={() => setGender(g)}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="pa-foot" style={{ color: '#A8432D', margin: 0 }}>{error}</p>}

      <div className="pa-nav" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="pa-next" disabled={!complete || pending}>
          {pending ? 'Saving…' : label} <ArrowRight size={17} />
        </button>
      </div>
      <p className="pa-foot" style={{ marginTop: 4 }}>Private and confidential. Only your care team sees these.</p>
    </form>
  )
}
