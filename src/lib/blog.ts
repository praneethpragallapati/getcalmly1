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
