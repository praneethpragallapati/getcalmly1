import CommunityFeed from '@/components/community/CommunityFeed'
import { getCommunityPosts, getCommunityStats, getMyCommunityPostIds } from '@/lib/community'
import { getCommunityPolls } from '@/lib/polls'
import { getSessionUserId } from '@/lib/patient'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { REAL_TALK_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const userId = await getSessionUserId()
  const [posts, stats, myPostIds, polls] = await Promise.all([
    getCommunityPosts(),
    getCommunityStats(),
    userId ? getMyCommunityPostIds(userId) : Promise.resolve([]),
    getCommunityPolls(userId),
  ])

  const openPolls = polls.filter((p) => !p.expired && p.myVote === null).length

  return (
    <>
      <SectionTabs
        eyebrow="Calm Club · Real Talk"
        title="Real Talk"
        meta="Honest conversations with people who get it."
        tabs={REAL_TALK_TABS.map((t) => (t.href === '/app/polls' ? { ...t, badge: openPolls } : t))}
        active="/app/community"
      />
      <CommunityFeed posts={posts} stats={stats} authed embedded myPostIds={myPostIds} detailBase="/app/community" showHero={false} />
    </>
  )
}
