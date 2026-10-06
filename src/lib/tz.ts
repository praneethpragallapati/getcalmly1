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

// ── Any time zone (the patient's own) ───────────────────────────────────────
// Everything a patient sees, and every "day" counted for them (streaks, today's
// check-in, daily/weekly checks), runs on their own clock. Their zone is kept on
// their account (lib/userTz) and synced from the browser; IST is the fallback.

/** Whether `tz` is a time zone this runtime knows (e.g. "Asia/Dubai"). */
export function isValidTz(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return false
  try {
    new Intl.DateTimeFormat('en-IN', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

/** Format an instant in a given zone (IST when none or unknown). */
export function fmtIn(tz: string | null | undefined, d: Date, opts: Intl.DateTimeFormatOptions): string {
  return d.toLocaleString('en-IN', { ...opts, timeZone: isValidTz(tz) ? tz : IST_TZ })
}

const partsCache = new Map<string, Intl.DateTimeFormat>()
function partsFormatter(tz: string): Intl.DateTimeFormat {
  let f = partsCache.get(tz)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short',
    })
    partsCache.set(tz, f)
  }
  return f
}
const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

/** Wall-clock parts of an instant in a zone (month 0-11), like istParts. */
export function partsIn(tz: string | null | undefined, d: Date): { year: number; month: number; day: number; dow: number; hour: number; minute: number } {
  const zone = isValidTz(tz) ? tz : IST_TZ
  if (zone === IST_TZ) return istParts(d)
  const p: Record<string, string> = {}
  for (const x of partsFormatter(zone).formatToParts(d)) p[x.type] = x.value
  return { year: +p.year, month: +p.month - 1, day: +p.day, dow: DOW[p.weekday] ?? 0, hour: +p.hour % 24, minute: +p.minute }
}

/** The instant of a wall-clock time in a zone (handles daylight saving). */
export function wallClockIn(tz: string | null | undefined, year: number, month: number, day: number, hour = 0, minute = 0): Date {
  const zone = isValidTz(tz) ? tz : IST_TZ
  if (zone === IST_TZ) return istWallClock(year, month, day, hour, minute)
  // Guess as UTC, then correct by the zone's offset at that moment (twice, for DST edges).
  const want = Date.UTC(year, month, day, hour, minute)
  let t = want
  for (let i = 0; i < 2; i++) {
    const p = partsIn(zone, new Date(t))
    const got = Date.UTC(p.year, p.month, p.day, p.hour, p.minute)
    t += want - got
  }
  return new Date(t)
}

/** "2026-10-06": the calendar day an instant falls on in a zone. */
export function dayKeyIn(tz: string | null | undefined, d: Date): string {
  const p = partsIn(tz, d)
  return `${p.year}-${String(p.month + 1).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`
}

/** Start of the zone's calendar day containing `d`, as an instant (ms). */
export function startOfDayIn(tz: string | null | undefined, d: Date): number {
  const p = partsIn(tz, d)
  return wallClockIn(tz, p.year, p.month, p.day, 0, 0).getTime()
}

/** Short name for a zone to show beside times, e.g. "IST", "GST", "GMT+4". */
export function tzShortName(tz: string | null | undefined, d = new Date()): string {
  const zone = isValidTz(tz) ? tz : IST_TZ
  if (zone === IST_TZ) return 'IST'
  try {
    const n = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' }).formatToParts(d).find((x) => x.type === 'timeZoneName')?.value
    return n ?? zone
  } catch {
    return zone
  }
}

/** Consecutive days (on the zone's calendar) ending today or yesterday with an entry. */
export function streakIn(tz: string | null | undefined, dates: Date[], now = new Date()): number {
  const days = new Set(dates.map((d) => dayKeyIn(tz, d)))
  // Noon of each day stepping back, so daylight-saving shifts never skip a day.
  const noon = startOfDayIn(tz, now) + 12 * 3_600_000
  const key = (n: number) => dayKeyIn(tz, new Date(noon - n * 86_400_000))
  let n = days.has(key(0)) ? 0 : 1
  let streak = 0
  while (days.has(key(n))) { streak++; n++ }
  return streak
}

/**
 * A zone label that renders the same on the server and in the browser (no
 * Intl zone names, which differ between them): "IST (GMT+5:30)",
 * "Dubai time (GMT+4)", "New York time (GMT-4)".
 */
export function tzLabel(tz: string | null | undefined, at = new Date()): string {
  const zone = isValidTz(tz) ? tz : IST_TZ
  if (zone === IST_TZ) return 'IST (GMT+5:30)'
  const p = partsIn(zone, at)
  const offMin = Math.round((Date.UTC(p.year, p.month, p.day, p.hour, p.minute) - Math.floor(at.getTime() / 60000) * 60000) / 60000)
  const sign = offMin >= 0 ? '+' : '-'
  const h = Math.floor(Math.abs(offMin) / 60), m = Math.abs(offMin) % 60
  const city = (zone.split('/').pop() ?? zone).replace(/_/g, ' ')
  return `${city} time (GMT${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''})`
}
