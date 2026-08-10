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
        <Stat label="Journal entries" value={p.journalCount} sub={p.lastJournalLabel ? `last ${p.lastJournalLabel}` : 'none yet'} />
        <Stat label="Tasks" value={`${p.doneTasks}/${p.doneTasks + p.openTasks}`} sub={`${p.openTasks} open`} />
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
        <Field label="Patient joined" value={s.patientJoinedLabel ?? 'did not join'} muted={!s.patientJoinedLabel} />
        <Field label="Clinician joined" value={s.therapistJoinedLabel ?? 'did not join'} muted={!s.therapistJoinedLabel} />
        <Field label="Ended" value={s.endedLabel ?? '—'} muted={!s.endedLabel} />
        <Field label="Together" value={s.durationMins != null ? fmtDuration(s.durationMins) : (s.bothJoined ? 'in progress' : '—')} />
        <Field label="Scheduled" value={fmtDuration(s.scheduledMins)} />
        <Field label="Call rating" value={s.rating != null ? `★ ${s.rating}/5` : (s.isPast ? 'not rated' : '—')} muted={s.rating == null} />
        <Field label="Notes" value={s.hasSummary ? 'written' : (s.isPast ? 'missing' : '—')} muted={!s.hasSummary} />
      </div>
    </div>
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
