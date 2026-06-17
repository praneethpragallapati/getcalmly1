import Link from 'next/link'
import {
  Sparkles,
  PenLine,
  Video,
  FileText,
  Flame,
  TrendingUp,
  NotebookPen,
  CalendarCheck,
  Pill,
  Heart,
  MessageCircle,
  AlertCircle,
} from 'lucide-react'
import { getDashboardData } from '@/lib/dashboard'
import { CheckIn } from '@/components/dashboard/CheckIn'
import { MoodWeekChart } from '@/components/dashboard/MoodWeekChart'
import { TaskList } from '@/components/dashboard/TaskList'
import type { Pattern } from '@/data/dashboardDemo'

const TONE_CLASS: Record<Pattern['tone'], string> = {
  coral: 't-coral',
  green: 't-green',
  gold: 't-gold',
  purple: 't-purple',
}
const TONE_ICON: Record<Pattern['tone'], typeof AlertCircle> = {
  coral: AlertCircle,
  green: Sparkles,
  gold: TrendingUp,
  purple: Heart,
}

export default async function AppHomePage() {
  const d = await getDashboardData()
  const openTasks = d.tasks.filter((t) => !t.done).length
  const med = d.medications.find((m) => m.active)

  return (
    <div className="stack">
      {/* Hero — daily Calm AI insight (#10) */}
      <section className="hero">
        <div>
          <span className="hero-badge">CALM AI · TODAY’S INSIGHT</span>
          <h2>{d.dailyInsight.title}</h2>
          <p>{d.dailyInsight.body}</p>
          <div className="hero-actions">
            <Link href="/app/calm-ai" className="btn btn-primary">
              <Sparkles size={16} /> Open Calm AI
            </Link>
            <Link href="/app/journal" className="btn btn-ghost-d">
              <PenLine size={16} /> Start a journal entry
            </Link>
          </div>
        </div>
        <div className="hero-side">
          <div className="hero-side-label">DETECTED THIS WEEK</div>
          {d.detectedThisWeek.map((p) => {
            const Icon = TONE_ICON[p.tone]
            return (
              <div className="detected" key={p.title}>
                <span className={`detected-ic ${TONE_CLASS[p.tone]}`}>
                  <Icon size={15} />
                </span>
                <div>
                  <div className="detected-title">{p.title}</div>
                  <div className="detected-sub">{p.sub}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Morning check-in (#8) */}
      <CheckIn initial={d.checkin} streakDays={d.streakDays} />

      {/* Mood trend (#15) + today's session (#3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        <MoodWeekChart data={d.moodWeek} avgMood={d.avgMood} />

        {d.todaySession && (
          <div className="card">
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}
            >
              <div className="section-title">Today’s session</div>
              <Link href="/app/sessions" className="link-action">
                All →
              </Link>
            </div>
            <div className="session-card-row">
              <span className="doc-avatar">👩‍⚕️</span>
              <div>
                <div className="doc-name">{d.todaySession.expert}</div>
                <div className="doc-sub">{d.todaySession.expertRole}</div>
                <div className="tag-row">
                  {d.todaySession.tags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="session-info-grid">
              <div>
                <div className="lbl">TIME</div>
                <div className="val">{d.todaySession.when.split('·').pop()?.trim()}</div>
              </div>
              <div>
                <div className="lbl">DURATION</div>
                <div className="val">{d.todaySession.durationMins} min</div>
              </div>
              <div>
                <div className="lbl">SESSION</div>
                <div className="val">#{d.todaySession.sessionNo}</div>
              </div>
            </div>
            <Link
              href={`/app/sessions/${d.todaySession.id}/room`}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Video size={16} /> Join session
            </Link>
            <Link
              href={`/app/sessions/${d.todaySession.id}`}
              className="link-action"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14 }}
            >
              <FileText size={14} /> Add pre-session note
            </Link>
          </div>
        )}
      </div>

      {/* Quick stats (#8) */}
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
          <span className="stat-badge t-green">↑18% month</span>
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
          <span className="stat-badge t-green">Active</span>
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

      {/* Recent journal · tasks + meds · community */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div className="section-title">Recent journal</div>
            <Link href="/app/journal" className="link-action">
              All entries →
            </Link>
          </div>
          {d.journals.slice(0, 3).map((j) => (
            <div className="entry" key={j.id}>
              <div className="entry-head">
                <span className="entry-title">{j.title}</span>
                <span className="entry-date">{j.date}</span>
              </div>
              <div className="entry-preview">{j.preview.slice(0, 110)}…</div>
            </div>
          ))}
        </div>

        <div className="stack">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div className="section-title">Today’s tasks</div>
              <span className="link-action">{openTasks} left</span>
            </div>
            <TaskList tasks={d.tasks} />
          </div>

          {/* Medications glimpse (#14 — full screen at /app/medications) */}
          {med && (
            <Link href="/app/medications" className="card" style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="section-title">Medications</div>
                <span className="link-action">Manage →</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="task-ic">
                  <Pill size={16} />
                </span>
                <div>
                  <div className="doc-name" style={{ fontSize: 15 }}>
                    {med.name} {med.dosage}
                  </div>
                  <div className="doc-sub">
                    {med.frequency} · {med.times.join(', ')}
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div className="section-title">Community</div>
            <Link href="/app/community" className="link-action">
              See all →
            </Link>
          </div>
          {d.community.map((c) => (
            <div className="comm-item" key={c.author}>
              <span className="comm-avatar">{c.author.charAt(0).toUpperCase()}</span>
              <div style={{ minWidth: 0 }}>
                <div className="comm-meta">
                  {c.author} · {c.role}
                </div>
                <div className="comm-text">{c.text}</div>
                <div className="comm-stats">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={12} /> {c.likes}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <MessageCircle size={12} /> {c.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
