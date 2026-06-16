'use client'

import Link from 'next/link'
import { useState } from 'react'

const charcoal = '#1C2B3A'
const coral = '#C8553D'
const cream = '#F9F5F2'
const teal = '#1A7F7A'
const green = '#3D9E72'

export default function EnterprisePage() {
  const [sent, setSent] = useState(false)

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
      <section style={{ background: charcoal, padding: '100px 48px 88px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -120, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.13) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,127,122,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 80, alignItems: 'center', position: 'relative' }}>
          <div>
            <p style={{ ...eyebrow, color: '#1FB6A8', marginBottom: 24 }}>GetCalmly for organisations · Coming soon</p>
            <h1 style={{
              fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
              fontSize: 'clamp(40px, 5.6vw, 66px)', color: '#fff', lineHeight: 1.02,
              letterSpacing: '-2px', marginBottom: 28,
            }}>
              The most stretched person on your team is probably the one who never says so.
            </h1>
            <p style={{ fontSize: 18.5, color: 'rgba(255,255,255,.7)', lineHeight: 1.82, fontWeight: 300, maxWidth: 580, marginBottom: 38 }}>
              Burnout, absenteeism and quiet quitting are rarely loud. By the time they show up in your numbers, the cost is already paid. GetCalmly gives your people confidential, clinically real mental health care — and gives you the signal long before it becomes a statistic.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#interest" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: coral, color: '#fff', padding: '15px 30px', borderRadius: 50, fontSize: 15.5, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(200,85,61,.35)' }}>
                Book a conversation →
              </a>
              <a href="#segments" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)', padding: '15px 26px', borderRadius: 50, fontSize: 15.5, fontWeight: 600, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", border: '1.5px solid rgba(255,255,255,.16)' }}>
                See what we offer
              </a>
            </div>
          </div>
          {/* Right column — compact trust signals */}
          <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(255,255,255,.10)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 24, letterSpacing: 0.3 }}>Used by teams that take care seriously</p>
            {[
              ['RCI & NMC verified', 'Every clinician credentialed'],
              ['15+ languages', 'Vernacular-first for India'],
              ['DPDP aligned', 'Privacy from day one'],
              ['48-hr onboarding', 'Pilot-ready in days, not months'],
            ].map(([t, d]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <span style={{ color: '#1FB6A8', fontSize: 16, marginTop: 1, flexShrink: 0 }}>✓</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{t}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', fontWeight: 300 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY THIS MATTERS: full-width editorial band ─── */}
      <section style={{ background: '#fff', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <p style={{ ...eyebrow, marginBottom: 20 }}>Why this matters now</p>
            <h2 style={{
              fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
              fontSize: 'clamp(30px, 4vw, 46px)', color: charcoal, letterSpacing: '-1.2px', lineHeight: 1.08, marginBottom: 0,
            }}>
              People do their best work when they are well — not when they are simply present.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 18, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 22 }}>
              A perk no one uses is not a benefit. Real support has to be confidential enough to trust, clinical enough to help, and easy enough to actually reach on the hardest day.
            </p>
            <p style={{ fontSize: 18, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300 }}>
              That is what we are building: verified clinicians, an AI-assisted support app for every day in between, and measurable outcomes — brought together as one platform you can stand behind.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SEGMENTS: 3-column, full width ─── */}
      <section id="segments" style={{ padding: '88px 48px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 52 }}>
            <p style={{ ...eyebrow, marginBottom: 16 }}>Built around how you work</p>
            <h2 style={{
              fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
              fontSize: 'clamp(32px, 5vw, 50px)', color: charcoal, letterSpacing: '-1.5px', lineHeight: 1.03, maxWidth: 600,
            }}>
              One platform, shaped to your people.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {[
              {
                accent: coral,
                pale: 'rgba(200,85,61,.07)',
                label: 'Corporates',
                headline: 'Mental health is the quietest cost on your balance sheet.',
                body: 'Burnout, absenteeism and quiet quitting rarely show up until they are expensive. Give your people confidential access to real therapists and a daily support app — and give your leaders aggregate wellbeing signals, never individual data.',
                points: ['Confidential therapy & psychiatry', 'Calm+ app from day one', 'Anonymised HR dashboards', '24×7 crisis support'],
              },
              {
                accent: green,
                pale: 'rgba(61,158,114,.07)',
                label: 'Education',
                headline: 'Students are carrying more than ever, and most carry it alone.',
                body: 'Exam pressure, identity, belonging and the weight of expectation. Bring age-appropriate counselling, child and adolescent specialists, and a safe digital space to your campus — with safeguarding built in.',
                points: ['Counsellors trained for students', 'Confidential self-referral', 'Safeguarding & crisis escalation', 'Wellbeing programmes for staff'],
              },
              {
                accent: teal,
                pale: 'rgba(26,127,122,.07)',
                label: 'Hospitals',
                headline: 'A complete mental health layer for your patients, delivered as SaaS.',
                body: 'Offer structured, AI-assisted mental health care under your own brand. Our platform handles matching, scheduling, clinical notes and the patient app — so your clinicians focus on care while you extend your services.',
                points: ['White-label portals', 'Clinical notes & referral flows', 'Google Meet + calendar sync', 'DPDP & NIMHANS compliant'],
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

      {/* ─── WHY US: 2×2 grid, full content width ─── */}
      <section style={{ background: '#fff', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 80, alignItems: 'flex-start' }}>
            <div style={{ position: 'sticky', top: 40 }}>
              <p style={{ ...eyebrow, marginBottom: 18 }}>Why organisations choose us</p>
              <h2 style={{
                fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
                fontSize: 'clamp(28px, 4vw, 42px)', color: charcoal, letterSpacing: '-1px', lineHeight: 1.08, marginBottom: 20,
              }}>
                Credible care, measurable trust.
              </h2>
              <p style={{ fontSize: 16, color: '#6B7D8E', lineHeight: 1.75, fontWeight: 300 }}>
                Every decision we make comes back to one question: would a clinician stake their reputation on this?
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
              {[
                ['Clinically credible', 'Only RCI-verified psychologists and NMC-registered psychiatrists. We verify every professional before they ever see a member of your community.'],
                ['AI that supports, never replaces', 'Calm AI, mood insights and journaling keep people supported between sessions, with every clinical output reviewed by a human.'],
                ['Outcomes you can measure', 'Anonymised, aggregate dashboards show engagement and wellbeing trends — so you can see impact without touching individual records.'],
                ['Built for India', 'Vernacular-first care across 15+ languages, designed for the realities of Indian workplaces, campuses and hospitals.'],
              ].map(([t, d], idx) => (
                <div key={t} style={{
                  padding: '32px 0',
                  borderTop: idx < 2 ? 'none' : '1px solid rgba(0,0,0,.08)',
                  paddingTop: idx < 2 ? 8 : 32,
                }}>
                  <p style={{ fontSize: 17, fontWeight: 700, color: charcoal, marginBottom: 10, letterSpacing: '-0.2px' }}>{t}</p>
                  <p style={{ fontSize: 15, color: '#5A6B7A', lineHeight: 1.75, fontWeight: 300 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PARTNERSHIP STEPS: 4-column, charcoal band ─── */}
      <section style={{ background: charcoal, padding: '80px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <p style={{ ...eyebrow, color: '#1FB6A8', marginBottom: 16 }}>How a partnership works</p>
              <h2 style={{
                fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
                fontSize: 'clamp(28px, 4vw, 42px)', color: '#fff', letterSpacing: '-1px', lineHeight: 1.05,
              }}>
                From first call to real impact.
              </h2>
            </div>
            <a href="#interest" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: coral, color: '#fff', padding: '14px 26px', borderRadius: 50, fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
              Start the conversation →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {[
              ['01', 'Discovery', 'We learn about your people, your goals and your constraints — then shape a programme that fits.'],
              ['02', 'Pilot', 'A focused rollout to one team or cohort, with clear success measures agreed up front.'],
              ['03', 'Rollout', 'Onboarding, comms and launch support to drive real adoption — not just sign-ups.'],
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
                ['NIMHANS standard', 'Telepsychotherapy compliant'],
              ].map(([t, d]) => (
                <div key={t} style={{
                  background: '#fff', borderRadius: 14, padding: '14px 18px',
                  border: `1.5px solid rgba(26,127,122,.18)`, flex: '1 1 160px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: teal, fontSize: 13, fontWeight: 800 }}>✓</span>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: charcoal }}>{t}</p>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#6B7D8E', lineHeight: 1.5 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTEREST FORM ─── */}
      <section id="interest" style={{ background: '#fff', padding: '88px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '420px 1fr', gap: 80, alignItems: 'flex-start' }}>
          {/* Left: copy */}
          <div style={{ position: 'sticky', top: 48 }}>
            <p style={{ ...eyebrow, marginBottom: 20 }}>Let&apos;s talk</p>
            <h2 style={{
              fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
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
                    <p style={{ fontSize: 13.5, color: '#6B7D8E', fontWeight: 300 }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14.5, color: '#6B7D8E', marginTop: 32, fontWeight: 300 }}>
              Prefer email? <a href="mailto:connect@getcalmly.com" style={{ color: coral, fontWeight: 600 }}>connect@getcalmly.com</a>
            </p>
          </div>

          {/* Right: form */}
          <div>
            {sent ? (
              <div style={{ padding: '48px 0' }}>
                <p style={{ ...eyebrow, marginBottom: 16 }}>Received</p>
                <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)', color: charcoal, letterSpacing: '-1px', marginBottom: 16 }}>Thank you.</h2>
                <p style={{ fontSize: 17, color: '#5A6B7A', lineHeight: 1.8, fontWeight: 300, maxWidth: 480 }}>We have your details. Our partnerships team will be in touch as we open enterprise access, and sooner if there is a strong fit.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Your name</label><input style={inputStyle} placeholder="Full name" /></div>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Work email</label><input type="email" style={inputStyle} placeholder="you@organisation.com" /></div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Organisation</label><input style={inputStyle} placeholder="Organisation name" /></div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={labelStyle}>You are a</label>
                    <select style={inputStyle} defaultValue="">
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
                    <select style={inputStyle} defaultValue="">
                      <option value="" disabled>Select</option>
                      <option>Under 100</option>
                      <option>100–500</option>
                      <option>500–2,000</option>
                      <option>2,000+</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Phone (optional)</label><input type="tel" style={inputStyle} placeholder="+91 98765 43210" /></div>
                </div>
                <div>
                  <label style={labelStyle}>What are you hoping to solve?</label>
                  <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell us a little about your goals — what would success look like for your people?" />
                </div>
                <button onClick={() => setSent(true)} style={{
                  width: '100%', padding: '17px', borderRadius: 50, border: 'none',
                  background: coral, color: '#fff', fontSize: 16, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 8px 24px rgba(200,85,61,.3)',
                }}>
                  Submit interest →
                </button>
                <p style={{ fontSize: 12.5, color: '#A0ADB8', textAlign: 'center', lineHeight: 1.6 }}>
                  Enterprise plans are in development. By submitting, you agree to be contacted about GetCalmly for organisations. See our <Link href="/privacy" style={{ color: coral, fontWeight: 600 }}>Privacy Policy</Link>.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
