// Pure helpers behind the patient booking calendar. Framework-agnostic and
// client-safe (no server imports), so the date maths can be tested on its own.
import { istParts, istWallClock } from '@/lib/tz'
import type { ExpertSlot } from '@/lib/sessions'

/** Stated on the booking UI so a patient abroad never has to guess the clock. */
export const IST_LABEL = 'IST (GMT+5:30)'

/*
 * Month and weekday names as DATA, not Intl.
 *
 * The booking calendar is a client component, so it renders on the server and
 * again in the browser. Intl output can differ between the two — Node's ICU and
 * the browser disagree on en-IN punctuation ("Friday 21 August" vs
 * "Friday, 21 August") — and React reports that as a hydration mismatch. Fixed
 * strings render identically everywhere.
 */
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** "Friday, 21 August" for a YYYY-MM-DD IST day key. */
export function longDayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  // Midday IST, so the weekday can never slide to the day either side.
  const dow = istParts(istWallClock(y, m - 1, d, 12)).dow
  return `${WEEKDAYS[dow]}, ${d} ${MONTHS[m - 1]}`
}

/** A slot plus whether it can actually be picked (taken, or past pack expiry). */
export type SlotWithState = ExpertSlot & { blocked: boolean }

export type DayMeta = {
  open: number
  taken: number
  sessions: { iso: string; timeLabel: string; expert: string; status: string }[]
  slots: SlotWithState[]
}

/**
 * `YYYY-MM-DD` for an IST calendar day.
 *
 * `month` is 0-11 throughout this module, matching istParts() and the Date
 * constructor. Mixing 0-11 and 1-12 across a date module is how off-by-one-month
 * bugs get in, so there is exactly one convention here.
 */
export function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Cells for a month grid: leading nulls to line up the 1st under its weekday,
 * then 1..daysInMonth. `month` is 0-11.
 */
export function buildMonth(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

/**
 * The parts of the day people book in. Deliberately the same four bands the
 * clinician sets availability in, so both sides speak about time the same way.
 */
export const SLOT_BANDS = [
  { key: 'morning', label: 'Morning · 6 AM–12 PM', hours: [6, 7, 8, 9, 10, 11] },
  { key: 'afternoon', label: 'Afternoon · 12–5 PM', hours: [12, 13, 14, 15, 16] },
  { key: 'evening', label: 'Evening · 5–11 PM', hours: [17, 18, 19, 20, 21, 22] },
  { key: 'night', label: 'Night · 11 PM–6 AM', hours: [23, 0, 1, 2, 3, 4, 5] },
] as const

export type BandKey = (typeof SLOT_BANDS)[number]['key']

/** Bucket a day's slots into the four bands, by their IST hour. */
export function groupByBand(slots: SlotWithState[]): Record<BandKey, SlotWithState[]> {
  const out = { morning: [], afternoon: [], evening: [], night: [] } as Record<BandKey, SlotWithState[]>
  for (const s of slots) {
    const hour = istParts(new Date(s.iso)).hour
    const band = SLOT_BANDS.find((b) => (b.hours as readonly number[]).includes(hour))
    out[band ? band.key : 'morning'].push(s)
  }
  for (const k of Object.keys(out) as BandKey[]) {
    out[k].sort((a, b) => Date.parse(a.iso) - Date.parse(b.iso))
  }
  return out
}
