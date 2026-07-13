'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

/** Friendly error boundary for the patient dashboard. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the error for debugging; a real logger would go here.
    console.error(error)
  }, [error])

  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 28px', maxWidth: 480, margin: '40px auto' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'rgba(200,85,61,.1)',
          color: 'var(--c-coral)',
          marginBottom: 16,
        }}
      >
        <AlertTriangle size={24} />
      </span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--c-charcoal)', margin: '0 0 8px' }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 14.5, color: 'var(--c-gray-d)', lineHeight: 1.6, margin: '0 0 22px' }}>
        We couldn&apos;t load this page. This is on us, not you — please try again in a moment.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/app" className="btn btn-ghost-d" style={{ border: '1px solid var(--c-line)', color: 'var(--c-charcoal)' }}>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
