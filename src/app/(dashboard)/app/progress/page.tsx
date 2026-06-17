import { Flame, TrendingUp, CalendarCheck, NotebookPen, Check, Lock } from 'lucide-react'
import { getDashboardData, getWeeklyProgress } from '@/lib/dashboard'
import { getSessionUserId } from '@/lib/patient'

function LineChart({ points }: { points: { label: string; value: number }[] }) {
  const w = 520
  const h = 150
  const pad = 28
  const max = Math.max(...points.map((p) => p.value), 10)
  const min = Math.min(...points.map((p) => p.value), 0)
  const span = max - min || 1
  const x = (i: number) => pad + (i * (w - pad * 2)) / (points.length - 1)
  const y = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="linechart">
      <path d={path} fill="none" stroke="#c8553d" strokeWidth={2.5} strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.value)} r={4} fill="#c8553d" />
          <text x={x(i)} y={y(p.value) - 10} fontSize={11} fill="#8e9eae" textAnchor="middle">
            {p.value.toFixed(1)}
          </text>
          <text x={x(i)} y={h - 6} fontSize={10} fill="#8e9eae" textAnchor="middle">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default async function ProgressPage() {
  const d = await getDashboardData()
  const userId = await getSessionUserId()
  const weekly = userId ? await getWeeklyProgress(userId) : null
  const first = d.moodOverTime[0]?.value ?? 0
  const last = d.moodOverTime[d.moodOverTime.length - 1]?.value ?? 0

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">My Progress</h1>
        <span className="page-meta">
          Started {d.startedOn} · {d.daysOnPlatform} days on getCalmly
        </span>
      </div>

      <div className="stack">
        {weekly && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 8 }}>This week</div>
            <div className="muted">
              Tasks from your expert: {weekly.tasksCompleted}/{weekly.tasksAssigned} completed ({weekly.completionPct}%)
            </div>
            <div className="muted">
              Mood check-ins: {weekly.moodCheckins}
              {weekly.moodAvg !== null ? ` · avg ${weekly.moodAvg}/10` : ''}
            </div>
          </div>
        )}
        <div className="grid-4">
          <div className="card stat-card">
            <span className="stat-ic t-coral">
              <Flame size={20} />
            </span>
            <span className="stat-badge t-coral">Personal best</span>
            <div className="stat-n">
              {d.streakDays}
              <span> days</span>
            </div>
            <div className="stat-l">Current streak</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-purple">
              <TrendingUp size={20} />
            </span>
            {d.moodMonthChangePct !== null && (
              <span className={`stat-badge ${d.moodMonthChangePct >= 0 ? 't-green' : 't-coral'}`}>
                {d.moodMonthChangePct >= 0 ? '↑' : '↓'}
                {Math.abs(d.moodMonthChangePct)}% month
              </span>
            )}
            <div className="stat-n">
              {d.avgMood.toFixed(1)}
              <span> /10</span>
            </div>
            <div className="stat-l">Avg mood score</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-green">
              <CalendarCheck size={20} />
            </span>
            <span className={`stat-badge ${d.planActive ? 't-green' : 't-gold'}`}>{d.planActive ? 'Active' : 'No active plan'}</span>
            <div className="stat-n">{d.sessionsDone}</div>
            <div className="stat-l">Therapy sessions</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-gold">
              <NotebookPen size={20} />
            </span>
            <span className="stat-badge t-gold">Consistent</span>
            <div className="stat-n">{d.journalCount}</div>
            <div className="stat-l">Journal entries</div>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>
              Mood over time
            </div>
            <LineChart points={d.moodOverTime} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
                fontSize: 12,
                color: 'var(--c-gray)',
              }}
            >
              <span>Started: {first.toFixed(1)} avg</span>
              <span>
                Now: <strong style={{ color: 'var(--c-charcoal)' }}>{last.toFixed(1)} avg {last >= first ? '↑' : '↓'}</strong>
              </span>
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 6 }}>
              Milestones
            </div>
            {d.milestones.map((m) => (
              <div className="milestone" key={m.label}>
                <span className={`ms-ic ${m.done ? 'done' : 'todo'}`}>
                  {m.done ? <Check size={16} strokeWidth={3} /> : <Lock size={15} />}
                </span>
                <div>
                  <div className={`ms-label ${m.done ? '' : 'todo'}`}>{m.label}</div>
                  <div className="ms-sub">{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
