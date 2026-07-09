import type { Metadata } from 'next'
import RealTalkHub from '@/components/site/RealTalkHub'
import { getBlogPosts } from '@/lib/blog'
import { getCommunityPosts } from '@/lib/community'

export const metadata: Metadata = {
  title: 'Real Talk: Articles & Community',
  description:
    'Real Talk is getCalmly’s content hub: honest, evidence-based articles on anxiety, grief, relationships and more, plus a safe, moderated community where you are not the only one who felt this way.',
  alternates: { canonical: '/real-talk' },
}

// Read fresh each request (both feeds fall back to bundled content).
export const dynamic = 'force-dynamic'

export default async function RealTalkPage() {
  const [blogPosts, communityPosts] = await Promise.all([
    getBlogPosts(),
    getCommunityPosts(),
  ])
  return <RealTalkHub blogPosts={blogPosts} communityPosts={communityPosts} />
}
