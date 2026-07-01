import { prisma } from '@/lib/prisma'
import { blogSeed, type BlogSeed } from '@/data/blogSeed'

// The view shape the pages render. Identical to the seed shape so the DB path
// and the fallback path are interchangeable.
export type BlogPostView = BlogSeed

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * All published posts, newest first. Reads from the database; if the DB is
 * unreachable or empty (e.g. before the first migrate + seed), falls back to
 * the bundled sample content so the site always renders.
 */
export async function getBlogPosts(): Promise<BlogPostView[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    })
    if (rows.length === 0) return blogSeed
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      author: r.authorName,
      role: r.authorRole,
      date: formatDate(r.publishedAt),
      readTime: r.readTime,
      tags: r.tags,
      content: r.content,
    }))
  } catch {
    return blogSeed
  }
}

export async function getBlogPost(slug: string): Promise<BlogPostView | null> {
  try {
    const r = await prisma.blogPost.findUnique({ where: { slug } })
    if (r) {
      return {
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        author: r.authorName,
        role: r.authorRole,
        date: formatDate(r.publishedAt),
        readTime: r.readTime,
        tags: r.tags,
        content: r.content,
      }
    }
  } catch {
    // fall through to seed
  }
  return blogSeed.find((p) => p.slug === slug) ?? null
}

export async function getBlogSlugs(): Promise<string[]> {
  try {
    const rows = await prisma.blogPost.findMany({ where: { published: true }, select: { slug: true } })
    if (rows.length > 0) return rows.map((r) => r.slug)
  } catch {
    // fall through
  }
  return blogSeed.map((p) => p.slug)
}

/** Slug + real last-modified date, for sitemap freshness signals. */
export async function getBlogSitemap(): Promise<{ slug: string; lastModified: Date }[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    })
    if (rows.length > 0) {
      return rows.map((r) => ({ slug: r.slug, lastModified: r.updatedAt ?? r.publishedAt }))
    }
  } catch {
    // fall through to bundled content
  }
  return blogSeed.map((p) => {
    const d = new Date(p.date)
    return { slug: p.slug, lastModified: isNaN(d.getTime()) ? new Date() : d }
  })
}

export type RelatedBlog = {
  slug: string
  title: string
  excerpt: string
  tags: string[]
  readTime: string
}

/**
 * Published posts that share at least one tag with the given set — used to
 * surface "related reads" on a blog post or a community discussion. Ranked by
 * tag overlap, excluding the current post when a slug is provided.
 */
export async function getRelatedBlogPosts(
  tags: string[],
  excludeSlug?: string,
  limit = 3,
): Promise<RelatedBlog[]> {
  const all = await getBlogPosts()
  return all
    .filter((p) => p.slug !== excludeSlug)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      tags: p.tags,
      readTime: p.readTime,
      overlap: p.tags.filter((t) => tags.includes(t)).length,
    }))
    .filter((p) => p.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map(({ slug, title, excerpt, tags, readTime }) => ({ slug, title, excerpt, tags, readTime }))
}
