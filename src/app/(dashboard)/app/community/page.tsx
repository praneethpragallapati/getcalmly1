import CommunityFeed from '@/components/community/CommunityFeed'
import { BlogsStrip } from '@/components/dashboard/BlogsStrip'
import { getBlogPosts } from '@/lib/blog'
import { getCommunityPosts, getCommunityStats, getMyCommunityPostIds } from '@/lib/community'
import { getSessionUserId } from '@/lib/patient'

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const userId = await getSessionUserId()
  const [posts, stats, myPostIds, blogs] = await Promise.all([
    getCommunityPosts(),
    getCommunityStats(),
    userId ? getMyCommunityPostIds(userId) : Promise.resolve([]),
    getBlogPosts(),
  ])

  return (
    <>
      <BlogsStrip posts={blogs} />
      <CommunityFeed posts={posts} stats={stats} authed embedded myPostIds={myPostIds} detailBase="/community" />
    </>
  )
}
