import { redirect, notFound } from 'next/navigation'
import { getCommunityPost, getCommunityComments, getUserCommunityVotes } from '@/lib/community'
import { getTherapistContext } from '@/lib/expert'
import { DashboardCommunityThread } from '@/components/community/DashboardCommunityThread'

export const metadata = { title: 'Community · Expert portal', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function ExpertCommunityThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const post = await getCommunityPost(id)
  if (!post) notFound()

  const [comments, votes] = await Promise.all([
    getCommunityComments(id),
    getUserCommunityVotes(ctx.userId, id),
  ])

  return <DashboardCommunityThread post={post} comments={comments} votes={votes} backHref="/expert/community" />
}
