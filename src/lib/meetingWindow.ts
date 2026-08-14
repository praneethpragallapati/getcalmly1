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
