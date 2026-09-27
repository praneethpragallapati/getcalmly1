'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { CalendarOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { TimeBlockPicker } from './TimeBlockPicker'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_DAYS = 92

/** YYYY-MM-DD for a calendar day (month is 0-based). */
function key(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Today's date in India, as YYYY-MM-DD, whatever the browser's timezone. */
function todayIst(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

/**
 * Take one or many dates out of the calendar.
 *
 * Click a day to select it, or press and drag across days to select a run
 * (a week away, say). Dragging from a selected day clears instead. Works with
 * touch: the grid tracks the pointer itself rather than relying on hover.
 *
 * "The whole day" is the default; picking specific hours is the deliberate
 * second option, and applies to every selected date.
 */
export function BlockDateForm({
  action,
  blocked = [],
}: {
  action: (formData: FormData) => void | Promise<void>
  /** Dates already blocked (YYYY-MM-DD), marked on the calendar. */
  blocked?: string[]
}) {
  const [today] = useState(todayIst)
  const [ty, tm] = today.split('-').map(Number)
  const [view, setView] = useState({ y: ty, m: tm - 1 })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [wholeDay, setWholeDay] = useState(true)
  const [pending, startTransition] = useTransition()
  const blockedSet = useMemo(() => new Set(blocked), [blocked])

  // Drag state: whether this drag adds or removes, and the days it has touched.
  const drag = useRef<{ adding: boolean; seen: Set<string> } | null>(null)

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(view.y, view.m, 1))
    const lead = (first.getUTCDay() + 6) % 7 // Monday-first
    const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate()
    const out: (string | null)[] = Array(lead).fill(null)
    for (let d = 1; d <= days; d++) out.push(key(view.y, view.m, d))
    while (out.length % 7) out.push(null)
    return out
  }, [view])

  const monthLabel = new Date(Date.UTC(view.y, view.m, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const atCurrentMonth = view.y === ty && view.m === tm - 1

  function apply(day: string) {
    const d = drag.current
    if (!d || d.seen.has(day) || day < today) return
    d.seen.add(day)
    setSelected((prev) => {
      const next = new Set(prev)
      if (d.adding) {
        if (next.size < MAX_DAYS) next.add(day)
      } else next.delete(day)
      return next
    })
  }

  function dayAt(x: number, y: number): string | null {
    const el = document.elementFromPoint(x, y) as HTMLElement | null
    return el?.closest<HTMLElement>('[data-day]')?.dataset.day ?? null
  }

  function onPointerDown(e: React.PointerEvent) {
    const day = (e.target as HTMLElement).closest<HTMLElement>('[data-day]')?.dataset.day
    if (!day || day < today) return
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { adding: !selected.has(day), seen: new Set() }
    apply(day)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return
    const day = dayAt(e.clientX, e.clientY)
    if (day) apply(day)
  }
  function endDrag() {
    drag.current = null
  }

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(Date.UTC(v.y, v.m + delta, 1))
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() }
    })
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      await action(formData)
      setSelected(new Set())
    })
  }

  const sorted = [...selected].sort()
  const n = sorted.length
  const summary =
    n === 0
      ? 'Click a day, or press and drag across several.'
      : n === 1
        ? fmt(sorted[0])
        : isRun(sorted)
          ? `${fmt(sorted[0])} to ${fmt(sorted[n - 1])}`
          : `${n} days selected`

  return (
    <form action={submit} className="stack" style={{ gap: 14, marginBottom: 16 }}>
      {sorted.map((d) => <input key={d} type="hidden" name="date" value={d} />)}

      <div className="bd-cal">
        <div className="bd-head">
          <button type="button" className="bd-nav" onClick={() => shift(-1)} disabled={atCurrentMonth} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <span className="bd-month">{monthLabel}</span>
          <button type="button" className="bd-nav" onClick={() => shift(1)} aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="bd-grid" role="grid" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
          {WEEKDAYS.map((w) => <span key={w} className="bd-wd">{w}</span>)}
          {cells.map((d, i) =>
            d === null ? (
              <span key={`x${i}`} />
            ) : (
              <span
                key={d}
                data-day={d}
                role="gridcell"
                aria-selected={selected.has(d)}
                tabIndex={d < today ? -1 : 0}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  setSelected((prev) => {
                    const next = new Set(prev)
                    if (next.has(d)) next.delete(d)
                    else if (next.size < MAX_DAYS) next.add(d)
                    return next
                  })
                }}
                className={`bd-day${d < today ? ' past' : ''}${selected.has(d) ? ' on' : ''}${blockedSet.has(d) ? ' blocked' : ''}${d === today ? ' today' : ''}`}
                title={blockedSet.has(d) ? 'Already blocked' : undefined}
              >
                {Number(d.slice(8))}
              </span>
            ),
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--c-charcoal)' }}>{summary}</span>
        {n > 0 && (
          <button type="button" className="link-action" onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Clear
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, cursor: 'pointer' }}>
          <input type="radio" name="scope" checked={wholeDay} onChange={() => setWholeDay(true)} />
          Unavailable all day
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, cursor: 'pointer' }}>
          <input type="radio" name="scope" checked={!wholeDay} onChange={() => setWholeDay(false)} />
          Only certain hours
        </label>
      </div>

      {/* Unmounted when the whole day is off, so no hoursOff reach the action,
          which is exactly how it reads "block everything". */}
      {!wholeDay && (
        <div style={{ borderTop: '1px solid var(--c-line)', paddingTop: 12 }}>
          <TimeBlockPicker name="hoursOff" compact />
          <p className="muted" style={{ fontSize: 12, margin: '8px 0 0' }}>
            These hours are removed from {n > 1 ? 'each selected date' : 'that date'} only. Everything else in your weekly pattern still stands.
          </p>
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-sm" disabled={n === 0 || pending} style={{ alignSelf: 'flex-start' }}>
        <CalendarOff size={14} /> {pending ? 'Blocking…' : n > 1 ? `Block ${n} days` : 'Block this date'}
      </button>
    </form>
  )
}

function fmt(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}

/** True when the sorted days are consecutive. */
function isRun(days: string[]): boolean {
  for (let i = 1; i < days.length; i++) {
    if (Date.parse(days[i]) - Date.parse(days[i - 1]) !== 86_400_000) return false
  }
  return true
}
