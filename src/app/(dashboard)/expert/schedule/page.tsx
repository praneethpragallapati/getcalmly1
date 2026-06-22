import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Video, Check, X, CalendarClock } from 'lucide-react'
import { getTherapistContext, getTherapistSchedule, type ScheduleAppointment } from '@/lib/expert'
import { confirmAppointment, cancelAppointment, rescheduleAppointmentAction } from '../actions'
import { SessionNoteForm } from '@/components/expert/SessionNoteForm'

function fmt(d: Date): string {
  return d.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

function Row({ a }: { a: ScheduleAppointment }) {
  const needsNote = a.status === 'CONFIRMED' && a.isPast && !a.hasSummary

  return (
    <div className="pattern" style={{ alignItems: 'flex-start' }}>
      <span className={`pattern-ic ${a.status === 'PENDING' ? 't-gold' : a.status === 'CANCELLED' ? 't-coral' : 't-green'}`}>
        <CalendarClock size={16} />
      </span>
      <div style={{ flex: 1 }}>
        <div className="pattern-title">
          <Link href={`/expert/patients/${a.patientId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {a.patientName}
          </Link>
        </div>
        <div className="pattern-sub">
          {fmt(a.scheduledAt)} · {a.durationMins} min · ₹{a.fee} · {a.status}
        </div>

        {a.status === 'PENDING' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <form action={confirmAppointment}>
              <input type="hidden" name="appointmentId" value={a.id} />
              <button type="submit" className="btn btn-primary btn-sm">
                <Check size={13} /> Confirm
              </button>
            </form>
            <form action={cancelAppointment}>
              <input type="hidden" name="appointmentId" value={a.id} />
              <button type="submit" className="btn btn-outline btn-sm">
                <X size={13} /> Decline
              </button>
            </form>
          </div>
        )}

        {a.status === 'CONFIRMED' && !a.isPast && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <Link href={`/app/sessions/${a.roomId ?? a.id}/room`} className="btn btn-primary btn-sm">
              <Video size={13} /> Join room
            </Link>
            <form action={rescheduleAppointmentAction} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="hidden" name="appointmentId" value={a.id} />
              <input className="entry-input" type="datetime-local" name="newDate" style={{ padding: '6px 10px' }} />
              <button type="submit" className="btn btn-outline btn-sm">Reschedule</button>
            </form>
            <form action={cancelAppointment}>
              <input type="hidden" name="appointmentId" value={a.id} />
              <button type="submit" className="btn btn-outline btn-sm">Cancel</button>
            </form>
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
  const pending = all.filter((a) => a.status === 'PENDING')
  const upcoming = all.filter((a) => a.status === 'CONFIRMED' && !a.isPast)
  const needsNotes = all.filter((a) => a.status === 'CONFIRMED' && a.isPast && !a.hasSummary)
  const history = all
    .filter((a) => !pending.includes(a) && !upcoming.includes(a) && !needsNotes.includes(a))
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
    .slice(0, 15)

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Schedule</div>
        <div className="page-meta">
          {pending.length} pending · {upcoming.length} upcoming · {needsNotes.length} need notes
        </div>
      </div>

      {pending.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 8 }}>Booking requests</div>
          {pending.map((a) => <Row key={a.id} a={a} />)}
        </div>
      )}

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
