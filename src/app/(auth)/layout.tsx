import Logo from '@/components/ui/Logo'
import Link from 'next/link'

const trust = [
  { icon: '🔒', text: 'End-to-end encrypted sessions' },
  { icon: '🧑‍⚕️', text: 'RCI & NMC verified professionals only' },
  { icon: '🇮🇳', text: 'DPDP Act 2023 compliant' },
  { icon: '💬', text: '15+ languages supported' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', background: '#0F1C28' }}>
      {/* Left panel, brand & reassurance */}
      <div style={{
        flex: '0 0 48%',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 56px',
        background: 'linear-gradient(160deg, #1C2B3A 0%, #0F1C28 100%)',
        position: 'relative',
        overflow: 'hidden',
      }} className="auth-left-panel">
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 80, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,158,114,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 'auto' }}>
          <Logo size={32} onDark />
        </Link>

        <div style={{ paddingTop: 64, paddingBottom: 48 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.3, color: 'rgba(255,255,255,.72)', marginBottom: 22 }}>
            India&apos;s mental healthcare, done right.
          </p>
          <h2 style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontWeight: 900,
            fontSize: 46,
            lineHeight: 1.02,
            color: '#fff',
            marginBottom: 22,
            letterSpacing: '-1px',
          }}>
            The right professional.<br /><span style={{ color: '#C8553D' }}>The very first time.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.62)', lineHeight: 1.7, maxWidth: 390, fontWeight: 300 }}>
            No endless scrolling through profiles. We match you by what you&apos;re actually going through, the language you think in, and what fits your budget, so your first session already feels like the right one.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {trust.map((t) => (
            <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{t.icon}</span>
              <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,.55)', fontWeight: 400 }}>{t.text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, fontSize: 12, color: 'rgba(255,255,255,.25)' }}>
          © {new Date().getFullYear()} GetCalmly. All rights reserved.
        </div>
      </div>

      {/* Right panel, auth form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        background: '#fff',
        overflowY: 'auto',
      }} className="auth-right-panel">
        {/* Mobile logo */}
        <div className="auth-mobile-logo" style={{ marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}><Logo size={28} /></Link>
        </div>
        {children}
      </div>

      <style>{`
        .auth-left-panel { display: flex; }
        .auth-mobile-logo { display: none; }
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          .auth-mobile-logo { display: block; }
        }
      `}</style>
    </div>
  )
}
