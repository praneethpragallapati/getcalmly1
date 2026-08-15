import { getCommunityPolls } from '@/lib/polls'
import { getSessionUserId } from '@/lib/patient'
import { PollCard } from '@/components/community/PollCard'

export const dynamic = 'force-dynamic'

export default async function PollsPage() {
  const userId = await getSessionUserId()
  const polls = await getCommunityPolls(userId)
  // Show only polls still open and not yet answered by this member. Pinned first,
  // then newest-first (getCommunityPolls returns createdAt desc; the sort is stable).
  const ordered = polls
    .filter((p) => !p.expired && p.myVote === null)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))

  return (
    <>
      <p className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--c-coral)', marginBottom: 6 }}>
        Calm Club · Polls
      </p>
      <div className="page-head">
        <div className="page-title">Community polls</div>
        <div className="page-meta">Have your say — one vote each, results update live.</div>
      </div>

      {ordered.length === 0 ? (
        <div className="card"><p className="muted">{polls.length === 0 ? 'No polls yet. Check back soon — the getCalmly team posts these from time to time.' : 'You’ve answered all the current polls. Check back soon for new ones.'}</p></div>
      ) : (
        <div className="stack" style={{ gap: 16, maxWidth: 640 }}>
          {ordered.map((p) => <PollCard key={p.id} poll={p} canVote={Boolean(userId)} />)}
        </div>
      )}
    </>
  )
}
