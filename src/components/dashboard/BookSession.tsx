'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Check, CalendarPlus } from 'lucide-react'
import { requestSession } from '@/app/(dashboard)/app/actions'
import type { ExpertSlot } from '@/lib/sessions'

type Clinician = { profileId: string; name: string; typeLabel: string }

/**
 * The expert's calendar the patient books from (#9). A patient can have up to
 * three clinicians (individual / couples / psychiatry), so we show a picker to
 * make it explicit WHOSE calendar this is and let them switch; picking a slot
 * calls requestSession for the selected clinician. Booked slots are disabled.
 */
export function BookSession({
  slots,
  therapistId,
  expertName,
  clinicians = [],
  selectedId,
}: {
  slots: ExpertSlot[]
  therapistId?: string
  expertName?: string
  clinicians?: Clinician[]
  selectedId?: string
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [requested, setRequested] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function request() {
    if (!selected) return
    setError(null)
    startTransition(async () => {
      const res = await requestSession(selected, therapistId)
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

  const selectedType = clinicians.find((c) => c.profileId === selectedId)?.typeLabel

  // No clinician attached yet → nudge instead of a mystery calendar.
  if (clinicians.length === 0) {
    return (
      <div className="card">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarPlus size={17} /> Book a session
        </div>
        <p className="muted" style={{ margin: '6px 0 12px' }}>
          You don’t have a clinician assigned yet, so there’s no calendar to book from.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/app/assessment" className="btn btn-primary btn-sm">Take your assessment</Link>
          <Link href="/app/billing" className="btn btn-outline btn-sm">Buy a package</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CalendarPlus size={17} /> Book a session
      </div>

      {/* Which clinician's calendar — a patient can have one per care type. */}
      {clinicians.length > 1 && (
        <>
          <div className="muted" style={{ fontSize: 12.5, margin: '8px 0 6px' }}>Choose who to book with</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {clinicians.map((c) => {
              const active = c.profileId === selectedId
              return (
                <Link
                  key={c.profileId}
                  href={`/app/sessions?with=${c.profileId}`}
                  scroll={false}
                  className="slot-chip"
                  style={{
                    textDecoration: 'none',
                    ...(active
                      ? { background: 'var(--c-coral, #C8553D)', color: '#fff', borderColor: 'transparent' }
                      : {}),
                  }}
                >
                  {c.typeLabel}: {c.name}
                </Link>
              )
            })}
          </div>
        </>
      )}

      <p className="muted" style={{ margin: '6px 0 14px' }}>
        {expertName
          ? <>Open times on <b>{expertName}</b>’s calendar{selectedType ? <> for <b>{selectedType}</b></> : null}. Pick one to request, you’ll be notified once it’s confirmed.</>
          : <>Open times on your expert’s calendar. Pick one to request, you’ll be notified once it’s confirmed.</>}
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
            expertName ? `Request slot with ${expertName}` : 'Request selected slot'
          )}
        </button>
        {error && <span style={{ fontSize: 12, color: 'var(--c-coral)' }}>{error}</span>}
      </div>
    </div>
  )
}
