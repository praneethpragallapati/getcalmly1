'use client'

import Link from 'next/link'
import { useState } from 'react'

const charcoal = '#1C2B3A'
const coral = '#C8553D'
const cream = '#F9F5F2'

const segments = [
  {
    accent: '#C8553D',
    title: 'For Corporates',
    line: 'Mental health is the quietest cost on your balance sheet.',
    body: 'Burnout, absenteeism and quiet quitting rarely show up until they are expensive. Give your people confidential access to real therapists and a daily support app, and give your leaders aggregate wellbeing signals, never individual data.',
    points: ['Confidential therapy and psychiatry for employees and dependants', 'Calm+ app for everyone from day one', 'Anonymised wellbeing dashboards for HR', 'Manager training, workshops and 24x7 crisis support'],
  },
  {
    accent: '#3D9E72',
    title: 'For Educational Institutions',
    line: 'Students are carrying more than ever, and most carry it alone.',
    body: 'Exam pressure, identity, belonging and the weight of expectation. Bring age-appropriate counselling, child and adolescent specialists, and a safe digital space to your campus, with safeguarding built in.',
    points: ['Counsellors trained for students and adolescents', 'Confidential self-referral for students', 'Safeguarding workflows and crisis escalation', 'Wellbeing programmes for staff and parents'],
  },
  {
    accent: '#1A7F7A',
    title: 'For Hospitals',
    line: 'A complete mental health layer for your patients, delivered as SaaS.',
    body: 'Offer structured, AI-assisted mental health care under your own brand. Our platform handles matching, scheduling, clinical notes and the patient app, so your clinicians focus on care while you extend your services.',
    points: ['White-label patient and clinician portals', 'Clinical notes, pre-session briefs and referral workflows', 'Google Meet sessions and calendar sync', 'DPDP-aligned, NIMHANS-standard compliance'],
  },
]

const why: [string, string][] = [
  ['Clinically credible', 'Only RCI-verified psychologists and NMC-registered psychiatrists. We verify every professional before they ever see a member of your community.'],
  ['AI that supports, never replaces', 'Calm AI, mood insights and journaling keep people supported between sessions, with every clinical output reviewed by a human.'],
  ['Outcomes you can measure', 'Anonymised, aggregate dashboards show engagement and wellbeing trends, so you can see the impact without ever touching individual records.'],
  ['Built for India', 'Vernacular-first care across 15+ languages, designed for the realities of Indian workplaces, campuses and hospitals.'],
]

const steps: [string, string, string][] = [
  ['01', 'Discovery', 'We learn about your people, your goals and your constraints, then shape a programme that fits.'],
  ['02', 'Pilot', 'A focused rollout to one team, cohort or department, with clear success measures agreed up front.'],
  ['03', 'Rollout', 'Onboarding, comms and launch support to drive real adoption, not just sign-ups.'],
  ['04', 'Measure', 'Quarterly anonymised reporting and reviews, so you can see impact and keep improving.'],
]

const compliance: [string, string][] = [
  ['DPDP Act 2023 aligned', 'Consent-first data handling and clear retention controls.'],
  ['Encrypted by default', 'Records encrypted in transit and at rest, access tightly scoped.'],
  ['Anonymised reporting', 'Organisations see aggregate trends only, never individual data.'],
  ['Clinical standards', 'NIMHANS telepsychotherapy guidelines and RCI audit standards.'],
]

export default function EnterprisePage() {
  const [sent, setSent] = useState(false)
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 15px', border: '1.5px solid #E2E8F0', borderRadius: 12,
    fontSize: 15, color: charcoal, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: charcoal, marginBottom: 7 }

  const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: 2, color: coral, textTransform: 'uppercase' }

  return (
    <div style={{ background: cream }}>
      {/* ─── HERO: the human cost, framed for the buyer ─── */}
      <section style={{ background: charcoal, padding: '88px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -140, right: -110, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -110, left: -90, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,127,122,.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <p style={{ ...eyebrow, color: '#1FB6A8', marginBottom: 22 }}>GetCalmly for organisations · Coming soon</p>
          <h1 style={{
            fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
            fontSize: 'clamp(38px, 6.4vw, 64px)', color: '#fff', lineHeight: 1.02, letterSpacing: '-1.8px', marginBottom: 26, maxWidth: 700,
          }}>
            The most stretched person on your team is probably the one who never says so.
          </h1>
          <p style={{ fontSize: 18.5, color: 'rgba(255,255,255,.74)', lineHeight: 1.8, fontWeight: 300, maxWidth: 620, marginBottom: 36 }}>
            Burnout, absenteeism and quiet quitting are rarely loud. By the time they show up in your numbers, the cost is already paid. GetCalmly gives your people confidential, clinically real mental health care, and gives you the signal long before it becomes a statistic.
          </p>
          <a href="#interest" style={{ display: 'inline-block', background: coral, color: '#fff', padding: '15px 30px', borderRadius: 50, fontSize: 15.5, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(200,85,61,.35)' }}>
            Book a conversation →
          </a>
        </div>
      </section>

      {/* ─── THE COST: stat row, the only acceptable boxed moment ─── */}
      <section style={{ padding: '76px 24px 60px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ ...eyebrow, textAlign: 'center', marginBottom: 36 }}>The quiet cost</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
            {([['1 in 7', 'Indians live with a mental health condition'], ['~60%', 'of that distress goes completely untreated'], ['Largest', 'invisible drag on productivity employers carry']] as [string, string][]).map(([n, d]) => (
              <div key={d}>
                <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(40px, 7vw, 56px)', color: coral, lineHeight: 1, letterSpacing: '-1.5px', marginBottom: 12 }}>{n}</p>
                <p style={{ fontSize: 15.5, color: '#5A6B7A', lineHeight: 1.6, fontWeight: 300, maxWidth: 220, margin: '0 auto' }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE TURN: from cost to care ─── */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ ...eyebrow, marginBottom: 20 }}>Why this matters now</p>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 4.4vw, 40px)', color: charcoal, letterSpacing: '-0.8px', lineHeight: 1.1, marginBottom: 24 }}>
            People do their best work when they are well, not when they are simply present.
          </h2>
          <p style={{ fontSize: 18, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 20 }}>
            A perk no one uses is not a benefit. Real support has to be confidential enough to trust, clinical enough to help, and easy enough to actually reach on the hardest day.
          </p>
          <p style={{ fontSize: 18, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300 }}>
            That is what we are building: verified clinicians, an AI-assisted support app for every day in between, and measurable outcomes, brought together as one platform you can stand behind.
          </p>
        </div>
      </section>

      {/* ─── SEGMENTS: built around how you work, as flowing story blocks ─── */}
      <section style={{ padding: '84px 24px 40px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <p style={{ ...eyebrow, marginBottom: 16 }}>Built around how you work</p>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(30px, 5vw, 44px)', color: charcoal, letterSpacing: '-1px', lineHeight: 1.05 }}>
              One platform, shaped to your people.
            </h2>
          </div>
          <div style={{ marginTop: 56 }}>
            {segments.map((s, idx) => (
              <div key={s.title} style={{ padding: '48px 0', borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,.08)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: s.accent, textTransform: 'uppercase', marginBottom: 14 }}>{s.title}</p>
                <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 3.6vw, 34px)', color: charcoal, letterSpacing: '-0.5px', lineHeight: 1.15, marginBottom: 18, maxWidth: 620 }}>
                  {s.line}
                </h3>
                <p style={{ fontSize: 17, color: '#3A4A5A', lineHeight: 1.8, fontWeight: 300, maxWidth: 640, marginBottom: 22 }}>{s.body}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px' }}>
                  {s.points.map((p) => (
                    <div key={p} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: '1 1 280px' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.accent, marginTop: 8, flexShrink: 0 }} />
                      <span style={{ fontSize: 15.5, color: '#5A6B7A', lineHeight: 1.65, fontWeight: 300 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY US: flowing dividers, not cards ─── */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ ...eyebrow, marginBottom: 16 }}>Why organisations choose us</p>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 4.4vw, 40px)', color: charcoal, letterSpacing: '-0.8px', lineHeight: 1.05 }}>
              Credible care, measurable trust.
            </h2>
          </div>
          <div>
            {why.map(([t, d], idx) => (
              <div key={t} style={{ display: 'grid', gridTemplateColumns: '12px 1fr', gap: 18, alignItems: 'flex-start', padding: '26px 0', borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,.07)' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: coral, marginTop: 9 }} />
                <div>
                  <p style={{ fontSize: 19, fontWeight: 700, color: charcoal, marginBottom: 8, letterSpacing: '-0.2px' }}>{t}</p>
                  <p style={{ fontSize: 16, color: '#5A6B7A', lineHeight: 1.75, fontWeight: 300 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW A PARTNERSHIP WORKS ─── */}
      <section style={{ padding: '84px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ ...eyebrow, marginBottom: 16 }}>How a partnership works</p>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 4.4vw, 40px)', color: charcoal, letterSpacing: '-0.8px', lineHeight: 1.05 }}>
              From first call to real impact.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>
            {steps.map(([n, t, d]) => (
              <div key={n}>
                <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 46, color: coral, opacity: 0.28, lineHeight: 1, marginBottom: 14 }}>{n}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: charcoal, marginBottom: 8, letterSpacing: '-0.2px' }}>{t}</p>
                <p style={{ fontSize: 15.5, color: '#6B7D8E', lineHeight: 1.7, fontWeight: 300 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECURITY & COMPLIANCE: charcoal band ─── */}
      <section style={{ background: charcoal, padding: '84px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ marginBottom: 44 }}>
            <p style={{ ...eyebrow, color: '#1FB6A8', marginBottom: 16 }}>Security &amp; compliance</p>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 4.4vw, 40px)', color: '#fff', letterSpacing: '-0.8px', lineHeight: 1.05, marginBottom: 18, maxWidth: 560 }}>
              Trust is the whole product.
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,.66)', lineHeight: 1.8, fontWeight: 300, maxWidth: 560 }}>
              Your people will only open up if they know it is safe. Everything below is non-negotiable, built in from day one.
            </p>
          </div>
          <div>
            {compliance.map(([t, d], idx) => (
              <div key={t} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 16, alignItems: 'flex-start', padding: '24px 0', borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,.12)' }}>
                <span style={{ color: '#1FB6A8', fontWeight: 800, fontSize: 16, lineHeight: 1, marginTop: 4 }}>✓</span>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 7 }}>{t}</p>
                  <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, fontWeight: 300 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTEREST FORM ─── */}
      <section id="interest" style={{ background: '#fff', padding: '84px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ ...eyebrow, marginBottom: 16 }}>Received</p>
              <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)', color: charcoal, letterSpacing: '-1px', marginBottom: 16 }}>Thank you.</h2>
              <p style={{ fontSize: 17, color: '#5A6B7A', lineHeight: 1.8, fontWeight: 300, maxWidth: 480, margin: '0 auto' }}>We have your details. Our partnerships team will be in touch as we open enterprise access, and sooner if there is a strong fit.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 32 }}>
                <p style={{ ...eyebrow, marginBottom: 16 }}>Let&apos;s talk</p>
                <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(30px, 5vw, 44px)', color: charcoal, letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 16 }}>
                  Tell us about your people.
                </h2>
                <p style={{ fontSize: 17, color: '#5A6B7A', lineHeight: 1.8, fontWeight: 300, maxWidth: 540 }}>
                  A few details so we can design the right partnership around your organisation. No commitment, no sales script.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Your name</label><input style={inputStyle} placeholder="Full name" /></div>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Work email</label><input type="email" style={inputStyle} placeholder="you@organisation.com" /></div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Organisation</label><input style={inputStyle} placeholder="Organisation name" /></div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={labelStyle}>You are a</label>
                    <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option><option>Corporate / Employer</option><option>Educational institution</option><option>Hospital / Care provider</option><option>Other</option></select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={labelStyle}>Approx. people to cover</label>
                    <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option><option>Under 100</option><option>100–500</option><option>500–2,000</option><option>2,000+</option></select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Phone (optional)</label><input type="tel" style={inputStyle} placeholder="+91 98765 43210" /></div>
                </div>
                <div><label style={labelStyle}>What are you hoping to solve?</label><textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell us a little about your goals." /></div>
                <button onClick={() => setSent(true)} style={{ width: '100%', padding: '16px', borderRadius: 50, border: 'none', background: coral, color: '#fff', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(200,85,61,.3)' }}>
                  Submit interest
                </button>
                <p style={{ fontSize: 12.5, color: '#A0ADB8', textAlign: 'center', lineHeight: 1.6 }}>
                  Enterprise plans are in development. By submitting, you agree to be contacted about GetCalmly for organisations. See our <Link href="/privacy" style={{ color: coral, fontWeight: 600 }}>Privacy Policy</Link>.
                </p>
              </div>
            </>
          )}
          <p style={{ textAlign: 'center', fontSize: 15, color: '#6B7D8E', marginTop: 28, fontWeight: 300 }}>
            Prefer to talk first? Email <a href="mailto:connect@getcalmly.com" style={{ color: coral, fontWeight: 600 }}>connect@getcalmly.com</a>
          </p>
        </div>
      </section>
    </div>
  )
}
