import Link from 'next/link'
import { ArrowRight, Flame, TrendingUp, Video } from 'lucide-react'
import { getDashboardData } from '@/lib/dashboard'
import { SERVICE_ICONS } from '@/components/site/serviceIcons'
import { MoodCheckIn } from '@/components/dashboard/MoodCheckIn'
import { TaskList } from '@/components/dashboard/TaskList'

export default async function AppHomePage() {
  const d = await getDashboardData()
  const TrackIcon = SERVICE_ICONS[d.trackSlug] ?? SERVICE_ICONS.therapy
  const openTasks = d.tasks.filter((t) => !t.done).length

  // Mood trend bar heights (score 1–5 → % of the 52px track).
  const maxScore = 5

  return (
    <>
      <div className="greeting">
        <h1>
          Hi <span>{d.name}</span> 👋
        </h1>
        <p>Here&apos;s your space for today.</p>
      </div>

      {/* Current plan / track */}
      <Link href="/app/account" className="app-card plan-strip">
        <span className="plan-icon">
          <TrackIcon size={22} />
        </span>
        <div className="plan-meta">
          <div className="plan-track">{d.trackTitle}</div>
          <div className="plan-sub">
            {d.category} · {d.sessionsTotal - d.sessionsUsed} of {d.sessionsTotal} sessions left
          </div>
        </div>
        <span className="tier-badge">{d.tier.toUpperCase()}</span>
      </Link>

      {/* Mood check-in */}
      <MoodCheckIn />

      {/* Streak + mood trend */}
      <div className="progress-row">
        <div className="app-card prog-card">
          <div className="prog-title">
            <Flame size={13} /> STREAK
          </div>
          <div className="prog-days">
            {d.streakDays}
            <span> days</span>
          </div>
          <div className="prog-sub">Check-ins in a row</div>
          <div className="streak-dots">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} className={`streak-dot${i < d.streakDays ? '' : ' empty'}`} />
            ))}
          </div>
        </div>
        <div className="app-card prog-card">
          <div className="prog-title">
            <TrendingUp size={13} /> MOOD TREND
          </div>
          <div className="mood-bars">
            {d.moodTrend.map((m) => (
              <div className="mbar-wrap" key={m.day}>
                <span
                  className={`mbar${m.today ? ' today' : ''}`}
                  style={{ height: `${(m.score / maxScore) * 100}%` }}
                />
                <span className={`mbar-day${m.today ? ' today' : ''}`}>{m.day[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily AI insight (#10 — body comes from the AI integration later) */}
      <div className="ai-card">
        <span className="ai-badge">CALM AI · DAILY INSIGHT</span>
        <div className="ai-title">{d.dailyInsight.title}</div>
        <div className="ai-body">{d.dailyInsight.body}</div>
        <Link href="/app/calm-ai" className="ai-btn">
          Talk to Calm AI <ArrowRight size={15} />
        </Link>
      </div>

      {/* Next session */}
      {d.nextSession && (
        <div className="session-card">
          <div className="doc-row">
            <span className="doc-avatar">👩‍⚕️</span>
            <div>
              <div className="doc-name">{d.nextSession.expert}</div>
              <div className="doc-sub">{d.nextSession.expertRole}</div>
            </div>
            <span className="rci-badge">✓ RCI</span>
          </div>
          <div className="session-time-row">
            <div>
              <div className="session-label">NEXT SESSION</div>
              <div className="session-time">{d.nextSession.when}</div>
              <div className="session-detail">{d.nextSession.durationMins} min · Video call</div>
            </div>
            <Link href={`/app/care`} className="join-btn">
              <Video size={15} /> Join
            </Link>
          </div>
          <div className="session-actions">
            <Link href={`/app/care`} className="session-action">
              Pre-session notes
            </Link>
            <Link href="/app/care" className="session-action">
              Reschedule
            </Link>
          </div>
        </div>
      )}

      {/* Tasks (#16) */}
      <div className="section-header">
        <span className="section-title">Today&apos;s tasks</span>
        <span className="view-all">{openTasks} left</span>
      </div>
      <TaskList tasks={d.tasks} />

      {/* Quick actions */}
      <div className="quick-grid">
        <Link href="/app/journal" className="quick-card pink">
          <ArrowRight className="quick-icon" size={20} />
          <span className="quick-title">New journal</span>
          <span className="quick-sub">Write it out</span>
        </Link>
        <Link href="/app/care" className="quick-card green">
          <ArrowRight className="quick-icon" size={20} />
          <span className="quick-title">Book session</span>
          <span className="quick-sub">With your expert</span>
        </Link>
        <Link href="/app/calm-ai" className="quick-card purple">
          <ArrowRight className="quick-icon" size={20} />
          <span className="quick-title">Calm AI</span>
          <span className="quick-sub">Chat anytime</span>
        </Link>
        <Link href="/app/journal?tab=insights" className="quick-card yellow">
          <ArrowRight className="quick-icon" size={20} />
          <span className="quick-title">Insights</span>
          <span className="quick-sub">Your week</span>
        </Link>
      </div>
    </>
  )
}
