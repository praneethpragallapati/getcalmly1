import { notFound, redirect } from 'next/navigation'
import { AlertTriangle, Flame, Check, Sparkles, Pill, FileText, Send } from 'lucide-react'
import {
  getTherapistContext, getExpertPatientProfile, generatePreSessionBrief, superviseeOwningPatient,
} from '@/lib/expert'
import { getFormLibrary, getPatientFormsForExpert } from '@/lib/forms'
import { getWeeklyProgress } from '@/lib/dashboard'
import { assignTask, toggleMedication, sendFormToPatient } from '../../actions'
import { PrescribeForm } from '@/components/expert/PrescribeForm'
import { SessionNoteForm } from '@/components/expert/SessionNoteForm'

const TREND_LABEL: Record<string, string> = {
  improving: 'Improving',
  declining: 'Declining',
  stable: 'Stable',
  insufficient: 'Not enough data yet',
}

const FORM_KIND_LABEL: Record<string, string> = {
  INTAKE: 'Intake',
  CONSENT: 'Consent',
  INFO: 'Information',
  FEEDBACK: 'Feedback',
}

export default async function ExpertPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  // Owner first; otherwise a supervisor of the owning therapist gets full
  // read-only visibility of the patient (assignments are admin-managed).
  let effectiveTherapistId = ctx.therapistProfileId
  let supervisorView = false
  let p = await getExpertPatientProfile(ctx.therapistProfileId, id)
  if (!p) {
    const superviseeId = await superviseeOwningPatient(ctx.therapistProfileId, id)
    if (superviseeId) {
      p = await getExpertPatientProfile(superviseeId, id)
      if (p) {
        effectiveTherapistId = superviseeId
        supervisorView = true
      }
    }
  }
  if (!p) notFound()

  const [weekly, brief, formLibrary, sentForms] = await Promise.all([
    getWeeklyProgress(id),
    generatePreSessionBrief(effectiveTherapistId, id),
    getFormLibrary(),
    getPatientFormsForExpert(effectiveTherapistId, id),
  ])

  // Sessions a note can be written/edited for: past ones (plus any already noted).
  const pastSessions = p.sessions.filter((s) => s.isPast || s.summary)

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <div className="page-title">{p.name}</div>
          <div className="page-meta">{p.trackLabel}{p.diagnosis ? ` · ${p.diagnosis}` : ''}{p.therapyStatus ? ` · ${p.therapyStatus}` : ''}</div>
        </div>
      </div>

      {supervisorView && (
        <div className="card" style={{ borderColor: 'var(--c-coral)', background: 'var(--c-coral-pale)' }}>
          <div className="pattern" style={{ padding: 0 }}>
            <span className="pattern-ic t-purple">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="pattern-title">Supervisor view · read-only</div>
              <div className="pattern-sub">
                You&apos;re viewing this patient as their therapist&apos;s supervisor. Notes, tasks, forms and
                medication remain with the treating therapist.
              </div>
            </div>
          </div>
        </div>
      )}

      {brief && (
        <div className="card" style={{ borderColor: 'var(--c-coral)', background: 'var(--c-coral-pale)' }}>
          <div className="pattern" style={{ padding: 0 }}>
            <span className="pattern-ic t-purple">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="pattern-title">AI co-pilot brief</div>
              <div className="pattern-sub">{brief}</div>
            </div>
          </div>
        </div>
      )}

      {(p.openCrisisCount > 0 || p.moodTrend === 'declining') && (
        <div className="card" style={{ borderColor: 'var(--c-coral)', background: 'var(--c-coral-pale)' }}>
          <div className="pattern" style={{ padding: 0 }}>
            <span className="pattern-ic t-coral">
              <AlertTriangle size={16} />
            </span>
            <div>
              <div className="pattern-title">Needs attention</div>
              <div className="pattern-sub">
                {p.openCrisisCount > 0 ? `${p.openCrisisCount} unresolved high-risk chat flag(s). ` : ''}
                {p.moodTrend === 'declining' ? 'Mood has been declining over recent check-ins.' : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-4">
        <div className="card">
          <div className="eyebrow">STREAK</div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={16} /> {p.streakDays} days
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">MOOD TREND</div>
          <div className="section-title">{TREND_LABEL[p.moodTrend]}</div>
        </div>
        <div className="card">
          <div className="eyebrow">SESSIONS</div>
          <div className="section-title">{p.sessionsDone}/{p.sessionsTotal} done</div>
          <div className="muted">{p.sessionsRemaining} remaining</div>
        </div>
        <div className="card">
          <div className="eyebrow">HIGH-RISK CHATS</div>
          <div className="section-title">{p.highStakeChatCount}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Mood — last 14 check-ins</div>
          {p.moodWeek.length === 0 && <p className="muted">No mood check-ins yet.</p>}
          {p.moodWeek.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
              {p.moodWeek.map((m, i) => (
                <div
                  key={i}
                  title={`${m.date}: ${m.mood}/10`}
                  style={{
                    flex: 1,
                    height: `${Math.max(6, m.mood * 9)}px`,
                    background: m.mood <= 4 ? 'var(--c-coral)' : m.mood <= 6 ? 'var(--c-gold)' : 'var(--c-green)',
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Compliance</div>
          <div className="muted">Task completion: {p.taskCompletionPct}%</div>
          <div className="muted">Medication compliance (active vs. prescribed): {p.medicationCompliancePct}%</div>
          {p.medications.length > 0 && (
            <ul style={{ marginTop: 10, paddingLeft: 18 }}>
              {p.medications.map((m, i) => (
                <li key={i} className="muted">
                  {m.name}{m.dosage ? ` (${m.dosage})` : ''} — {m.active ? 'active' : 'discontinued'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {ctx.isPsychiatrist && !supervisorView && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Pill size={16} /> Medication management
          </div>
          <p className="muted" style={{ marginBottom: 14 }}>
            As a psychiatrist you can prescribe and manage this patient&apos;s medication. Changes appear on the
            patient&apos;s Medications page immediately.
          </p>

          {p.medications.length === 0 && <p className="muted">No medications on record.</p>}
          {p.medications.map((m) => (
            <div key={m.id} className="pattern">
              <span className={`pattern-ic ${m.active ? 't-green' : 't-gold'}`}>
                <Pill size={16} />
              </span>
              <div style={{ flex: 1 }}>
                <div className="pattern-title">
                  {m.name}
                  {m.dosage ? ` · ${m.dosage}` : ''}
                </div>
                <div className="pattern-sub">
                  {[
                    m.frequency,
                    m.durationDays ? `${m.durationDays} days` : null,
                    m.prescribedBy ? `by ${m.prescribedBy}` : null,
                    m.active ? 'active' : 'discontinued',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {m.orderStatusLabel
                    ? `Delivery: ${m.orderStatusLabel}${m.orderAmount ? ` · ₹${m.orderAmount} paid` : ''}`
                    : 'Delivery: not yet ordered by patient'}
                </div>
              </div>
              <form action={toggleMedication}>
                <input type="hidden" name="medicationId" value={m.id} />
                <input type="hidden" name="patientId" value={p.patientId} />
                <input type="hidden" name="active" value={m.active ? 'false' : 'true'} />
                <button type="submit" className="btn btn-outline btn-sm">
                  {m.active ? 'Discontinue' : 'Reactivate'}
                </button>
              </form>
            </div>
          ))}

          <PrescribeForm patientId={p.patientId} />
        </div>
      )}

      <div className="card">
        <div className="section-title" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={16} /> Forms
        </div>
        <p className="muted" style={{ marginBottom: 14 }}>
          Send a consent or information form from the library. The patient fills it in from their dashboard and
          you&apos;ll see it marked complete here.
        </p>

        {sentForms.length === 0 && <p className="muted">No forms sent yet.</p>}
        {sentForms.map((f) => (
          <div key={f.id} className="pattern">
            <span className={`pattern-ic ${f.status === 'COMPLETED' ? 't-green' : 't-gold'}`}>
              {f.status === 'COMPLETED' ? <Check size={16} /> : <FileText size={16} />}
            </span>
            <div style={{ flex: 1 }}>
              <div className="pattern-title">
                {f.title} <span className="muted" style={{ fontWeight: 400 }}>· {FORM_KIND_LABEL[f.kind] ?? f.kind}</span>
              </div>
              <div className="pattern-sub">
                {[
                  `sent ${f.sentLabel}${f.assignedBy ? ` by ${f.assignedBy}` : ''}`,
                  f.status === 'COMPLETED' ? `completed ${f.completedLabel}` : 'awaiting completion',
                ].join(' · ')}
              </div>
            </div>
          </div>
        ))}

        {!supervisorView && (
        <form action={sendFormToPatient} className="stack" style={{ gap: 10, marginTop: 14 }}>
          <input type="hidden" name="patientId" value={p.patientId} />
          <div className="grid-2" style={{ gap: 10 }}>
            <select className="entry-input" name="templateId" defaultValue="" required>
              <option value="" disabled>
                Choose a form…
              </option>
              {formLibrary.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({FORM_KIND_LABEL[t.kind] ?? t.kind})
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={14} /> Send form
            </button>
          </div>
        </form>
        )}
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>This week&apos;s progress</div>
        <div className="muted">
          Tasks completed: {weekly.tasksCompleted}/{weekly.tasksAssigned} ({weekly.completionPct}%)
        </div>
        <div className="muted">
          Mood check-ins: {weekly.moodCheckins}
          {weekly.moodAvg !== null ? ` · avg ${weekly.moodAvg}/10` : ''}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Assigned tasks ({p.taskCompletionPct}% done)</div>
          {p.tasks.length === 0 && <p className="muted">No tasks assigned yet.</p>}
          {p.tasks.map((t) => (
            <div key={t.id} className="pattern">
              <span className={`pattern-ic ${t.done ? 't-green' : t.expired ? 't-coral' : 't-purple'}`}>
                {t.done ? <Check size={16} /> : <Flame size={16} />}
              </span>
              <div>
                <div className="pattern-title">{t.title}</div>
                <div className="pattern-sub">
                  {t.type}
                  {t.dueLabel ? ` · ${t.done ? 'done' : t.expired ? `expired ${t.dueLabel}` : `due ${t.dueLabel}`}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!supervisorView && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Assign a task</div>
          <form action={assignTask} className="stack" style={{ gap: 10 }}>
            <input type="hidden" name="patientId" value={p.patientId} />
            <input className="entry-input" name="title" placeholder="Task title" required />
            <input className="entry-input" name="description" placeholder="Details (optional)" />
            <select className="entry-input" name="type" defaultValue="REFLECTION">
              <option value="EXERCISE">Exercise</option>
              <option value="VIDEO">Video</option>
              <option value="READING">Reading</option>
              <option value="REFLECTION">Reflection</option>
              <option value="BREATHING">Breathing</option>
            </select>
            <label className="muted" style={{ fontSize: 12 }}>
              Expiry
              <input className="entry-input" type="date" name="dueDate" style={{ marginTop: 4 }} />
            </label>
            <button type="submit" className="btn btn-primary btn-sm">Assign task</button>
          </form>
        </div>
        )}
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Session notes</div>
        <p className="muted" style={{ marginBottom: 14 }}>
          Write a note for any past session, or update an existing one. Notes are saved to the patient&apos;s record.
        </p>
        {pastSessions.length === 0 && <p className="muted">No past sessions to note yet.</p>}
        {pastSessions.map((s) => (
          <div key={s.id} className="pattern" style={{ alignItems: 'flex-start' }}>
            <span className={`pattern-ic ${s.summary ? 't-green' : 't-gold'}`}>
              {s.summary ? <Check size={16} /> : <FileText size={16} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pattern-title">
                {s.dateLabel} <span className="muted" style={{ fontWeight: 400 }}>· {s.status}</span>
              </div>
              {s.summary && <div className="pattern-sub" style={{ marginBottom: 8 }}>{s.summary}</div>}
              {!supervisorView && (
              <div style={{ maxWidth: 520, marginTop: 6 }}>
                <SessionNoteForm
                  appointmentId={s.id}
                  patientId={p.patientId}
                  initialSummary={s.summary ?? ''}
                  submitLabel={s.summary ? 'Update note' : 'Save & mark complete'}
                />
              </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
