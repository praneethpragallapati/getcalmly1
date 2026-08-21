'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Check, CalendarPlus } from 'lucide-react'
import { requestSession } from '@/app/(dashboard)/app/actions'
import { useToast } from '@/components/ui/Toast'
import type { ExpertSlot } from '@/lib/sessions'
import { fmtIST } from '@/lib/tz'

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
  bookUntilIso,
  packExpired = false,
}: {
  slots: ExpertSlot[]
  therapistId?: string
  expertName?: string
  clinicians?: Clinician[]
  selectedId?: string
  bookUntilIso?: string | null
  packExpired?: boolean
}) {
  // A slot is bookable only up to the package expiry (null = no expiry). This
  // mirrors the server's guard exactly (expiresAt >= scheduledAt), so the UI and
  // the action agree on which slots are allowed.
  const bookUntil = bookUntilIso ? new Date(bookUntilIso).getTime() : null
  const afterExpiry = (iso: string) => bookUntil != null && new Date(iso).getTime() > bookUntil
  const validUntilLabel = bookUntilIso
    ? fmtIST(new Date(bookUntilIso), { day: 'numeric', month: 'short', year: 'numeric' })
    : null
  const toast = useToast()
  const [selected, setSelected] = useState<string | null>(null)
  const [requested, setRequested] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function request() {
    if (!selected || packExpired || afterExpiry(selected)) return
    setError(null)
    startTransition(async () => {
      const res = await requestSession(selected, therapistId)
      if (res.ok) {
        setRequested(selected)
        setSelected(null)
        toast.success('Session requested — you’ll be notified once it’s confirmed')
      } else {
        setError(res.error ?? 'Could not request this slot.')
        toast.error(res.error ?? 'Could not request this slot.')
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

      {packExpired ? (
        // Expired package → no bookable calendar; send them to renew.
        <div style={{ padding: '14px 16px', background: '#FFF1EC', border: '1px solid rgba(200,85,61,.25)', borderRadius: 12 }}>
          <div style={{ fontWeight: 700, color: 'var(--c-charcoal, #1C2B3A)', fontSize: 14 }}>
            This {selectedType ?? 'package'} has expired{validUntilLabel ? ` (valid until ${validUntilLabel})` : ''}.
          </div>
          <p className="muted" style={{ margin: '6px 0 10px', fontSize: 13 }}>
            Renew or extend it to book a session.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/app/billing" className="btn btn-primary btn-sm">Renew package</Link>
            <a className="btn btn-outline btn-sm" href="mailto:connect@getcalmly.com?subject=Renew%20my%20package" style={{ textDecoration: 'none' }}>Contact support</a>
          </div>
        </div>
      ) : (
        <>
          {validUntilLabel && (
            <p className="muted" style={{ margin: '-6px 0 12px', fontSize: 12.5 }}>
              Your package is valid until <b>{validUntilLabel}</b> — slots after that date can’t be booked.
            </p>
          )}
          <div className="slot-cal">
            {[...byDay.entries()].map(([day, daySlots]) => (
              <div className="slot-day" key={day}>
                <div className="slot-day-label">{day}</div>
                <div className="slot-times">
                  {daySlots.map((s) => {
                    const isRequested = requested === s.iso
                    const past = afterExpiry(s.iso)
                    const disabled = s.taken || isRequested || past
                    return (
                      <button
                        key={s.iso}
                        type="button"
                        disabled={disabled}
                        title={past ? 'After your package validity' : undefined}
                        onClick={() => setSelected(s.iso)}
                        className={`slot-chip${selected === s.iso ? ' selected' : ''}${disabled ? ' taken' : ''}`}
                      >
                        {isRequested ? '✓ Requested' : s.taken ? 'Booked' : past ? 'Past validity' : s.time}
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
            {error && <span style={{ fontSize: 12, color: 'var(--c-coral-d)' }}>{error}</span>}
          </div>
        </>
      )}
    </div>
  )
}
