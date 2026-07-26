import { redirect } from 'next/navigation'
import CommunityFeed from '@/components/community/CommunityFeed'
import { getTherapistContext } from '@/lib/expert'
import { getCommunityPosts, getCommunityStats, getMyCommunityPostIds } from '@/lib/community'

export const metadata = { title: 'Community · Expert portal', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function ExpertCommunityPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const [posts, stats, myPostIds] = await Promise.all([
    getCommunityPosts(),
    getCommunityStats(),
    getMyCommunityPostIds(ctx.userId),
  ])

  return (
    <CommunityFeed posts={posts} stats={stats} authed embedded myPostIds={myPostIds} detailBase="/community" />
  )
}
