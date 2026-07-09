import { CalendarDays } from 'lucide-react'

/**
 * The patient's own month-at-a-glance calendar (#9). Highlights today and dots
 * days that have a session. Pure/presentational, the page computes which days
 * are marked from the patient's appointments.
 */
export function PatientCalendar({ markedDays }: { markedDays: number[] }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const firstDay = new Date(year, month, 1).getDay() // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const marked = new Set(markedDays)

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="card">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CalendarDays size={17} /> {monthLabel}
      </div>
      <div className="cal-grid cal-head">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="cal-dow">
            {d}
          </span>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => (
          <div
            key={i}
            className={`cal-cell${d === today ? ' today' : ''}${
              d && marked.has(d) ? ' has-session' : ''
            }${d === null ? ' empty' : ''}`}
          >
            {d && <span>{d}</span>}
            {d && marked.has(d) && <span className="cal-dot" />}
          </div>
        ))}
      </div>
      <div className="cal-legend">
        <span>
          <i className="dot-today" /> Today
        </span>
        <span>
          <i className="dot-session" /> Session
        </span>
      </div>
    </div>
  )
}
