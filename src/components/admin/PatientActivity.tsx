import type { PatientActivity, PatientSessionRow, PatientProgress } from '@/lib/admin'

const charcoal = '#1C2B3A'
const purple = '#6D5BD0'
const green = '#2C7A57'

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: green,
  CONFIRMED: purple,
  PENDING: '#B7791F',
  CANCELLED: '#B03A2E',
  RESCHEDULED: '#5A6A7A',
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: charcoal, lineHeight: 1.1 }}>{value}</div>
      {sub && <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

/** A compact bar sparkline of recent mood check-ins (1–5). */
function MoodTrend({ trend }: { trend: PatientProgress['moodTrend'] }) {
  if (trend.length === 0) return null
  return (
    <div>
      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Mood trend (recent check-ins, 1–5)</div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 56 }}>
        {trend.map((t, i) => (
          <div key={i} title={`${t.label}: ${t.mood}/5`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 14, height: Math.max(6, (t.mood / 5) * 48), background: t.mood >= 4 ? green : t.mood <= 2 ? '#B03A2E' : purple, borderRadius: 4, opacity: 0.85 }} />
          </div>
        ))}
      </div>
      <div className="muted" style={{ fontSize: 10.5, marginTop: 4 }}>{trend[0]?.label} → {trend[trend.length - 1]?.label}</div>
    </div>
  )
}

/** Read-only progress snapshot: check-ins, journaling, tasks, sessions. */
export function PatientProgressCard({ progress }: { progress: PatientProgress }) {
  const p = progress
  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Patient progress</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 16 }}>
        A snapshot of engagement — mood check-ins, journaling, assigned tasks and sessions. {p.memberSinceLabel && <>Member since {p.memberSinceLabel}.</>}
      </p>
      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Stat label="Sessions completed" value={p.sessionsCompleted} sub={`${p.sessionsUpcoming} upcoming`} />
        <Stat label="Avg mood" value={p.avgMood ?? '—'} sub={p.checkIns > 0 ? `${p.checkIns} check-ins` : 'no check-ins yet'} />
        <Stat label="Journals written" value={p.journalCount} sub={p.lastJournalLabel ? `last ${p.lastJournalLabel}` : 'none yet'} />
        <Stat label="Task adherence" value={p.taskAdherencePct != null ? `${p.taskAdherencePct}%` : '—'} sub={`${p.doneTasks}/${p.doneTasks + p.openTasks} done`} />
        <Stat label="Med adherence" value={p.medAdherencePct != null ? `${p.medAdherencePct}%` : '—'} sub={p.medsTotal > 0 ? `${p.medsActive}/${p.medsTotal} active` : 'no prescriptions'} />
        <Stat label="Avg rating given" value={p.avgRatingGiven != null ? `★ ${p.avgRatingGiven}` : '—'} sub={p.lastCheckInLabel ? `last check-in ${p.lastCheckInLabel}` : undefined} />
      </div>
      {p.moodTrend.length > 0 && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(28,43,58,.08)' }}>
          <MoodTrend trend={p.moodTrend} />
        </div>
      )}
    </div>
  )
}

function fmtDuration(mins: number | null): string {
  if (mins == null) return '—'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function SessionCard({ s }: { s: PatientSessionRow }) {
  return (
    <div style={{ border: '1px solid rgba(28,43,58,.1)', borderRadius: 12, padding: '13px 15px', opacity: s.status === 'CANCELLED' ? 0.65 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: charcoal }}>{s.scheduledLabel}</div>
          <div className="muted" style={{ fontSize: 12.5 }}>
            with <b style={{ color: charcoal }}>{s.clinicianName}</b>
            {s.clinicianRating > 0 && <span style={{ color: '#C9973A' }}> · ★ {s.clinicianRating.toFixed(1)} overall</span>}
          </div>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.03em', color: STATUS_COLOR[s.status] ?? charcoal, textTransform: 'uppercase' }}>{s.status.toLowerCase()}</span>
      </div>
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginTop: 11 }}>
        {/* In and out for each side, then each side's own time and the time
            they actually overlapped.

            Span rows (migration 0035) give the exact picture including rejoins.
            When there are none — an older session, or a database without that
            table — these fall back to Appointment's own joined/lastSeen stamps
            so an in, an out and a duration are always shown. Previously the
            individual totals appeared ONLY when spans existed, so on a database
            without them the whole breakdown silently disappeared. */}
        <Field label="Patient in" value={s.patientJoinedLabel ?? 'did not join'} muted={!s.patientJoinedLabel} />
        <Field label="Patient out" value={s.patientLeftLabel ?? '—'} muted={!s.patientLeftLabel} />
        <Field
          label="Clinician in"
          value={
            s.therapistJoinedLabel
              ? <>{s.therapistJoinedLabel}{s.joinDelayMins != null && <DelayChip mins={s.joinDelayMins} />}</>
              : 'did not join'
          }
          muted={!s.therapistJoinedLabel}
        />
        <Field label="Clinician out" value={s.therapistLeftLabel ?? '—'} muted={!s.therapistLeftLabel} />
        <Field label="Ended" value={s.endedLabel ?? '—'} muted={!s.endedLabel} />
        <Field
          label="Patient total"
          value={s.presence.hasSpans
            ? fmtDuration(s.presence.patient.totalMins)
            : (s.patientMins != null ? fmtDuration(s.patientMins) : '—')}
          muted={!s.presence.hasSpans && s.patientMins == null}
        />
        <Field
          label="Clinician total"
          value={s.presence.hasSpans
            ? fmtDuration(s.presence.therapist.totalMins)
            : (s.therapistMins != null ? fmtDuration(s.therapistMins) : '—')}
          muted={!s.presence.hasSpans && s.therapistMins == null}
        />
        <Field
          label="Together"
          value={s.presence.hasSpans
            ? fmtDuration(s.presence.togetherMins)
            : (s.durationMins != null ? fmtDuration(s.durationMins) : (s.bothJoined ? 'in progress' : '—'))}
        />
        <Field label="Scheduled" value={fmtDuration(s.scheduledMins)} />
        <Field label="Call rating" value={s.rating != null ? `★ ${s.rating}/5` : (s.isPast ? 'not rated' : '—')} muted={s.rating == null} />
        {/* The clinician's read on the session. Visible here and to the
            clinician; never to the member it describes. */}
        <Field
          label="Clinician's rating of member"
          value={s.memberRating != null ? `★ ${s.memberRating}/5` : (s.isPast ? 'not rated' : '—')}
          muted={s.memberRating == null}
        />
      </div>
      {s.presence.hasSpans && (
        <div style={{ marginTop: 11, padding: '10px 12px', background: 'rgba(28,43,58,.03)', borderRadius: 10, border: '1px solid rgba(28,43,58,.08)' }}>
          <div className="muted" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 6 }}>
            Attendance — every join and drop, per side
          </div>
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
            <SpanList title="Patient" side={s.presence.patient} />
            <SpanList title="Clinician" side={s.presence.therapist} />
          </div>
        </div>
      )}
      {s.preSessionNote && (
        <div style={{ marginTop: 11, padding: '9px 12px', background: 'rgba(200,85,61,.05)', borderRadius: 10, border: '1px solid rgba(200,85,61,.12)' }}>
          <div className="muted" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#B5533C', marginBottom: 3 }}>Pre-session note (from patient)</div>
          <div style={{ fontSize: 13, color: '#3A4A5A', lineHeight: 1.5 }}>{s.preSessionNote}</div>
        </div>
      )}
      {/* Admins see WHETHER a note exists, never its contents. The note is the
          clinical record between a patient and their clinician; what an admin
          needs is whether the clinician has written it up (it gates their pay),
          not what was said in the room. */}
      <div style={{ marginTop: 9 }}>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
            color: s.hasSummary ? '#2C7A57' : '#8A6300',
            background: s.hasSummary ? 'rgba(61,158,114,.12)' : 'rgba(201,151,58,.14)',
          }}
        >
          {s.hasSummary ? '✓ Session note completed' : '• Session note pending'}
        </span>
      </div>
    </div>
  )
}

/** How late (or early) the clinician was, coloured only when it's material. */
function DelayChip({ mins }: { mins: number }) {
  if (mins === 0) return <span className="muted" style={{ fontWeight: 600 }}> · on time</span>
  const late = mins > 0
  const heavy = late && mins >= 5
  return (
    <span style={{ fontWeight: 700, color: heavy ? '#C0504B' : late ? '#B7791F' : '#2C7A57' }}>
      {' '}· {late ? `${mins}m late` : `${Math.abs(mins)}m early`}
    </span>
  )
}

function Field({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: muted ? '#8A97A4' : charcoal }}>{value}</div>
    </div>
  )
}

/** Read-only session-by-session status: join times, together-duration, rating. */
export function PatientSessionsCard({ sessions }: { sessions: PatientSessionRow[] }) {
  const upcoming = sessions.filter((s) => !s.isPast && s.status !== 'CANCELLED')
  const past = sessions.filter((s) => s.isPast || s.status === 'CANCELLED')
  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Session status</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
        Every session this patient has taken or booked — when each party joined, how long they were together, and the call rating.
      </p>
      {sessions.length === 0 && <p className="muted" style={{ fontSize: 13.5 }}>No sessions on record.</p>}
      {upcoming.length > 0 && (
        <>
          <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Upcoming ({upcoming.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: past.length ? 20 : 0 }}>
            {upcoming.map((s) => <SessionCard key={s.id} s={s} />)}
          </div>
        </>
      )}
      {past.length > 0 && (
        <>
          <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Past &amp; cancelled ({past.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {past.map((s) => <SessionCard key={s.id} s={s} />)}
          </div>
        </>
      )}
    </div>
  )
}

/** Convenience wrapper rendering both cards from a single activity payload. */
export function PatientActivitySections({ activity }: { activity: PatientActivity }) {
  return (
    <>
      <PatientProgressCard progress={activity.progress} />
      <PatientSessionsCard sessions={activity.sessions} />
    </>
  )
}

/** One participant's join/leave stretches for a session. */
function SpanList({ title, side }: { title: string; side: PatientSessionRow['presence']['patient'] }) {
  if (side.spans.length === 0) {
    return (
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: charcoal, marginBottom: 4 }}>{title}</div>
        <div className="muted" style={{ fontSize: 12 }}>did not join</div>
      </div>
    )
  }
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: charcoal, marginBottom: 4 }}>
        {title}
        {side.rejoins > 0 && (
          <span style={{ color: '#C9973A', fontWeight: 700 }}> · rejoined {side.rejoins}×</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {side.spans.map((sp, i) => (
          <div key={i} style={{ fontSize: 12, color: '#3A4A5A' }}>
            {sp.joinedLabel} – {sp.leftLabel}
            <span className="muted"> · {sp.minutes}m</span>
          </div>
        ))}
      </div>
    </div>
  )
}
