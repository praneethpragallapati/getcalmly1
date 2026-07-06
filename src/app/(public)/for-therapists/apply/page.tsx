'use client'

import Link from 'next/link'
import { useState } from 'react'
import CountrySelect from '@/components/ui/CountrySelect'
import { defaultCountry } from '@/data/countries'

const SPECIALIZATIONS = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'OCD', 'Stress & Burnout', 'Relationships',
  'Couples Therapy', 'Child & Adolescent', 'Family Therapy', 'Grief & Loss', 'Addiction',
  'LGBTQIA+ Affirmative', 'Perinatal / Postpartum', 'Eating Disorders', 'Sleep', 'Geriatric',
]
const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Malayalam', 'Kannada', 'Gujarati', 'Punjabi', 'Other']
const COUNCILS = ['RCI', 'NMC', 'RCI + NMC', 'Other']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 15px', border: '1.5px solid #E2E8F0', borderRadius: 12,
  fontSize: 15, color: '#1C2B3A', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: '#1C2B3A', marginBottom: 7 }

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: '28px', border: '1.5px solid rgba(0,0,0,.06)', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: '#E9F6EF', color: '#3D9E72', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1C2B3A', fontFamily: "'DM Sans', sans-serif" }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  )
}

function Chips({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (s: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onToggle(o)} style={{
          padding: '8px 13px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          border: selected.includes(o) ? '1.5px solid #3D9E72' : '1.5px solid #E2E8F0',
          background: selected.includes(o) ? '#E9F6EF' : '#fff',
          color: selected.includes(o) ? '#3D9E72' : '#6B7D8E', fontFamily: "'DM Sans', sans-serif",
        }}>{o}</button>
      ))}
    </div>
  )
}

export default function TherapistApplyPage() {
  const [country, setCountry] = useState(defaultCountry)
  const [specs, setSpecs] = useState<string[]>([])
  const [langs, setLangs] = useState<string[]>([])
  const [files, setFiles] = useState<string[]>([])
  const [agree, setAgree] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (v: string) =>
    setter((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))

  if (submitted) {
    return (
      <div style={{ background: '#FFFCFA', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ maxWidth: 520, textAlign: 'center', background: '#fff', borderRadius: 24, padding: '48px 36px', border: '1.5px solid rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: 46, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300, fontSize: 34, color: '#1C2B3A', marginBottom: 14, lineHeight: 1.1 }}>
            Application received.
          </h1>
          <p style={{ fontSize: 15, color: '#6B7D8E', lineHeight: 1.7, marginBottom: 28 }}>
            Thank you for applying to GetCalmly. Our clinical team will verify your registration and review your documents, then reach out to schedule your interview. You&apos;ll hear from us within 3–5 working days.
          </p>
          <Link href="/" style={{ display: 'inline-block', padding: '13px 26px', borderRadius: 50, background: '#3D9E72', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#FFFCFA' }}>
      {/* Header */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '76px 24px 56px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Link href="/for-therapists" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.45)', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>← Back to Join our experts</Link>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)', color: '#fff', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 14 }}>
            Apply to practice on GetCalmly
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.62)', lineHeight: 1.7 }}>
            A few details about you and your practice. Everything you share goes straight to our clinical team for verification. Nothing is shown publicly until you are live and have approved your profile.
          </p>
        </div>
      </section>

      {/* Form */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        <Section n="1" title="About you">
          <div><label style={labelStyle}>Full name (as on registration)</label><input style={inputStyle} placeholder="Dr. Ananya Sharma" /></div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px' }}><label style={labelStyle}>Email</label><input type="email" style={inputStyle} placeholder="you@example.com" /></div>
            <div style={{ flex: '1 1 220px' }}>
              <label style={labelStyle}>Mobile</label>
              <div style={{ display: 'flex', border: '1.5px solid #E2E8F0', borderRadius: 12 }}>
                <CountrySelect value={country} onChange={setCountry} />
                <input type="tel" placeholder="98765 43210" style={{ ...inputStyle, border: 'none', borderRadius: '0 12px 12px 0' }} />
              </div>
            </div>
          </div>
          <div><label style={labelStyle}>City</label><input style={inputStyle} placeholder="e.g. Bengaluru" /></div>
        </Section>

        <Section n="2" title="Registration & credentials">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}>Council</label>
              <select style={inputStyle} defaultValue=""><option value="" disabled>Select council</option>{COUNCILS.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
            <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Registration number</label><input style={inputStyle} placeholder="e.g. A012345" /></div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}>Primary role</label>
              <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option><option>Clinical Psychologist</option><option>Counselling Psychologist</option><option>Psychiatrist</option><option>Psychotherapist</option><option>Counsellor</option></select>
            </div>
            <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Years of experience</label><input type="number" min={0} style={inputStyle} placeholder="e.g. 8" /></div>
          </div>
          <div><label style={labelStyle}>Qualifications</label><input style={inputStyle} placeholder="e.g. M.Phil Clinical Psychology, M.Sc Psychology" /><p style={{ fontSize: 12, color: '#A0ADB8', marginTop: 6 }}>Comma-separated. List degrees and clinical training.</p></div>
        </Section>

        <Section n="3" title="Your practice">
          <div><label style={labelStyle}>Specialisations</label><Chips options={SPECIALIZATIONS} selected={specs} onToggle={toggle(setSpecs)} /></div>
          <div><label style={labelStyle}>Languages you practise in</label><Chips options={LANGUAGES} selected={langs} onToggle={toggle(setLangs)} /></div>
          <div><label style={labelStyle}>Therapeutic approaches (optional)</label><input style={inputStyle} placeholder="e.g. CBT, DBT, ACT" /></div>
          <div><label style={labelStyle}>Short bio</label><textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="A few lines on how you work and who you help best. This will seed your profile (you'll review before it goes live)." /></div>
        </Section>

        <Section n="4" title="Documents">
          <p style={{ fontSize: 13.5, color: '#6B7D8E', lineHeight: 1.6, marginTop: -6 }}>
            Upload your council registration proof, degree certificates, and a government photo ID. PDF, JPG or PNG.
          </p>
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '32px 20px', border: '2px dashed #D8DEE6', borderRadius: 14, cursor: 'pointer',
            background: '#FAFBFC', textAlign: 'center',
          }}>
            <span style={{ fontSize: 28 }}>📎</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1C2B3A' }}>Click to upload or drag files here</span>
            <span style={{ fontSize: 12, color: '#A0ADB8' }}>Up to 10MB each</span>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
            />
          </label>
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {files.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#3A4A5A', background: '#F5F7FA', padding: '8px 12px', borderRadius: 8 }}>
                  <span>📄</span>{f}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section n="5" title="Schedule your interview">
          <p style={{ fontSize: 13.5, color: '#6B7D8E', lineHeight: 1.6, marginTop: -6 }}>
            Pick a preferred window for a short conversation with our clinical team. We&apos;ll confirm a final time by email.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}><label style={labelStyle}>Preferred date</label><input type="date" style={inputStyle} /></div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}>Preferred time</label>
              <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option><option>Morning (9am–12pm)</option><option>Afternoon (12pm–4pm)</option><option>Evening (4pm–8pm)</option></select>
            </div>
          </div>
        </Section>

        {/* Consent + submit */}
        <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', cursor: 'pointer', padding: '16px 18px', borderRadius: 14, border: `1.5px solid ${agree ? 'rgba(61,158,114,.3)' : '#E2E8F0'}`, background: agree ? '#FFF8F5' : '#fff', marginBottom: 20 }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 2, width: 17, height: 17, accentColor: '#3D9E72', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#3A4A5A', lineHeight: 1.55 }}>
            I confirm the information provided is accurate, I hold valid registration, and I consent to GetCalmly verifying my credentials and storing this application securely per the{' '}
            <Link href="/privacy" style={{ color: '#3D9E72', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</Link>.
          </span>
        </label>

        <button
          onClick={() => agree && setSubmitted(true)}
          disabled={!agree}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: '#3D9E72', color: '#fff',
            fontSize: 16, fontWeight: 700, cursor: agree ? 'pointer' : 'not-allowed', opacity: agree ? 1 : 0.45,
            fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 20px rgba(61,158,114,.3)',
          }}
        >
          Submit application →
        </button>
        <p style={{ fontSize: 12.5, color: '#A0ADB8', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
          Your application is routed directly to our admin team for review. We typically respond within 3–5 working days.
        </p>
      </section>
    </div>
  )
}
