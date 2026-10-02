'use client'

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { savePendingAssessment, RESULT_KEY } from '@/lib/pendingAssessment'
import { FLOWS, type AssessmentResult } from '@/data/assessments'
import { whatWeHeard, carePlan, tipsFor, firstSessionSteps } from '@/data/assessmentInsights'
import { HeartHandshake, CalendarDays, Route, Leaf } from 'lucide-react'
import { rankClinicians } from '@/data/assessmentMatch'
import type { PoolClinician } from '@/lib/assessmentPool'
import { PATH_LOOK } from './AssessmentStep1'

type FirstSession = { therapy: number; psychiatry: number; couples: number }

const noSubscription = () => () => {}

export default function Results({ firstSession, pool }: { firstSession: FirstSession; pool: PoolClinician[] }) {
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
  const plan = carePlan(flow.id, result.level)
  const tips = tipsFor(result)
  const steps = firstSessionSteps(flow.id)
  // Booking starts with the first session for this path; the saved answers
  // then match a clinician automatically.
  const buyHref = `/app/billing?track=${flow.id === 'psychiatry' ? 'psychiatry' : flow.id === 'couple' ? 'couples' : 'therapy'}`

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

        <blockquote className="pa-heard">
          <span className="pa-heard-l">What we heard</span>
          {whatWeHeard(result)}
        </blockquote>

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

        <h2 className="pa-h2">Your <em>care plan.</em></h2>
        <p className="pa-hint">What support usually looks like for answers like yours. Your clinician shapes the details with you.</p>
        <div className="pa-plan">
          <div className="pa-plan-tile">
            <span className="pa-plan-ic"><HeartHandshake size={18} /></span>
            <span className="pa-plan-l">Recommended care</span>
            <span className="pa-plan-v">{plan.care}</span>
            <span className="pa-plan-n">{plan.careNote}</span>
          </div>
          <div className="pa-plan-tile">
            <span className="pa-plan-ic"><CalendarDays size={18} /></span>
            <span className="pa-plan-l">Suggested rhythm</span>
            <span className="pa-plan-v">{plan.rhythm}</span>
            <span className="pa-plan-n">{plan.rhythmNote}</span>
          </div>
          <div className="pa-plan-tile">
            <span className="pa-plan-ic"><Route size={18} /></span>
            <span className="pa-plan-l">Typical length</span>
            <span className="pa-plan-v">{plan.length}</span>
            <span className="pa-plan-n">{plan.lengthNote}</span>
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
              const covered = Math.min(needsShown.length, m.matched.filter((n) => !flow.baseNeeds.includes(n)).length)
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
                  <span className="pa-lic">✓ {c.licence} licensed · {c.yearsExp} yrs experience</span>
                  {needsShown.length > 0 && (
                    <div className="pa-fit">
                      <div className="pa-fit-top">
                        <span>Match strength</span>
                        <b>{covered} of {needsShown.length} of your needs</b>
                      </div>
                      <div className="pa-fit-bar" aria-hidden>
                        <span style={{ width: `${Math.round((covered / needsShown.length) * 100)}%` }} />
                      </div>
                    </div>
                  )}
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
                    <span className="pa-fee">₹{price}<small>first session</small></span>
                    <Link href={buyHref}>Book session</Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <h2 className="pa-h2">Small things to <em>try this week.</em></h2>
        <p className="pa-hint">Gentle, practical ideas based on what you shared. They help while you settle in with your clinician.</p>
        <div className="pa-tips">
          {tips.map((t) => (
            <div key={t.title} className="pa-tip">
              <span className="pa-tip-ic"><Leaf size={16} /></span>
              <span className="pa-tip-t">{t.title}</span>
              <span className="pa-tip-b">{t.body}</span>
            </div>
          ))}
        </div>

        <h2 className="pa-h2">Your first session, <em>step by step.</em></h2>
        <ol className="pa-steps">
          {steps.map((st, i) => (
            <li key={st.title} className="pa-step">
              <span className="pa-step-n">{i + 1}</span>
              <span className="pa-step-t">{st.title}</span>
              <span className="pa-step-b">{st.body}</span>
            </li>
          ))}
        </ol>

        <div className="pa-cta">
          <div>
            <h3>Not ready to <em>book yet?</em></h3>
            <p>Sign up free and book whenever it suits you. Your answers and details come with you, so you will not be asked again, and mood check-ins, journalling and the community are open to you in the meantime.</p>
          </div>
          <Link href="/login?next=/app">Sign up free</Link>
        </div>
      </div>
    </div>
  )
}
