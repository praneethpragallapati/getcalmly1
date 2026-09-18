import CommunityFeed from '@/components/community/CommunityFeed'
import { getCommunityPosts, getCommunityStats, getMyCommunityPostIds } from '@/lib/community'
import { getCommunityPolls, needsAnswer } from '@/lib/polls'
import { getSessionUserId } from '@/lib/patient'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { CALM_CLUB_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const userId = await getSessionUserId()
  const [posts, stats, myPostIds, polls] = await Promise.all([
    getCommunityPosts(),
    getCommunityStats(),
    userId ? getMyCommunityPostIds(userId) : Promise.resolve([]),
    getCommunityPolls(userId),
  ])

  const openPolls = polls.filter(needsAnswer).length

  return (
    <>
      <SectionTabs
        eyebrow="Calm Club · The Circles"
        title="The Circles"
        meta="Honest conversations with people who get it."
        tabs={CALM_CLUB_TABS.map((t) => (t.href === '/app/polls' ? { ...t, badge: openPolls } : t))}
        active="/app/community"
      />
      <CommunityFeed posts={posts} stats={stats} authed embedded myPostIds={myPostIds} detailBase="/app/community" showHero={false} />
    </>
  )
}
