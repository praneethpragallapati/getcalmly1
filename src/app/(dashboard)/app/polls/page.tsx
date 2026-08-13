import { getCommunityPolls } from '@/lib/polls'
import { getSessionUserId } from '@/lib/patient'
import { PollCard } from '@/components/community/PollCard'

export const dynamic = 'force-dynamic'

export default async function PollsPage() {
  const userId = await getSessionUserId()
  const polls = await getCommunityPolls(userId)
  // Pinned polls always sit at the very top of the tab; then open polls, then closed.
  const pinned = polls.filter((p) => p.pinned)
  const active = polls.filter((p) => !p.pinned && !p.expired)
  const closed = polls.filter((p) => !p.pinned && p.expired)

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
          {pinned.map((p) => <PollCard key={p.id} poll={p} canVote={Boolean(userId) && !p.expired} />)}
          {active.map((p) => <PollCard key={p.id} poll={p} canVote={Boolean(userId)} />)}
          {closed.length > 0 && (
            <>
              <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 6 }}>Closed polls</div>
              {closed.map((p) => <PollCard key={p.id} poll={p} canVote={false} />)}
            </>
          )}
        </div>
      )}
    </>
  )
}
