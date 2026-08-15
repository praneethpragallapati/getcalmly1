import { getCommunityPolls } from '@/lib/polls'
import { getSessionUserId } from '@/lib/patient'
import { PollCard } from '@/components/community/PollCard'

export const dynamic = 'force-dynamic'

export default async function PollsPage() {
  const userId = await getSessionUserId()
  const polls = await getCommunityPolls(userId)
  // Pinned polls sit at the very top; then every other poll in newest-first order
  // (getCommunityPolls already returns createdAt desc, and this sort is stable).
  const ordered = [...polls].sort((a, b) => Number(b.pinned) - Number(a.pinned))

  return (
    <>
      <p className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--c-coral)', marginBottom: 6 }}>
        Calm Club · Polls
      </p>
      <div className="page-head">
        <div className="page-title">Community polls</div>
        <div className="page-meta">Have your say — one vote each, results update live.</div>
      </div>

      {polls.length === 0 ? (
        <div className="card"><p className="muted">No polls yet. Check back soon — the getCalmly team posts these from time to time.</p></div>
      ) : (
        <div className="stack" style={{ gap: 16, maxWidth: 640 }}>
          {ordered.map((p) => <PollCard key={p.id} poll={p} canVote={Boolean(userId) && !p.expired} />)}
        </div>
      )}
    </>
  )
}
