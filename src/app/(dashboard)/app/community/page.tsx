import CommunityFeed from '@/components/community/CommunityFeed'
import { getCommunityPosts, getCommunityStats, getMyCommunityPostIds } from '@/lib/community'
import { getCommunityPolls } from '@/lib/polls'
import { getSessionUserId } from '@/lib/patient'

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const userId = await getSessionUserId()
  const [posts, stats, myPostIds, polls] = await Promise.all([
    getCommunityPosts(),
    getCommunityStats(),
    userId ? getMyCommunityPostIds(userId) : Promise.resolve([]),
    getCommunityPolls(userId),
  ])

  return (
    <>
      <p
        className="muted"
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '1.4px',
          textTransform: 'uppercase',
          color: 'var(--c-coral)',
          marginBottom: 6,
        }}
      >
        Calm Club · Community
      </p>
      <CommunityFeed posts={posts} stats={stats} authed embedded myPostIds={myPostIds} detailBase="/app/community" polls={polls} />
    </>
  )
}
