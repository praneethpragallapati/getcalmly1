'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { detailsProblem, type VisitorDetails } from '@/data/assessments'
import { completeMemberProfile } from '@/app/(public)/welcome/actions'
import { queueDetailsForSignIn } from '@/lib/pendingAssessment'
import { loginWithCodeHref } from '@/lib/loginLink'
import DetailsFields from './DetailsFields'

/**
 * Booking directly with a clinician from their website profile: the same
 * "about you" step as the assessment, in the same style. Then the usual login
 * page, with the phone number just given filled in and a code already sent;
 * after the code, the details are saved and checkout opens with this
 * clinician. Signed-in members go straight to checkout.
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
  const [details, setDetails] = useState<VisitorDetails>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const checkout = `/checkout?care=${care}`

  // The chosen clinician rides along in a cookie to checkout (also set by the
  // profile's Book button; set here too for anyone arriving on this link).
  useEffect(() => {
    document.cookie = `gc_book_clinician=${encodeURIComponent(slug)}; path=/; max-age=1800; samesite=lax`
  }, [slug])

  async function next() {
    const problem = detailsProblem(details)
    if (problem) { setError(problem); return }
    setError('')
    setBusy(true)
    if (signedIn) {
      const res = await completeMemberProfile({
        name: details.name, email: details.email, phone: details.phone,
        dateOfBirth: details.dateOfBirth, gender: details.gender,
      }).catch(() => null)
      if (!res?.ok) { setBusy(false); setError(res?.error ?? 'Could not save your details. Please try again.'); return }
      router.push(checkout)
      return
    }
    // Saved to the account right after sign-in (lib/pendingAssessment).
    queueDetailsForSignIn(details)
    router.push(loginWithCodeHref(details.phone, checkout))
  }

  return (
    <div className="pa" style={{ '--pa-accent': accent } as React.CSSProperties}>
      <div className="pa-inner pa-inner-q">
        <div className="pa-top">
          <span className="pa-pathtag">Booking with {first}</span>
          <button type="button" className="pa-change" onClick={() => router.push(`/clinicians/${slug}`)}>Back to profile</button>
        </div>
        <div className="pa-bar" aria-hidden>
          <span className="now" />
          {!signedIn && <span />}
        </div>
        <p className="pa-count"><b>About you</b>{signedIn ? 'One last step' : 'Step 1 of 2'}</p>

        <div className="pa-stage">
          <h1 className="pa-q">First, a little <em>about you.</em></h1>
          <p className="pa-hint">So {first} can look after you properly. Private, and only your care team sees it.</p>
          <DetailsFields details={details} onChange={(k, v) => { setDetails((d) => ({ ...d, [k]: v })); setError('') }} />
        </div>

        <div className="pa-nav">
          <button type="button" className="pa-back" onClick={() => router.push(`/clinicians/${slug}`)}>← Back</button>
          <button type="button" className="pa-next" disabled={busy || detailsProblem(details) !== null} onClick={() => void next()}>
            {busy ? 'One moment…' : signedIn ? 'Continue to booking' : 'Continue'}
            <ArrowRight size={17} />
          </button>
        </div>
        {error && <p className="pa-foot" style={{ color: '#A8432D' }}>{error}</p>}
      </div>
    </div>
  )
}
