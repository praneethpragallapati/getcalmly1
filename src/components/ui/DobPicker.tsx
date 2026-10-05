'use client'

import { useState } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n: number) => String(n).padStart(2, '0')
const daysIn = (m: number, y: number) => new Date(y || 2000, m, 0).getDate()

function parse(v: string): { d: number; m: number; y: number } {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  return r ? { y: Number(r[1]), m: Number(r[2]), d: Number(r[3]) } : { y: 0, m: 0, d: 0 }
}

/**
 * Date of birth as day / month / year (dd/mm/yyyy): three plain selects, which
 * phones open as their own scrolling pickers. The value is yyyy-mm-dd once all
 * three are chosen (empty until then), so it saves exactly like a date input.
 */
export default function DobPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [parts, setParts] = useState(() => parse(value))
  const thisYear = new Date().getFullYear()
  const years = Array.from({ length: 101 }, (_, i) => thisYear - i)
  const days = Array.from({ length: daysIn(parts.m || 1, parts.y) }, (_, i) => i + 1)

  function set(next: Partial<typeof parts>) {
    const n = { ...parts, ...next }
    // 31 then a shorter month: keep the day inside that month.
    if (n.d && n.m) n.d = Math.min(n.d, daysIn(n.m, n.y))
    setParts(n)
    onChange(n.d && n.m && n.y ? `${n.y}-${pad(n.m)}-${pad(n.d)}` : '')
  }

  return (
    <div className="dob" role="group" aria-label="Date of birth, day month year">
      <select className="dob-sel" aria-label="Day" value={parts.d || ''} onChange={(e) => set({ d: Number(e.target.value) })}>
        <option value="" disabled>DD</option>
        {days.map((d) => <option key={d} value={d}>{pad(d)}</option>)}
      </select>
      <select className="dob-sel" aria-label="Month" value={parts.m || ''} onChange={(e) => set({ m: Number(e.target.value) })}>
        <option value="" disabled>MM</option>
        {MONTHS.map((n, i) => <option key={n} value={i + 1}>{pad(i + 1)} · {n}</option>)}
      </select>
      <select className="dob-sel dob-year" aria-label="Year" value={parts.y || ''} onChange={(e) => set({ y: Number(e.target.value) })}>
        <option value="" disabled>YYYY</option>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  )
}
