'use client'

import { useId, useState } from 'react'
import type { MonthMoney, CategoryTotal } from '@/lib/ledger'
import { MONEY_IN_COLOR, MONEY_OUT_COLOR } from '@/lib/ledger'

/**
 * Money charts — hand-rolled SVG, matching how the rest of this codebase draws
 * (there is no chart library, and adding one for two charts isn't worth it).
 *
 * The palette is not eyeballed: the hues were run through the data-viz
 * validator and re-stepped until every check passed. In/out is blue vs coral
 * rather than the obvious green vs red, which is the classic colourblind trap.
 *
 * Both charts are interactive: hovering a month or a category shows a tooltip
 * with the exact figures, and both back onto a table view so no number is
 * gated behind a hover.
 */

const RUPEE = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

/**
 * Axis ticks at clean round numbers, so they read without decoding.
 *
 * The last tick is always >= max. Stopping at the last tick BELOW max would put
 * the top of the scale under the tallest bar, and the bar would be clipped to
 * the plot — silently reading as a smaller number than it is.
 */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0]
  const raw = max / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10
  const out: number[] = []
  for (let v = 0; ; v += step) {
    out.push(v)
    if (v >= max - step * 0.001) break
  }
  return out
}

const GRID = 'rgba(28,43,58,.12)'
const INK_MUTED = 'var(--c-gray)'

// ── Money in vs out, by month ────────────────────────────────────────────────

export function MoneyFlowChart({ months }: { months: MonthMoney[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const clipId = useId()
  if (months.length === 0) return <p className="muted" style={{ fontSize: 13.5 }}>No money recorded yet.</p>

  // PAD_T leaves room for the topmost tick label, which sits ON the top
  // gridline — at 16 it was being clipped by the viewBox edge.
  const W = 720, H = 268, PAD_L = 64, PAD_R = 16, PAD_T = 24, PAD_B = 40
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B
  const max = Math.max(1, ...months.map((m) => Math.max(m.in, m.out)))
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1] || 1
  const y = (v: number) => PAD_T + plotH - (v / top) * plotH

  const band = plotW / months.length
  // ≤24px bars, never filling the band — the leftover is deliberate air.
  const barW = Math.min(24, Math.max(6, band / 2 - 5))
  const active = hover != null ? months[hover] : null

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Money in and out by month" style={{ display: 'block' }}>
        <defs>
          <clipPath id={clipId}><rect x={PAD_L} y={PAD_T} width={plotW} height={plotH + 1} /></clipPath>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={PAD_L - 8} y={y(t) + 4} textAnchor="end" fontSize={10.5} fill={INK_MUTED}>
              {t >= 1000 ? `₹${(t / 1000).toLocaleString('en-IN')}k` : `₹${t}`}
            </text>
          </g>
        ))}

        <g clipPath={`url(#${clipId})`}>
          {months.map((m, i) => {
            const cx = PAD_L + band * i + band / 2
            // 2px surface gap between the touching pair, not a stroke.
            const inX = cx - barW - 1
            const outX = cx + 1
            const on = hover === i
            return (
              <g key={m.key} opacity={hover == null || on ? 1 : 0.45}>
                <rect x={inX} y={y(m.in)} width={barW} height={Math.max(0, y(0) - y(m.in))}
                  fill={MONEY_IN_COLOR} rx={4} />
                <rect x={inX} y={Math.max(y(m.in), y(0) - 4)} width={barW} height={Math.min(4, Math.max(0, y(0) - y(m.in)))}
                  fill={MONEY_IN_COLOR} />
                <rect x={outX} y={y(m.out)} width={barW} height={Math.max(0, y(0) - y(m.out))}
                  fill={MONEY_OUT_COLOR} rx={4} />
                <rect x={outX} y={Math.max(y(m.out), y(0) - 4)} width={barW} height={Math.min(4, Math.max(0, y(0) - y(m.out)))}
                  fill={MONEY_OUT_COLOR} />
              </g>
            )
          })}
        </g>

        <line x1={PAD_L} x2={W - PAD_R} y1={y(0)} y2={y(0)} stroke={GRID} strokeWidth={1} />

        {months.map((m, i) => (
          <text key={m.key} x={PAD_L + band * i + band / 2} y={H - 22} textAnchor="middle" fontSize={10.5} fill={INK_MUTED}>
            {m.label.split(' ')[0]}
          </text>
        ))}

        {/* Hit targets are the whole band, far bigger than the bars. */}
        {months.map((m, i) => (
          <rect
            key={`hit-${m.key}`}
            x={PAD_L + band * i} y={PAD_T} width={band} height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {active && (
        <div role="status" style={{
          position: 'absolute', top: 4, right: 4, pointerEvents: 'none',
          background: '#fff', border: '1px solid rgba(28,43,58,.14)', borderRadius: 10,
          padding: '8px 11px', boxShadow: '0 8px 24px rgba(28,43,58,.12)', fontSize: 12.5, minWidth: 168,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--c-charcoal)', marginBottom: 4 }}>{active.label}</div>
          <Row swatch={MONEY_IN_COLOR} label="In" value={RUPEE(active.in)} />
          <Row swatch={MONEY_OUT_COLOR} label="Out" value={RUPEE(active.out)} />
          <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(28,43,58,.08)', display: 'flex', justifyContent: 'space-between' }}>
            <span className="muted">Net</span>
            <span style={{ fontWeight: 700, color: 'var(--c-charcoal)' }}>{RUPEE(active.net)}</span>
          </div>
        </div>
      )}

      <Legend items={[{ color: MONEY_IN_COLOR, label: 'Money in' }, { color: MONEY_OUT_COLOR, label: 'Money out' }]} />
    </div>
  )
}

function Row({ swatch, label, value }: { swatch: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'space-between' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <i style={{ width: 9, height: 9, borderRadius: 3, background: swatch, display: 'inline-block' }} />
        <span className="muted">{label}</span>
      </span>
      <span style={{ fontWeight: 700, color: 'var(--c-charcoal)' }}>{value}</span>
    </div>
  )
}

export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
      {items.map((i) => (
        <span key={i.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--c-gray-d)' }}>
          <i style={{ width: 10, height: 10, borderRadius: 3, background: i.color, display: 'inline-block' }} />
          {i.label}
        </span>
      ))}
    </div>
  )
}

// ── Spend by category ────────────────────────────────────────────────────────

/**
 * Horizontal bars, not a donut: this is magnitude by identity, and a donut
 * makes seven similar slices impossible to rank. Each bar is directly labelled,
 * which is also the secondary encoding the palette's adjacent-pair separation
 * relies on.
 */
export function CategoryBars({ rows, total }: { rows: CategoryTotal[]; total: number }) {
  const [hover, setHover] = useState<string | null>(null)
  if (rows.length === 0) return <p className="muted" style={{ fontSize: 13.5 }}>Nothing recorded yet.</p>
  const max = Math.max(...rows.map((r) => r.amount), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((r) => {
        const pct = total > 0 ? Math.round((r.amount / total) * 100) : 0
        const on = hover === r.category
        return (
          <div
            key={r.category}
            onMouseEnter={() => setHover(r.category)}
            onMouseLeave={() => setHover(null)}
            style={{ opacity: hover == null || on ? 1 : 0.55, cursor: 'default' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, marginBottom: 4 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <i style={{ width: 10, height: 10, borderRadius: 3, background: r.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--c-charcoal)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.label}
                </span>
              </span>
              <span style={{ color: 'var(--c-charcoal)', fontWeight: 700, flexShrink: 0 }}>
                {RUPEE(r.amount)} <span className="muted" style={{ fontWeight: 400 }}>· {pct}%</span>
              </span>
            </div>
            <div style={{ height: 12, background: 'rgba(28,43,58,.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(r.amount / max) * 100}%`, background: r.color, borderRadius: 4 }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
