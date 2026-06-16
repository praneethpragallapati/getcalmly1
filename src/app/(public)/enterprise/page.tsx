'use client'

import Link from 'next/link'
import { useState } from 'react'

const charcoal = '#1C2B3A'
const coral = '#C8553D'
const teal = '#1A7F7A'

const segments = [
  {
    icon: '🏢',
    accent: '#C8553D',
    pale: 'rgba(200,85,61,.08)',
    title: 'For Corporates',
    line: 'Mental health is the quietest cost on your balance sheet.',
    body: 'Burnout, absenteeism and quiet quitting rarely show up until they are expensive. Give your people confidential access to real therapists and a daily support app, and give your leaders aggregate wellbeing signals, never individual data.',
    points: ['Confidential therapy and psychiatry for employees and dependants', 'Calm+ app for everyone from day one', 'Anonymised wellbeing dashboards for HR', 'Manager training, workshops and 24x7 crisis support'],
  },
  {
    icon: '🎓',
    accent: '#3D9E72',
    pale: 'rgba(61,158,114,.08)',
    title: 'For Educational Institutions',
    line: 'Students are carrying more than ever, and most carry it alone.',
    body: 'Exam pressure, identity, belonging and the weight of expectation. Bring age-appropriate counselling, child and adolescent specialists, and a safe digital space to your campus, with safeguarding built in.',
    points: ['Counsellors trained for students and adolescents', 'Confidential self-referral for students', 'Safeguarding workflows and crisis escalation', 'Wellbeing programmes for staff and parents'],
  },
  {
    icon: '🏥',
    accent: '#1A7F7A',
    pale: 'rgba(26,127,122,.08)',
    title: 'For Hospitals',
    line: 'A complete mental health layer for your patients, delivered as SaaS.',
    body: 'Offer structured, AI-assisted mental health care under your own brand. Our platform handles matching, scheduling, clinical notes and the patient app, so your clinicians focus on care while you extend your services.',
    points: ['White-label patient and clinician portals', 'Clinical notes, pre-session briefs and referral workflows', 'Google Meet sessions and calendar sync', 'DPDP-aligned, NIMHANS-standard compliance'],
  },
]

const why = [
  ['🧠', 'Clinically credible', 'Only RCI-verified psychologists and NMC-registered psychiatrists. We verify every professional before they ever see a member of your community.'],
  ['🤖', 'AI that supports, never replaces', 'Calm AI, mood insights and journaling keep people supported between sessions, with every clinical output reviewed by a human.'],
  ['📊', 'Outcomes you can measure', 'Anonymised, aggregate dashboards show engagement and wellbeing trends, so you can see the impact without ever touching individual records.'],
  ['🇮🇳', 'Built for India', 'Vernacular-first care across 15+ languages, designed for the realities of Indian workplaces, campuses and hospitals.'],
]

const steps = [
  ['01', 'Discovery', 'We learn about your people, your goals and your constraints, then shape a programme that fits.'],
  ['02', 'Pilot', 'A focused rollout to one team, cohort or department, with clear success measures agreed up front.'],
  ['03', 'Rollout', 'Onboarding, comms and launch support to drive real adoption, not just sign-ups.'],
  ['04', 'Measure', 'Quarterly anonymised reporting and reviews, so you can see impact and keep improving.'],
]

export default function EnterprisePage() {
  const [sent, setSent] = useState(false)
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 15px', border: '1.5px solid #E2E8F0', borderRadius: 12,
    fontSize: 15, color: charcoal, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: charcoal, marginBottom: 7 }

  return (
    <div style={{ background: '#F9F5F2' }}>
      {/* Hero */}
      <section style={{ background: charcoal, padding: '84px 24px 70px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -90, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,127,122,.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#1FB6A8', background: 'rgba(26,127,122,.15)', padding: '5px 14px', borderRadius: 50, marginBottom: 18, textTransform: 'uppercase' }}>GetCalmly for organisations · Coming soon</span>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(38px, 6vw, 62px)', color: '#fff', lineHeight: 1.02, letterSpacing: '-1.5px', marginBottom: 18 }}>
            Mental health care,<br /><span style={{ color: coral }}>for your whole organisation.</span>
          </h1>
          <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,.66)', lineHeight: 1.7, fontWeight: 300, maxWidth: 620, margin: '0 auto' }}>
            We are building GetCalmly for teams, campuses and care providers, bringing verified clinicians, an AI-assisted support app, and measurable outcomes together in one platform. Tell us about your organisation and we will design a partnership around your people.
          </p>
          <a href="#interest" style={{ display: 'inline-block', marginTop: 30, background: coral, color: '#fff', padding: '15px 30px', borderRadius: 50, fontSize: 15.5, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(200,85,61,.35)' }}>
            Register your interest →
          </a>
        </div>
      </section>

      {/* Stat band */}
      <section style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.05)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '36px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[['1 in 7', 'Indians live with a mental health condition'], ['~60%', 'of distress goes untreated'], ['₹', 'lost productivity is the hidden cost to employers']].map(([n, d]) => (
            <div key={d}>
              <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 36, color: coral, lineHeight: 1 }}>{n}</p>
              <p style={{ fontSize: 13, color: '#6B7D8E', marginTop: 6, lineHeight: 1.5 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Segments */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 24px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 4.5vw, 42px)', color: charcoal, letterSpacing: '-1px' }}>Built around how you work</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22 }}>
          {segments.map((s) => (
            <div key={s.title} style={{ background: '#fff', borderRadius: 20, padding: '30px 28px', border: '1.5px solid rgba(0,0,0,.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: s.pale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{s.icon}</div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: charcoal, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{s.title}</h3>
              <p style={{ fontSize: 13.5, color: s.accent, fontWeight: 600, lineHeight: 1.45, marginBottom: 12 }}>{s.line}</p>
              <p style={{ fontSize: 14, color: '#6B7D8E', lineHeight: 1.65, marginBottom: 16 }}>{s.body}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 'auto' }}>
                {s.points.map((p) => (
                  <div key={p} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <span style={{ color: s.accent, fontWeight: 800, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13.3, color: '#3A4A5A', lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why GetCalmly */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(26px, 4vw, 38px)', color: charcoal, letterSpacing: '-0.5px' }}>Why organisations choose us</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {why.map(([icon, t, d]) => (
            <div key={t} style={{ background: '#fff', borderRadius: 18, padding: '24px', border: '1.5px solid rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 26, marginBottom: 12 }}>{icon}</div>
              <p style={{ fontSize: 16, fontWeight: 800, color: charcoal, marginBottom: 8 }}>{t}</p>
              <p style={{ fontSize: 13.8, color: '#6B7D8E', lineHeight: 1.65 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How partnership works */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: coral, textTransform: 'uppercase', marginBottom: 12 }}>How a partnership works</p>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(26px, 4vw, 38px)', color: charcoal, letterSpacing: '-0.5px' }}>From first call to real impact</h2>
          </div>
          {steps.map(([n, t, d]) => (
            <div key={n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '18px 0', borderBottom: '1px solid #EEF0F3' }}>
              <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 30, color: teal, lineHeight: 1, flexShrink: 0, width: 46 }}>{n}</span>
              <div>
                <p style={{ fontSize: 17, fontWeight: 800, color: charcoal, marginBottom: 4 }}>{t}</p>
                <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.65 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security & compliance */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ background: charcoal, borderRadius: 24, padding: '40px', color: '#fff' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#1FB6A8', textTransform: 'uppercase', marginBottom: 14 }}>Security &amp; compliance</p>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 28, marginBottom: 20 }}>Trust is the whole product</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              ['DPDP Act 2023 aligned', 'Consent-first data handling and clear retention controls.'],
              ['Encrypted by default', 'Records encrypted in transit and at rest, access tightly scoped.'],
              ['Anonymised reporting', 'Organisations see aggregate trends only, never individual data.'],
              ['Clinical standards', 'NIMHANS telepsychotherapy guidelines and RCI audit standards.'],
            ].map(([t, d]) => (
              <div key={t}>
                <p style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 6, display: 'flex', gap: 8 }}><span style={{ color: '#1FB6A8' }}>✓</span>{t}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interest form */}
      <section id="interest" style={{ maxWidth: 680, margin: '0 auto', padding: '12px 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '36px', border: '1.5px solid rgba(0,0,0,.06)' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
              <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 30, color: charcoal, marginBottom: 12 }}>Thank you.</h2>
              <p style={{ fontSize: 15, color: '#6B7D8E', lineHeight: 1.7 }}>We have your details. Our partnerships team will be in touch as we open enterprise access, and sooner if there is a strong fit.</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 28, color: charcoal, marginBottom: 6 }}>Register your interest</h2>
              <p style={{ fontSize: 14, color: '#6B7D8E', lineHeight: 1.6, marginBottom: 24 }}>A few details so we can tailor the right partnership. No commitment.</p>
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
                <button onClick={() => setSent(true)} style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: coral, color: '#fff', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 18px rgba(200,85,61,.3)' }}>
                  Submit interest
                </button>
                <p style={{ fontSize: 12.5, color: '#A0ADB8', textAlign: 'center', lineHeight: 1.6 }}>
                  Enterprise plans are in development. By submitting, you agree to be contacted about GetCalmly for organisations. See our <Link href="/privacy" style={{ color: coral, fontWeight: 600 }}>Privacy Policy</Link>.
                </p>
              </div>
            </>
          )}
        </div>
        <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7D8E', marginTop: 20 }}>
          Prefer to talk first? Email <a href="mailto:partnerships@getcalmly.com" style={{ color: coral, fontWeight: 600 }}>partnerships@getcalmly.com</a>
        </p>
      </section>
    </div>
  )
}
