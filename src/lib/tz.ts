/**
 * India-first time handling.
 *
 * The app runs on Vercel, whose servers are in UTC. `Date#setHours` and
 * `Date#toLocaleString` (without an explicit `timeZone`) both follow the
 * server's timezone, so on production a slot built as `setHours(10, 0)` becomes
 * 10:00 *UTC* (= 3:30 PM IST) and is *labelled* "10:00 am". A patient in India
 * books what looks like a 10 am slot but really schedules it for 3:30 pm IST —
 * which is why an elapsed morning session was still showing as "upcoming".
 *
 * These helpers pin everything to India Standard Time (Asia/Kolkata, a fixed
 * +05:30 with no DST) regardless of where the code runs, so a "10:00 am" slot
 * always means 10:00 am IST both when it is created and when it is displayed.
 */

export const IST_TZ = 'Asia/Kolkata'

/** IST is a fixed offset (+05:30) with no daylight saving. */
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000

/** Format an instant for display to Indian users, always in IST. */
export function fmtIST(d: Date, opts: Intl.DateTimeFormatOptions): string {
  return d.toLocaleString('en-IN', { ...opts, timeZone: IST_TZ })
}

/** The IST calendar/clock parts (year, month 0-11, day, weekday, hour, minute) of an instant. */
export function istParts(d: Date): {
  year: number
  month: number
  day: number
  dow: number
  hour: number
  minute: number
} {
  // Shift the instant by the IST offset, then read it as if it were UTC — the
  // UTC fields now hold the IST wall-clock values.
  const shifted = new Date(d.getTime() + IST_OFFSET_MS)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    dow: shifted.getUTCDay(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  }
}

/** The absolute instant for a given IST wall-clock time (fixed +05:30). */
export function istWallClock(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(year, month, day, hour, minute, 0, 0) - IST_OFFSET_MS)
}

/**
 * Parse an `<input type="datetime-local">` value ("YYYY-MM-DDTHH:mm") as an IST
 * wall-clock time. A bare `new Date(value)` reads it in the SERVER timezone
 * (UTC on Vercel), so a clinician picking 2:00 PM would land at 7:30 PM IST.
 * Returns null for anything that isn't a well-formed local datetime string.
 */
export function istWallClockFromInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (!m) return null
  const d = istWallClock(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])
  return Number.isNaN(d.getTime()) ? null : d
}
