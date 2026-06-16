import type { Metadata } from 'next'
import CommunityFeed from '@/components/community/CommunityFeed'
import { getCommunityPosts } from '@/lib/community'

export const metadata: Metadata = {
  title: 'Community | GetCalmly',
  description:
    'A safe, moderated space to share experiences and feel understood. Read freely — join to take part.',
  alternates: { canonical: '/community' },
}

// Read fresh from the database on each request (falls back to bundled sample
// content when the DB is unavailable).
export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const posts = await getCommunityPosts()
  return <CommunityFeed posts={posts} />
}
