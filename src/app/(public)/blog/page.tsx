import type { Metadata } from 'next'
import BlogList from '@/components/blog/BlogList'
import { getBlogPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog | GetCalmly',
  description:
    'Evidence-based perspectives on anxiety, grief, relationships and more, written by licensed mental health professionals.',
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
