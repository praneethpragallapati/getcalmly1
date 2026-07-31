import Link from 'next/link'
import { BlogCard } from '@/components/blog/BlogList'
import type { BlogPostView } from '@/lib/blog'

/**
 * The blogs we publish, surfaced inside a dashboard above the community feed —
 * the same posts shown on the public site. Reuses the public BlogCard so the
 * look matches. Accent adapts to the current dashboard theme via --c-coral.
 */
export function BlogsStrip({ posts, limit = 3 }: { posts: BlogPostView[]; limit?: number }) {
  if (posts.length === 0) return null
  const shown = posts.slice(0, limit)
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Big Shoulders Display',sans-serif", fontWeight: 300, fontSize: 'clamp(24px,3.2vw,32px)', color: 'var(--c-charcoal)', margin: 0, lineHeight: 1.05 }}>
            From our clinicians
          </h2>
          <p className="muted" style={{ marginTop: 4 }}>Evidence-based reads, written by professionals.</p>
        </div>
        <Link href="/blog" style={{ color: 'var(--c-coral)', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
          View all articles →
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
        {shown.map((p) => <BlogCard key={p.slug} post={p} />)}
      </div>
    </section>
  )
}
