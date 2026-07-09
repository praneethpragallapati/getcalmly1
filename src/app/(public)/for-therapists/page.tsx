import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Therapists, Practice on GetCalmly | RCI & NMC Clinicians',
  description:
    'Join GetCalmly as a verified therapist or psychiatrist. AI pre-session briefs, matched clients, a clinical co-pilot, supervision tools, and reliable payouts. Less admin, better care.',
  alternates: { canonical: '/for-therapists' },
}

const benefits = [
  { icon: '🧠', t: 'An AI co-pilot, not a replacement', d: 'Auto-drafted session notes, homework tracking, and pre-session briefs you review and approve. The judgement stays yours. The paperwork does not.' },
  { icon: '🎯', t: 'Matched clients, not cold leads', d: 'We route clients to you by specialty, language, and availability. No bidding, no chasing, no marketing spend. Just the right fit walking in.' },
  { icon: '📋', t: 'Pre-session briefs', d: 'Walk into every session already caught up: mood trends, journal themes, last session\'s homework, and PHQ-9/GAD-7 history, summarised.' },
  { icon: '🔔', t: 'Between-session safety net', d: 'Severity-tiered alerts surface the clients who need attention now, so nothing slips through the gaps between appointments.' },
  { icon: '👥', t: 'Built-in supervision', d: 'Supervise associates or get supervised. Track cases under supervision, share notes, and keep growing clinically, all in one place.' },
  { icon: '🗓️', t: 'Calendar that runs itself', d: 'Two-way Google Calendar sync, recurring availability, and one-tap Google Meet. Set your hours and let it handle the rest.' },
  { icon: '💳', t: 'Transparent, on-time payouts', d: 'Razorpay-backed payments, clear fees, and reliable settlements with a live earnings summary. You focus on care; we handle billing.' },
  { icon: '🔒', t: 'Compliance from day one', d: 'DPDP-aligned data handling, encrypted records, consent management, and NIMHANS telepsychotherapy standards, built in from the start.' },
]

export default function ForTherapistsPage() {
  return (
    <div style={{ background: '#FFFCFA' }}>
      {/* Hero */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '99px 24px 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,158,114,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5, color: 'rgba(255,255,255,.45)', marginBottom: 18 }}>Join our expert team</p>
          <h1 style={{
            fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300,
            fontSize: 'clamp(40px, 7vw, 64px)', color: '#fff', lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 22,
          }}>
            Spend your time<br /><span style={{ color: '#3D9E72' }}>on care, not admin.</span>
          </h1>
          <p style={{ fontSize: 17.5, color: 'rgba(255,255,255,.66)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto', fontWeight: 300 }}>
            GetCalmly gives you matched clients, an AI clinical co-pilot, supervision tools, and a calendar that runs itself. The parts of practice that drain you fade into the background, and the part you trained for takes centre stage.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <Link href="/for-therapists/apply" style={ctaPrimary}>Apply to join →</Link>
            <Link href="/contact" style={ctaGhost}>Talk to our team</Link>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginTop: 20 }}>
            Every clinician is verified with the RCI / NMC before going live.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            ['~70%', 'less time on notes & admin'],
            ['0', 'rupees on marketing or lead-gen'],
            ['100%', 'sessions on secure Google Meet'],
          ].map(([n, d]) => (
            <div key={d}>
              <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 38, color: '#3D9E72', lineHeight: 1 }}>{n}</p>
              <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 6 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '90px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300, fontSize: 'clamp(30px, 5vw, 44px)', color: '#1C2B3A', letterSpacing: '-1px', marginBottom: 14 }}>
              Clinical tools, finally on your side.
            </h2>
            <p style={{ fontSize: 17, color: '#6B7D8E', lineHeight: 1.7, fontWeight: 300 }}>
              Everything below is built around one idea: protect your clinical time and judgement.
            </p>
          </div>
          <div>
            {benefits.map((b, idx) => (
              <div key={b.t} style={{
                display: 'grid', gridTemplateColumns: '12px 1fr', gap: 18, alignItems: 'flex-start',
                padding: '24px 0', borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,.07)',
              }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#3D9E72', marginTop: 9 }} />
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1C2B3A', marginBottom: 7, letterSpacing: '-0.2px' }}>{b.t}</h3>
                  <p style={{ fontSize: 15.5, color: '#5A6B7A', lineHeight: 1.7, fontWeight: 300 }}>{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How joining works */}
      <section style={{ background: '#fff', padding: '85px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#3D9E72', textTransform: 'uppercase', marginBottom: 14 }}>Joining is simple</p>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300, fontSize: 'clamp(28px, 5vw, 40px)', color: '#1C2B3A', letterSpacing: '-1px' }}>
              From application to first client.
            </h2>
          </div>
          {[
            ['01', 'Apply', 'Tell us about your practice, qualifications, and specialisations, and upload your registration and certificates.'],
            ['02', 'Verify', 'We verify your RCI / NMC registration and review your documents. Quality is non-negotiable for us.'],
            ['03', 'Interview', 'A short conversation with our clinical team to get to know you and your approach.'],
            ['04', 'Go live', 'Set your availability, connect Google Calendar, and start receiving matched clients.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '20px 0', borderBottom: '1px solid #EEF0F3' }}>
              <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 30, color: '#3D9E72', lineHeight: 1, flexShrink: 0, width: 46 }}>{n}</span>
              <div>
                <p style={{ fontSize: 17, fontWeight: 800, color: '#1C2B3A', marginBottom: 4 }}>{t}</p>
                <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.65 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', padding: '85px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300, fontSize: 40, color: '#fff', marginBottom: 16, letterSpacing: '-0.5px' }}>
            Build your practice on solid ground.
          </h2>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.62)', lineHeight: 1.7, marginBottom: 30 }}>
            Join a platform that takes clinical quality as seriously as you do. We&apos;ll handle the busywork, you do the work that matters.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/for-therapists/apply" style={ctaPrimary}>Apply to join →</Link>
            <Link href="/contact" style={ctaGhost}>Ask a question</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const ctaPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3D9E72', color: '#fff',
  padding: '15px 30px', borderRadius: 50, fontSize: 15.5, fontWeight: 700, textDecoration: 'none',
  fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(61,158,114,.35)',
}
const ctaGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)',
  color: 'rgba(255,255,255,.85)', padding: '15px 26px', borderRadius: 50, fontSize: 15.5, fontWeight: 600,
  textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", border: '1.5px solid rgba(255,255,255,.16)',
}
