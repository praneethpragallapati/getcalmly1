'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { therapists } from '@/data/therapists'

type Result = {
  type: string
  severity: 'Minimal' | 'Mild' | 'Moderate' | 'Severe'
  concerns: string[]
  riskFlag: boolean
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
  const matched = matchTherapists(result, lang)

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
                {t.rciVerified && (
                  <span className="rm-verified">✓ RCI Verified · Clinically registered</span>
                )}
                <div className="rm-tags">
                  {t.specializations.slice(0, 3).map((s) => (
                    <span key={s} className="rm-tag">{s}</span>
                  ))}
                </div>
                <div className="rm-meta">
                  <span>⭐ {t.rating}</span>
                  <span>·</span>
                  <span>{t.yearsExp} yrs experience</span>
                  <span>·</span>
                  <span>{t.languages.slice(0, 2).join(', ')}</span>
                </div>
                <div className="rm-footer">
                  <span className="rm-fee">From ₹{t.sessionFee}<span className="rm-fee-sub">/session</span></span>
                  <Link href="/login" className="rm-btn">
                    {i === 0 ? '✦ Book free session' : 'Book session'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="results-cta">
          <div className="rcta-inner">
            <div className="rcta-left">
              <p className="rcta-eyebrow">Free to start</p>
              <h3 className="rcta-title">Your first session is on us.</h3>
              <p className="rcta-sub">No card. No commitment. Create your free account to book — it takes 30 seconds.</p>
            </div>
            <div className="rcta-actions">
              <Link href="/register" className="rcta-btn-primary">✦ Create free account</Link>
              <Link href="/assess" className="rcta-btn-ghost">Retake assessment</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function matchTherapists(result: Result, lang: string | null) {
  let pool = [...therapists]
  if (result.type === 'psychiatry') pool.sort((a, b) => Number(b.designation.includes('Psychiatrist')) - Number(a.designation.includes('Psychiatrist')))
  else if (result.type === 'couple') pool.sort((a, b) => Number(b.designation.includes('Couples')) - Number(a.designation.includes('Couples')))
  else if (result.type === 'child') pool.sort((a, b) => Number(b.designation.includes('Child')) - Number(a.designation.includes('Child')))
  if (lang) pool.sort((a, b) => Number(b.languages.includes(lang)) - Number(a.languages.includes(lang)))
  return pool.slice(0, 3)
}
