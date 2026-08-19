import { getCommunityPolls } from '@/lib/polls'
import { getSessionUserId } from '@/lib/patient'
import { PollCard } from '@/components/community/PollCard'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { REAL_TALK_TABS } from '@/data/sectionTabs'

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
      <SectionTabs
        eyebrow="Calm Club · Real Talk"
        title="Real Talk"
        meta="Have your say — one vote each, results update live."
        tabs={REAL_TALK_TABS.map((t) => (t.href === '/app/polls' ? { ...t, badge: ordered.length } : t))}
        active="/app/polls"
      />

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
