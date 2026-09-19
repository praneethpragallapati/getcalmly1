import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ClipboardList, User, CalendarClock, Users, AlertTriangle, ListTodo, CheckCircle2,
} from 'lucide-react'
import { JoinButton } from '@/components/dashboard/JoinButton'
import {
  getTherapistContext, getCaseload, getRiskNotifications, getTherapistSchedule,
  getExpertPatientProfile, getMyAssignedTasks, type ScheduleAppointment, type MyTask,
} from '@/lib/expert'
import { RequestCancel } from '@/components/expert/RequestCancel'
import { fmtIST, istParts } from '@/lib/tz'

// All times shown in IST (backend clock), so a noon-IST session reads as 12:00 PM
// and not the UTC server time.
function timeLabel(d: Date) {
  return fmtIST(d, { hour: 'numeric', minute: '2-digit' })
}
function isToday(d: Date) {
  const a = istParts(d)
  const n = istParts(new Date())
  return a.day === n.day && a.month === n.month && a.year === n.year
}

/** The doctor's real to-do list, derived from live data, no separate table. */
type DoctorTask = { key: string; label: string; sub: string; href: string; urgent: boolean }

function buildTasks(
  schedule: ScheduleAppointment[],
  risk: { id: string; patientId: string; patientName: string; kind: string }[],
  adminTasks: MyTask[],
): DoctorTask[] {
  const tasks: DoctorTask[] = []
  // 1. Delivered sessions still missing a clinical note. Cancelled and voided
  // sessions never appear — nothing to write up, and no pay riding on them.
  schedule
    .filter((a) => a.needsNote)
    .slice(-4)
    .forEach((a) =>
      tasks.push({
        key: `note-${a.id}`,
        label: `Write session note · ${a.patientName}`,
        sub: `Session on ${fmtIST(a.scheduledAt, { day: 'numeric', month: 'short' })}`,
        href: '/expert/tasks',
        urgent: false,
      }),
    )
  // 2. Unresolved risk alerts
  risk.slice(0, 3).forEach((r) =>
    tasks.push({
      key: `risk-${r.id}`,
      label: `Review ${r.kind === 'crisis' ? 'crisis alert' : 'mood decline'} · ${r.patientName}`,
      sub: "Opens the patient's profile, resolve it there",
      href: `/expert/patients/${r.patientId}`,
      urgent: true,
    }),
  )
  // 3. Anything admin has sent this clinician
  adminTasks.filter((t) => !t.done).slice(0, 4).forEach((t) =>
    tasks.push({
      key: `admin-${t.id}`,
      label: t.title,
      sub: [t.assignedBy ? `From ${t.assignedBy}` : 'From admin', t.expired ? 'overdue' : t.dueLabel ? `until ${t.dueLabel}` : null]
        .filter(Boolean).join(' · '),
      href: '/expert/tasks',
      urgent: t.expired,
    }),
  )
  return tasks.sort((a, b) => Number(b.urgent) - Number(a.urgent))
}

export default async function ExpertHomePage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const [schedule, caseload, risk, myTasks] = await Promise.all([
    getTherapistSchedule(ctx.therapistProfileId),
    getCaseload(ctx.therapistProfileId),
    getRiskNotifications(ctx.therapistProfileId),
    getMyAssignedTasks(ctx.userId),
  ])

  const upcoming = schedule.filter((a) => !a.isPast && a.status !== 'CANCELLED')
  const today = upcoming.filter((a) => isToday(a.scheduledAt))
  const next = upcoming[0] ?? null
  const tasks = buildTasks(schedule, risk, myTasks)

  // Data-composed pre-session context for the hero (fast; no LLM call here).
  // Structured, labelled rows rather than a run-on sentence, so the clinician can
  // scan it before joining. Each row is one clinical signal.
  const nextProfile = next ? await getExpertPatientProfile(ctx.therapistProfileId, next.patientId) : null
  type BriefRow = { label: string; value: string; alert?: boolean }
  const briefRows: BriefRow[] = []
  if (next && nextProfile) {
    const TREND_FRIENDLY: Record<string, string> = {
      improving: 'trending up',
      declining: 'trending down',
      stable: 'stable',
      insufficient: 'not enough check-ins yet',
    }
    // Mood
    if (nextProfile.moodWeek.length) {
      const moods = nextProfile.moodWeek.map((m) => m.mood)
      const latest = moods[moods.length - 1]
      briefRows.push({
        label: 'Mood',
        value: `now ${latest}/10 · ${TREND_FRIENDLY[nextProfile.moodTrend] ?? nextProfile.moodTrend} (last ${moods.length}: ${moods.join(', ')})`,
        alert: nextProfile.moodTrend === 'declining',
      })
    }
    // Tasks left (homework)
    if (nextProfile.tasks.length) {
      const open = nextProfile.tasks.filter((t) => !t.done).length
      briefRows.push({
        label: 'Tasks left',
        value: open === 0
          ? `none — all ${nextProfile.tasks.length} done (${nextProfile.taskCompletionPct}% completed)`
          : `${open} of ${nextProfile.tasks.length} still open · ${nextProfile.taskCompletionPct}% completed`,
      })
    }
    // Medication adherence — shown whenever the patient has any medication on
    // record (a therapist may be seeing a patient who's also under psychiatry).
    if (nextProfile.medications.length) {
      const active = nextProfile.medications.filter((m) => m.active).length
      briefRows.push({
        label: 'Medication adherence',
        value: `${nextProfile.medicationCompliancePct}% · ${active} of ${nextProfile.medications.length} prescriptions active`,
      })
    }
    // Journals written so far (content stays private — count only).
    briefRows.push({
      label: 'Journals written',
      value: nextProfile.journalCount === 0
        ? 'none yet'
        : `${nextProfile.journalCount} so far`,
    })
    // Sessions so far, per care type this clinician covers for them — a
    // psychiatrist's brief should not carry a therapy balance, and a clinician
    // who does both needs them apart rather than added up.
    for (const pkg of nextProfile.packages) {
      if (pkg.total === 0) continue
      briefRows.push({
        label: nextProfile.packages.length > 1 ? `${pkg.label} sessions` : 'Sessions',
        value: `${pkg.used} of ${pkg.total} used · ${pkg.remaining} remaining`,
      })
    }
    // Crisis alerts
    if (nextProfile.openCrisisCount > 0) {
      briefRows.push({
        label: 'Alerts',
        value: `${nextProfile.openCrisisCount} open crisis alert${nextProfile.openCrisisCount === 1 ? '' : 's'} — review before joining`,
        alert: true,
      })
    }
    // The patient's own note for THIS session (distinct from clinical notes).
    if (next.preSessionNote) {
      briefRows.push({ label: 'Patient’s note for this session', value: next.preSessionNote })
    }
    // Last completed session's clinical summary (distinct from the pre-session note).
    const lastSummary = nextProfile.sessions.find((s) => s.isPast && s.summary)?.summary
    if (lastSummary) {
      briefRows.push({ label: 'Last session summary', value: lastSummary })
    }
  }

  const moodRows = caseload.filter((p) => p.lastMood !== null).slice(0, 6)
  const trendColor = (t: string) => (t === 'improving' ? '#3D9E72' : t === 'declining' ? '#C0504B' : '#C9973A')

  return (
    <div className="stack">
      {/* ── Up-next hero ── */}
      {next && nextProfile ? (
        <div className="card" style={{ background: 'radial-gradient(ellipse 70% 80% at 92% 0%, rgba(26,127,122,.35), transparent 60%), #141E29', border: 'none', color: '#fff', padding: 28 }}>
          <div className="page-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 28, alignItems: 'start' }}>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4ba8a2', background: 'rgba(75,168,162,.14)', padding: '5px 12px', borderRadius: 20 }}>
                ● Up next · {isToday(next.scheduledAt) ? `${timeLabel(next.scheduledAt)} today` : fmtIST(next.scheduledAt, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 34, lineHeight: 1.05, margin: '14px 0 6px' }}>
                {/* Numbered from the appointments themselves (sessionNo), not
                    from the package counter: a booked session is already counted
                    as used, so "used + 1" numbered an upcoming third session the
                    fourth. This matches what the patient is shown. */}
                {next.sessionNo ? `Session #${next.sessionNo} with ` : 'Session with '}
                <span style={{ color: '#4ba8a2', fontWeight: 700 }}>{next.patientName}</span>
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: 16 }}>
                {/* Sessions run in getCalmly's own video room (100ms), not on any
                    external meeting provider — see HmsRoom / CallDock. */}
                {next.durationMins} min · getCalmly video room
              </p>
              {briefRows.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4ba8a2', marginBottom: 10 }}>✦ Pre-session brief</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {briefRows.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                        <span style={{ flex: '0 0 148px', fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: r.alert ? '#f0a3a0' : 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
                          {r.label}
                        </span>
                        <span style={{ flex: 1, fontSize: 13, lineHeight: 1.55, color: r.alert ? '#f5b7b4' : 'rgba(255,255,255,.85)' }}>
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <JoinButton
                  scheduledISO={next.scheduledAt.toISOString()}
                  durationMins={next.durationMins}
                  href={`/expert/sessions/${next.id}/room`}
                  joinedAlready={next.joinedThisSide}
                  label="Join Meet"
                  size="md"
                />
                <Link href={`/expert/patients/${next.patientId}`} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.08)', color: '#fff', border: '1px solid rgba(255,255,255,.16)' }}>
                  <ClipboardList size={15} /> Session notes
                </Link>
                <Link href={`/expert/patients/${next.patientId}`} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.08)', color: '#fff', border: '1px solid rgba(255,255,255,.16)' }}>
                  <User size={15} /> {next.patientName.split(' ')[0]}&apos;s profile
                </Link>
              </div>
              <div style={{ marginTop: 14 }}>
                {next.cancelRequested ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#f5b7b4', background: 'rgba(192,80,75,.18)', border: '1px solid rgba(240,163,160,.3)', padding: '7px 12px', borderRadius: 8 }}>
                    Cancellation requested · awaiting admin approval
                  </span>
                ) : (
                  <RequestCancel appointmentId={next.id} />
                )}
              </div>
            </div>
            {/* Today's schedule rail */}
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 10 }}>Today&apos;s schedule</div>
              {today.length === 0 && <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.45)' }}>No sessions today.</p>}
              {today.slice(0, 5).map((a) => (
                <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#4ba8a2', minWidth: 62 }}>{timeLabel(a.scheduledAt)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{a.patientName}</div>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.4)' }}>{a.durationMins} min · {a.status.toLowerCase()}</div>
                  </div>
                  {a.id === next.id && <span style={{ fontSize: 9, fontWeight: 700, color: '#4ba8a2', background: 'rgba(75,168,162,.15)', padding: '3px 8px', borderRadius: 12 }}>Up next</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="section-title">No upcoming sessions</div>
          <p className="muted" style={{ marginTop: 6 }}>New session requests will appear here and on your <Link href="/expert/schedule">schedule</Link>.</p>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid-4">
        <Link href="/expert/schedule" className="card" style={{ textDecoration: 'none' }}>
          <CalendarClock size={18} style={{ color: 'var(--c-coral-d)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, marginTop: 8 }}>{today.length}</div>
          <div className="muted">sessions today{next && isToday(next.scheduledAt) ? ` · next at ${timeLabel(next.scheduledAt)}` : ''}</div>
        </Link>
        <Link href="/expert/patients" className="card" style={{ textDecoration: 'none' }}>
          <Users size={18} style={{ color: 'var(--c-coral-d)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, marginTop: 8 }}>{caseload.length}</div>
          <div className="muted">active patients</div>
        </Link>
        <Link href="/expert/risk" className="card" style={{ textDecoration: 'none' }}>
          <AlertTriangle size={18} style={{ color: risk.length ? '#C0504B' : 'var(--c-coral)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, marginTop: 8, color: risk.length ? '#C0504B' : undefined }}>{risk.length}</div>
          <div className="muted">{risk.length === 1 ? 'alert needs review' : 'alerts need review'}</div>
        </Link>
        <Link href="/expert/tasks" className="card" style={{ textDecoration: 'none' }}>
          <ListTodo size={18} style={{ color: 'var(--c-coral-d)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, marginTop: 8 }}>{tasks.length}</div>
          <div className="muted">pending tasks</div>
        </Link>
      </div>

      <div className="grid-2">
        {/* ── Pending tasks ── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="section-title">Tasks</div>
            <Link href="/expert/tasks" className="link-action">See all</Link>
          </div>
          {tasks.length === 0 && (
            <p className="muted" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={15} style={{ color: '#3D9E72' }} /> All caught up, notes written, alerts reviewed.
            </p>
          )}
          <div style={{ marginTop: 8 }}>
            {tasks.slice(0, 6).map((t) => (
              <Link key={t.key} href={t.href} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 0', borderTop: '1px solid rgba(28,43,58,.06)', textDecoration: 'none' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: t.urgent ? '#C0504B' : 'var(--c-coral)' }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--c-charcoal)' }}>{t.label}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{t.sub}</div>
                </div>
                {t.urgent && <span style={{ marginLeft: 'auto', fontSize: 9.5, fontWeight: 700, color: '#C0504B', background: 'rgba(192,80,75,.1)', padding: '3px 9px', borderRadius: 12, whiteSpace: 'nowrap' }}>Urgent</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Patient mood overview ── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="section-title">Patient mood overview</div>
            {/* Spelled out because "mood overview" reads like an average and is
                not one — the big number is the most recent check-in. The average
                sits beside it so the two can never look like a contradiction. */}
            <span className="muted" style={{ fontSize: 12 }}>latest check-in · out of 10</span>
          </div>
          {moodRows.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No mood check-ins yet.</p>}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {moodRows.map((p) => (
              <Link key={p.patientId} href={`/expert/patients/${p.patientId}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-charcoal)', width: 110, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                {/* Bar length is the latest score out of 10; bar COLOUR is the
                    trend, not the score. Those are two different facts and the
                    legend below says so. */}
                <span style={{ flex: 1, height: 7, borderRadius: 6, background: 'rgba(28,43,58,.07)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', borderRadius: 6, width: `${(p.lastMood ?? 0) * 10}%`, background: trendColor(p.moodTrend) }} />
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, width: 30, textAlign: 'right' }}>{p.lastMood?.toFixed(1)}</span>
                <span className="muted" style={{ fontSize: 11.5, width: 56, textAlign: 'right', flexShrink: 0 }}>
                  {p.avgMood != null ? `avg ${p.avgMood.toFixed(1)}` : ''}
                </span>
              </Link>
            ))}
          </div>
          {moodRows.length > 0 && (
            <p className="muted" style={{ fontSize: 11.5, marginTop: 12, lineHeight: 1.6 }}>
              Bar length = latest check-in out of 10. Bar colour = direction of travel
              across their last 14 check-ins (improving / stable / declining), not the score.
              <strong> avg</strong> is the mean of those same 14.
            </p>
          )}
        </div>
      </div>

      {/* ── Patient alerts ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="section-title">Patient alerts</div>
          <Link href="/expert/risk" className="link-action">See all</Link>
        </div>
        {risk.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No open alerts.</p>}
        <div style={{ marginTop: 8 }}>
          {risk.slice(0, 3).map((r) => (
            <Link key={r.id} href={`/expert/patients/${r.patientId}`} style={{ display: 'block', padding: '13px 15px', marginTop: 8, borderRadius: 12, background: 'rgba(192,80,75,.06)', border: '1px solid rgba(192,80,75,.18)', textDecoration: 'none' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--c-charcoal)' }}>
                {r.patientName}, {r.message}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{r.detail}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
