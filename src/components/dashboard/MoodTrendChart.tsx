'use client'

import { useState } from 'react'
import type { MoodWeekPoint } from '@/data/dashboardDemo'

type Range = 'week' | 'sixWeeks'
type Key = 'mood' | 'energy' | 'calm'

/** Muted, harmonious trio — one dominant hue, two supporting. */
const SERIES: { key: Key; label: string; color: string }[] = [
  { key: 'mood', label: 'Mood', color: '#C8553D' },
  { key: 'energy', label: 'Energy', color: '#D9A441' },
  { key: 'calm', label: 'Calm', color: '#4E9E8F' },
]

const W = 640
const H = 210
const PAD_X = 26
const PAD_T = 18
const PAD_B = 34

/** Catmull-Rom → cubic bezier, so the line reads as a soft curve not a zigzag. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

/**
 * Mood over time — a soft area/line chart rather than grouped bars, with a
 * week / 6-week range toggle and per-series toggles. Mood leads as a filled
 * gradient; energy and calm sit behind it as thin lines so the card reads calm
 * instead of busy.
 */
export function MoodTrendChart({
  data,
  avgMood,
  sixWeeks = [],
}: {
  data: MoodWeekPoint[]
  avgMood: number
  sixWeeks?: MoodWeekPoint[]
}) {
  const [range, setRange] = useState<Range>('week')
  const [on, setOn] = useState<Record<Key, boolean>>({ mood: true, energy: true, calm: true })
  const [hover, setHover] = useState<number | null>(null)

  const canCompare = sixWeeks.length > 0
  const points = range === 'sixWeeks' && canCompare ? sixWeeks : data
  const hasData = points.some((p) => p.mood > 0 || p.energy > 0 || p.calm > 0)

  const scored = points.filter((p) => p.mood > 0)
  const shownAvg =
    range === 'sixWeeks'
      ? scored.length ? Math.round((scored.reduce((a, p) => a + p.mood, 0) / scored.length) * 10) / 10 : 0
      : avgMood

  const n = Math.max(points.length, 2)
  const x = (i: number) => PAD_X + (i * (W - PAD_X * 2)) / (n - 1)
  const y = (v: number) => PAD_T + (1 - v / 10) * (H - PAD_T - PAD_B)

  return (
    <div className="card mood-card">
      {/* Header */}
      <div className="mood-head">
        <div>
          <div className="eyebrow">HOW YOU&apos;VE BEEN</div>
          <div className="mood-title">{range === 'sixWeeks' ? 'Last 6 weeks' : 'This week'}</div>
        </div>
        <div className="mood-head-right">
          <div className="mood-avg">
            <span className="mood-avg-n">{hasData && shownAvg > 0 ? shownAvg.toFixed(1) : '—'}</span>
            <span className="mood-avg-l">avg mood</span>
          </div>
          {canCompare && (
            <div className="seg">
              <button className={`seg-btn${range === 'week' ? ' on' : ''}`} onClick={() => { setRange('week'); setHover(null) }}>Week</button>
              <button className={`seg-btn${range === 'sixWeeks' ? ' on' : ''}`} onClick={() => { setRange('sixWeeks'); setHover(null) }}>6 weeks</button>
            </div>
          )}
        </div>
      </div>

      {!hasData ? (
        <p className="muted mood-empty">
          {range === 'sixWeeks'
            ? 'Nothing logged in the last six weeks yet — each point here becomes one week’s average.'
            : 'No check-ins yet this week. Save today’s check-in and the line starts here.'}
        </p>
      ) : (
        <div className="mood-chart-wrap">
          <svg viewBox={`0 0 ${W} ${H}`} className="mood-svg" role="img" aria-label="Mood over time">
            <defs>
              {SERIES.map((s) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>

            {/* Soft baseline grid at 0 / 5 / 10 */}
            {[0, 5, 10].map((v) => (
              <g key={v}>
                <line x1={PAD_X} x2={W - PAD_X} y1={y(v)} y2={y(v)} className="mood-grid" />
                <text x={0} y={y(v) + 4} className="mood-axis">{v}</text>
              </g>
            ))}

            {/* Series — mood filled, the other two as thin lines */}
            {SERIES.filter((s) => on[s.key]).map((s) => {
              const pts = points.map((p, i) => ({ x: x(i), y: y(p[s.key]) }))
              const line = smoothPath(pts)
              const area = `${line} L ${pts[pts.length - 1].x} ${y(0)} L ${pts[0].x} ${y(0)} Z`
              return (
                <g key={s.key}>
                  {s.key === 'mood' && <path d={area} fill={`url(#grad-${s.key})`} className="mood-area" />}
                  <path
                    d={line}
                    pathLength={1}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={s.key === 'mood' ? 3 : 1.75}
                    strokeOpacity={s.key === 'mood' ? 1 : 0.55}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mood-line"
                  />
                  {s.key === 'mood' &&
                    pts.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={hover === i ? 5.5 : 3.5}
                        fill="#fff"
                        stroke={s.color}
                        strokeWidth={2.5}
                        className="mood-dot"
                      />
                    ))}
                </g>
              )
            })}

            {/* Hover columns + x labels */}
            {points.map((p, i) => (
              <g key={i}>
                {hover === i && <line x1={x(i)} x2={x(i)} y1={PAD_T} y2={y(0)} className="mood-hairline" />}
                <text x={x(i)} y={H - 10} className={`mood-xlab${hover === i ? ' on' : ''}`}>{p.day}</text>
                <rect
                  x={x(i) - (W - PAD_X * 2) / (n - 1) / 2}
                  y={0}
                  width={(W - PAD_X * 2) / (n - 1)}
                  height={H}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
              </g>
            ))}
          </svg>

          {hover !== null && points[hover] && (
            <div className="mood-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
              <div className="mood-tip-day">{points[hover].day}</div>
              {SERIES.filter((s) => on[s.key]).map((s) => (
                <div key={s.key} className="mood-tip-row">
                  <i style={{ background: s.color }} />
                  {s.label}
                  <b>{points[hover]![s.key]}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Series toggles */}
      <div className="mood-legend">
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`mood-chip${on[s.key] ? ' on' : ''}`}
            onClick={() => setOn((o) => ({ ...o, [s.key]: !o[s.key] }))}
            style={on[s.key] ? { borderColor: s.color, color: s.color, background: `${s.color}14` } : undefined}
          >
            <i style={{ background: on[s.key] ? s.color : '#C3CDD6' }} />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
