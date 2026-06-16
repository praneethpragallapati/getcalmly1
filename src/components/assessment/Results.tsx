'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { therapists } from '@/data/therapists'

type Result = {
  type: string
  severity: 'Minimal' | 'Mild' | 'Moderate' | 'Severe'
  concerns: string[]
  riskFlag: boolean
  tags?: string[]
  answers: Record<string, string | string[]>
}

const severityConfig = {
  Minimal: {
    bg: '#E5F4EE', color: '#1A7F7A', border: 'rgba(26,127,122,.2)',
    icon: '🌱',
    label: 'Minimal',
    desc: 'Your responses suggest minimal distress. A few sessions or self-help tools may help you stay well and build resilience.',
  },
  Mild: {
    bg: '#FFF8E7', color: '#C9973A', border: 'rgba(201,151,58,.2)',
    icon: '🌤️',
    label: 'Mild',
    desc: 'Your responses suggest mild difficulties. Talking to a counsellor can help you build coping strategies before things build up.',
  },
  Moderate: {
    bg: '#FFF0EC', color: '#C8553D', border: 'rgba(200,85,61,.2)',
    icon: '⛅',
    label: 'Moderate',
    desc: 'Your responses suggest moderate difficulties. We recommend regular sessions with a clinical psychologist who can work with you systematically.',
  },
  Severe: {
    bg: '#FDECEC', color: '#C0392B', border: 'rgba(192,57,43,.2)',
    icon: '🌧️',
    label: 'Severe',
    desc: 'Your responses suggest significant distress. We strongly recommend speaking with a professional soon. If you are in crisis, please use the helplines below.',
  },
}

export default function Results() {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('assess_result')
    if (raw) setResult(JSON.parse(raw))
  }, [])

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
  const lang = typeof result.answers.language === 'string' ? result.answers.language : null
  const genderPref = typeof result.answers.gender === 'string' ? result.answers.gender : null
  const support = typeof window !== 'undefined' ? sessionStorage.getItem('assess_support') : null
  const matched = matchTherapists(result, lang, support, genderPref)

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
              {lang && (
                <p className="rcc-lang">Preferred session language: <strong>{lang}</strong></p>
              )}
            </div>
          )}
        </div>

        {/* Crisis block */}
        {result.riskFlag && (
          <div className="results-crisis">
            <h3 className="crisis-title">You don&apos;t have to face this alone</h3>
            <p className="crisis-sub">If you are in crisis or thinking about harming yourself, please reach out right now:</p>
            <div className="crisis-lines">
              <a href="tel:+919152987821" className="crisis-line">
                <span className="cl-name">iCall (TISS)</span>
                <span className="cl-num">9152987821</span>
              </a>
              <a href="tel:+917893078930" className="crisis-line">
                <span className="cl-name">One Life</span>
                <span className="cl-num">78930-78930</span>
              </a>
              <a href="tel:+912227546669" className="crisis-line">
                <span className="cl-name">Asra (24/7)</span>
                <span className="cl-num">+91-22-27546669</span>
              </a>
            </div>
          </div>
        )}

        {/* Therapist matches */}
        <div className="results-matches">
          <div className="rm-header">
            <h2 className="rm-title">Your matched professionals</h2>
            <p className="rm-sub">Matched by your concerns{lang ? ` and ${lang} language preference` : ''}. We find the right fit — you don&apos;t browse.</p>
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
              <p className="rcta-eyebrow">Your first session is free</p>
              <h3 className="rcta-title">Not sure yet?</h3>
              <p className="rcta-sub">Start with a free first session with your matched professional. No card, no commitment — just a conversation.</p>
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
 * derived tags. Care type strongly gates the right specialism, language
 * preference is a soft boost, and a tiny random term breaks ties so equally
 * good matches don't always appear in the same order. Top 3 are returned.
 */
function matchTherapists(result: Result, lang: string | null, support: string | null, genderPref: string | null) {
  const patientTags = new Set(result.tags ?? [])
  if (result.type === 'psychiatry') ['medication', 'psychiatry'].forEach((t) => patientTags.add(t))
  if (result.type === 'couple') ['couples', 'relationships'].forEach((t) => patientTags.add(t))
  if (result.type === 'child') ['child', 'adolescent'].forEach((t) => patientTags.add(t))

  const wantsPsychiatry = result.type === 'psychiatry' || support === 'medication'
  const therapyOnly = support === 'therapy' // pure therapy seeker — don't surface psychiatrists
  const wantGender = genderPref === 'Prefer a woman' ? 'female' : genderPref === 'Prefer a man' ? 'male' : null

  const scored = therapists.map((t) => {
    const isPsych = t.designation.includes('Psychiatrist')
    let s = t.tags.filter((tag) => patientTags.has(tag)).length
    // Care-type gating
    if (wantsPsychiatry) s += isPsych ? 6 : -5
    else if (therapyOnly && isPsych) s -= 8 // effectively excludes psychiatrists
    else if (isPsych) s -= 2 // 'both' / 'not sure' — slight preference for therapists
    if (result.type === 'couple') s += t.designation.includes('Couples') ? 6 : 0
    if (result.type === 'child') s += t.designation.includes('Child') ? 6 : 0
    // Language preference
    if (lang && t.languages.includes(lang)) s += 2
    // Gender preference — strong boost for a match, soft penalty otherwise
    if (wantGender) s += t.gender === wantGender ? 4 : -3
    // Rating breaks ties between otherwise equally-good matches (kept small so it
    // never overrides genuine clinical fit); tiny random term shuffles exact ties.
    s += t.rating * 0.02 + Math.random() * 0.001
    return { t, s }
  })

  scored.sort((a, b) => b.s - a.s)
  return scored.slice(0, 3).map((x) => x.t)
}
