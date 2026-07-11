'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import CountrySelect from '@/components/ui/CountrySelect'
import { defaultCountry } from '@/data/countries'

type CareFor = 'self' | 'couple' | 'child'

const CARE_LABELS: Record<string, string> = {
  therapy: 'Therapy with a psychologist',
  psychiatry: 'Psychiatric care',
  app: 'Calm+ (the full app)',
  free: 'the free plan',
}

const LANGS = ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Malayalam', 'Kannada', 'Gujarati', 'Punjabi', 'Other']
const TRACKS = ['Anxiety', 'Low mood / depression', 'Stress & burnout', 'Relationships', 'Trauma & grief', 'Sleep', 'Self-worth', 'Anger', 'Motherhood / postpartum', 'Something else']
const RELATIONS = ['Parent', 'Spouse / Partner', 'Sibling', 'Friend', 'Child', 'Other']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12,
  fontSize: 15, color: '#1C2B3A', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#1C2B3A', marginBottom: 7 }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function RegisterForm() {
  const [step, setStep] = useState(1)
  const [careFor, setCareFor] = useState<CareFor>('self')
  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('phone')
  const [country, setCountry] = useState(defaultCountry)
  const [tracks, setTracks] = useState<string[]>([])
  const [llmConsent, setLlmConsent] = useState(true)
  const [consents, setConsents] = useState({ retention: false, ai: false, liability: false, terms: false })
  const [done, setDone] = useState(false)
  // Care type chosen on the pricing page (therapy / psychiatry / app / free).
  const c = useSearchParams().get('care')
  const careType = c && CARE_LABELS[c] ? c : null

  // The partner/child step only exists for couple/child care.
  const hasExtraStep = careFor !== 'self'
  const totalSteps = hasExtraStep ? 5 : 4

  // Map the visible step number to a logical screen, skipping the conditional one.
  const screen = (() => {
    if (step === 1) return 'basics'
    if (step === 2) return 'about'
    if (hasExtraStep && step === 3) return careFor === 'couple' ? 'partner' : 'child'
    const adj = hasExtraStep ? step : step + 1
    if (adj === 4) return 'emergency'
    return 'consents'
  })()

  const toggleTrack = (t: string) =>
    setTracks((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))

  const canSubmit = consents.retention && consents.ai && consents.liability && consents.terms

  if (done) {
    const isPaid = careType === 'therapy' || careType === 'psychiatry' || careType === 'app'
    const nextHref = isPaid ? `/checkout?care=${careType}` : '/assess'
    return (
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 34, color: '#1C2B3A', marginBottom: 12, lineHeight: 1.1 }}>
          Account created.
        </h1>
        <p style={{ fontSize: 15, color: '#6B7D8E', lineHeight: 1.65, marginBottom: 28 }}>
          {isPaid
            ? 'One quick step left. Review exactly what you’re getting and confirm your plan, your first session is a flat ₹999.'
            : 'Your account is ready. Next, we’ll match you with the right professional and book your first session.'}
        </p>
        <Link href={nextHref} style={{
          display: 'inline-block', padding: '14px 28px', borderRadius: 50, background: '#C8553D',
          color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
          boxShadow: '0 6px 20px rgba(200,85,61,.3)',
        }}>
          {isPaid ? 'Continue to checkout →' : '✦ Find my match'}
        </Link>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: '#8E9EAE' }}>Step {step} of {totalSteps}</p>
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} style={{ background: 'none', border: 'none', color: '#6B7D8E', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
          )}
        </div>
        <div style={{ height: 5, background: '#EEF0F3', borderRadius: 50, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step / totalSteps) * 100}%`, background: '#C8553D', borderRadius: 50, transition: 'width .3s' }} />
        </div>
      </div>

      {/* ─── Step 1: Basics ─────────────────────────────── */}
      {screen === 'basics' && (
        <>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 34, color: '#1C2B3A', marginBottom: 6, lineHeight: 1.05 }}>
            Let&apos;s begin with you.
          </h1>
          <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.6, marginBottom: careType ? 16 : 24 }}>
            Free to join, takes about two minutes.
          </p>
          {careType && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#FFF1EC', border: '1px solid rgba(200,85,61,.2)', borderRadius: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 16 }}>✦</span>
              <span style={{ fontSize: 13.5, color: '#1C2B3A' }}>You&apos;re signing up for <strong>{CARE_LABELS[careType]}</strong>. We&apos;ll tailor a few questions to that.</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
            <button style={socialBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign up with Google
            </button>
            <button style={socialBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Sign up with Apple
            </button>
          </div>

          <div style={dividerWrap}><div style={dividerLine} /><span style={dividerText}>or with your details</span><div style={dividerLine} /></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Your full name">
              <input type="text" placeholder="e.g. Priya Sharma" style={inputStyle} />
            </Field>

            <Field label="Who is this care for?">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {([['self', 'Myself'], ['couple', 'My partner & me'], ['child', 'My child']] as const).map(([val, lbl]) => (
                  <button key={val} type="button" onClick={() => setCareFor(val)} style={{
                    padding: '11px 6px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    border: careFor === val ? '1.5px solid #C8553D' : '1.5px solid #E2E8F0',
                    background: careFor === val ? '#FFF1EC' : '#fff',
                    color: careFor === val ? '#C8553D' : '#6B7D8E', fontFamily: "'DM Sans', sans-serif",
                  }}>{lbl}</button>
                ))}
              </div>
            </Field>

            <div>
              <div style={{ display: 'flex', background: '#F5F7FA', borderRadius: 10, padding: 3, marginBottom: 10 }}>
                {(['phone', 'email'] as const).map((t) => (
                  <button key={t} onClick={() => setContactMethod(t)} style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
                    background: contactMethod === t ? '#fff' : 'transparent', color: contactMethod === t ? '#1C2B3A' : '#8E9EAE',
                    boxShadow: contactMethod === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none', fontFamily: "'DM Sans', sans-serif",
                  }}>{t === 'phone' ? '📱 Mobile' : '✉️ Email'}</button>
                ))}
              </div>
              {contactMethod === 'phone' ? (
                <div style={{ display: 'flex', border: '1.5px solid #E2E8F0', borderRadius: 12 }}>
                  <CountrySelect value={country} onChange={setCountry} />
                  <input type="tel" placeholder="98765 43210" style={{ ...inputStyle, border: 'none', borderRadius: '0 12px 12px 0' }} />
                </div>
              ) : (
                <input type="email" placeholder="you@example.com" style={inputStyle} />
              )}
            </div>
          </div>

          <button onClick={() => setStep(2)} style={{ ...primaryBtn, marginTop: 24 }}>Continue →</button>

          <p style={{ fontSize: 14, color: '#8E9EAE', textAlign: 'center', marginTop: 20 }}>
            Already have an account? <Link href="/login" style={linkStyle}>Sign in</Link>
          </p>
        </>
      )}

      {/* ─── Step 2: About you ──────────────────────────── */}
      {screen === 'about' && (
        <>
          <StepHead title="A little about you" sub="This helps us match you with the right professional and personalise your care." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Field label="Date of birth"><input type="date" style={inputStyle} /></Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Gender">
                  <select style={inputStyle} defaultValue="">
                    <option value="" disabled>Select</option>
                    <option>Woman</option><option>Man</option><option>Non-binary</option><option>Prefer not to say</option>
                  </select>
                </Field>
              </div>
            </div>
            <Field label="Preferred language for sessions">
              <select style={inputStyle} defaultValue="">
                <option value="" disabled>Select a language</option>
                {LANGS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="What brings you here? (pick any that fit)">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TRACKS.map((t) => (
                  <button key={t} type="button" onClick={() => toggleTrack(t)} style={{
                    padding: '8px 13px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: tracks.includes(t) ? '1.5px solid #C8553D' : '1.5px solid #E2E8F0',
                    background: tracks.includes(t) ? '#FFF1EC' : '#fff',
                    color: tracks.includes(t) ? '#C8553D' : '#6B7D8E', fontFamily: "'DM Sans', sans-serif",
                  }}>{t}</button>
                ))}
              </div>
            </Field>

            {/* Psychiatry-specific intake, shown only when that care was chosen. */}
            {careType === 'psychiatry' && (
              <>
                <Field label="Are you currently taking any psychiatric medication?">
                  <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option><option>No, not currently</option><option>Yes, currently</option><option>I have in the past</option></select>
                </Field>
                <Field label="Have you been diagnosed by a professional before?">
                  <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option><option>No</option><option>Yes</option><option>I&apos;m not sure</option></select>
                </Field>
              </>
            )}

            {careType === 'therapy' && (
              <Field label="Have you been to therapy before?">
                <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option><option>This would be my first time</option><option>Yes, in the past</option><option>Yes, currently</option></select>
              </Field>
            )}
          </div>
          <button onClick={() => setStep(3)} style={{ ...primaryBtn, marginTop: 24 }}>Continue →</button>
        </>
      )}

      {/* ─── Step 3a: Partner (couple) ──────────────────── */}
      {screen === 'partner' && (
        <>
          <StepHead title="About your partner" sub="Couples work involves both of you. We'll invite them to join with their own private login too." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Partner's full name"><input type="text" placeholder="Their name" style={inputStyle} /></Field>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Field label="Date of birth"><input type="date" style={inputStyle} /></Field></div>
              <div style={{ flex: 1 }}>
                <Field label="Gender">
                  <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Prefer not to say</option></select>
                </Field>
              </div>
            </div>
            <Field label="Partner's mobile">
              <div style={{ display: 'flex', border: '1.5px solid #E2E8F0', borderRadius: 12 }}>
                <CountrySelect value={country} onChange={setCountry} />
                <input type="tel" placeholder="98765 43210" style={{ ...inputStyle, border: 'none', borderRadius: '0 12px 12px 0' }} />
              </div>
            </Field>
            <Field label="Partner's email (optional)"><input type="email" placeholder="partner@example.com" style={inputStyle} /></Field>
          </div>
          <button onClick={() => setStep(4)} style={{ ...primaryBtn, marginTop: 24 }}>Continue →</button>
        </>
      )}

      {/* ─── Step 3b: Child ─────────────────────────────── */}
      {screen === 'child' && (
        <>
          <StepHead title="About your child" sub="So we can match a child specialist and tailor care to their age and needs." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Child's name"><input type="text" placeholder="Their name" style={inputStyle} /></Field>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Field label="Date of birth"><input type="date" style={inputStyle} /></Field></div>
              <div style={{ flex: 1 }}>
                <Field label="Gender">
                  <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option><option>Girl</option><option>Boy</option><option>Non-binary</option><option>Prefer not to say</option></select>
                </Field>
              </div>
            </div>
            <Field label="Your relationship to the child">
              <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option><option>Mother</option><option>Father</option><option>Guardian</option><option>Other</option></select>
            </Field>
            <Field label="Anything we should know? (optional)">
              <textarea rows={3} placeholder="Brief context helps us prepare the right specialist." style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
          </div>
          <button onClick={() => setStep(4)} style={{ ...primaryBtn, marginTop: 24 }}>Continue →</button>
        </>
      )}

      {/* ─── Step 4: Emergency contact ──────────────────── */}
      {screen === 'emergency' && (
        <>
          <StepHead title="Emergency contact" sub="Because your safety matters most. We'll only ever reach out to them in a genuine crisis, never for anything routine." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Contact's name"><input type="text" placeholder="Someone you trust" style={inputStyle} /></Field>
            <Field label="Their mobile">
              <div style={{ display: 'flex', border: '1.5px solid #E2E8F0', borderRadius: 12 }}>
                <CountrySelect value={country} onChange={setCountry} />
                <input type="tel" placeholder="98765 43210" style={{ ...inputStyle, border: 'none', borderRadius: '0 12px 12px 0' }} />
              </div>
            </Field>
            <Field label="Relationship to you">
              <select style={inputStyle} defaultValue=""><option value="" disabled>Select</option>{RELATIONS.map((r) => <option key={r}>{r}</option>)}</select>
            </Field>
          </div>
          <button onClick={() => setStep(hasExtraStep ? 5 : 4)} style={{ ...primaryBtn, marginTop: 24 }}>Continue →</button>
        </>
      )}

      {/* ─── Step 5: Consents ───────────────────────────── */}
      {screen === 'consents' && (
        <>
          <StepHead title="Your privacy & consent" sub="Mental health is sensitive. Please read these, they explain exactly how your information is used." />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Consent
              checked={consents.retention}
              onChange={(v) => setConsents((c) => ({ ...c, retention: v }))}
              text={<>I understand my health information is stored securely and retained in line with the{' '}<Link href="/privacy" style={linkStyle}>Data Retention Policy</Link>{' '}(DPDP Act 2023).</>}
            />

            {/* LLM sharing, optional toggle */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', background: '#F9F5FF', border: '1px solid rgba(124,92,191,.16)', borderRadius: 12 }}>
              <Toggle on={llmConsent} onChange={setLlmConsent} />
              <div>
                <p style={{ fontSize: 13.5, color: '#1C2B3A', fontWeight: 600, marginBottom: 3 }}>Help improve AI features</p>
                <p style={{ fontSize: 12.5, color: '#6B7D8E', lineHeight: 1.55 }}>
                  Allow GetCalmly to share <strong>de-identified</strong> data with trusted AI/LLM partners to power features like Calm AI and journaling insights. Optional, you can switch this off anytime in Settings.
                </p>
              </div>
            </div>

            <Consent
              checked={consents.ai}
              onChange={(v) => setConsents((c) => ({ ...c, ai: v }))}
              text={<>I understand AI features are <strong>supportive tools, not a substitute for professional care</strong>, may be inaccurate, and that GetCalmly does not guarantee the accuracy of AI-generated content.</>}
            />

            <Consent
              checked={consents.liability}
              onChange={(v) => setConsents((c) => ({ ...c, liability: v }))}
              text={<>I understand GetCalmly is <strong>not an emergency service</strong>. In a crisis I will contact emergency helplines or local services, and GetCalmly is not liable for clinical outcomes.</>}
            />

            <Consent
              checked={consents.terms}
              onChange={(v) => setConsents((c) => ({ ...c, terms: v }))}
              text={<>I agree to the{' '}<Link href="/safety" style={linkStyle}>Safety &amp; Ethics</Link>,{' '}<Link href="/privacy" style={linkStyle}>Privacy Policy</Link>, and Terms of Use.</>}
            />
          </div>

          <button
            onClick={() => canSubmit && setDone(true)}
            disabled={!canSubmit}
            style={{ ...primaryBtn, marginTop: 22, opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
          >
            Create my account
          </button>
          {!canSubmit && (
            <p style={{ fontSize: 12.5, color: '#A0ADB8', textAlign: 'center', marginTop: 10 }}>
              Please accept the required items to continue.
            </p>
          )}
        </>
      )}
    </div>
  )
}

/* ── small presentational helpers ───────────────────────── */

function StepHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 32, color: '#1C2B3A', marginBottom: 6, lineHeight: 1.05 }}>{title}</h1>
      <p style={{ fontSize: 14, color: '#6B7D8E', lineHeight: 1.6 }}>{sub}</p>
    </div>
  )
}

function Consent({ checked, onChange, text }: { checked: boolean; onChange: (v: boolean) => void; text: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', cursor: 'pointer', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${checked ? 'rgba(200,85,61,.3)' : '#E2E8F0'}`, background: checked ? '#FFF8F5' : '#fff' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 2, width: 17, height: 17, accentColor: '#C8553D', flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: '#3A4A5A', lineHeight: 1.55 }}>{text}</span>
    </label>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} aria-pressed={on} style={{
      width: 42, height: 24, borderRadius: 50, border: 'none', cursor: 'pointer', flexShrink: 0, marginTop: 1,
      background: on ? '#7C5CBF' : '#CBD3DC', position: 'relative', transition: 'background .2s',
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </button>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}

const socialBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '13px 20px',
  fontSize: 15, fontWeight: 600, color: '#1C2B3A', background: '#fff', cursor: 'pointer', width: '100%',
  fontFamily: "'DM Sans', sans-serif",
}
const primaryBtn: React.CSSProperties = {
  width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#C8553D', color: '#fff',
  fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(200,85,61,.3)',
}
const linkStyle: React.CSSProperties = { color: '#C8553D', fontWeight: 600, textDecoration: 'underline' }
const dividerWrap: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }
const dividerLine: React.CSSProperties = { flex: 1, height: 1, background: '#EEF0F3' }
const dividerText: React.CSSProperties = { fontSize: 12, color: '#A0ADB8', fontWeight: 500, whiteSpace: 'nowrap' }
