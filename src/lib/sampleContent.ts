import { prisma } from '@/lib/prisma'
import { blogSeed } from '@/data/blogSeed'
import { communitySeed, ROLE_NAME_TO_ENUM } from '@/data/communitySeed'

/**
 * Persists the bundled sample blogs and community discussions into the database
 * so every surface reads the SAME content — the public site, the patient
 * community feed, AND the admin content-moderation panel (which only ever shows
 * real DB rows). Without this, the public pages fall back to in-code seed
 * content that the admin panel can't see or manage.
 *
 * Idempotent and non-destructive:
 *   • Blogs upsert by their real slug; community posts by a deterministic id.
 *   • `update: {}` means existing rows are left untouched — a re-run never
 *     clobbers edits an admin has since made.
 *   • Every sample row carries a `sample-*` id, so removing all sample content
 *     at go-live is one line each:
 *       DELETE FROM "BlogPost"      WHERE id LIKE 'sample-blog-%';
 *       DELETE FROM "CommunityPost" WHERE id LIKE 'sample-comm-%';
 *
 * Runs at most once per server instance (in-memory guard); safe to call from
 * any content loader.
 */
let ensured = false

function parseBlogDate(s: string): Date {
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

export async function ensureSampleContent(): Promise<void> {
  if (ensured) return
  try {
    for (const b of blogSeed) {
      await prisma.blogPost.upsert({
        where: { slug: b.slug },
        update: {},
        create: {
          id: `sample-blog-${b.slug}`,
          slug: b.slug,
          title: b.title,
          excerpt: b.excerpt,
          content: b.content,
          authorName: b.author,
          authorRole: b.role,
          tags: b.tags,
          readTime: b.readTime,
          coverImage: b.coverImage ?? null,
          published: true,
          publishedAt: parseBlogDate(b.date),
        },
      })
    }

    for (let i = 0; i < communitySeed.length; i++) {
      const p = communitySeed[i]
      await prisma.communityPost.upsert({
        where: { id: `sample-comm-${i + 1}` },
        update: {},
        create: {
          id: `sample-comm-${i + 1}`,
          title: p.title,
          body: p.body,
          authorName: p.author,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          authorRole: (ROLE_NAME_TO_ENUM[p.role] ?? 'MEMBER') as any,
          tenure: p.tenure,
          tags: p.tags,
          upvotes: p.upvotes,
          // Stagger timestamps so the feed order matches the seed order
          // (index 0 is the most recent).
          createdAt: new Date(Date.now() - i * 6 * 60 * 60 * 1000),
        },
      })
    }

    ensured = true
  } catch {
    // Leave `ensured` false so a later load (e.g. once a pending migration runs)
    // can retry; never let seeding failure break a content page.
  }
}
