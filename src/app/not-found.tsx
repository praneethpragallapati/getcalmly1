import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found · getCalmly',
  robots: { index: false, follow: false },
}

/** Branded 404 for any unmatched route. */
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        gap: 6,
      }}
    >
      <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 96, fontWeight: 900, color: '#C8553D', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 28, fontWeight: 700, color: '#1C2B3A', margin: '8px 0 6px' }}>
        We couldn&apos;t find that page
      </h1>
      <p style={{ fontSize: 15.5, color: '#5A6A7A', lineHeight: 1.6, maxWidth: 420, margin: '0 0 24px' }}>
        The link may be broken or the page may have moved. Let&apos;s get you back on track.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{ padding: '12px 26px', borderRadius: 28, background: '#C8553D', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
        >
          Back home
        </Link>
        <Link
          href="/app"
          style={{ padding: '12px 26px', borderRadius: 28, background: 'transparent', color: '#1C2B3A', fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1.5px solid rgba(28,43,58,.2)' }}
        >
          Go to my dashboard
        </Link>
      </div>
    </main>
  )
}
