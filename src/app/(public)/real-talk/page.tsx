import type { Metadata } from 'next'
import RealTalkHub from '@/components/site/RealTalkHub'
import { getBlogPosts } from '@/lib/blog'
import { getCommunityPosts } from '@/lib/community'

export const metadata: Metadata = {
  title: 'Calm Club: Articles & Community',
  description:
    'Calm Club: honest, evidence-based articles on anxiety, grief, relationships and more, plus a safe, moderated community where you are not the only one who felt this way. Read freely, sign in to take part.',
  alternates: { canonical: '/real-talk' },
}

// Read fresh each request (both feeds fall back to bundled content).
// ISR: serve a cached render and revalidate at most every 180s. Admin edits
// call revalidatePath() so changes still appear immediately; this is the cap.
export const revalidate = 180

export default async function RealTalkPage() {
  const [blogPosts, communityPosts] = await Promise.all([
    getBlogPosts(),
    getCommunityPosts(),
  ])
  return <RealTalkHub blogPosts={blogPosts} communityPosts={communityPosts} />
}
