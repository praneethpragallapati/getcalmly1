'use client'

import { useState, useTransition } from 'react'
import { Check, CalendarPlus } from 'lucide-react'
import { requestSession } from '@/app/(dashboard)/app/actions'
import type { ExpertSlot } from '@/lib/sessions'

/**
 * The expert's calendar the patient books from (#9). Picking a slot calls the
 * requestSession action, which creates a PENDING appointment for the expert to
 * confirm. Booked slots are disabled.
 */
export function BookSession({ slots }: { slots: ExpertSlot[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [requested, setRequested] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function request() {
    if (!selected) return
    setError(null)
    startTransition(async () => {
      const res = await requestSession(selected)
      if (res.ok) {
        setRequested(selected)
        setSelected(null)
      } else {
        setError(res.error ?? 'Could not request this slot.')
      }
    })
  }

  // Group slots by day for a tidier calendar column.
  const byDay = new Map<string, ExpertSlot[]>()
  for (const s of slots) {
    const list = byDay.get(s.label) ?? []
    list.push(s)
    byDay.set(s.label, list)
  }

  return (
    <div className="card">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CalendarPlus size={17} /> Book a session
      </div>
      <p className="muted" style={{ margin: '6px 0 14px' }}>
        Open times on your expert’s calendar. Pick one to request — you’ll be notified once it’s
        confirmed.
      </p>

      <div className="slot-cal">
        {[...byDay.entries()].map(([day, daySlots]) => (
          <div className="slot-day" key={day}>
            <div className="slot-day-label">{day}</div>
            <div className="slot-times">
              {daySlots.map((s) => {
                const isRequested = requested === s.iso
                return (
                  <button
                    key={s.iso}
                    type="button"
                    disabled={s.taken || isRequested}
                    onClick={() => setSelected(s.iso)}
                    className={`slot-chip${selected === s.iso ? ' selected' : ''}${
                      s.taken || isRequested ? ' taken' : ''
                    }`}
                  >
                    {isRequested ? '✓ Requested' : s.taken ? 'Booked' : s.time}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
        <button
          className="btn btn-primary"
          type="button"
          onClick={request}
          disabled={!selected || pending}
        >
          {pending ? (
            'Requesting…'
          ) : requested ? (
            <>
              <Check size={15} /> Requested
            </>
          ) : (
            'Request selected slot'
          )}
        </button>
        {error && <span style={{ fontSize: 12, color: 'var(--c-coral)' }}>{error}</span>}
      </div>
    </div>
  )
}
