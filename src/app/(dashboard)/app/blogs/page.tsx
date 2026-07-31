import { BlogsStrip } from '@/components/dashboard/BlogsStrip'
import { getBlogPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export default async function BlogsPage() {
  const blogs = await getBlogPosts()
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
        Calm Club · Blogs
      </p>
      <BlogsStrip posts={blogs} limit={99} />
    </>
  )
}
