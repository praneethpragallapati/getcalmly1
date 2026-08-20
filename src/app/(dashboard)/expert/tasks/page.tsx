import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, FileText, ListTodo, AlertTriangle } from 'lucide-react'
import {
  getTherapistContext, getSessionsNeedingNote, getMyAssignedTasks, getRiskNotifications,
} from '@/lib/expert'
import { SessionNoteForm } from '@/components/expert/SessionNoteForm'
import { MyTaskList } from '@/components/expert/MyTaskList'

export const dynamic = 'force-dynamic'

/**
 * Everything on the clinician's plate in one place: the session notes they owe
 * (written inline, right here) and the tasks an admin has sent them. Open alerts
 * get a pointer rather than a copy — they're worked in the patient's profile.
 */
export default async function ExpertTasksPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const [notesDue, adminTasks, risk] = await Promise.all([
    getSessionsNeedingNote(ctx.therapistProfileId),
    getMyAssignedTasks(ctx.userId),
    getRiskNotifications(ctx.therapistProfileId),
  ])
  const adminOpen = adminTasks.filter((t) => !t.done)
  const open = notesDue.length + adminOpen.length

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Tasks</div>
        <div className="page-meta">
          {open === 0 ? 'Nothing outstanding' : `${open} open · ${notesDue.length} note${notesDue.length === 1 ? '' : 's'} to write · ${adminOpen.length} from admin`}
        </div>
      </div>

      {open === 0 && (
        <div className="card">
          <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <CheckCircle2 size={16} style={{ color: '#3D9E72' }} /> All caught up — every session is written up and there&apos;s nothing waiting from admin.
          </p>
        </div>
      )}

      {/* ── Session notes owed ── */}
      {notesDue.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--c-gold)', background: 'var(--c-gold-pale)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16} /> Session notes to write
            </div>
            <span className="muted" style={{ fontSize: 12 }}>{notesDue.length} waiting</span>
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
            Sessions you delivered. A note is what moves each one onto your earnings ledger.
          </p>
          <div style={{ marginTop: 6 }}>
            {notesDue.map((n) => (
              <div key={n.appointmentId} className="pattern" style={{ alignItems: 'flex-start' }}>
                <span className="pattern-ic t-gold"><FileText size={16} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pattern-title">
                    <Link href={`/expert/patients/${n.patientId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {n.patientName}
                    </Link>
                  </div>
                  <div className="pattern-sub">
                    {n.dateLabel}
                    {n.daysAgo >= 2 && (
                      <span style={{ color: '#C0504B', fontWeight: 700 }}> · {n.daysAgo} days ago</span>
                    )}
                  </div>
                  {/* Collapsed by default: the note form is long, and a stack of
                      them would bury the list of who's still waiting. */}
                  <details style={{ marginTop: 8, maxWidth: 520 }}>
                    <summary className="link-action" style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
                      Write the note
                    </summary>
                    <div style={{ marginTop: 10 }}>
                      <SessionNoteForm appointmentId={n.appointmentId} patientId={n.patientId} />
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Admin-assigned tasks ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ListTodo size={16} /> From admin
          </div>
          <span className="muted" style={{ fontSize: 12 }}>{adminOpen.length} open</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <MyTaskList tasks={adminTasks} />
        </div>
      </div>

      {/* ── Alerts live on the patient's profile; point at them, don't duplicate ── */}
      {risk.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} style={{ color: '#C0504B' }} /> Patient alerts
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
            {risk.length} alert{risk.length === 1 ? '' : 's'} still to review.{' '}
            <Link href="/expert/risk" className="link-action">Open them</Link>
          </p>
        </div>
      )}
    </div>
  )
}
