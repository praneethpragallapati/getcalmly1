'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Video, Clock } from 'lucide-react'
import { joinPhase, meetingBounds, type JoinPhase } from '@/lib/meetingWindow'

/**
 * Join control that reflects the meeting window live: greyed out before the
 * session starts, active during it, and disabled ("Session ended") once the
 * window closes. The room page enforces the same rule server-side — this is UX.
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
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(t)
  }, [])

  const phase: JoinPhase = joinPhase(scheduledISO, durationMins, now, joinedAlready)
  const { start } = meetingBounds(scheduledISO, durationMins)
  const cls = size === 'md' ? 'btn btn-primary' : 'btn btn-primary btn-sm'

  if (phase === 'open') {
    return (
      <Link href={href} className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        <Video size={size === 'md' ? 16 : 14} /> {label}
      </Link>
    )
  }

  const startsInMin = Math.max(0, Math.round((start - now) / 60_000))
  const startLabel = new Date(scheduledISO).toLocaleString(undefined, {
    weekday: 'short', hour: 'numeric', minute: '2-digit',
  })
  const hint =
    phase === 'closed'
      ? 'Session ended'
      : startsInMin <= 60
        ? `Opens in ${startsInMin} min`
        : `Opens ${startLabel}`

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
