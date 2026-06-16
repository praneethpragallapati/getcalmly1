import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features | GetCalmly',
  description: 'Human care, amplified by thoughtful AI. Matching, Calm AI companion, mood insights, smart journaling, and a clinician co-pilot. Always human-led, never automated away.',
  alternates: { canonical: '/features' },
}

const pillars = [
  {
    icon: '🧭',
    accent: '#C8553D',
    pale: 'rgba(200,85,61,.08)',
    title: 'Matching that actually fits',
    body: 'No browsing dozens of profiles hoping you guess right. A short assessment reads what you\'re going through, the language you think in, and your budget, then matches you to a professional who genuinely fits. The first session feels right because it is.',
  },
  {
    icon: '💬',
    accent: '#7C5CBF',
    pale: 'rgba(124,92,191,.08)',
    title: 'Calm — your AI companion',
    body: 'For the 2am spirals and the in-between moments your therapist can\'t be there for. Calm is a gentle, always-available space to talk things through, breathe, and steady yourself. It notices when you\'re struggling and surfaces real help. It never pretends to be your therapist.',
  },
  {
    icon: '📈',
    accent: '#3D9E72',
    pale: 'rgba(61,158,114,.08)',
    title: 'Mood tracking that does something',
    body: 'Most apps just draw you a chart. Ours watches for patterns and acts. A few low days nudges a breathing exercise; a fortnight of low mood gently suggests talking to someone, with the words to start. Your tracking becomes a quiet early-warning system, not a diary you forget.',
  },
  {
    icon: '📔',
    accent: '#C9973A',
    pale: 'rgba(201,151,58,.08)',
    title: 'Journaling that reflects back',
    body: 'Write freely. Calm gently surfaces the patterns in your own words, the thoughts that keep circling and the moments that lift you, drawing on CBT principles to help you see them. Reflections to support self-understanding, always clearly marked as not a diagnosis.',
  },
  {
    icon: '🩺',
    accent: '#1A7F7A',
    pale: 'rgba(26,127,122,.08)',
    title: 'A co-pilot for your therapist',
    body: 'Your clinician walks into every session already caught up: your week, your mood trend, last session\'s homework, summarised for them. Less time on paperwork, more time on you. Every AI summary is reviewed and approved by a human before it ever counts.',
  },
  {
    icon: '🛟',
    accent: '#C0392B',
    pale: 'rgba(192,57,43,.08)',
    title: 'Safety, watching quietly',
    body: 'A safety layer reads for signs of crisis across the platform and connects you to immediate help when it matters most. Your care team is alerted to meaningful changes so nothing slips through the cracks between sessions.',
  },
]

export default function FeaturesPage() {
  return (
    <div style={{ background: '#F9F5F2' }}>
      {/* Hero */}
      <section style={{ background: '#1C2B3A', padding: '84px 24px 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,158,114,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5, color: 'rgba(255,255,255,.45)', marginBottom: 18 }}>How GetCalmly works</p>
          <h1 style={{
            fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
            fontSize: 'clamp(40px, 7vw, 66px)', color: '#fff', lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 22,
          }}>
            Human care.<br /><span style={{ color: '#C8553D' }}>Amplified by AI.</span>
          </h1>
          <p style={{ fontSize: 17.5, color: 'rgba(255,255,255,.66)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto', fontWeight: 300 }}>
            Real therapy with real, licensed professionals, sits at the heart of everything. The technology around it just makes that care easier to reach, easier to stay with, and a little more personal. The AI never replaces your therapist. It helps them help you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <Link href="/assess" style={ctaPrimary}>✦ Find your match</Link>
            <Link href="/services" style={ctaGhost}>Explore services</Link>
          </div>
        </div>
      </section>

      {/* Philosophy strip */}
      <section style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.05)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 28 }}>
          {[
            ['Human-led, always', 'AI assists. Licensed clinicians decide. Every clinical output is human-reviewed.'],
            ['Opt-in by design', 'Every AI feature is optional. Turn any of it off, anytime, without losing your care.'],
            ['Private & compliant', 'Encrypted records and consent management, built to India\'s DPDP Act 2023 from day one.'],
          ].map(([t, d]) => (
            <div key={t}>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#1C2B3A', marginBottom: 6 }}>{t}</p>
              <p style={{ fontSize: 13.5, color: '#6B7D8E', lineHeight: 1.6 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 22 }}>
          {pillars.map((p) => (
            <div key={p.title} style={{ background: '#fff', borderRadius: 20, padding: '30px 28px', border: '1.5px solid rgba(0,0,0,.06)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: p.pale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{p.icon}</div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#1C2B3A', marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>{p.title}</h3>
              <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.7 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it flows */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#C8553D', textTransform: 'uppercase', marginBottom: 14 }}>The journey</p>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(30px, 5vw, 44px)', color: '#1C2B3A', letterSpacing: '-1px' }}>
              Assess. Match. Meet. Heal.
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['01', 'Assess', 'A short, gentle assessment helps us understand what you\'re carrying, with no jargon, no judgement.'],
              ['02', 'Match', 'We pair you with the right licensed professional by concern, language, and budget. No guesswork.'],
              ['03', 'Meet', 'Sessions happen securely over Google Meet, at times that work for you. Your first one is free.'],
              ['04', 'Heal', 'Between sessions, Calm, mood tracking and journaling keep you supported, and keep your therapist informed.'],
            ].map(([n, t, d]) => (
              <div key={n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '20px 0', borderBottom: '1px solid #EEF0F3' }}>
                <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 32, color: '#C8553D', lineHeight: 1, flexShrink: 0, width: 48 }}>{n}</span>
                <div>
                  <p style={{ fontSize: 17, fontWeight: 800, color: '#1C2B3A', marginBottom: 4 }}>{t}</p>
                  <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.65 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1C2B3A', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 38, color: '#fff', marginBottom: 16, letterSpacing: '-0.5px' }}>
            Care that remembers you.
          </h2>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.62)', lineHeight: 1.7, marginBottom: 30 }}>
            Start free. Meet your match. Let the rest take care of itself.
          </p>
          <Link href="/assess" style={ctaPrimary}>✦ Start your free assessment</Link>
        </div>
      </section>
    </div>
  )
}

const ctaPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C8553D', color: '#fff',
  padding: '15px 30px', borderRadius: 50, fontSize: 15.5, fontWeight: 700, textDecoration: 'none',
  fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(200,85,61,.35)',
}
const ctaGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)',
  color: 'rgba(255,255,255,.85)', padding: '15px 26px', borderRadius: 50, fontSize: 15.5, fontWeight: 600,
  textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", border: '1.5px solid rgba(255,255,255,.16)',
}
