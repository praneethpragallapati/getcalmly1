import { notFound, redirect } from 'next/navigation'
import { AlertTriangle, Flame, Check, Sparkles } from 'lucide-react'
import { getTherapistContext, getExpertPatientProfile, generatePreSessionBrief } from '@/lib/expert'
import { getWeeklyProgress } from '@/lib/dashboard'
import { assignTask } from '../../actions'

const TREND_LABEL: Record<string, string> = {
  improving: 'Improving',
  declining: 'Declining',
  stable: 'Stable',
  insufficient: 'Not enough data yet',
}

export default async function ExpertPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const p = await getExpertPatientProfile(ctx.therapistProfileId, id)
  if (!p) notFound()

  const [weekly, brief] = await Promise.all([
    getWeeklyProgress(id),
    generatePreSessionBrief(ctx.therapistProfileId, id),
  ])

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <div className="page-title">{p.name}</div>
          <div className="page-meta">{p.trackLabel}{p.diagnosis ? ` · ${p.diagnosis}` : ''}{p.therapyStatus ? ` · ${p.therapyStatus}` : ''}</div>
        </div>
      </div>

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
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>Session notes</div>
        {p.sessionNotes.length === 0 && <p className="muted">No session notes recorded yet.</p>}
        {p.sessionNotes.map((s, i) => (
          <div key={i} className="pattern">
            <div>
              <div className="pattern-title">{s.date}</div>
              <div className="pattern-sub">{s.raw || 'No note for this session.'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
