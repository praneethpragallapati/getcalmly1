import CommunityFeed from '@/components/community/CommunityFeed'
import { getCommunityPosts, getCommunityStats, getMyCommunityPostIds } from '@/lib/community'
import { getSessionUserId } from '@/lib/patient'

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const userId = await getSessionUserId()
  const [posts, stats, myPostIds] = await Promise.all([
    getCommunityPosts(),
    getCommunityStats(),
    userId ? getMyCommunityPostIds(userId) : Promise.resolve([]),
  ])

  return (
    <CommunityFeed posts={posts} stats={stats} authed embedded myPostIds={myPostIds} detailBase="/community" />
  )
}
