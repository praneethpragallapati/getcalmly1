// Join-window rules for a session, shared by the server-side room gate (the
// authoritative check) and the client Join button (UX only). Framework-agnostic
// and client-safe — no server imports.
//
// Rules:
//   • No pre-join: a session can't be joined before its scheduled start.
//   • Join closes at start + duration (e.g. 45 min) for anyone who hasn't
//     already joined — you can't start a fresh join once the window is over.
//   • Someone already in the call is never cut off: if this side has already
//     joined once, re-entry stays allowed past the window (so a dropped
//     connection can reconnect and the call isn't guillotined mid-session).

export type JoinPhase = 'early' | 'open' | 'closed'

export function meetingBounds(scheduledISO: string, durationMins: number): { start: number; end: number } {
  const start = Date.parse(scheduledISO)
  const end = start + durationMins * 60_000
  return { start, end }
}

/**
 * Resolve the join phase for a session at a given instant.
 * `joinedAlready` = this participant's side has already joined once.
 */
export function joinPhase(
  scheduledISO: string,
  durationMins: number,
  nowMs: number,
  joinedAlready: boolean
): JoinPhase {
  const { start, end } = meetingBounds(scheduledISO, durationMins)
  if (nowMs < start) return 'early'
  if (nowMs > end && !joinedAlready) return 'closed'
  return 'open'
}

/**
 * The hard ceiling on a single call: two hours, no exceptions.
 *
 * Anchored to the FIRST join recorded for the session rather than to when this
 * tab happened to open, so reloading the page — or rejoining after a drop —
 * cannot buy more time. Before anyone has joined there is nothing to anchor to,
 * so the clock starts now and is re-anchored on the next load, once the join has
 * been written.
 */
export const MAX_CALL_MS = 2 * 60 * 60 * 1000
/** How long before the cut-off the warning appears. */
export const CALL_WARN_MS = 5 * 60 * 1000

export function callHardEnd(firstJoinISO: string | null, nowMs: number): number {
  const anchor = firstJoinISO ? Date.parse(firstJoinISO) : NaN
  return (Number.isNaN(anchor) ? nowMs : anchor) + MAX_CALL_MS
}

/** The earlier of the two sides' first joins, or null if neither has joined. */
export function earliestJoin(a: Date | null, b: Date | null): string | null {
  const times = [a, b].filter((d): d is Date => d instanceof Date)
  if (times.length === 0) return null
  return new Date(Math.min(...times.map((d) => d.getTime()))).toISOString()
}
