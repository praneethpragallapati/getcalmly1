import Link from 'next/link'
import { Video, FileText, Calendar, CheckCircle2, Clock } from 'lucide-react'
import { getSessionsView, getExpertCalendar } from '@/lib/sessions'
import { PatientCalendar } from '@/components/dashboard/PatientCalendar'
import { BookSession } from '@/components/dashboard/BookSession'
import type { DashSession } from '@/data/dashboardDemo'

function SessionRow({ s }: { s: DashSession }) {
  const past = s.status === 'COMPLETED'
  return (
    <div className="sess-row">
      <span className="doc-avatar" style={{ width: 46, height: 46, fontSize: 22 }}>
        👩‍⚕️
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="doc-name" style={{ fontSize: 15 }}>
          {s.expert}
        </div>
        <div className="doc-sub">{s.when}</div>
        {s.tags && s.tags.length > 0 && (
          <div className="tag-row">
            {s.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="sess-actions">
        {past ? (
          <>
            <span className="sess-status done">
              <CheckCircle2 size={14} /> Completed
            </span>
            <Link href={`/app/sessions/${s.id}`} className="btn btn-outline btn-sm">
              <FileText size={14} /> {s.hasSummary ? 'View summary' : 'View'}
            </Link>
          </>
        ) : (
          <>
            <Link href={`/app/sessions/${s.id}/room`} className="btn btn-primary btn-sm">
              <Video size={14} /> Join
            </Link>
            <Link href={`/app/sessions/${s.id}`} className="btn btn-outline btn-sm">
              <FileText size={14} /> Notes
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default async function SessionsPage() {
  const [view, calendar] = await Promise.all([getSessionsView(), getExpertCalendar()])

  // Days in the current month that have a session, for the patient calendar.
  const now = new Date()
  const markedDays = [...view.upcoming, ...view.past]
    .map((s) => (s.scheduledISO ? new Date(s.scheduledISO) : null))
    .filter((d): d is Date => !!d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
    .map((d) => d.getDate())

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Sessions</h1>
        <span className="page-meta">
          {view.upcoming.length} upcoming · {view.past.length} completed
        </span>
      </div>

      {view.today && (
        <div className="session-banner" style={{ marginBottom: 20 }}>
          <div>
            <div className="session-when">LIVE NOW · READY TO JOIN</div>
            <h3>Session with {view.today.expert}</h3>
            <div className="sub">
              {view.today.when} · {view.today.durationMins} min
            </div>
          </div>
          <Link href={`/app/sessions/${view.today.id}/room`} className="btn btn-primary">
            <Video size={16} /> Join now
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="stack">
          <div className="card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Clock size={17} /> Upcoming
            </div>
            {view.upcoming.length === 0 ? (
              <p className="muted" style={{ padding: '12px 0' }}>
                No upcoming sessions. Book one from your expert’s calendar →
              </p>
            ) : (
              view.upcoming.map((s) => <SessionRow key={s.id} s={s} />)
            )}
          </div>

          <div className="card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Calendar size={17} /> Past sessions
            </div>
            {view.past.length === 0 ? (
              <p className="muted" style={{ padding: '12px 0' }}>
                Your completed sessions will appear here.
              </p>
            ) : (
              view.past.map((s) => <SessionRow key={s.id} s={s} />)
            )}
          </div>
        </div>

        <div className="stack">
          <PatientCalendar markedDays={markedDays} />
          <BookSession slots={calendar.slots} />
        </div>
      </div>
    </>
  )
}
