'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Globe } from 'lucide-react'
import { istParts } from '@/lib/tz'
import { IST_LABEL, MONTHS, SLOT_BANDS, type DayMeta, dayKey, buildMonth, groupByBand, longDayLabel } from '@/lib/bookingCalendar'
import type { ExpertSlot } from '@/lib/sessions'

/**
 * Pick a date, then a time — instead of scrolling one long list of every open
 * slot on every day.
 *
 * The month grid is the primary control: each day shows whether it has open
 * times and whether the patient already has a session that day, so the calendar
 * answers "when could I come in?" on its own rather than being a row of
 * undifferentiated dots. Selecting a day reveals only that day's times, grouped
 * into the parts of the day people actually think in.
 *
 * Every instant is rendered in IST via istParts/the server-formatted labels, and
 * the zone is stated on the page — a patient abroad should never have to guess
 * which clock a slot is on.
 */

export type BookedSession = {
  iso: string
  /** Server-formatted IST time, e.g. "3:00 PM". */
  timeLabel: string
  expert: string
  status: string
}

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function BookingCalendar({
  slots,
  sessions,
  bookUntilIso,
  onPick,
  selectedIso,
  disabled = false,
}: {
  slots: ExpertSlot[]
  sessions: BookedSession[]
  bookUntilIso?: string | null
  /** Called with a slot ISO when the patient taps a time. */
  onPick: (iso: string) => void
  selectedIso: string | null
  disabled?: boolean
}) {
  const today = useMemo(() => istParts(new Date()), [])
  const [cursor, setCursor] = useState({ year: today.year, month: today.month })

  // Day-by-day index of what's open and what's already booked, in IST.
  const days = useMemo(() => {
    const map = new Map<string, DayMeta>()
    const bookUntil = bookUntilIso ? Date.parse(bookUntilIso) : null
    for (const s of slots) {
      const p = istParts(new Date(s.iso))
      const k = dayKey(p.year, p.month, p.day)
      const meta = map.get(k) ?? { open: 0, taken: 0, sessions: [], slots: [] }
      const afterExpiry = bookUntil != null && Date.parse(s.iso) > bookUntil
      if (s.taken || afterExpiry) meta.taken++
      else meta.open++
      meta.slots.push({ ...s, blocked: s.taken || afterExpiry })
      map.set(k, meta)
    }
    for (const b of sessions) {
      const p = istParts(new Date(b.iso))
      const k = dayKey(p.year, p.month, p.day)
      const meta = map.get(k) ?? { open: 0, taken: 0, sessions: [], slots: [] }
      meta.sessions.push(b)
      map.set(k, meta)
    }
    return map
  }, [slots, sessions, bookUntilIso])

  // Default to the first day that actually has something open.
  const firstOpenKey = useMemo(() => {
    const keys = [...days.entries()].filter(([, m]) => m.open > 0).map(([k]) => k).sort()
    return keys[0] ?? null
  }, [days])
  const [picked, setPicked] = useState<string | null>(null)
  const activeKey = picked ?? firstOpenKey

  const cells = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor])
  const monthLabel = `${MONTHS[cursor.month]} ${cursor.year}`

  const active = activeKey ? days.get(activeKey) : undefined
  const bands = useMemo(() => groupByBand(active?.slots ?? []), [active])

  // month is 0-11, same as istParts and Date.
  const step = (delta: number) => setCursor((c) => {
    const m = c.month + delta
    if (m < 0) return { year: c.year - 1, month: 11 }
    if (m > 11) return { year: c.year + 1, month: 0 }
    return { year: c.year, month: m }
  })

  const atToday = cursor.year === today.year && cursor.month === today.month

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <CalendarDays size={17} /> {monthLabel}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => step(-1)}
            disabled={atToday}
            aria-label="Previous month"
            title={atToday ? 'This is the current month' : 'Previous month'}
          >
            <ChevronLeft size={14} />
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => step(1)} aria-label="Next month">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="cal-grid cal-head">
        {DOW.map((d, i) => <span key={i} className="cal-dow">{d}</span>)}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="cal-cell empty" />
          const k = dayKey(cursor.year, cursor.month, d)
          const meta = days.get(k)
          const isToday = atToday && d === today.day
          const hasOpen = (meta?.open ?? 0) > 0
          const hasSession = (meta?.sessions.length ?? 0) > 0
          const isActive = k === activeKey
          const label = [
            `${d} ${monthLabel}`,
            hasOpen ? `${meta!.open} open time${meta!.open === 1 ? '' : 's'}` : 'no open times',
            hasSession ? `${meta!.sessions.length} booked session${meta!.sessions.length === 1 ? '' : 's'}` : null,
          ].filter(Boolean).join(' · ')
          return (
            <button
              key={i}
              type="button"
              onClick={() => hasOpen && setPicked(k)}
              disabled={!hasOpen}
              aria-label={label}
              title={label}
              aria-pressed={isActive}
              className={[
                'cal-cell', 'cal-pick',
                isToday ? 'today' : '',
                hasOpen ? 'has-open' : '',
                hasSession ? 'has-session' : '',
                isActive ? 'is-active' : '',
              ].filter(Boolean).join(' ')}
            >
              <span>{d}</span>
              {/* The day's own summary, so the grid carries information rather
                  than only a dot: how many times are open, and a marker when a
                  session is already booked. */}
              {hasOpen && <span className="cal-open">{meta!.open}</span>}
              {hasSession && <span className="cal-dot" />}
            </button>
          )
        })}
      </div>

      <div className="cal-legend">
        <span><i className="dot-today" /> Today</span>
        <span><i className="dot-open" /> Open times</span>
        <span><i className="dot-session" /> Your session</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Globe size={12} /> {IST_LABEL}
        </span>
      </div>

      {/* The chosen day */}
      <div style={{ borderTop: '1px solid var(--c-line)', marginTop: 14, paddingTop: 14 }}>
        {!activeKey ? (
          <p className="muted" style={{ margin: 0 }}>
            No open times on this calendar yet. Try the next month, or contact support.
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--c-charcoal)' }}>
                {longDayLabel(activeKey)}
              </div>
              <span className="muted" style={{ fontSize: 12.5 }}>
                {active?.open ?? 0} open · times in {IST_LABEL}
              </span>
            </div>

            {active && active.sessions.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {active.sessions.map((b) => (
                  <div key={b.iso} className="muted" style={{ fontSize: 12.5 }}>
                    You already have <b>{b.timeLabel}</b> with {b.expert}
                    {b.status === 'COMPLETED' ? ' (completed)' : ''}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SLOT_BANDS.map((band) => {
                const list = bands[band.key]
                if (!list || list.length === 0) return null
                return (
                  <div key={band.key}>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>{band.label}</div>
                    <div className="slot-times">
                      {list.map((s) => (
                        <button
                          key={s.iso}
                          type="button"
                          disabled={s.blocked || disabled}
                          onClick={() => onPick(s.iso)}
                          title={s.blocked ? 'Not available' : undefined}
                          className={`slot-chip${selectedIso === s.iso ? ' selected' : ''}${s.blocked ? ' taken' : ''}`}
                        >
                          {s.blocked ? `${s.time} · taken` : s.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
              {(active?.open ?? 0) === 0 && (
                <p className="muted" style={{ margin: 0 }}>Nothing open on this day.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
