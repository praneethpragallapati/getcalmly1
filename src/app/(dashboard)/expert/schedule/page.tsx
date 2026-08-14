import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Video, CalendarClock } from 'lucide-react'
import { getTherapistContext, getTherapistSchedule, type ScheduleAppointment } from '@/lib/expert'
import { SessionNoteForm } from '@/components/expert/SessionNoteForm'
import { RequestCancel } from '@/components/expert/RequestCancel'
import { fmtIST } from '@/lib/tz'

function fmt(d: Date): string {
  return fmtIST(d, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

const chipStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#3A4A5A',
  background: 'rgba(28,43,58,.05)', borderRadius: 8, padding: '5px 10px',
}

/** A live (bookable/joinable) session: upcoming and not cancelled or completed. */
function isLive(a: ScheduleAppointment): boolean {
  return !a.isPast && a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
}

function Row({ a }: { a: ScheduleAppointment }) {
  const needsNote = a.isPast && a.status !== 'CANCELLED' && !a.hasSummary

  return (
    <div className="pattern" style={{ alignItems: 'flex-start' }}>
      <span className={`pattern-ic ${a.status === 'CANCELLED' ? 't-coral' : isLive(a) ? 't-green' : 't-gold'}`}>
        <CalendarClock size={16} />
      </span>
      <div style={{ flex: 1 }}>
        <div className="pattern-title">
          <Link href={`/expert/patients/${a.patientId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {a.patientName}
          </Link>
        </div>
        <div className="pattern-sub">
          {fmt(a.scheduledAt)} · {a.durationMins} min · ₹{a.fee}
          {a.status === 'CANCELLED' && <span style={{ color: 'var(--c-coral, #C0504B)', fontWeight: 700 }}> · Cancelled</span>}
          {a.status === 'COMPLETED' && <span style={{ color: 'var(--c-green, #2C7A57)', fontWeight: 700 }}> · Completed</span>}
        </div>

        {isLive(a) && (
          <div style={{ marginTop: 8, maxWidth: 520, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={chipStyle}>
              Tasks left: {a.tasksTotal === 0 ? 'none assigned' : a.tasksOpen === 0 ? `none (all ${a.tasksTotal} done)` : `${a.tasksOpen} of ${a.tasksTotal}`}
            </span>
            {a.medTotal > 0 && (
              <span style={chipStyle}>Med adherence: {a.medAdherencePct}% ({a.medActive}/{a.medTotal} active)</span>
            )}
            <span style={chipStyle}>Journals: {a.journalCount === 0 ? 'none yet' : `${a.journalCount} written`}</span>
          </div>
        )}

        {isLive(a) && a.preSessionNote && (
          <div style={{ marginTop: 8, maxWidth: 520, padding: '9px 12px', background: 'rgba(200,85,61,.06)', borderRadius: 10, border: '1px solid rgba(200,85,61,.15)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--c-coral, #C8553D)', marginBottom: 3 }}>
              Patient&apos;s note before this session
            </div>
            <div style={{ fontSize: 13, color: '#3A4A5A', lineHeight: 1.5 }}>{a.preSessionNote}</div>
          </div>
        )}

        {isLive(a) && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Link href={`/expert/sessions/${a.id}/room`} className="btn btn-primary btn-sm">
              <Video size={13} /> Join room
            </Link>
            {a.cancelRequested ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#C0504B', background: 'rgba(192,80,75,.08)', border: '1px solid rgba(192,80,75,.2)', padding: '7px 12px', borderRadius: 8 }}>
                Cancellation requested · awaiting admin approval
              </span>
            ) : (
              <RequestCancel appointmentId={a.id} />
            )}
          </div>
        )}

        {needsNote && (
          <div style={{ marginTop: 10, maxWidth: 480 }}>
            <SessionNoteForm appointmentId={a.id} patientId={a.patientId} />
          </div>
        )}
      </div>
    </div>
  )
}

export default async function SchedulePage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const all = await getTherapistSchedule(ctx.therapistProfileId)
  const upcoming = all.filter((a) => !a.isPast && a.status !== 'CANCELLED' && a.status !== 'COMPLETED')
  const needsNotes = all.filter((a) => a.isPast && a.status !== 'CANCELLED' && !a.hasSummary)
  const history = all
    .filter((a) => !upcoming.includes(a) && !needsNotes.includes(a))
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
    .slice(0, 15)

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Schedule</div>
        <div className="page-meta">
          {upcoming.length} upcoming · {needsNotes.length} need notes
        </div>
      </div>

      {needsNotes.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--c-gold)', background: 'var(--c-gold-pale)' }}>
          <div className="section-title" style={{ marginBottom: 8 }}>Needs a session note</div>
          {needsNotes.map((a) => <Row key={a.id} a={a} />)}
        </div>
      )}

      <div className="card">
        <div className="section-title" style={{ marginBottom: 8 }}>Upcoming</div>
        {upcoming.length === 0 && <p className="muted">No confirmed sessions on the calendar yet.</p>}
        {upcoming.map((a) => <Row key={a.id} a={a} />)}
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 8 }}>History</div>
        {history.length === 0 && <p className="muted">No past sessions yet.</p>}
        {history.map((a) => <Row key={a.id} a={a} />)}
      </div>
    </div>
  )
}
