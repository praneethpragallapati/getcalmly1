'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, X, Check, LifeBuoy } from 'lucide-react'
import { cancelMyAppointment, rescheduleMyAppointment } from '@/app/(dashboard)/app/actions'

const SUPPORT_EMAIL = 'connect@getcalmly.com'

/** A "Contact support" link that opens the user's mail client to connect@getcalmly.com. */
function ContactSupport({ subject }: { subject?: string }) {
  const href = `mailto:${SUPPORT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
  return (
    <a className="btn btn-outline btn-sm" href={href} style={{ textDecoration: 'none' }}>
      <LifeBuoy size={13} /> Contact support
    </a>
  )
}

/**
 * Cancel / reschedule controls for an upcoming session. Both are only allowed
 * at least 24 hours before the session — the button is disabled inside that
 * window and the server enforces it too. Cancelling restores the session to the
 * package it was booked from.
 */
export function SessionActions({ id, scheduledISO }: { id: string; scheduledISO?: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [mode, setMode] = useState<null | 'cancel' | 'reschedule'>(null)
  const [when, setWhen] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  // Evaluate "now" once at mount (state initializer) rather than during every
  // render — keeps the render pure and the 24h lock stable for this view.
  const [now] = useState(() => Date.now())

  const hoursOut = scheduledISO ? (new Date(scheduledISO).getTime() - now) / 3_600_000 : 0
  const locked = hoursOut < 24

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setMsg(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) { setMode(null); router.refresh() }
      else setMsg(res.error ?? 'Something went wrong.')
    })
  }

  if (locked) {
    // Within 24h the patient can't self-serve cancel/reschedule, so give them a
    // way to reach a human instead of a dead end.
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <span className="doc-sub" style={{ fontSize: 11.5 }} title="Changes are only allowed 24h+ before the session">Locked (within 24h)</span>
        <ContactSupport subject="Help with my upcoming session (within 24 hours)" />
      </div>
    )
  }

  if (mode === 'reschedule') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)}
          style={{ fontFamily: 'inherit', fontSize: 12.5, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--c-line)', background: 'var(--c-white)', color: 'var(--c-charcoal)' }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-primary btn-sm" disabled={pending || !when}
            onClick={() => run(() => rescheduleMyAppointment(id, new Date(when).toISOString()))}>
            <Check size={13} /> Confirm
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => { setMode(null); setMsg(null) }}>Back</button>
        </div>
        {msg && <span style={{ fontSize: 11, color: 'var(--c-coral)' }}>{msg}</span>}
      </div>
    )
  }

  if (mode === 'cancel') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Cancel this session?</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm" disabled={pending} style={{ background: 'var(--c-coral)', color: '#fff' }}
            onClick={() => run(() => cancelMyAppointment(id))}>Yes, cancel</button>
          <button className="btn btn-outline btn-sm" onClick={() => { setMode(null); setMsg(null) }}>Keep</button>
        </div>
        {msg && <span style={{ fontSize: 11, color: 'var(--c-coral)' }}>{msg}</span>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <button className="btn btn-outline btn-sm" onClick={() => setMode('reschedule')}><CalendarClock size={13} /> Reschedule</button>
      <button className="btn btn-outline btn-sm" onClick={() => setMode('cancel')} style={{ color: 'var(--c-coral)' }}><X size={13} /> Cancel</button>
      <ContactSupport subject="Help with my upcoming session" />
    </div>
  )
}
