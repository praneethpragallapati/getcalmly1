import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getSessionUserId } from '@/lib/patient'
import { getJournalEntry } from '@/lib/journal'

export const dynamic = 'force-dynamic'

export default async function JournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getSessionUserId()
  if (!userId) redirect('/login')

  const entry = await getJournalEntry(userId, id)
  if (!entry) notFound()

  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/app/journal" className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to journal
          </Link>
          <h1 className="page-title" style={{ marginTop: 6 }}>{entry.title}</h1>
          <span className="page-meta">{entry.dateLabel}</span>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        {(entry.moodTag || entry.topicTags.length > 0) && (
          <div className="entry-tags" style={{ marginTop: 0, marginBottom: 16 }}>
            {entry.moodTag && <span className="tag">{entry.moodTag}</span>}
            {entry.topicTags.map((t) => (
              <span className="tag t-purple" key={t}>{t}</span>
            ))}
          </div>
        )}
        <div className="journal-body">{entry.content}</div>
      </div>
    </>
  )
}
