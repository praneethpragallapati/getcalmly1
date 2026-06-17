import { Sparkles, TrendingUp, Heart, AlertCircle } from 'lucide-react'
import { getDashboardData } from '@/lib/dashboard'
import { NewEntry } from '@/components/dashboard/NewEntry'
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

export default async function JournalPage() {
  const d = await getDashboardData()

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">My Journal</h1>
        <span className="page-meta">
          {d.journalCount} entries · {d.streakDays}-day streak 🔥
        </span>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }}
      >
        <div className="card">
          {d.journals.map((j) => (
            <div className="entry" key={j.id}>
              <div className="entry-head">
                <span className="entry-title">{j.title}</span>
                <span className="entry-date">{j.date}</span>
              </div>
              <div className="entry-preview">{j.preview}</div>
              {(j.moodTag || j.topicTags.length > 0) && (
                <div className="entry-tags">
                  {j.moodTag && <span className="tag">{j.moodTag}</span>}
                  {j.topicTags.map((t) => (
                    <span className="tag t-purple" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="stack">
          <NewEntry />

          {/* AI-detected patterns (#12 — copy from the AI integration later) */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 6 }}>
              AI-detected patterns
            </div>
            {d.journalPatterns.map((p) => {
              const Icon = TONE_ICON[p.tone]
              return (
                <div className="pattern" key={p.title}>
                  <span className={`pattern-ic ${TONE_CLASS[p.tone]}`}>
                    <Icon size={15} />
                  </span>
                  <div>
                    <div className="pattern-title">{p.title}</div>
                    <div className="pattern-sub">{p.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Weekly insight (#12) */}
          <div className="card" style={{ background: '#1c2b3a', color: '#fff', border: 'none' }}>
            <span className="hero-badge">CALM AI · THIS WEEK</span>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {d.weeklyInsight.title}
            </div>
            <p style={{ fontSize: 13, color: '#b9c3cd', lineHeight: 1.55 }}>
              {d.weeklyInsight.body}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
