'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowRight } from 'lucide-react'
import { detailsProblem, type VisitorDetails } from '@/data/assessments'
import { completeMemberProfile } from '@/app/(public)/welcome/actions'
import { DETAILS_KEY } from '@/lib/pendingAssessment'
import DetailsFields from './DetailsFields'

// TEMPORARY test number, mirrored from the login page: signs in with no code.
const BYPASS_MOBILE = '918884518688'

/** "+91 98765 43210" / "9876543210" → "919876543210" (10 digits assume India). */
function toMobile(phone: string): string {
  const d = phone.replace(/\D/g, '')
  return d.length === 10 ? `91${d}` : d
}

function pretty(mobile: string): string {
  return mobile.startsWith('91') && mobile.length === 12 ? `+91 ${mobile.slice(2, 7)} ${mobile.slice(7)}` : `+${mobile}`
}

/**
 * Booking directly with a clinician from their website profile. The same
 * "about you" step as the assessment, in the same style, then the phone number
 * they just gave, a one-time code to sign in, and on to checkout. Signed-in
 * members skip the code.
 */
export default function BookFlow({
  slug,
  clinicianName,
  care,
  accent,
  signedIn,
  initial,
}: {
  slug: string
  clinicianName: string
  care: 'therapy' | 'psychiatry'
  accent: string
  signedIn: boolean
  initial: VisitorDetails
}) {
  const router = useRouter()
  const first = clinicianName.split(' ').slice(0, 2).join(' ')
  const [step, setStep] = useState<'details' | 'phone' | 'code'>('details')
  const [details, setDetails] = useState<VisitorDetails>(initial)
  const [mobile, setMobile] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const checkout = `/checkout?care=${care}`

  // The chosen clinician rides along in a cookie to checkout (also set by the
  // profile's Book button; set here too for anyone arriving on this link).
  useEffect(() => {
    document.cookie = `gc_book_clinician=${encodeURIComponent(slug)}; path=/; max-age=1800; samesite=lax`
  }, [slug])

  const setDetail = (k: keyof VisitorDetails, v: string) => setDetails((d) => ({ ...d, [k]: v }))
  const steps = signedIn ? 1 : 2
  const stepNo = step === 'details' ? 1 : 2

  async function saveAndGo() {
    const res = await completeMemberProfile({
      name: details.name, email: details.email, phone: details.phone,
      dateOfBirth: details.dateOfBirth, gender: details.gender,
    }).catch(() => null)
    if (!res?.ok) { setError(res?.error ?? 'Could not save your details. Please try again.'); setBusy(false); return }
    try { sessionStorage.removeItem(DETAILS_KEY) } catch { /* ignore */ }
    router.push(checkout)
  }

  async function continueFromDetails() {
    const problem = detailsProblem(details)
    if (problem) { setError(problem); return }
    setError('')
    // Kept for a moment in case sign-in sends them round the long way.
    try { sessionStorage.setItem(DETAILS_KEY, JSON.stringify(details)) } catch { /* ignore */ }
    if (signedIn) { setBusy(true); await saveAndGo(); return }
    setMobile(toMobile(details.phone))
    setStep('phone')
  }

  async function sendCode() {
    setError('')
    if (mobile.length < 10) { setError('Please add a valid phone number.'); return }
    const m = toMobile(mobile)
    if (m !== mobile) setMobile(m)
    setBusy(true)
    if (m === BYPASS_MOBILE) {
      const r = await signIn('phone-otp', { mobile: m, otp: 'bypass', redirect: false }).catch(() => null)
      if (r?.ok) { await saveAndGo(); return }
      setBusy(false); setError('Could not sign in. Please try again.'); return
    }
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: `+${m}` }),
      })
      const data = await res.json()
      if (data.ok) { setStep('code'); setCode('') }
      else setError(data.message || 'Could not send your code. Please try again.')
    } catch {
      setError('Network error. Please try again.')
    }
    setBusy(false)
  }

  async function verify() {
    setError('')
    if (code.length < 6) { setError('Enter the 6-digit code.'); return }
    setBusy(true)
    const r = await signIn('phone-otp', { mobile: `+${mobile}`, otp: code, redirect: false }).catch(() => null)
    if (r?.ok) { await saveAndGo(); return }
    setBusy(false)
    setError('That code did not match. Please try again.')
  }

  return (
    <div className="pa" style={{ '--pa-accent': accent } as React.CSSProperties}>
      <div className="pa-inner pa-inner-q">
        <div className="pa-top">
          <span className="pa-pathtag">Booking with {first}</span>
          <button type="button" className="pa-change" onClick={() => router.push(`/clinicians/${slug}`)}>Back to profile</button>
        </div>
        <div className="pa-bar" aria-hidden>
          {Array.from({ length: steps }, (_, i) => <span key={i} className={i < stepNo - 1 ? 'done' : i === stepNo - 1 ? 'now' : ''} />)}
        </div>
        <p className="pa-count"><b>{step === 'details' ? 'About you' : 'Sign in'}</b>Step {stepNo} of {steps}</p>

        {step === 'details' && (
          <div className="pa-stage" key="details">
            <h1 className="pa-q">First, a little <em>about you.</em></h1>
            <p className="pa-hint">So {first} can look after you properly. Private, and only your care team sees it.</p>
            <DetailsFields details={details} onChange={(k, v) => { setDetail(k, v); setError('') }} />
          </div>
        )}

        {step === 'phone' && (
          <div className="pa-stage" key="phone">
            <h1 className="pa-q">Now, let&apos;s <em>sign you in.</em></h1>
            <p className="pa-hint">We will send a one-time code on WhatsApp to this number.</p>
            <div className="pa-form">
              <label className="pa-field" style={{ maxWidth: 340 }}>
                <span className="pa-pref-l">Phone</span>
                <input
                  className="pa-input"
                  type="tel"
                  autoComplete="tel"
                  value={mobile ? pretty(mobile) : ''}
                  onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setError('') }}
                  placeholder="+91 98765 43210"
                />
              </label>
            </div>
          </div>
        )}

        {step === 'code' && (
          <div className="pa-stage" key="code">
            <h1 className="pa-q">Enter your <em>code.</em></h1>
            <p className="pa-hint">
              We sent a 6-digit code on WhatsApp to {pretty(mobile)}.{' '}
              <button type="button" className="pa-change" onClick={() => { setStep('phone'); setError('') }}>Change number</button>
            </p>
            <div className="pa-form">
              <label className="pa-field" style={{ maxWidth: 260 }}>
                <span className="pa-pref-l">One-time code</span>
                <input
                  className="pa-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') void verify() }}
                  placeholder="••••••"
                  style={{ letterSpacing: 8, fontSize: 20, fontWeight: 700 }}
                />
              </label>
              <button type="button" className="pa-change" style={{ alignSelf: 'flex-start' }} onClick={() => void sendCode()} disabled={busy}>
                Send a new code
              </button>
            </div>
          </div>
        )}

        <div className="pa-nav">
          <button
            type="button"
            className="pa-back"
            onClick={() => (step === 'details' ? router.push(`/clinicians/${slug}`) : setStep(step === 'code' ? 'phone' : 'details'))}
          >
            ← Back
          </button>
          <button
            type="button"
            className="pa-next"
            disabled={busy || (step === 'details' && detailsProblem(details) !== null)}
            onClick={() => void (step === 'details' ? continueFromDetails() : step === 'phone' ? sendCode() : verify())}
          >
            {busy
              ? 'One moment…'
              : step === 'details'
                ? (signedIn ? 'Continue to booking' : 'Continue')
                : step === 'phone'
                  ? 'Send my code'
                  : 'Verify and continue'}
            <ArrowRight size={17} />
          </button>
        </div>
        {error && <p className="pa-foot" style={{ color: '#A8432D' }}>{error}</p>}
      </div>
    </div>
  )
}
