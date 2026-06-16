import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Therapists — Practice on GetCalmly | RCI & NMC Clinicians',
  description:
    'Join GetCalmly as a verified therapist or psychiatrist. AI pre-session briefs, matched clients, a clinical co-pilot, supervision tools, and reliable payouts. Less admin, better care.',
  alternates: { canonical: '/for-therapists' },
}

const benefits = [
  { icon: '🧠', t: 'An AI co-pilot, not a replacement', d: 'Auto-drafted session notes, homework tracking, and pre-session briefs you review and approve. The judgement stays yours — the paperwork doesn\'t.' },
  { icon: '🎯', t: 'Matched clients, not cold leads', d: 'We route clients to you by specialty, language, and availability. No bidding, no chasing, no marketing spend — just the right fit walking in.' },
  { icon: '📋', t: 'Pre-session briefs', d: 'Walk into every session already caught up: mood trends, journal themes, last session\'s homework, and PHQ-9/GAD-7 history, summarised.' },
  { icon: '🔔', t: 'Between-session safety net', d: 'Severity-tiered alerts surface the clients who need attention now, so nothing slips through the gaps between appointments.' },
  { icon: '👥', t: 'Built-in supervision', d: 'Supervise associates or get supervised — track cases under supervision, share notes, and grow clinically, all in one place.' },
  { icon: '🗓️', t: 'Calendar that runs itself', d: 'Two-way Google Calendar sync, recurring availability, and one-tap Google Meet. Set your hours and let it handle the rest.' },
  { icon: '💳', t: 'Transparent, on-time payouts', d: 'Razorpay-backed payments, clear fees, and reliable settlements with a live earnings summary. You focus on care; we handle billing.' },
  { icon: '🔒', t: 'Compliance from day one', d: 'DPDP-aligned data handling, encrypted records, consent management, and NIMHANS telepsychotherapy standards — built in, not bolted on.' },
]

export default function ForTherapistsPage() {
  return (
    <div style={{ background: '#F9F5F2' }}>
      {/* Hero */}
      <section style={{ background: '#1C2B3A', padding: '84px 24px 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,127,122,.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5, color: 'rgba(255,255,255,.45)', marginBottom: 18 }}>For therapists & psychiatrists</p>
          <h1 style={{
            fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
            fontSize: 'clamp(40px, 7vw, 64px)', color: '#fff', lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 22,
          }}>
            Spend your time<br /><span style={{ color: '#1FB6A8' }}>on care, not admin.</span>
          </h1>
          <p style={{ fontSize: 17.5, color: 'rgba(255,255,255,.66)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto', fontWeight: 300 }}>
            GetCalmly gives you matched clients, an AI clinical co-pilot, supervision tools, and a calendar that runs itself — so the parts of practice that drain you fade into the background, and the part you trained for takes centre stage.
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
              <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 38, color: '#C8553D', lineHeight: 1 }}>{n}</p>
              <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 6 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 24px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(30px, 5vw, 44px)', color: '#1C2B3A', letterSpacing: '-1px', marginBottom: 14 }}>
            Clinical tools, finally on your side.
          </h2>
          <p style={{ fontSize: 16, color: '#6B7D8E', maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
            Everything below is built around one idea: protect your clinical time and judgement.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {benefits.map((b) => (
            <div key={b.t} style={{ background: '#fff', borderRadius: 18, padding: '26px 24px', border: '1.5px solid rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 26, marginBottom: 14 }}>{b.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1C2B3A', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{b.t}</h3>
              <p style={{ fontSize: 14, color: '#6B7D8E', lineHeight: 1.65 }}>{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How joining works */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#C8553D', textTransform: 'uppercase', marginBottom: 14 }}>Joining is simple</p>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 5vw, 40px)', color: '#1C2B3A', letterSpacing: '-1px' }}>
              From application to first client.
            </h2>
          </div>
          {[
            ['01', 'Apply', 'Tell us about your practice, qualifications, and specialisations — and upload your registration and certificates.'],
            ['02', 'Verify', 'We verify your RCI / NMC registration and review your documents. Quality is non-negotiable for us.'],
            ['03', 'Interview', 'A short conversation with our clinical team to get to know you and your approach.'],
            ['04', 'Go live', 'Set your availability, connect Google Calendar, and start receiving matched clients.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '20px 0', borderBottom: '1px solid #EEF0F3' }}>
              <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 30, color: '#1FB6A8', lineHeight: 1, flexShrink: 0, width: 46 }}>{n}</span>
              <div>
                <p style={{ fontSize: 17, fontWeight: 800, color: '#1C2B3A', marginBottom: 4 }}>{t}</p>
                <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.65 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1C2B3A', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 40, color: '#fff', marginBottom: 16, letterSpacing: '-0.5px' }}>
            Build your practice on solid ground.
          </h2>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.62)', lineHeight: 1.7, marginBottom: 30 }}>
            Join a platform that takes clinical quality as seriously as you do. We&apos;ll handle the busywork — you do the work that matters.
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
  display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C8553D', color: '#fff',
  padding: '15px 30px', borderRadius: 50, fontSize: 15.5, fontWeight: 700, textDecoration: 'none',
  fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(200,85,61,.35)',
}
const ctaGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)',
  color: 'rgba(255,255,255,.85)', padding: '15px 26px', borderRadius: 50, fontSize: 15.5, fontWeight: 600,
  textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", border: '1.5px solid rgba(255,255,255,.16)',
}
