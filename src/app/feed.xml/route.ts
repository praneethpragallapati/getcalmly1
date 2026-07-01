import { getBlogPosts } from '@/lib/blog'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getcalmly.com'

export const dynamic = 'force-dynamic'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// RSS 2.0 feed for the blog — lets readers, aggregators and AI crawlers
// discover and follow new posts.
export async function GET() {
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = []
  try {
    posts = await getBlogPosts()
  } catch {
    // ship an empty-but-valid feed if the source is unavailable
  }

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`
      const date = new Date(p.date)
      const pubDate = isNaN(date.getTime()) ? new Date() : date
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.excerpt)}</description>
      <dc:creator>${esc(p.author)}</dc:creator>
      <pubDate>${pubDate.toUTCString()}</pubDate>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>getCalmly Blog</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Mental health, therapy and wellbeing — from getCalmly’s clinicians.</description>
    <language>en-IN</language>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
