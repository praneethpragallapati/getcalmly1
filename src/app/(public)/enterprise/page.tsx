'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { submitEnterpriseLead } from '@/app/(public)/actions'
import { contactEmail } from '@/config/site'

const charcoal = '#1C2B3A'
// Brand coral is only AA-safe as large display text. Everything on this page
// uses it at body/eyebrow/button size, so it points at the darker ink cut
// (5.99:1 on cream, and on white behind a CTA) instead of #C8553D at 4.26:1.
const coral = '#A8432D'
const cream = '#FFFCFA'
const teal = '#1A7F7A'
const green = '#3D9E72'

// Enterprise FAQ. Rendered as a collapsed accordion AND emitted as FAQPage
// JSON-LD so answer/generative engines can lift the answers. Written plain,
// the way a person would actually answer, not marketing boilerplate.
const ENT_FAQ: { q: string; a: string }[] = [
  {
    q: 'Will our leadership see individual employees’ mental health data?',
    a: 'No, and this matters to us. HR and managers only ever see anonymous, team-level trends. Nobody at your company can see a named person’s sessions, their mood data, or their notes.',
  },
  {
    q: 'Is workplace teletherapy DPDP-compliant in India?',
    a: 'Yes. We built GetCalmly privacy-first and in line with India’s DPDP Act, and our online therapy follows NIMHANS teletherapy guidelines. People know what they’re consenting to, and how long their data is kept.',
  },
  {
    q: 'What does a GetCalmly workplace programme include?',
    a: 'Confidential therapy and psychiatry with RCI- and NMC-registered clinicians, the Calm+ app for your team (mood check-ins, journaling, Calm AI), an anonymised dashboard for people leaders, and crisis resources built into the app.',
  },
  {
    q: 'How much does it cost?',
    a: 'It depends on the size of your organisation and what you want to cover, so we’ll put together a quote rather than quote a flat per-head price. Tell us a bit about your team and we’ll come back with numbers.',
  },
  {
    q: 'How quickly can we get started?',
    a: 'We can usually have you up and running in about 48 hours. Most companies start with a small pilot, one team or group, agree what success looks like, then widen it out from there.',
  },
  {
    q: 'Which locations and languages do you cover?',
    a: 'It’s all online, so your people can use it from anywhere in India. We try to match each person with a clinician who speaks their preferred language.',
  },
  {
    q: 'Are your clinicians actually qualified?',
    a: 'Yes. Every therapist and psychiatrist is licensed, background-checked, and registered with the RCI or NMC before they see anyone. These are real, vetted professionals, not a directory of freelancers.',
  },
]

export default function EnterprisePage() {
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()

  function submitLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const get = (k: string) => String(fd.get(k) ?? '')
    startTransition(async () => {
      await submitEnterpriseLead({
        name: get('name'), email: get('email'), organisation: get('organisation'),
        sector: get('sector'), teamSize: get('teamSize'), phone: get('phone'), message: get('message'),
      })
      setSent(true)
    })
  }

  const eyebrow: React.CSSProperties = {
    fontSize: 11.5, fontWeight: 700, letterSpacing: 2.5, color: coral,
    textTransform: 'uppercase', marginBottom: 0,
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 15px', border: '1.5px solid #E2E8F0', borderRadius: 12,
    fontSize: 15, color: charcoal, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 700, color: charcoal, marginBottom: 7,
  }

  return (
    <div style={{ background: cream }}>

      {/* ─── HERO ─── */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(90,130,195,.22), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.16), transparent 60%), #14233B', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '118px 48px 88px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -120, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,150,210,.16) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 80, alignItems: 'center', position: 'relative' }}>
          <div>
            <p style={{ ...eyebrow, color: coral, marginBottom: 24 }}>GetCalmly for organisations · Coming soon</p>
            <h1 style={{
              fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300,
              fontSize: 'clamp(40px, 5.6vw, 66px)', color: '#fff', lineHeight: 1.04,
              letterSpacing: '-2px', marginBottom: 28,
            }}>
              Workplace mental health,{' '}
              <span style={{ color: coral }}>before it shows up in your numbers.</span>
            </h1>
            <p style={{ fontSize: 18.5, color: 'rgba(255,255,255,.7)', lineHeight: 1.82, fontWeight: 300, maxWidth: 580, marginBottom: 38 }}>
              Burnout, absenteeism and quiet quitting are rarely loud. By the time they show up in your numbers, the cost is already paid. GetCalmly gives your people confidential therapy and psychiatry with RCI- and NMC-registered clinicians, and gives you the signal long before it becomes a statistic.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#interest" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: coral, color: '#fff', padding: '15px 30px', borderRadius: 50, fontSize: 15.5, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(200,85,61,.35)' }}>
                Submit interest →
              </a>
              <a href="#segments" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)', padding: '15px 26px', borderRadius: 50, fontSize: 15.5, fontWeight: 600, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", border: '1.5px solid rgba(255,255,255,.16)' }}>
                See what we offer
              </a>
            </div>
          </div>
          {/* Right column, compact trust signals */}
          <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(255,255,255,.10)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 24, letterSpacing: 0.3 }}>Built for teams that take care seriously</p>
            {[
              ['RCI & NMC verified', 'Every clinician credentialed'],
              ['Aggregate-only insights', 'Individuals always anonymous'],
              ['DPDP aligned', 'Privacy from day one'],
              ['48-hr onboarding', 'Pilot-ready in days, not months'],
            ].map(([t, d]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <span style={{ color: coral, fontSize: 16, marginTop: 1, flexShrink: 0 }}>✓</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{t}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', fontWeight: 300 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEGMENTS: 3-column, full width ─── */}
      <section id="segments" style={{ padding: '104px 48px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 52 }}>
            <p style={{ ...eyebrow, marginBottom: 16 }}>Built around how you work</p>
            <h2 style={{
              fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300,
              fontSize: 'clamp(32px, 5vw, 50px)', color: charcoal, letterSpacing: '-1.5px', lineHeight: 1.03, maxWidth: 600,
            }}>
              One platform, shaped to your people.
            </h2>
          </div>
          <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {[
              {
                accent: coral,
                pale: 'rgba(200,85,61,.07)',
                label: 'Corporates',
                headline: 'Mental health is the quietest cost on your balance sheet.',
                body: 'Burnout, absenteeism and quiet quitting rarely show up until they are expensive. Give your people confidential access to real therapists and a daily support app, and give your leaders aggregate wellbeing signals, never individual data.',
                points: ['Confidential therapy & psychiatry', 'Calm+ app from day one', 'Anonymised HR dashboards', 'In-app crisis resources & escalation'],
              },
              {
                accent: green,
                pale: 'rgba(61,158,114,.07)',
                label: 'Education',
                headline: 'Students are carrying more than ever, and most carry it alone.',
                body: 'Exam pressure, identity, belonging and the weight of expectation. Bring age-appropriate counselling, child and adolescent specialists, and a safe digital space to your campus, with safeguarding built in.',
                points: ['Counsellors trained for students', 'Confidential self-referral', 'Safeguarding & crisis escalation', 'Wellbeing programmes for staff'],
              },
              {
                accent: teal,
                pale: 'rgba(26,127,122,.07)',
                label: 'Hospitals',
                headline: 'A complete mental health layer for your patients, delivered as SaaS.',
                body: 'Offer structured, AI-assisted mental health care under your own brand. Our platform handles matching, scheduling, clinical notes and the patient app, so your clinicians focus on care while you extend your services.',
                points: ['White-label portals', 'Clinical notes & referral flows', 'Google Meet + calendar sync', 'DPDP-ready, NIMHANS-aligned care'],
              },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: '44px 36px 40px',
                background: i === 1 ? '#fff' : cream,
                borderRadius: i === 0 ? '20px 0 0 20px' : i === 2 ? '0 20px 20px 0' : 0,
                borderTop: `3px solid ${s.accent}`,
              }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 2, color: s.accent, textTransform: 'uppercase', marginBottom: 18 }}>{s.label}</p>
                <h3 style={{
                  fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800,
                  fontSize: 'clamp(20px, 2.4vw, 26px)', color: charcoal, letterSpacing: '-0.4px',
                  lineHeight: 1.2, marginBottom: 18,
                }}>
                  {s.headline}
                </h3>
                <p style={{ fontSize: 15, color: '#5A6B7A', lineHeight: 1.78, fontWeight: 300, marginBottom: 24 }}>{s.body}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {s.points.map((p) => (
                    <div key={p} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.accent, marginTop: 7, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#5A6B7A', lineHeight: 1.6, fontWeight: 400 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HR ADMIN DASHBOARD: copy left, mock dashboard right ─── */}
      <section style={{ background: '#fff', padding: '104px 48px' }}>
        <div className="m-stack" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '400px 1fr', gap: 72, alignItems: 'center' }}>
          {/* Left: copy */}
          <div>
            <p style={{ ...eyebrow, marginBottom: 18 }}>For HR & people leaders</p>
            <h2 style={{
              fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300,
              fontSize: 'clamp(28px, 4vw, 44px)', color: charcoal, letterSpacing: '-1.2px', lineHeight: 1.06, marginBottom: 22,
            }}>
              See the wellbeing of your people, never the person.
            </h2>
            <p style={{ fontSize: 17, color: '#5A6B7A', lineHeight: 1.82, fontWeight: 300, marginBottom: 28 }}>
              One simple dashboard tells you whether your investment is working: how many people are engaging, where stress is rising, and whether wellbeing is trending up. The signal is drawn from everyday use of the app, mood check-ins, journaling and Calm AI conversations, then aggregated and anonymised, so you see the trend, never an individual&apos;s records.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['Spot strain before it spreads', 'Department-level trends flag where burnout risk is climbing, so you can act early.'],
                ['Prove the ROI', 'Engagement and utilisation in one view, show leadership the programme is being used.'],
                ['Zero admin overhead', 'No spreadsheets, no manual reports. Live numbers refresh on their own.'],
              ].map(([t, d]) => (
                <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: coral, fontSize: 16, marginTop: 2, flexShrink: 0 }}>✓</span>
                  <div>
                    <p style={{ fontSize: 15.5, fontWeight: 700, color: charcoal, marginBottom: 3 }}>{t}</p>
                    <p style={{ fontSize: 14, color: '#5A6A7A', lineHeight: 1.6, fontWeight: 300 }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mock dashboard */}
          <div style={{
            background: cream, borderRadius: 24, padding: 24,
            border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 30px 60px -20px rgba(28,43,58,.22)',
          }}>
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,.05)' }}>
              {/* Dash top bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: charcoal, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: "'Big Shoulders Display', sans-serif" }}>G</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: charcoal }}>Wellbeing Overview</span>
                </div>
                <span style={{ fontSize: 11.5, color: '#5F6E7D', background: '#F2F5F8', padding: '5px 10px', borderRadius: 20, fontWeight: 600 }}>Last 30 days ▾</span>
              </div>

              {/* KPI row */}
              <div className="m-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(0,0,0,.05)' }}>
                {[
                  ['Active members', '412', '68% of staff', coral],
                  ['Sessions booked', '189', '+23% MoM', green],
                  ['Wellbeing index', '7.4', '+0.6 vs last mo', teal],
                ].map(([label, val, sub, c]) => (
                  <div key={label} style={{ background: '#fff', padding: '18px 18px 16px' }}>
                    <p style={{ fontSize: 11.5, color: '#5F6E7D', fontWeight: 600, marginBottom: 8 }}>{label}</p>
                    <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 30, color: charcoal, lineHeight: 1 }}>{val}</p>
                    <p style={{ fontSize: 11.5, color: c as string, fontWeight: 700, marginTop: 6 }}>{sub}</p>
                  </div>
                ))}
              </div>

              {/* Trend chart */}
              <div style={{ padding: '18px 20px', borderTop: '1px solid rgba(0,0,0,.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: charcoal }}>Engagement trend</p>
                  <span style={{ fontSize: 11, color: '#5F6E7D' }}>weekly active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 78 }}>
                  {[38, 46, 42, 55, 61, 58, 72, 80].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: i >= 6 ? coral : 'rgba(200,85,61,.22)', borderRadius: '5px 5px 0 0' }} />
                  ))}
                </div>
              </div>

              {/* Themes row */}
              <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(0,0,0,.06)' }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: charcoal, marginBottom: 12 }}>Top themes raised <span style={{ fontWeight: 400, color: '#5F6E7D' }}>· anonymised</span></p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {[
                    ['Workload & stress', 34, coral],
                    ['Sleep', 26, teal],
                    ['Work–life balance', 21, green],
                  ].map(([name, pct, c]) => (
                    <div key={name as string} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12.5, color: '#5A6B7A', width: 130, flexShrink: 0 }}>{name}</span>
                      <div style={{ flex: 1, height: 7, background: '#EEF1F4', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: c as string, borderRadius: 10 }} />
                      </div>
                      <span style={{ fontSize: 11.5, color: '#5F6E7D', fontWeight: 600, width: 32, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: '#5F6E7D', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
              Illustrative view. Aggregate data only, individual records are never visible to your organisation.
            </p>
          </div>
        </div>
      </section>

      {/* ─── PARTNERSHIP STEPS: 4-column, charcoal band ─── */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(90,130,195,.22), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.16), transparent 60%), #14233B', padding: '94px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <p style={{ ...eyebrow, color: coral, marginBottom: 16 }}>How a partnership works</p>
              <h2 style={{
                fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300,
                fontSize: 'clamp(28px, 4vw, 42px)', color: '#fff', letterSpacing: '-1px', lineHeight: 1.05,
              }}>
                From first call to measurable impact.
              </h2>
            </div>
            <a href="#interest" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: coral, color: '#fff', padding: '14px 26px', borderRadius: 50, fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
              Submit interest →
            </a>
          </div>
          <div className="m-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {[
              ['01', 'Discovery', 'We learn about your people, your goals and your constraints, then shape a programme that fits.'],
              ['02', 'Pilot', 'A focused rollout to one team or cohort, with clear success measures agreed up front.'],
              ['03', 'Rollout', 'Onboarding, comms and launch support to drive real adoption, not just sign-ups.'],
              ['04', 'Measure', 'Quarterly anonymised reporting and reviews, so you can see impact and keep improving.'],
            ].map(([n, t, d], i) => (
              <div key={n} style={{
                padding: '36px 28px',
                background: i % 2 === 0 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.02)',
                borderRadius: i === 0 ? '16px 0 0 16px' : i === 3 ? '0 16px 16px 0' : 0,
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,.08)' : 'none',
              }}>
                <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 40, color: coral, opacity: 0.35, lineHeight: 1, marginBottom: 16 }}>{n}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '-0.2px' }}>{t}</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.72, fontWeight: 300 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPLIANCE: compact inline strip ─── */}
      <section style={{ background: cream, padding: '56px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0 }}>
              <p style={{ ...eyebrow, color: teal, marginBottom: 8 }}>Security & compliance</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: charcoal, letterSpacing: '-0.3px' }}>Trust is the whole product.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
              {[
                ['DPDP Act 2023', 'Consent-first, clear retention'],
                ['Encrypted by default', 'In transit & at rest'],
                ['Anonymised reporting', 'No individual data to orgs'],
                ['NIMHANS-aligned care', 'Follows NIMHANS teletherapy guidelines'],
              ].map(([t, d]) => (
                <div key={t} style={{
                  background: '#fff', borderRadius: 14, padding: '14px 18px',
                  border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)', flex: '1 1 160px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: teal, fontSize: 13, fontWeight: 800 }}>✓</span>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: charcoal }}>{t}</p>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#5A6A7A', lineHeight: 1.5 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ: collapsed accordion + FAQPage schema ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: ENT_FAQ.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <section style={{ background: cream, padding: '88px 48px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...eyebrow, marginBottom: 14, textAlign: 'center' }}>Questions from people leaders</p>
          <h2 style={{
            fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300,
            fontSize: 'clamp(28px, 4vw, 42px)', color: charcoal, letterSpacing: '-1px', lineHeight: 1.05,
            textAlign: 'center', marginBottom: 36,
          }}>
            What organisations ask us.
          </h2>
          <div>
            {ENT_FAQ.map((f) => (
              <details key={f.q} className="svc-faq-item">
                <summary style={{ color: charcoal }}>
                  <span>{f.q}</span>
                  <span className="svc-faq-ic" aria-hidden="true" style={{ color: coral }} />
                </summary>
                <p className="svc-faq-a">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTEREST FORM ─── */}
      <section id="interest" style={{ background: '#fff', padding: '104px 48px' }}>
        <div className="m-stack" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '420px 1fr', gap: 80, alignItems: 'flex-start' }}>
          {/* Left: copy */}
          <div style={{ position: 'sticky', top: 48 }}>
            <p style={{ ...eyebrow, marginBottom: 20 }}>Let&apos;s talk</p>
            <h2 style={{
              fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300,
              fontSize: 'clamp(32px, 4.4vw, 48px)', color: charcoal, letterSpacing: '-1.5px', lineHeight: 1.05, marginBottom: 20,
            }}>
              Tell us about your people.
            </h2>
            <p style={{ fontSize: 17, color: '#5A6B7A', lineHeight: 1.82, fontWeight: 300, marginBottom: 32 }}>
              A few details so we can design the right partnership around your organisation. No commitment, no sales script.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['Verified clinicians only', 'RCI & NMC registered before going live'],
                ['Pilot first, scale later', 'No big bets before you see results'],
                ['Privacy by design', 'Individuals always stay anonymous to your org'],
              ].map(([t, d]) => (
                <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: green, fontSize: 16, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: charcoal, marginBottom: 2 }}>{t}</p>
                    <p style={{ fontSize: 13.5, color: '#5A6A7A', fontWeight: 300 }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14.5, color: '#5A6A7A', marginTop: 32, fontWeight: 300 }}>
              Prefer email? <a href={`mailto:${contactEmail}`} style={{ color: coral, fontWeight: 600 }}>{contactEmail}</a>
            </p>
          </div>

          {/* Right: form */}
          <div>
            {sent ? (
              <div style={{ padding: '48px 0' }}>
                <p style={{ ...eyebrow, marginBottom: 16 }}>Received</p>
                <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300, fontSize: 'clamp(32px, 5vw, 44px)', color: charcoal, letterSpacing: '-1px', marginBottom: 16 }}>Thank you.</h2>
                <p style={{ fontSize: 17, color: '#5A6B7A', lineHeight: 1.8, fontWeight: 300, maxWidth: 480 }}>We have your details. Our partnerships team will be in touch as we open enterprise access, and sooner if there is a strong fit.</p>
              </div>
            ) : (
              <form onSubmit={submitLead} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Your name</label><input name="name" required style={inputStyle} placeholder="Full name" /></div>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Work email</label><input name="email" type="email" required style={inputStyle} placeholder="you@organisation.com" /></div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Organisation</label><input name="organisation" style={inputStyle} placeholder="Organisation name" /></div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={labelStyle}>You are a</label>
                    <select name="sector" style={inputStyle} defaultValue="">
                      <option value="" disabled>Select</option>
                      <option>Corporate / Employer</option>
                      <option>Educational institution</option>
                      <option>Hospital / Care provider</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={labelStyle}>Approx. people to cover</label>
                    <select name="teamSize" style={inputStyle} defaultValue="">
                      <option value="" disabled>Select</option>
                      <option>Under 100</option>
                      <option>100–500</option>
                      <option>500–2,000</option>
                      <option>2,000+</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Phone (optional)</label><input name="phone" type="tel" style={inputStyle} placeholder="+91 98765 43210" /></div>
                </div>
                <div>
                  <label style={labelStyle}>What are you hoping to solve?</label>
                  <textarea name="message" rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell us a little about your goals, what would success look like for your people?" />
                </div>
                <button type="submit" disabled={pending} style={{
                  width: '100%', padding: '17px', borderRadius: 50, border: 'none',
                  background: coral, color: '#fff', fontSize: 16, fontWeight: 700,
                  cursor: pending ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 8px 24px rgba(200,85,61,.3)', opacity: pending ? 0.7 : 1,
                }}>
                  {pending ? 'Submitting…' : 'Submit interest →'}
                </button>
                <p style={{ fontSize: 12.5, color: '#5F6E7D', textAlign: 'center', lineHeight: 1.6 }}>
                  Enterprise plans are in development. By submitting, you agree to be contacted about GetCalmly for organisations. See our <Link href="/privacy" style={{ color: coral, fontWeight: 600 }}>Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
