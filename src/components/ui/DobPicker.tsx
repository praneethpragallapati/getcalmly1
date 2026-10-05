'use client'

import { useEffect, useId, useLayoutEffect, useRef } from 'react'

const ROW = 40 // px per row; three rows show, the middle one is the choice
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// Where the wheels rest before a date is chosen.
const DEFAULT = { d: 1, m: 1, y: 1995 }

const pad = (n: number) => String(n).padStart(2, '0')
const daysIn = (m: number, y: number) => new Date(y, m, 0).getDate()

function parse(v: string): { d: number; m: number; y: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  return m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : null
}

/**
 * Date of birth as three scrolling wheels, day / month / year (dd/mm/yyyy),
 * instead of a calendar. The value stays yyyy-mm-dd, like a date input's, so
 * it saves exactly as before. Scroll, tap a row, or use the arrow keys.
 */
export default function DobPicker({
  value,
  onChange,
  label = 'Date of birth',
}: {
  value: string
  onChange: (v: string) => void
  label?: string
}) {
  const thisYear = new Date().getFullYear()
  const years = Array.from({ length: 101 }, (_, i) => thisYear - 100 + i)
  const cur = parse(value) ?? DEFAULT
  const days = Array.from({ length: daysIn(cur.m, cur.y) }, (_, i) => i + 1)

  function set(next: Partial<typeof cur>) {
    const n = { ...cur, ...next }
    n.d = Math.min(n.d, daysIn(n.m, n.y))
    onChange(`${n.y}-${pad(n.m)}-${pad(n.d)}`)
  }

  return (
    <div>
      <div
        className="dob"
        role="group"
        aria-label={`${label}, day month year`}
        style={{ opacity: value ? 1 : 0.85 }}
      >
        <span className="dob-band" aria-hidden />
        <Wheel label="Day" items={days.map(pad)} index={cur.d - 1} onPick={(i) => set({ d: i + 1 })} />
        <Wheel label="Month" items={MONTHS.map((n, i) => `${pad(i + 1)} ${n}`)} index={cur.m - 1} onPick={(i) => set({ m: i + 1 })} />
        <Wheel label="Year" items={years.map(String)} index={years.indexOf(cur.y)} onPick={(i) => set({ y: years[i] })} wide />
      </div>
      <p className="dob-read" aria-live="polite">
        {value ? `${pad(cur.d)}/${pad(cur.m)}/${cur.y}` : 'DD/MM/YYYY · scroll to choose'}
      </p>
    </div>
  )
}

function Wheel({
  label, items, index, onPick, wide,
}: {
  label: string
  items: string[]
  index: number
  onPick: (i: number) => void
  wide?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const uid = useId()
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null)
  const i = Math.max(0, Math.min(items.length - 1, index))

  // Keep the wheel on the chosen row (on load, and when the day list shrinks).
  useLayoutEffect(() => {
    const el = ref.current
    if (el && Math.abs(el.scrollTop - i * ROW) > 1) el.scrollTop = i * ROW
  }, [i, items.length])

  useEffect(() => () => { if (settle.current) clearTimeout(settle.current) }, [])

  function onScroll() {
    const el = ref.current
    if (!el) return
    if (settle.current) clearTimeout(settle.current)
    // Once the scroll comes to rest, the row in the middle is the choice.
    settle.current = setTimeout(() => {
      const at = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ROW)))
      if (at !== i) onPick(at)
    }, 110)
  }

  function go(to: number) {
    const t = Math.max(0, Math.min(items.length - 1, to))
    ref.current?.scrollTo({ top: t * ROW, behavior: 'smooth' })
    if (t !== i) onPick(t)
  }

  return (
    <div
      ref={ref}
      className={`dob-col${wide ? ' wide' : ''}`}
      role="listbox"
      aria-label={label}
      aria-activedescendant={`${uid}-${i}`}
      tabIndex={0}
      onScroll={onScroll}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); go(i + 1) }
        if (e.key === 'ArrowUp') { e.preventDefault(); go(i - 1) }
      }}
    >
      <div style={{ height: ROW }} aria-hidden />
      {items.map((t, k) => (
        <div
          key={t}
          id={`${uid}-${k}`}
          role="option"
          aria-selected={k === i}
          className={`dob-row${k === i ? ' on' : ''}`}
          onClick={() => go(k)}
        >
          {t}
        </div>
      ))}
      <div style={{ height: ROW }} aria-hidden />
    </div>
  )
}
