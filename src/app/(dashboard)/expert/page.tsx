import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Video, ClipboardList, User, CalendarClock, Users, AlertTriangle, ListTodo, CheckCircle2,
} from 'lucide-react'
import {
  getTherapistContext, getCaseload, getRiskNotifications, getTherapistSchedule,
  getExpertPatientProfile, getMyAssignedTasks, type ScheduleAppointment,
} from '@/lib/expert'
import { MyTaskList } from '@/components/expert/MyTaskList'

function timeLabel(d: Date) {
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}
function isToday(d: Date) {
  const n = new Date()
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
}

/** The doctor's real to-do list, derived from live data, no separate table. */
type DoctorTask = { key: string; label: string; sub: string; href: string; urgent: boolean }

function buildTasks(
  schedule: ScheduleAppointment[],
  risk: { id: string; patientId: string; patientName: string; kind: string }[],
): DoctorTask[] {
  const tasks: DoctorTask[] = []
  // 1. Past sessions still missing a clinical note
  schedule
    .filter((a) => a.isPast && a.status !== 'CANCELLED' && !a.hasSummary)
    .slice(-4)
    .forEach((a) =>
      tasks.push({
        key: `note-${a.id}`,
        label: `Write session note · ${a.patientName}`,
        sub: `Session on ${a.scheduledAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
        href: `/expert/patients/${a.patientId}`,
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
  // 3. Session requests awaiting confirmation
  schedule
    .filter((a) => !a.isPast && a.status === 'PENDING')
    .slice(0, 3)
    .forEach((a) =>
      tasks.push({
        key: `confirm-${a.id}`,
        label: `Confirm session request · ${a.patientName}`,
        sub: `Requested for ${a.scheduledAt.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}`,
        href: '/expert/schedule',
        urgent: false,
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
  const tasks = buildTasks(schedule, risk)

  // Data-composed pre-session context for the hero (fast; no LLM call here).
  const nextProfile = next ? await getExpertPatientProfile(ctx.therapistProfileId, next.patientId) : null
  let brief: string | null = null
  if (next && nextProfile) {
    const bits: string[] = []
    if (nextProfile.moodWeek.length) {
      const moods = nextProfile.moodWeek.map((m) => m.mood)
      bits.push(`Mood last ${moods.length} check-ins: ${moods.join(', ')} (${nextProfile.moodTrend}).`)
    }
    const openTasks = nextProfile.tasks.filter((t) => !t.done)
    if (nextProfile.tasks.length) {
      bits.push(
        openTasks.length
          ? `${openTasks.length} of ${nextProfile.tasks.length} homework tasks still open.`
          : 'All assigned homework completed.',
      )
    }
    if (nextProfile.sessionNotes[0]?.raw) bits.push(`Last note: ${nextProfile.sessionNotes[0].raw}`)
    if (nextProfile.openCrisisCount > 0) bits.push(`⚠ ${nextProfile.openCrisisCount} open crisis alert(s).`)
    brief = bits.join(' ')
  }

  const moodRows = caseload.filter((p) => p.lastMood !== null).slice(0, 6)
  const trendColor = (t: string) => (t === 'improving' ? '#3D9E72' : t === 'declining' ? '#C0504B' : '#C9973A')

  return (
    <div className="stack">
      {/* ── Up-next hero ── */}
      {next && nextProfile ? (
        <div className="card" style={{ background: 'radial-gradient(ellipse 70% 80% at 92% 0%, rgba(26,127,122,.35), transparent 60%), #141E29', border: 'none', color: '#fff', padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 28, alignItems: 'start' }}>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4ba8a2', background: 'rgba(75,168,162,.14)', padding: '5px 12px', borderRadius: 20 }}>
                ● Up next · {isToday(next.scheduledAt) ? `${timeLabel(next.scheduledAt)} today` : next.scheduledAt.toLocaleString('en-IN', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 34, lineHeight: 1.05, margin: '14px 0 6px' }}>
                Session #{nextProfile.sessionsDone + 1} with <span style={{ color: '#4ba8a2', fontWeight: 700 }}>{next.patientName}</span>
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: 16 }}>
                {nextProfile.trackLabel} · {next.durationMins} min · Google Meet
              </p>
              {brief && (
                <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4ba8a2', marginBottom: 7 }}>✦ Pre-session context</div>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,.78)' }}>{brief}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href={`/app/sessions/${next.roomId ?? next.id}/room`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <Video size={15} /> Join Meet
                </Link>
                <Link href={`/expert/patients/${next.patientId}`} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.08)', color: '#fff', border: '1px solid rgba(255,255,255,.16)' }}>
                  <ClipboardList size={15} /> Session notes
                </Link>
                <Link href={`/expert/patients/${next.patientId}`} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.08)', color: '#fff', border: '1px solid rgba(255,255,255,.16)' }}>
                  <User size={15} /> {next.patientName.split(' ')[0]}&apos;s profile
                </Link>
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
          <CalendarClock size={18} style={{ color: 'var(--c-coral)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, marginTop: 8 }}>{today.length}</div>
          <div className="muted">sessions today{next && isToday(next.scheduledAt) ? ` · next at ${timeLabel(next.scheduledAt)}` : ''}</div>
        </Link>
        <Link href="/expert/patients" className="card" style={{ textDecoration: 'none' }}>
          <Users size={18} style={{ color: 'var(--c-coral)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, marginTop: 8 }}>{caseload.length}</div>
          <div className="muted">active patients</div>
        </Link>
        <Link href="/expert/risk" className="card" style={{ textDecoration: 'none' }}>
          <AlertTriangle size={18} style={{ color: risk.length ? '#C0504B' : 'var(--c-coral)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, marginTop: 8, color: risk.length ? '#C0504B' : undefined }}>{risk.length}</div>
          <div className="muted">{risk.length === 1 ? 'alert needs review' : 'alerts need review'}</div>
        </Link>
        <div className="card">
          <ListTodo size={18} style={{ color: 'var(--c-coral)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, marginTop: 8 }}>{tasks.length}</div>
          <div className="muted">pending tasks</div>
        </div>
      </div>

      <div className="grid-2">
        {/* ── Pending tasks ── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="section-title">Pending tasks</div>
            <span className="muted" style={{ fontSize: 12 }}>{tasks.length} open</span>
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
            <span className="muted" style={{ fontSize: 12 }}>latest check-in</span>
          </div>
          {moodRows.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No mood check-ins yet.</p>}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {moodRows.map((p) => (
              <Link key={p.patientId} href={`/expert/patients/${p.patientId}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-charcoal)', width: 110, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                <span style={{ flex: 1, height: 7, borderRadius: 6, background: 'rgba(28,43,58,.07)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', borderRadius: 6, width: `${(p.lastMood ?? 0) * 10}%`, background: trendColor(p.moodTrend) }} />
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, width: 30, textAlign: 'right' }}>{p.lastMood?.toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tasks assigned by admin ── */}
      {myTasks.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="section-title">Tasks from admin</div>
            <span className="muted" style={{ fontSize: 12 }}>{myTasks.filter((t) => !t.done).length} open</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <MyTaskList tasks={myTasks} />
          </div>
        </div>
      )}

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
