import type { MoodWeekPoint } from '@/data/dashboardDemo'

/**
 * Grouped mini bar chart of Mood / Energy / Calm across the week. Pure
 * presentational — heights are % of a 0–10 scale.
 */
export function MoodWeekChart({ data, avgMood }: { data: MoodWeekPoint[]; avgMood: number }) {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 4,
        }}
      >
        <div className="section-title">Mood this week</div>
        <div className="big-score">
          <div className="n">{avgMood.toFixed(1)}</div>
          <div className="l">avg this week</div>
        </div>
      </div>
      <div className="legend">
        <span>
          <i style={{ background: '#c8553d' }} /> Mood
        </span>
        <span>
          <i style={{ background: '#6d5bd0' }} /> Energy
        </span>
        <span>
          <i style={{ background: '#3d9e72' }} /> Calm
        </span>
      </div>
      <div className="bars">
        {data.map((p) => (
          <div className="bar-col" key={p.day}>
            <div className="bar-set">
              <span className="bar mood" style={{ height: `${p.mood * 10}%` }} />
              <span className="bar energy" style={{ height: `${p.energy * 10}%` }} />
              <span className="bar calm" style={{ height: `${p.calm * 10}%` }} />
            </div>
            <span className="bar-day">{p.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
