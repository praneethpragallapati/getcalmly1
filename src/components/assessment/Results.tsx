'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import { savePendingAssessment, saveForBooking, signInAfterAssessmentHref, RESULT_KEY } from '@/lib/pendingAssessment'
import { FLOWS, type AssessmentResult } from '@/data/assessments'
import { rankClinicians } from '@/data/assessmentMatch'
import type { PoolClinician } from '@/lib/assessmentPool'
import { PATH_LOOK } from './AssessmentStep1'

type FirstSession = { therapy: number; psychiatry: number; couples: number }

const noSubscription = () => () => {}

export default function Results({ firstSession, pool }: { firstSession: FirstSession; pool: PoolClinician[] }) {
  const router = useRouter()
  const [booking, setBooking] = useState(false)
  const raw = useSyncExternalStore(noSubscription, () => sessionStorage.getItem(RESULT_KEY), () => null)
  const result = useMemo<AssessmentResult | null>(() => {
    try {
      const r = raw ? (JSON.parse(raw) as AssessmentResult) : null
      return r && FLOWS[r.flow] && Array.isArray(r.needs) ? r : null
    } catch {
      return null
    }
  }, [raw])

  // Already signed in? Save the answers and details now. Signed out, this does
  // nothing; they are saved right after sign-in instead (lib/pendingAssessment).
  const savedRef = useRef(false)
  useEffect(() => {
    if (!result || savedRef.current) return
    savedRef.current = true
    void savePendingAssessment()
  }, [result])

  const matches = useMemo(() => (result ? rankClinicians(pool, {
    flow: result.flow, needs: result.needs, styles: result.styles, level: result.level, risk: result.risk,
    genderPref: result.prefs.gender, language: result.prefs.language,
  }) : []), [pool, result])

  if (!result) {
    return (
      <div className="pa">
        <div className="pa-inner" style={{ textAlign: 'center', paddingTop: 40 }}>
          <p className="pa-eyebrow">Pre-assessment</p>
          <h1 className="pa-h1">Let&apos;s start <em>fresh.</em></h1>
          <p className="pa-lead" style={{ margin: '16px auto 28px' }}>We couldn&apos;t find your answers. It only takes a few minutes to go through them again.</p>
          <Link href="/assess" className="pa-next" style={{ textDecoration: 'none' }}>Start the pre-assessment</Link>
        </div>
      </div>
    )
  }

  const flow = FLOWS[result.flow]
  const accent = PATH_LOOK[flow.id].color
  const price = flow.id === 'psychiatry' ? firstSession.psychiatry : flow.id === 'couple' ? firstSession.couples : firstSession.therapy
  const needsShown = result.needs.filter((n) => !flow.baseNeeds.includes(n))
  // Booking starts with the first session for this path; the saved answers
  // then match a clinician automatically.
  const track = flow.id === 'psychiatry' ? 'psychiatry' : flow.id === 'couple' ? 'couples' : 'therapy'
  const buyHref = `/app/billing?track=${track}`
  // Book session matches for this care type first (saved now if signed in,
  // else right after sign-in), so billing opens on the first session itself.
  async function book() {
    if (booking) return
    setBooking(true)
    await saveForBooking(track)
    // Signed out: straight to the code for the number they just gave.
    const session = await getSession().catch(() => null)
    router.push(session ? buyHref : signInAfterAssessmentHref(buyHref))
  }
  async function signUp() {
    if (booking) return
    setBooking(true)
    const session = await getSession().catch(() => null)
    router.push(session ? '/app' : signInAfterAssessmentHref('/app'))
  }

  return (
    <div className="pa" style={{ '--pa-accent': accent } as React.CSSProperties}>
      <div className="pa-inner">
        <p className="pa-eyebrow">Your results · {flow.name}</p>
        <h1 className="pa-h1">Here is <em>where to begin.</em></h1>
        <p className="pa-lead">A summary of what you shared, and the clinicians best placed to help. This is a screening, not a diagnosis.</p>

        {/* No crisis or helpline panel on this page, by decision: however the
            answers score, an on-screen alarm frightens people away from the very
            help they came for. A risk answer is still saved and raises an alert
            for the clinician, who follows the risk protocol at the first session. */}

        <div className="pa-summary">
          <div>
            <p className="pa-level-l">Where things are</p>
            <p className="pa-level">{flow.levelName[result.level]}</p>
            <p className="pa-level-msg">{flow.message[result.level]}</p>
          </div>
          <div>
            {result.concerns.length > 0 && (
              <div className="pa-summary-block">
                <p className="pa-level-l">What you told us</p>
                <div className="pa-tags">{result.concerns.map((c) => <span key={c} className="pa-tag">{c}</span>)}</div>
              </div>
            )}
            {needsShown.length > 0 && (
              <div className="pa-summary-block">
                <p className="pa-level-l">What we matched on</p>
                <div className="pa-tags">{needsShown.map((n) => <span key={n} className="pa-tag need">{n}</span>)}</div>
              </div>
            )}
          </div>
        </div>

        <h2 className="pa-h2">Your <em>best matches.</em></h2>
        <p className="pa-hint">Ranked by how closely what each clinician offers fits what you need.</p>

        {matches.length === 0 ? (
          <p className="pa-lead">We are adding clinicians for this path. Create your account and our care team will match you personally.</p>
        ) : (
          <div className="pa-matches">
            {matches.map((m, i) => {
              const c = m.clinician
              const why = [...m.matched.filter((n) => !flow.baseNeeds.includes(n)), ...m.safetyMatched]
              return (
                <div key={c.id} className={`pa-match${i === 0 ? ' best' : ''}`}>
                  {i === 0 && <span className="pa-best">Best match</span>}
                  <div className="pa-who">
                    <span className="pa-av" style={i === 0 ? { background: accent } : undefined}>{c.initials}</span>
                    <div>
                      <p className="pa-name">{c.name}</p>
                      <p className="pa-desig">{c.designation}</p>
                    </div>
                  </div>
                  <span className="pa-lic">✓ {c.licence} licensed</span>
                  <div>
                    <p className="pa-why-l">Why this match</p>
                    <div className="pa-why">
                      {why.slice(0, 4).map((n) => <span key={n}>{n}</span>)}
                      {m.styleMatched.slice(0, 2).map((s) => <span key={s} className="style">{s}</span>)}
                      {why.length === 0 && m.styleMatched.length === 0 && (
                        <span>{flow.baseNeeds[0] ?? 'Broad experience across concerns'}</span>
                      )}
                    </div>
                  </div>
                  <p className="pa-meta">Speaks {c.languages.slice(0, 3).join(', ') || 'English'}</p>
                  <div className="pa-book">
                    <span className="pa-fee">
                      ₹{price.toLocaleString('en-IN')}
                      <small>first session, introductory price</small>
                    </span>
                    <a href={buyHref} onClick={(e) => { e.preventDefault(); void book() }} aria-busy={booking}>Book session</a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="pa-cta">
          <div>
            <h3>Not ready to <em>book yet?</em></h3>
            <p>Sign up free and book whenever it suits you. Your answers and details come with you, so you will not be asked again, and mood check-ins, journalling and the community are open to you in the meantime.</p>
          </div>
          <a href="/login?next=/app" onClick={(e) => { e.preventDefault(); void signUp() }}>Sign up free</a>
        </div>
      </div>
    </div>
  )
}
