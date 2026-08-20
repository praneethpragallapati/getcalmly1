import { Flame, TrendingUp, CalendarCheck, NotebookPen } from 'lucide-react'
import { getDashboardData, getWeeklyProgress } from '@/lib/dashboard'
import { getMilestones } from '@/lib/milestones'
import { getSessionUserId } from '@/lib/patient'
import { MilestonesPanel } from '@/components/dashboard/MilestonesPanel'

export const dynamic = 'force-dynamic'

/**
 * My Progress — the measurement page. Home stays about today (the AI brief, the
 * next session, the check-in, this week's mood); the longer view of how things
 * are trending lives here so neither page has to carry both.
 */
export default async function ProgressPage() {
  const d = await getDashboardData()
  const userId = await getSessionUserId()
  const [weekly, milestones] = userId
    ? await Promise.all([getWeeklyProgress(userId), getMilestones(userId)])
    : [null, []]

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">My Progress</h1>
        <span className="page-meta">
          Started {d.startedOn} · {d.daysOnPlatform} days on getCalmly
        </span>
      </div>

      <div className="stack">
        <div className="grid-4">
          <div className="card stat-card">
            <span className="stat-ic t-coral"><Flame size={20} /></span>
            <span className="stat-badge t-coral">Personal best</span>
            <div className="stat-n">{d.streakDays}<span> days</span></div>
            <div className="stat-l">Current streak</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-purple"><TrendingUp size={20} /></span>
            {d.moodMonthChangePct !== null && (
              <span className={`stat-badge ${d.moodMonthChangePct >= 0 ? 't-green' : 't-coral'}`}>
                {d.moodMonthChangePct >= 0 ? '↑' : '↓'}{Math.abs(d.moodMonthChangePct)}% month
              </span>
            )}
            <div className="stat-n">{d.avgMood > 0 ? d.avgMood.toFixed(1) : '—'}{d.avgMood > 0 && <span> /10</span>}</div>
            <div className="stat-l">Avg mood score</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-green"><CalendarCheck size={20} /></span>
            <span className={`stat-badge ${d.planActive ? 't-green' : 't-gold'}`}>{d.planActive ? 'Active' : 'No active plan'}</span>
            <div className="stat-n">{d.sessionsDone}</div>
            <div className="stat-l">Therapy sessions</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-gold"><NotebookPen size={20} /></span>
            <span className="stat-badge t-gold">Consistent</span>
            <div className="stat-n">{d.journalCount}</div>
            <div className="stat-l">Journal entries</div>
          </div>
        </div>

        {weekly && (
          <div className="card tint-green">
            <div className="section-title" style={{ marginBottom: 8 }}>This week</div>
            <div className="muted">
              Tasks from your expert: <b style={{ color: 'var(--c-charcoal)' }}>{weekly.tasksCompleted}/{weekly.tasksAssigned}</b> completed ({weekly.completionPct}%)
            </div>
            <div className="muted">
              Mood check-ins: <b style={{ color: 'var(--c-charcoal)' }}>{weekly.moodCheckins}</b>
              {weekly.moodAvg !== null ? ` · avg ${weekly.moodAvg}/10` : ''}
            </div>
          </div>
        )}

        <MilestonesPanel milestones={milestones} />
      </div>
    </>
  )
}
