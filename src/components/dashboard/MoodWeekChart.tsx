'use client'

import { useState } from 'react'
import type { MoodWeekPoint } from '@/data/dashboardDemo'

type Range = 'week' | 'sixWeeks'

/**
 * Grouped mini bar chart of Mood / Energy / Calm, with a range toggle:
 *   · This week — one bar group per day, last 7 days.
 *   · 6 weeks   — one bar group per week, each the average of that week.
 * Pure presentational; heights are % of a 0–10 scale.
 */
export function MoodWeekChart({
  data,
  avgMood,
  sixWeeks = [],
}: {
  data: MoodWeekPoint[]
  avgMood: number
  sixWeeks?: MoodWeekPoint[]
}) {
  const [range, setRange] = useState<Range>('week')
  const canCompare = sixWeeks.length > 0

  const points = range === 'sixWeeks' && canCompare ? sixWeeks : data
  const hasData = points.some((p) => p.mood > 0 || p.energy > 0 || p.calm > 0)

  // In the 6-week view the headline is the average across the weeks that have
  // data, so it describes what's actually on screen.
  const scored = points.filter((p) => p.mood > 0)
  const shownAvg =
    range === 'sixWeeks'
      ? (scored.length ? Math.round((scored.reduce((a, p) => a + p.mood, 0) / scored.length) * 10) / 10 : 0)
      : avgMood

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
        <div>
          <div className="section-title">{range === 'sixWeeks' ? 'Mood over 6 weeks' : 'Mood this week'}</div>
          {canCompare && (
            <div style={{ display: 'inline-flex', background: 'rgba(28,43,58,.05)', borderRadius: 999, padding: 3, gap: 2, marginTop: 8 }}>
              <RangeBtn on={range === 'week'} onClick={() => setRange('week')}>This week</RangeBtn>
              <RangeBtn on={range === 'sixWeeks'} onClick={() => setRange('sixWeeks')}>6 weeks</RangeBtn>
            </div>
          )}
        </div>
        <div className="big-score">
          <div className="n">{hasData && shownAvg > 0 ? shownAvg.toFixed(1) : '—'}</div>
          <div className="l">{range === 'sixWeeks' ? 'avg over 6 weeks' : 'avg this week'}</div>
        </div>
      </div>

      {!hasData && (
        <p className="muted" style={{ margin: '10px 0 2px', fontSize: 13.5, lineHeight: 1.5 }}>
          {range === 'sixWeeks'
            ? 'No check-ins in the last six weeks yet. Each bar here is one week’s average once you start tracking.'
            : 'No check-ins logged this week yet. Save today’s check-in above and your first bar appears here — only the days you track are shown.'}
        </p>
      )}

      <div className="legend">
        <span><i style={{ background: '#c8553d' }} /> Mood</span>
        <span><i style={{ background: '#6d5bd0' }} /> Energy</span>
        <span><i style={{ background: '#3d9e72' }} /> Calm</span>
      </div>

      <div className="bars">
        {points.map((p, i) => (
          <div className="bar-col" key={`${p.day}-${i}`}>
            <div className="bar-set">
              <span className="bar mood" style={{ height: `${p.mood * 10}%` }} />
              <span className="bar energy" style={{ height: `${p.energy * 10}%` }} />
              <span className="bar calm" style={{ height: `${p.calm * 10}%` }} />
            </div>
            <span className="bar-day">{p.day}</span>
          </div>
        ))}
      </div>

      {range === 'sixWeeks' && hasData && (
        <p className="muted" style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}>
          Each bar is one week’s average, labelled by the week it starts.
        </p>
      )}
    </div>
  )
}

function RangeBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 'none', cursor: 'pointer', borderRadius: 999, padding: '5px 13px', fontSize: 12.5, fontWeight: 700,
        background: on ? '#fff' : 'transparent',
        color: on ? 'var(--c-charcoal, #1C2B3A)' : 'var(--c-gray-d, #5A6A7A)',
        boxShadow: on ? '0 1px 3px rgba(28,43,58,.12)' : 'none',
        transition: 'background .15s, color .15s',
      }}
    >
      {children}
    </button>
  )
}
