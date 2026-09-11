import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTherapistContext, getTherapistSchedule } from '@/lib/expert'
import { fmtIST } from '@/lib/tz'

export const dynamic = 'force-dynamic'

type Row = Awaited<ReturnType<typeof getTherapistSchedule>>[number]

function NoteRow({ a }: { a: Row }) {
  const due = a.needsNote
  const missing = !a.hasSummary ? 'Note due' : 'Assessment due'
  return (
    <Link href={`/expert/notes/${a.id}`} className="card note-row">
      <div>
        <div className="note-row-t">{a.patientName}{a.sessionNo ? ` · session ${a.sessionNo}` : ''}</div>
        <div className="muted" style={{ fontSize: 12.5 }}>{fmtIST(a.scheduledAt, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</div>
      </div>
      {due
        ? <span className="note-flag due">{missing}</span>
        : <span className="note-flag done">Written</span>}
    </Link>
  )
}

export default async function SessionNotesPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')
  const sched = await getTherapistSchedule(ctx.therapistProfileId)

  const toWrite = sched
    .filter((a) => a.needsNote)
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
  const written = sched
    .filter((a) => a.hasSummary)
    .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt))
    .slice(0, 50)

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Session notes</h1>
        <span className="page-meta">{toWrite.length} to write · {written.length} recently written</span>
      </div>

      <div className="stack">
        <div className="section-title">To write</div>
        {toWrite.length === 0
          ? <div className="card"><p className="muted">Nothing waiting. Every delivered session is written up.</p></div>
          : toWrite.map((a) => <NoteRow key={a.id} a={a} />)}

        <div className="section-title" style={{ marginTop: 6 }}>Recently written</div>
        {written.length === 0
          ? <div className="card"><p className="muted">No notes yet.</p></div>
          : written.map((a) => <NoteRow key={a.id} a={a} />)}
      </div>
    </>
  )
}
