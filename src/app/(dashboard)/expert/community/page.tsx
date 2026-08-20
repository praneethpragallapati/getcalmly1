import { redirect } from 'next/navigation'
import CommunityFeed from '@/components/community/CommunityFeed'
import { getTherapistContext } from '@/lib/expert'
import { getCommunityPosts, getCommunityStats, getMyCommunityPostIds } from '@/lib/community'
import { SectionTabs } from '@/components/ui/SectionTabs'

export const metadata = { title: 'Real Talk · Expert portal', robots: { index: false, follow: false } }
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
    <>
      <SectionTabs
        eyebrow="Calm Club · Real Talk"
        title="Real Talk"
        meta="What members are talking about — reply as yourself, with your badge."
        tabs={[]}
        active=""
      />
      <CommunityFeed posts={posts} stats={stats} authed embedded myPostIds={myPostIds} detailBase="/expert/community" showHero={false} />
    </>
  )
}
