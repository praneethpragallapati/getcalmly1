import { getDashboardData } from '@/lib/dashboard'
import { NewEntry } from '@/components/dashboard/NewEntry'

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
        </div>
      </div>
    </>
  )
}
