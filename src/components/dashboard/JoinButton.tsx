'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { joinPhase, meetingBounds, type JoinPhase } from '@/lib/meetingWindow'

/**
 * Join control that reflects the meeting window live: greyed out before the
 * session starts, active during it, and disabled ("Session ended") once the
 * window closes. The room page enforces the same rule server-side — this is UX.
 *
 * Within the last hour before start it counts down to the second ("Opens in
 * 4:32"); once the window opens the button carries a slow "live now" pulse for
 * the whole call. The ticker only runs per-second when it needs to (near start
 * or live) and drops back to a slow poll otherwise.
 */
export function JoinButton({
  scheduledISO,
  durationMins,
  href,
  joinedAlready = false,
  label = 'Join room',
  size = 'sm',
}: {
  scheduledISO: string
  durationMins: number
  href: string
  joinedAlready?: boolean
  label?: string
  size?: 'sm' | 'md'
}) {
  // Recompute on a timer so the button flips to active exactly when the session
  // starts, without needing a page refresh.
  const [now, setNow] = useState<number>(() => Date.now())

  const phase: JoinPhase = joinPhase(scheduledISO, durationMins, now, joinedAlready)
  const { start } = meetingBounds(scheduledISO, durationMins)
  const msToStart = start - now
  // Tick every second when it matters (counting down within the hour, or live),
  // otherwise a lazy 15s poll is plenty.
  const fast = phase === 'open' || (phase === 'early' && msToStart <= 60 * 60_000)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), fast ? 1_000 : 15_000)
    return () => clearInterval(t)
  }, [fast])

  const cls = size === 'md' ? 'btn btn-primary' : 'btn btn-primary btn-sm'

  if (phase === 'open') {
    return (
      <Link
        href={href}
        className={`${cls} join-live`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
      >
        <span className="join-live-dot" aria-hidden /> {label} · Live now
      </Link>
    )
  }

  const startLabel = new Date(scheduledISO).toLocaleString(undefined, {
    weekday: 'short', hour: 'numeric', minute: '2-digit',
  })

  // Under an hour: a live m:ss countdown. Further out: the day/time it opens.
  let hint: string
  if (phase === 'closed') {
    hint = 'Session ended'
  } else if (msToStart <= 60 * 60_000) {
    const secs = Math.max(0, Math.round(msToStart / 1_000))
    const m = Math.floor(secs / 60)
    const s = secs % 60
    hint = `Opens in ${m}:${String(s).padStart(2, '0')}`
  } else {
    hint = `Opens ${startLabel}`
  }

  return (
    <span
      title={phase === 'early' ? `You can join at ${startLabel}` : 'The join window has closed'}
      className={cls}
      aria-disabled="true"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        pointerEvents: 'none', opacity: 0.5, cursor: 'not-allowed',
        background: 'var(--c-line, #E2E8F0)', color: 'var(--c-gray-d, #5A6B7A)', border: 'none',
      }}
    >
      <Clock size={size === 'md' ? 16 : 14} /> {label} · {hint}
    </span>
  )
}
