import { notFound, redirect } from 'next/navigation'
import { AlertTriangle, Flame, Check, Sparkles, Pill, FileText } from 'lucide-react'
import {
  getTherapistContext, getExpertPatientProfile, getRiskNotifications,
  superviseeOwningPatient, MOOD_TREND_LABEL,
} from '@/lib/expert'
import { patientCode } from '@/lib/ids'
import { getFormLibrary, getPatientFormsForExpert } from '@/lib/forms'
import { toggleMedication, resolveAlert } from '../../actions'
import { AssignTaskForm } from '@/components/expert/AssignTaskForm'
import { PrescribeForm } from '@/components/expert/PrescribeForm'
import { SessionNoteForm } from '@/components/expert/SessionNoteForm'
import { SendFormCard } from '@/components/expert/SendFormCard'
import { AssignGuidedTrack } from '@/components/expert/AssignGuidedTrack'
import { getGuidedTrackOptions, getGuidedAssignmentsFor } from '@/lib/guided'
import { getPatientWeeklySummary } from '@/lib/patientSummary'
import { WeeklySummaryCard } from '@/components/expert/WeeklySummaryCard'
import { DetailGrid, formatAddress, formatEmergencyContact } from '@/components/ui/DetailGrid'
import { SessionNote } from '@/components/ui/SessionNote'
import { fmtIST } from '@/lib/tz'

/** Capitalise for use as a standalone metric value. */
const sentence = (v: string) => v.charAt(0).toUpperCase() + v.slice(1)

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

  // The weekly figures come from the summary card now, so the old
  // getWeeklyProgress read (which said the same thing again) is gone.
  const [weeklySummary, formLibrary, sentForms, allRisk, guidedTracks, guidedAssignments] = await Promise.all([
    getPatientWeeklySummary(id),
    getFormLibrary(),
    getPatientFormsForExpert(effectiveTherapistId, id),
    getRiskNotifications(effectiveTherapistId),
    getGuidedTrackOptions(),
    getGuidedAssignmentsFor(id),
  ])
  const patientAlerts = allRisk.filter((r) => r.patientId === id)

  // Sessions a note can be written/edited for. Own delivered (paid) sessions —
  // cancelled and voided ones are left out, since there's no session to write up
  // and no pay riding on it — plus any session from any expert that already has
  // a note, so the clinician still sees the whole picture.
  const pastSessions = p.sessions.filter((s) => s.summary || (s.isOwn && s.payable))
  /** Sessions that actually happened and were written up — any clinician's. */
  const sessionsHeld = pastSessions.filter((s) => s.summary).length

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {p.name}
            <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: 'var(--c-gray-d)', background: 'rgba(28,43,58,.06)', padding: '2px 8px', borderRadius: 6 }}>{p.contact.code ?? patientCode(p.patientId)}</span>
          </div>
          {/* Diagnosis and therapy status only — both clinician-entered. The
              assessment's track label is not shown: it is a single intake answer
              that never changes, and next to real clinical fields it looked like
              one. */}
          <div className="page-meta">
            {[p.diagnosis, p.therapyStatus].filter(Boolean).join(' · ') || 'No diagnosis recorded'}
          </div>
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
                You&apos;re viewing this patient as their therapist&apos;s supervisor, so you see everything
                they see. Writing notes, assigning tasks and forms, and prescribing stay with the treating
                clinician.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The patient's week, from session notes, mood check-ins and task
          adherence. Not an AI brief — every figure comes off the record. */}
      {weeklySummary && <WeeklySummaryCard summary={weeklySummary} />}

      {/* Reference, not clinical work — collapsed so the care sections stay
          near the top. */}
      <details className="card" style={{ padding: 0 }}>
        <summary style={{ cursor: 'pointer', padding: '16px 20px', fontWeight: 700, fontSize: 15, color: 'var(--c-charcoal)' }}>
          Contact &amp; personal details
        </summary>
        <div style={{ padding: '0 20px 18px' }}>
          <p className="muted" style={{ fontSize: 12.5, margin: '0 0 4px' }}>
            How to reach this patient and their emergency contact between sessions.
          </p>
          <DetailGrid
            fields={[
              { label: 'Member ID', value: p.contact.code },
              { label: 'Email', value: p.contact.email },
              { label: 'Phone', value: p.contact.phone },
              { label: 'Date of birth', value: p.contact.dateOfBirth ? fmtIST(new Date(p.contact.dateOfBirth), { day: 'numeric', month: 'short', year: 'numeric' }) : null },
              { label: 'Gender', value: p.contact.gender },
              { label: 'Marital status', value: p.contact.maritalStatus },
              { label: 'Occupation', value: p.contact.occupation },
              { label: 'Preferred language', value: p.contact.preferredLanguage },
              { label: 'Address', value: formatAddress(p.contact) },
              { label: 'Emergency contact', value: formatEmergencyContact(p.contact) },
              { label: 'Member since', value: p.contact.joinedLabel },
            ]}
          />
        </div>
      </details>

      {(patientAlerts.length > 0 || p.moodTrend === 'declining') && (
        <div className="card" style={{ borderColor: 'var(--c-coral)', background: 'var(--c-coral-pale)' }}>
          <div className="pattern" style={{ padding: 0 }}>
            <span className="pattern-ic t-coral">
              <AlertTriangle size={16} />
            </span>
            <div style={{ flex: 1 }}>
              <div className="pattern-title">Needs attention</div>
              {p.moodTrend === 'declining' && (
                <div className="pattern-sub">Mood has been declining over recent check-ins.</div>
              )}
              {patientAlerts.map((a) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div className="pattern-sub" style={{ fontWeight: 600 }}>{a.message}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{a.detail}</div>
                  </div>
                  {!supervisorView && (
                    <form action={resolveAlert}>
                      <input type="hidden" name="alertId" value={a.id} />
                      <input type="hidden" name="patientId" value={p.patientId} />
                      <button type="submit" className="btn btn-outline btn-sm">Mark resolved</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* At a glance — the numbers a clinician scans before a session, in one
          card rather than six. */}
      <div className="card">
        <div className="section-title">At a glance</div>
        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginTop: 12 }}>
          <Metric label="Streak" value={`${p.streakDays} days`} icon={<Flame size={15} />} />
          <Metric label="Mood trend" value={sentence(MOOD_TREND_LABEL[p.moodTrend] ?? p.moodTrend)} />
          {/* This is the PACKAGE counter (sessionsUsed / sessionsTotal on their
              subscription), not a count of sessions that happened. The two can
              legitimately differ — a booking consumes one immediately, a voided
              session returns one — and labelling both "Sessions" made a package
              reading 1/17 next to two written-up sessions look like a bug.
              Completed sessions are shown separately, from the appointments. */}
          <Metric
            label="Package sessions"
            value={`${p.sessionsDone}/${p.sessionsTotal} used`}
            sub={`${p.sessionsRemaining} remaining`}
          />
          <Metric label="Sessions held" value={String(sessionsHeld)} sub="with a written note" />
          <Metric label="Task completion" value={`${p.taskCompletionPct}%`} />
          <Metric
            label="Medication"
            value={p.medications.length ? `${p.medicationCompliancePct}%` : '—'}
            sub={p.medications.length ? `${p.medications.filter((m) => m.active).length}/${p.medications.length} active` : 'none prescribed'}
          />
          <Metric label="High-risk chats" value={String(p.highStakeChatCount)} alert={p.highStakeChatCount > 0} />
        </div>

        {/* The two session numbers come from different places — the package
            counter moves when a session is BOOKED against a package, the held
            count is sessions that actually happened and were written up — so
            they can disagree for perfectly good reasons. When they do, say
            which reason, instead of leaving it to be worked out. */}
        {sessionsHeld !== p.sessionsDone && (
          <p className="muted" style={{ fontSize: 12, margin: '10px 0 0' }}>
            {p.sessionsBookedOnPackage !== null && p.sessionsBookedOnPackage !== p.sessionsDone
              ? `Package counter says ${p.sessionsDone} used, but ${p.sessionsBookedOnPackage} session${p.sessionsBookedOnPackage === 1 ? ' is' : 's are'} booked against it. The counter has drifted — an admin can fix it on the patient's admin page with "Set counter".`
              : sessionsHeld > p.sessionsDone
                ? `${sessionsHeld - p.sessionsDone} of these ${sessionsHeld - p.sessionsDone === 1 ? 'was' : 'were'} not paid for out of a current package — held before this package started, drawn from one that has since ended, or added outside the booking flow. The package counter only moves when a session is booked against it.`
                : 'Some booked sessions have not been held or written up yet — the package counter moves at booking, not after the session.'}
          </p>
        )}

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(28,43,58,.08)' }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
            Mood, last 14 check-ins
            {/* Height and colour are two readings of the same number, and neither
                was explained: height is the score, colour is which band it falls
                in. Without this the bars looked arbitrary. */}
            <span style={{ marginLeft: 8 }}>
              — height is the score out of 10; colour is the band:
              <span style={{ color: 'var(--c-coral)', fontWeight: 700 }}> 1–4 low</span>,
              <span style={{ color: 'var(--c-gold)', fontWeight: 700 }}> 5–6 middling</span>,
              <span style={{ color: 'var(--c-green)', fontWeight: 700 }}> 7–10 good</span>
            </span>
          </div>
          {p.moodWeek.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>No mood check-ins yet.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {p.moodWeek.map((m, i) => (
                <div
                  key={i}
                  title={`${m.date}: ${m.mood}/10`}
                  style={{
                    flex: 1,
                    height: `${Math.max(6, m.mood * 8)}px`,
                    background: m.mood <= 4 ? 'var(--c-coral)' : m.mood <= 6 ? 'var(--c-gold)' : 'var(--c-green)',
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {(ctx.isPsychiatrist || supervisorView) && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Pill size={16} /> {supervisorView ? 'Medication' : 'Medication management'}
          </div>
          <p className="muted" style={{ marginBottom: 14 }}>
            {supervisorView
              ? 'What this patient is currently prescribed. Prescribing stays with the treating clinician.'
              : 'As a psychiatrist you can prescribe and manage this patient\u2019s medication. Changes appear on the patient\u2019s Medications page immediately.'}
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
              {!supervisorView && ctx.isPsychiatrist && (
                <form action={toggleMedication}>
                  <input type="hidden" name="medicationId" value={m.id} />
                  <input type="hidden" name="patientId" value={p.patientId} />
                  <input type="hidden" name="active" value={m.active ? 'false' : 'true'} />
                  <button type="submit" className="btn btn-outline btn-sm">
                    {m.active ? 'Discontinue' : 'Reactivate'}
                  </button>
                </form>
              )}
            </div>
          ))}

          {!supervisorView && ctx.isPsychiatrist && <PrescribeForm patientId={p.patientId} />}
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
          <SendFormCard
            patientId={p.patientId}
            templates={formLibrary.map((t) => ({
              id: t.id,
              title: t.title,
              kind: t.kind,
              fieldCount: t.fieldCount,
              builtIn: t.builtIn,
              // Their own form is editable in place; anything else — a standard
              // form, or a colleague's — is copied first.
              mine: !t.builtIn && t.createdById === ctx.userId,
            }))}
          />
        )}
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
                  {t.frequencyLabel ? ` · ${t.frequencyLabel}` : ''}
                  {t.timesLabel ? ` · ${t.timesLabel}` : ''}
                  {t.dueLabel ? ` · ${t.done ? 'done' : t.expired ? `expired ${t.dueLabel}` : `until ${t.dueLabel}`}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!supervisorView && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Assign a task</div>
            <AssignTaskForm patientId={p.patientId} />
          </div>
        )}
      </div>

      <AssignGuidedTrack
        patientId={p.patientId}
        tracks={guidedTracks}
        assignments={guidedAssignments}
        readOnly={supervisorView}
      />

      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Session notes</div>
        <p className="muted" style={{ marginBottom: 14 }}>
          Notes from every expert involved in this patient&apos;s care. You can write or update notes on your own
          sessions; other clinicians&apos; notes are read-only.
        </p>
        {pastSessions.length === 0 && <p className="muted">No past sessions to note yet.</p>}
        {pastSessions.map((s) => {
          const editable = s.isOwn && !supervisorView
          return (
            <div key={s.id} className="pattern" style={{ alignItems: 'flex-start' }}>
              <span className={`pattern-ic ${s.summary ? 't-green' : 't-gold'}`}>
                {s.summary ? <Check size={16} /> : <FileText size={16} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pattern-title" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {s.dateLabel} <span className="muted" style={{ fontWeight: 400 }}>· {s.status}</span>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: s.isOwn ? 'rgba(26,127,122,.12)' : 'rgba(28,43,58,.06)',
                    color: s.isOwn ? '#1A7F7A' : '#5A6B7A',
                  }}>
                    {s.isOwn ? 'You' : s.author}
                  </span>
                </div>
                {s.summary && (
                  <div style={{ maxWidth: 560, marginTop: 8 }}>
                    <SessionNote note={s.summary} title="Note" meta={s.isOwn ? 'yours' : s.author} />
                  </div>
                )}
                {editable ? (
                  <details style={{ maxWidth: 560, marginTop: 8 }}>
                    <summary className="link-action" style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
                      {s.summary ? 'Edit this note' : 'Write the note'}
                    </summary>
                    <div style={{ marginTop: 10 }}>
                      <SessionNoteForm
                        appointmentId={s.id}
                        patientId={p.patientId}
                        initialSummary={s.summary ?? ''}
                        submitLabel={s.summary ? 'Update note' : 'Save & mark complete'}
                      />
                    </div>
                  </details>
                ) : (
                  !s.summary && <div className="pattern-sub" style={{ fontStyle: 'italic', opacity: 0.7 }}>No note written yet.</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** One figure in the "At a glance" row — same shape for every metric, so the
 *  row reads as a single scale rather than a set of unrelated cards. */
function Metric({ label, value, sub, icon, alert }: {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
  alert?: boolean
}) {
  return (
    <div style={{ minWidth: 116 }}>
      <div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</div>
      <div
        style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, lineHeight: 1.15, marginTop: 2,
          color: alert ? '#C0504B' : 'var(--c-charcoal, #1C2B3A)',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}
      >
        {icon}{value}
      </div>
      {sub && <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{sub}</div>}
    </div>
  )
}
