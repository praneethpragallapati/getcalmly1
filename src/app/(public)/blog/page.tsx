import type { Metadata } from 'next'
import BlogList from '@/components/blog/BlogList'
import { getBlogPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Mental Health Blog',
  description:
    'Evidence-based writing on anxiety, sleep, grief, work stress and relationships, from RCI-verified therapists and NMC-verified psychiatrists practising in India.',
  alternates: { canonical: '/blog' },
}

// Read fresh from the database on each request (falls back to bundled sample
// content when the DB is unavailable).
// ISR: serve a cached render and revalidate at most every 300s. Admin edits
// call revalidatePath() so changes still appear immediately; this is the cap.
export const revalidate = 300

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <BlogList posts={posts} />
}
