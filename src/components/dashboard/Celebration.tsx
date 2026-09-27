'use client'

import { useEffect } from 'react'

/**
 * A brief, premium completion moment — a coral ring with a check that draws
 * left-to-right, a title and a sub. Mirrors the mobile app's tier-1 celebration.
 * Renders nothing until `show` is true; auto-dismisses after ~1.9s. Reduced
 * motion still shows the card, just without the draw/float.
 */
export function Celebration({
  show,
  title,
  sub,
  onDone,
}: {
  show: boolean
  title: string
  sub?: string
  onDone: () => void
}) {
  useEffect(() => {
    if (!show) return
    const t = setTimeout(onDone, 1900)
    return () => clearTimeout(t)
  }, [show, onDone])

  if (!show) return null

  return (
    <div className="cel-overlay" role="status" aria-live="polite" onClick={onDone}>
      <div className="cel-card">
        <svg className="cel-ring" viewBox="0 0 48 48" width="72" height="72" aria-hidden>
          <circle cx="24" cy="24" r="21" className="cel-ring-bg" />
          <circle cx="24" cy="24" r="21" className="cel-ring-fg" pathLength={1} />
          <path d="M15 24.5 L21 30.5 L33 17.5" className="cel-check" pathLength={1} fill="none" />
        </svg>
        <div className="cel-title">{title}</div>
        {sub && <div className="cel-sub">{sub}</div>}
      </div>
    </div>
  )
}
