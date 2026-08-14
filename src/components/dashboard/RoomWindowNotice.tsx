'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, CalendarX, CheckCircle2 } from 'lucide-react'

/**
 * Shown in place of the video room when it can't be joined:
 *   • early     — before the scheduled start (auto-reloads into the room at start)
 *   • closed    — the join window (start + duration) has passed
 *   • cancelled — the session was cancelled
 *   • completed — the session already finished
 */
export function RoomWindowNotice({
  variant,
  scheduledISO,
  startMs,
  whenLabel,
  backHref,
}: {
  variant: 'early' | 'closed' | 'cancelled' | 'completed'
  scheduledISO: string
  startMs: number
  whenLabel: string
  backHref: string
}) {
  const router = useRouter()
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    if (variant !== 'early') return
    const tick = setInterval(() => setNow(Date.now()), 5_000)
    return () => clearInterval(tick)
  }, [variant])

  // When the start time arrives on an "early" notice, reload so the server gate
  // re-evaluates and drops the patient/clinician straight into the room.
  useEffect(() => {
    if (variant === 'early' && now >= startMs) router.refresh()
  }, [variant, now, startMs, router])

  const startsInMin = Math.max(0, Math.round((startMs - now) / 60_000))

  const copy = {
    early: {
      icon: <Clock size={20} />,
      title: 'Your session hasn’t started yet',
      body: `You can join at ${whenLabel}${startsInMin <= 60 ? ` — opens in ${startsInMin} min` : ''}. Keep this page open and it’ll let you in automatically.`,
    },
    closed: {
      icon: <CalendarX size={20} />,
      title: 'The join window has closed',
      body: `This session’s time (${whenLabel}) has passed, so the room can no longer be joined.`,
    },
    cancelled: {
      icon: <CalendarX size={20} />,
      title: 'This session was cancelled',
      body: 'It’s no longer available to join.',
    },
    completed: {
      icon: <CheckCircle2 size={20} />,
      title: 'This session has ended',
      body: 'The room is closed. You can review notes from the session details.',
    },
  }[variant]

  return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 460, margin: '24px auto' }}>
      <div style={{ display: 'inline-flex', color: 'var(--c-gray-d, #5A6B7A)', marginBottom: 12 }}>{copy.icon}</div>
      <div className="section-title" style={{ marginBottom: 8 }}>{copy.title}</div>
      <p className="muted" style={{ lineHeight: 1.6, marginBottom: 18 }}>{copy.body}</p>
      <Link href={backHref} className="btn btn-outline btn-sm">Back</Link>
      <span suppressHydrationWarning style={{ display: 'none' }}>{scheduledISO}</span>
    </div>
  )
}
