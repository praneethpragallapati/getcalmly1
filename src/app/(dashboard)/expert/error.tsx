'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

/** Friendly error boundary for the expert (therapist) portal. */
export default function ExpertError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      style={{
        maxWidth: 460,
        margin: '48px auto',
        textAlign: 'center',
        padding: '40px 28px',
        background: 'var(--c-white, #fff)',
        border: '1px solid var(--c-line, #e6e0db)',
        borderRadius: 16,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'rgba(200,85,61,.1)',
          color: 'var(--c-coral, #C8553D)',
          marginBottom: 16,
        }}
      >
        <AlertTriangle size={24} />
      </span>
      <h2 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 24, fontWeight: 700, color: 'var(--c-charcoal, #1C2B3A)', margin: '0 0 8px' }}>
        This page couldn&apos;t load
      </h2>
      <p style={{ fontSize: 14.5, color: 'var(--c-gray-d, #5A6A7A)', lineHeight: 1.6, margin: '0 0 8px' }}>
        Something went wrong loading your portal. Try again in a moment.
      </p>
      {error.digest && (
        <p style={{ fontSize: 12, color: 'var(--c-gray, #9AABB8)', margin: '0 0 22px', fontFamily: 'ui-monospace, monospace' }}>
          Ref: {error.digest}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/expert" className="btn btn-ghost-d" style={{ border: '1px solid var(--c-line, #e6e0db)', color: 'var(--c-charcoal, #1C2B3A)' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
