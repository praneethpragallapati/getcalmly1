import { notFound } from 'next/navigation'
import { getCommunityPost, getCommunityComments, getUserCommunityVotes } from '@/lib/community'
import { getSessionUserId } from '@/lib/patient'
import { DashboardCommunityThread } from '@/components/community/DashboardCommunityThread'

export const dynamic = 'force-dynamic'

export default async function AppCommunityThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getCommunityPost(id)
  if (!post) notFound()

  const userId = await getSessionUserId()
  const [comments, votes] = await Promise.all([
    getCommunityComments(id),
    userId ? getUserCommunityVotes(userId, id) : Promise.resolve({ post: false, comments: new Set<string>() }),
  ])

  return <DashboardCommunityThread post={post} comments={comments} votes={votes} backHref="/app/community" />
}
