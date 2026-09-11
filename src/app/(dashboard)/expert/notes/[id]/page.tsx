import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTherapistContext } from '@/lib/expert'
import { prisma } from '@/lib/prisma'
import { SessionNoteForm } from '@/components/expert/SessionNoteForm'
import { AssignTaskForm } from '@/components/expert/AssignTaskForm'
import { ClinicianOutcomePanel } from '@/components/outcomes/ClinicianOutcomePanel'
import { FREQUENCY_LABEL } from '@/lib/taskRecurrence'
import { fmtIST } from '@/lib/tz'

export const dynamic = 'force-dynamic'

/** Full-screen session note editor: roomy SOAP note + session outcome, with the
 *  patient's clinical scores and their homework (tasks) alongside. */
export default async function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const appt = await prisma.appointment.findFirst({
    where: { id, therapistId: ctx.therapistProfileId },
    select: {
      id: true, scheduledAt: true, status: true, summary: true, summaryDraft: true,
      patientId: true, patient: { select: { name: true } },
    },
  })
  if (!appt) notFound()

  const tasks = await prisma.task
    .findMany({
      where: { userId: appt.patientId },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, title: true, frequency: true, dueDate: true, completedAt: true, assignedBy: true },
    })
    .catch(() => [] as { id: string; title: string; frequency: string | null; dueDate: Date | null; completedAt: Date | null; assignedBy: string | null }[])

  return (
    <div className="notes-editor">
      <div className="page-head">
        <Link href="/expert/notes" className="link-action" style={{ fontSize: 12.5, fontWeight: 700 }}>← Session notes</Link>
        <h1 className="page-title" style={{ marginTop: 6 }}>Session note</h1>
        <span className="page-meta">
          {appt.patient?.name ?? 'Patient'} · {fmtIST(appt.scheduledAt, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      <div className="notes-grid">
        <div className="card">
          <SessionNoteForm
            appointmentId={appt.id}
            patientId={appt.patientId}
            initialSummary={appt.summary ?? ''}
            initialDraft={appt.summaryDraft ?? ''}
            large
            submitLabel={appt.summary ? 'Update note' : 'Save & mark complete'}
          />
        </div>

        <aside className="notes-side">
          <ClinicianOutcomePanel userId={appt.patientId} />
          <div className="card">
            <div className="section-title">Homework (tasks)</div>
            <p className="muted" style={{ fontSize: 12, marginBottom: 10 }}>Assign homework using the tasks feature. Optional.</p>
            <AssignTaskForm patientId={appt.patientId} />
            {tasks.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="section-title" style={{ fontSize: 12.5 }}>Already assigned</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tasks.map((t) => (
                    <div key={t.id} className="task-row">
                      <span className="task-row-t">{t.title}{t.completedAt ? ' ✓' : ''}</span>
                      <span className="muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>
                        {FREQUENCY_LABEL[(t.frequency ?? 'ONE_TIME') as keyof typeof FREQUENCY_LABEL] ?? 'One-time'}
                        {t.dueDate ? ` · till ${fmtIST(t.dueDate, { day: 'numeric', month: 'short' })}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
