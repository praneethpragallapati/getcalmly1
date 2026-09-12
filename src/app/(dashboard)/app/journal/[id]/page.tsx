import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getSessionUserId } from '@/lib/patient'
import { getJournalEntry } from '@/lib/journal'
import { JournalEntryView } from '@/components/dashboard/JournalEntryView'

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
        <JournalEntryView entry={entry} />
      </div>
    </>
  )
}
