'use client'

import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { SLOT_GROUPS, SLOT_GROUP_KEYS, NIGHT_SHIFT_NOTE } from '@/lib/expert'

/**
 * Availability as time BLOCKS rather than twenty-four checkboxes.
 *
 * Clinicians think in stretches — "I work 9 to 1" — not in individual hours, so
 * the picker takes a from/to range and shows what's chosen as removable chips.
 * The underlying storage is still a set of whole hours, and the component emits
 * one hidden input per hour under `name`, so the existing server actions read
 * exactly the same FormData they always did.
 *
 * Ranges wrap past midnight: 11 PM to 6 AM is a night shift, not an error. The
 * "to" hour is EXCLUSIVE — a 9-to-1 block is the four slots 9, 10, 11, 12 —
 * because that is how people say it, and an inclusive end would silently book
 * an extra hour.
 */

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i)

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

/** Every hour in [from, to), wrapping past midnight when to <= from. */
function hoursInRange(from: number, to: number): number[] {
  const span = to > from ? to - from : 24 - from + to
  return Array.from({ length: span }, (_, i) => (from + i) % 24)
}

export function TimeBlockPicker({
  name,
  initial = [],
  compact = false,
}: {
  /** Form field name — one hidden input per selected hour. */
  name: string
  initial?: number[]
  /** Drops the night-shift note; for the tighter time-off form. */
  compact?: boolean
}) {
  const [hours, setHours] = useState<Set<number>>(() => new Set(initial))
  const [from, setFrom] = useState(9)
  const [to, setTo] = useState(13)

  const blocks = useMemo(() => toBlocks([...hours]), [hours])

  const addRange = () => setHours((prev) => {
    const next = new Set(prev)
    for (const h of hoursInRange(from, to)) next.add(h)
    return next
  })
  const removeBlock = (b: { from: number; to: number }) => setHours((prev) => {
    const next = new Set(prev)
    for (const h of hoursInRange(b.from, b.to)) next.delete(h)
    return next
  })
  const addPreset = (key: (typeof SLOT_GROUP_KEYS)[number]) => setHours((prev) => {
    const next = new Set(prev)
    for (const h of SLOT_GROUPS[key].hours) next.add(h)
    return next
  })

  const nightSelected = SLOT_GROUPS.night.hours.some((h) => hours.has(h))

  return (
    <div>
      {/* The real payload: the server actions still read repeated `name` values. */}
      {[...hours].sort((a, b) => a - b).map((h) => (
        <input key={h} type="hidden" name={name} value={h} />
      ))}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="eyebrow">From</span>
          <select className="field-select" value={from} onChange={(e) => setFrom(Number(e.target.value))} style={{ minWidth: 104 }}>
            {ALL_HOURS.map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="eyebrow">To</span>
          <select className="field-select" value={to} onChange={(e) => setTo(Number(e.target.value))} style={{ minWidth: 104 }}>
            {ALL_HOURS.map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
          </select>
        </label>
        <button type="button" className="btn btn-outline btn-sm" onClick={addRange}>
          <Plus size={13} /> Add block
        </button>
        {hours.size > 0 && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setHours(new Set())}>
            Clear all
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, alignItems: 'center' }}>
        <span className="muted" style={{ fontSize: 12 }}>Quick add:</span>
        {SLOT_GROUP_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => addPreset(key)}
            className="btn btn-outline btn-sm"
            style={{ padding: '4px 11px', fontSize: 12 }}
          >
            {SLOT_GROUPS[key].label.split(' · ')[0]}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        {blocks.length === 0 ? (
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>
            Nothing selected — this day is closed.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {blocks.map((b) => (
              <span
                key={`${b.from}-${b.to}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  fontSize: 13, fontWeight: 700, color: 'var(--c-charcoal)',
                  background: 'var(--c-coral-pale)', border: '1px solid rgba(200,85,61,.22)',
                  padding: '5px 8px 5px 12px', borderRadius: 20,
                }}
              >
                {hourLabel(b.from)} – {hourLabel(b.to)}
                <button
                  type="button"
                  onClick={() => removeBlock(b)}
                  aria-label={`Remove ${hourLabel(b.from)} to ${hourLabel(b.to)}`}
                  style={{
                    display: 'inline-flex', border: 'none', background: 'none', cursor: 'pointer',
                    color: 'var(--c-coral-d)', padding: 2,
                  }}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
            <span className="muted" style={{ fontSize: 12.5, alignSelf: 'center' }}>
              {hours.size} slot{hours.size === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>

      {!compact && nightSelected && (
        <p className="muted" style={{ fontSize: 11.5, lineHeight: 1.45, margin: '10px 0 0' }}>
          ⭑ {NIGHT_SHIFT_NOTE}
        </p>
      )}
    </div>
  )
}
