import { getCommunityPolls, isPollOpen, needsAnswer, orderPolls } from '@/lib/polls'
import { getSessionUserId } from '@/lib/patient'
import { PollCard } from '@/components/community/PollCard'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { REAL_TALK_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function PollsPage() {
  const userId = await getSessionUserId()
  const polls = await getCommunityPolls(userId)
  // Every poll that's still open, unanswered ones first. Filtering out answered
  // polls used to pull a multi-select poll off the page after a single tap, and
  // it also meant nobody ever saw the live results this page promises.
  const ordered = orderPolls(polls.filter(isPollOpen))
  const unanswered = ordered.filter(needsAnswer).length

  return (
    <>
      <SectionTabs
        eyebrow="Calm Club · Real Talk"
        title="Real Talk"
        meta="Have your say — one vote each, results update live."
        tabs={REAL_TALK_TABS.map((t) => (t.href === '/app/polls' ? { ...t, badge: unanswered } : t))}
        active="/app/polls"
      />

      {ordered.length === 0 ? (
        <div className="card"><p className="muted">{polls.length === 0 ? 'No polls yet. Check back soon — the getCalmly team posts these from time to time.' : 'No polls are open right now. Check back soon for new ones.'}</p></div>
      ) : (
        <div className="stack" style={{ gap: 16, maxWidth: 640 }}>
          {ordered.map((p) => <PollCard key={p.id} poll={p} canVote={Boolean(userId)} />)}
        </div>
      )}
    </>
  )
}
