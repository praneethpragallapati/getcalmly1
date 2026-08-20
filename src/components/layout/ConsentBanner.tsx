'use client'
import Link from 'next/link'
import { useLocalStorageFlag } from '@/lib/useLocalStorageFlag'

export default function ConsentBanner() {
  const [decided, setConsent] = useLocalStorageFlag('cookieConsent')

  if (decided) return null

  const dismiss = (choice: string) => setConsent(choice)

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 600,
        background: '#1C2B3A',
        borderTop: '1px solid rgba(200,85,61,.25)',
        boxShadow: '0 -8px 32px rgba(28,43,58,.25)',
        padding: '18px 24px',
        paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
          <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>🍪</span>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', lineHeight: 1.55, margin: 0 }}>
            We use cookies to keep you signed in and improve your experience. By continuing, you
            agree to our{' '}
            <Link href="/privacy" style={{ color: '#E8896F', textDecoration: 'underline', fontWeight: 600 }}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <button
            onClick={() => dismiss('declined')}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,.7)',
              background: 'rgba(255,255,255,.08)',
              border: '1.5px solid rgba(255,255,255,.15)',
              padding: '10px 22px',
              borderRadius: 50,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Decline
          </button>
          <button
            onClick={() => dismiss('accepted')}
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              background: '#B8482F',
              border: 'none',
              padding: '10px 26px',
              borderRadius: 50,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              boxShadow: '0 4px 16px rgba(200,85,61,.35)',
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
