'use client'

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { therapists } from '@/data/therapists'
import { saveAssessmentResult } from '@/app/(dashboard)/app/actions'

type Result = {
  type: string
  severity: 'Minimal' | 'Mild' | 'Moderate' | 'Severe'
  concerns: string[]
  riskFlag: boolean
  tags?: string[]
  answers: Record<string, string | string[]>
}

/**
 * How a result is worded.
 *
 * This is a screening questionnaire on a public page, not a triage. Someone
 * reading it is deciding whether to book a first session, and the two ways to
 * lose them are opposite: frighten them, or sound so breezy that nothing seems
 * worth doing. The old wording did the first — "significant distress", a red
 * panel, "we strongly recommend ... soon", and a list of crisis helplines under
 * a heading about harming yourself. Someone who has just answered honestly
 * about a hard few weeks was being told, in effect, that they are an emergency.
 *
 * So: plain language for where things are, a clear reason to talk to someone,
 * and no alarm. Nothing here is softened to the point of shrugging — the
 * heaviest result still says plainly that this is worth proper support.
 *
 * The clinical severity itself is NOT softened. It is stored on the profile and
 * reaches the clinician exactly as scored; only the words on this page changed.
 */
const severityConfig = {
  Minimal: {
    bg: '#E9F3EE', color: '#2C6E58', border: 'rgba(44,110,88,.18)',
    icon: '🌱',
    label: 'Mostly steady',
    desc: 'Your answers point to things being broadly okay. A few sessions can be a good place to work on something specific, or just to have somewhere to think out loud.',
  },
  Mild: {
    bg: '#F5F1E8', color: '#8A6D3B', border: 'rgba(138,109,59,.18)',
    icon: '🌤️',
    label: 'Some strain',
    desc: 'Your answers point to a few things weighing on you. These are usually easier to shift with someone alongside you than on your own.',
  },
  Moderate: {
    bg: '#F3EDE9', color: '#8C5A44', border: 'rgba(140,90,68,.18)',
    icon: '⛅',
    label: 'A fair amount going on',
    desc: 'Your answers point to a fair amount to work through. Regular sessions with a clinical psychologist give that a proper structure rather than leaving it to chance.',
  },
  Severe: {
    bg: '#ECEFF3', color: '#41556B', border: 'rgba(65,85,107,.2)',
    icon: '🌥️',
    label: 'A lot going on',
    desc: 'Your answers point to a lot going on at the moment. This is worth proper support — a clinical psychologist can help you make sense of it and work through it at a pace that suits you.',
  },
}

// The stored result never changes while this page is mounted, so no
// subscription is needed, only a hydration-safe read of sessionStorage.
const noSubscription = () => () => {}

export default function Results() {
  const raw = useSyncExternalStore(
    noSubscription,
    () => sessionStorage.getItem('assess_result'),
    () => null,
  )
  const result = useMemo<Result | null>(() => (raw ? JSON.parse(raw) : null), [raw])

  // If the visitor is signed in (e.g. they just registered and are completing
  // onboarding), persist this assessment to their profile and match a clinician.
  // Best-effort: the server action no-ops for logged-out marketing visitors, so
  // a signed-in patient is never asked to take the assessment again.
  const savedRef = useRef(false)
  useEffect(() => {
    if (!result || savedRef.current) return
    savedRef.current = true
    const genderPref = typeof result.answers.gender === 'string' ? result.answers.gender : null
    void saveAssessmentResult({
      type: result.type,
      tags: result.tags ?? [],
      // Language is collected once at signup and lives on the profile; the
      // assessment no longer asks, and null leaves the saved value alone.
      language: null,
      genderPref,
      severity: result.severity,
      riskFlag: result.riskFlag,
    })
  }, [result])

  if (!result) {
    return (
      <div className="assess-shell">
        <div className="assess-inner" style={{ textAlign: 'center', paddingTop: 80 }}>
          <p style={{ color: '#8E9EAE', marginBottom: 24 }}>We couldn&apos;t find your assessment results.</p>
          <Link href="/assess" className="aq-next" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            ✦ Start Assessment
          </Link>
        </div>
      </div>
    )
  }

  const cfg = severityConfig[result.severity]
  const genderPref = typeof result.answers.gender === 'string' ? result.answers.gender : null
  const support = typeof window !== 'undefined' ? sessionStorage.getItem('assess_support') : null
  const matched = matchTherapists(result, support, genderPref)

  return (
    <div className="assess-shell results-shell">
      <div className="assess-inner results-inner">

        {/* Header */}
        <div className="results-header">
          <div className="results-label">✦ Assessment complete</div>
          <h1 className="assess-h1" style={{ marginBottom: 8 }}>Your wellness profile</h1>
          <p className="assess-sub" style={{ marginBottom: 0 }}>Based on your responses. This is a screening summary, not a clinical diagnosis.</p>
        </div>

        {/* Severity + Concerns row */}
        <div className="results-top-grid">
          <div className="results-sev-card" style={{ background: cfg.bg, borderColor: cfg.border }}>
            <div className="rsc-icon">{cfg.icon}</div>
            <div>
              <p className="rsc-eyebrow">Severity level</p>
              <p className="rsc-level" style={{ color: cfg.color }}>{cfg.label}</p>
            </div>
            <p className="rsc-desc">{cfg.desc}</p>
          </div>

          {result.concerns.length > 0 && (
            <div className="results-concern-card">
              <p className="rcc-eyebrow">Areas of concern</p>
              <div className="rcc-tags">
                {result.concerns.map((c) => (
                  <span key={c} className="rcc-tag">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* No crisis panel here by design. The red block, the heading about
            harming yourself and the helpline list used to appear the moment the
            risk flag was set, which turned an honest answer into an emergency
            on screen. The flag itself still travels: it is saved with the
            assessment and reaches the clinician, who is the right person to act
            on it. */}

        {/* Therapist matches */}
        <div className="results-matches">
          <div className="rm-header">
            <h2 className="rm-title">Your matched professionals</h2>
            <p className="rm-sub">Matched by your concerns. We find the right fit, you don&apos;t browse.</p>
          </div>
          <div className="rm-grid">
            {matched.map((t, i) => (
              <div key={t.id} className={`rm-card${i === 0 ? ' rm-card-featured' : ''}`}>
                {i === 0 && <div className="rm-badge">✦ Best match</div>}
                <div className="rm-head">
                  <div className="rm-avatar" style={{ background: t.accent }}>{t.initials}</div>
                  <div className="rm-info">
                    <p className="rm-name">{t.name}</p>
                    <p className="rm-desig">{t.designation}</p>
                  </div>
                </div>
                <span className="rm-verified">
                  ✓ {t.nmcVerified ? 'NMC-registered' : 'RCI-verified'} · {t.availableNext ? `Available ${t.availableNext}` : 'Clinically registered'}
                </span>
                <div className="rm-tags">
                  {t.specializations.slice(0, 3).map((s) => (
                    <span key={s} className="rm-tag">{s}</span>
                  ))}
                </div>
                <div className="rm-meta">
                  <span>{t.yearsExp} yrs exp</span>
                  <span>·</span>
                  <span>{t.languages.slice(0, 2).join(', ')}</span>
                </div>
                <div className="rm-footer">
                  <span className="rm-fee">From ₹{t.sessionFee}<span className="rm-fee-sub">/session</span></span>
                  <Link href="/login" className="rm-btn">Book session</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="results-cta">
          <div className="rcta-inner">
            <div className="rcta-left">
              <p className="rcta-eyebrow">Your first session, from ₹799</p>
              <h3 className="rcta-title">Not sure yet?</h3>
              <p className="rcta-sub">Start with a free first session with your matched professional. No card, no commitment, just a conversation.</p>
            </div>
            <div className="rcta-actions">
              <Link href="/login" className="rcta-btn-primary">✦ Book a free session</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

/**
 * Rank professionals by how many of their tags overlap with the patient's
 * derived tags. Care type strongly gates the right specialism, and a tiny
 * random term breaks ties so equally good matches don't always appear in the
 * same order. Top 3 are returned.
 *
 * Language is not a factor here: the assessment stopped asking for it, since it
 * is collected at signup. Server-side matching for a signed-in patient still
 * uses their saved preference (see lib/matching.ts).
 */
function matchTherapists(result: Result, support: string | null, genderPref: string | null) {
  const patientTags = new Set(result.tags ?? [])
  if (result.type === 'psychiatry') ['medication', 'psychiatry'].forEach((t) => patientTags.add(t))
  if (result.type === 'couple') ['couples', 'relationships'].forEach((t) => patientTags.add(t))
  if (result.type === 'child') ['child', 'adolescent'].forEach((t) => patientTags.add(t))

  const wantsPsychiatry = result.type === 'psychiatry' || support === 'medication'
  const therapyOnly = support === 'therapy' // pure therapy seeker, don't surface psychiatrists
  const wantGender = genderPref === 'Prefer a woman' ? 'female' : genderPref === 'Prefer a man' ? 'male' : null

  const scored = therapists.map((t) => {
    const isPsych = t.designation.includes('Psychiatrist')
    let s = t.tags.filter((tag) => patientTags.has(tag)).length
    // Care-type gating
    if (wantsPsychiatry) s += isPsych ? 6 : -5
    else if (therapyOnly && isPsych) s -= 8 // effectively excludes psychiatrists
    else if (isPsych) s -= 2 // 'both' / 'not sure', slight preference for therapists
    if (result.type === 'couple') s += t.designation.includes('Couples') ? 6 : 0
    if (result.type === 'child') s += t.designation.includes('Child') ? 6 : 0
    // Gender preference, strong boost for a match, soft penalty otherwise
    if (wantGender) s += t.gender === wantGender ? 4 : -3
    // Rating breaks ties between otherwise equally-good matches (kept small so it
    // never overrides genuine clinical fit); tiny random term shuffles exact ties.
    s += t.rating * 0.02 + Math.random() * 0.001
    return { t, s }
  })

  scored.sort((a, b) => b.s - a.s)
  return scored.slice(0, 3).map((x) => x.t)
}
