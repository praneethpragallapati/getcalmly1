import { redirect } from 'next/navigation'
import { getAdminSession, getFeedback } from '@/lib/admin'
import { FeedbackTable } from '@/components/admin/FeedbackTable'

export const dynamic = 'force-dynamic'

export default async function AdminFeedbackPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const rows = await getFeedback()

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Patient feedback</div>
        <div className="page-meta">Every post-session rating · filter by clinician, patient, rating, recency or package type</div>
      </div>

      {rows.length === 0 ? (
        <div className="card"><p className="muted">No session ratings yet. Feedback appears here as patients rate their completed sessions.</p></div>
      ) : (
        <FeedbackTable rows={rows} />
      )}
    </div>
  )
}
