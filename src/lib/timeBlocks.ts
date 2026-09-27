/**
 * Hour and block helpers for availability, shared by server and client.
 *
 * They used to live in the TimeBlockPicker client component, and the
 * Availability page (a server component) called them from there. Server code
 * cannot call a client module's functions, so the page crashed as soon as any
 * day had saved hours. Plain module, no 'use client'.
 */

export const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i)

export function hourLabel(h: number): string {
  const ampm = h < 12 ? 'AM' : 'PM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display} ${ampm}`
}

/** Consecutive hours collapsed into [start, endExclusive] ranges for display. */
export function toBlocks(hours: number[]): { from: number; to: number }[] {
  const set = new Set(hours)
  const out: { from: number; to: number }[] = []
  // Walk 0..23 so the output is stable; a block wrapping midnight shows as two
  // (e.g. "11 PM–12 AM" and "12 AM–6 AM") only when 0 itself starts a run.
  let run: number[] = []
  for (const h of ALL_HOURS) {
    if (set.has(h)) run.push(h)
    else if (run.length) { out.push({ from: run[0], to: (run[run.length - 1] + 1) % 24 }); run = [] }
  }
  if (run.length) out.push({ from: run[0], to: (run[run.length - 1] + 1) % 24 })

  // Join a run ending at midnight with one starting at midnight — that is one
  // night shift, and showing it as two reads as a mistake.
  if (out.length > 1 && out[0].from === 0 && out[out.length - 1].to === 0) {
    const first = out.shift()!
    out[out.length - 1] = { from: out[out.length - 1].from, to: first.to }
  }
  return out
}

