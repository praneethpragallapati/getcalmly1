'use client'

import { useEffect } from 'react'
import { contactEmail } from '@/config/site'

/**
 * Error boundary for the admin area. Instead of a raw "server error" crash, this
 * shows a graceful, reloadable card — and surfaces the error's digest, which
 * correlates to the exact line in the server logs (Vercel → Runtime Logs). Also
 * logs to the browser console so a failing page is diagnosable without a full
 * crash. Keep this resilient: it must never itself depend on data that can fail.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Visible in the browser console; the matching server log line carries the
    // same digest so the two can be lined up.
    console.error('[admin] page error', { message: error.message, digest: error.digest })
  }, [error])

  return (
    <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 34, marginBottom: 8 }}>⚠️</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1C2B3A', marginBottom: 8 }}>This page hit an error</h1>
      <p style={{ color: '#6B7D8E', fontSize: 14.5, lineHeight: 1.6, marginBottom: 18 }}>
        Something went wrong loading this admin page. Try again — if it keeps happening, send us the
        reference code below and we’ll look into it.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <button
          onClick={() => reset()}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#6D5BD0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Reload
        </button>
        <a
          href={`mailto:${contactEmail}?subject=Admin%20page%20error`}
          style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid #E2E8F0', color: '#1C2B3A', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
        >
          Contact support
        </a>
      </div>
      {error.digest && (
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#A0ADB8' }}>
          Reference: {error.digest}
        </div>
      )}
    </div>
  )
}
