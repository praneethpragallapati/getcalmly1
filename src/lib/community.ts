import { prisma } from '@/lib/prisma'
import {
  communitySeed,
  ENUM_TO_ROLE_NAME,
  type CommunityRoleName,
} from '@/data/communitySeed'

export type CommunityPostView = {
  id: string
  title: string
  body: string
  author: string
  role: CommunityRoleName
  tenure: string | null
  date: string
  tags: string[]
  upvotes: number
  comments: number
}

export type RelatedDiscussion = { id: string; title: string; tags: string[] }

function relativeTime(d: Date): string {
  const secs = Math.floor((Date.now() - d.getTime()) / 1000)
  const mins = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  if (secs < 60) return 'just now'
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`
}

const seedView: CommunityPostView[] = communitySeed.map((p, i) => ({
  id: `seed-${i + 1}`,
  ...p,
}))

/** All discussions, newest first, with DB fallback to bundled sample content. */
export async function getCommunityPosts(): Promise<CommunityPostView[]> {
  try {
    const rows = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { comments: true } } },
    })
    if (rows.length === 0) return seedView
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      author: r.authorName,
      role: ENUM_TO_ROLE_NAME[r.authorRole] ?? 'Member',
      tenure: r.tenure,
      date: relativeTime(r.createdAt),
      tags: r.tags,
      upvotes: r.upvotes,
      comments: r._count.comments,
    }))
  } catch {
    return seedView
  }
}

/** A single discussion by id, with DB fallback to bundled sample content. */
export async function getCommunityPost(id: string): Promise<CommunityPostView | null> {
  try {
    const r = await prisma.communityPost.findUnique({
      where: { id },
      include: { _count: { select: { comments: true } } },
    })
    if (r) {
      return {
        id: r.id,
        title: r.title,
        body: r.body,
        author: r.authorName,
        role: ENUM_TO_ROLE_NAME[r.authorRole] ?? 'Member',
        tenure: r.tenure,
        date: relativeTime(r.createdAt),
        tags: r.tags,
        upvotes: r.upvotes,
        comments: r._count.comments,
      }
    }
  } catch {
    // fall through to seed
  }
  return seedView.find((p) => p.id === id) ?? null
}

/**
 * Discussions that share at least one tag with the given set — used to surface
 * "related community chatter" on a blog post. Ranked by overlap count.
 */
export async function getRelatedDiscussions(
  tags: string[],
  limit = 3,
): Promise<RelatedDiscussion[]> {
  try {
    const rows = await prisma.communityPost.findMany({
      where: { tags: { hasSome: tags } },
      orderBy: { upvotes: 'desc' },
      take: limit * 3,
      select: { id: true, title: true, tags: true },
    })
    if (rows.length > 0) {
      return rows
        .map((r) => ({
          ...r,
          overlap: r.tags.filter((t) => tags.includes(t)).length,
        }))
        .sort((a, b) => b.overlap - a.overlap)
        .slice(0, limit)
        .map(({ id, title, tags }) => ({ id, title, tags }))
    }
  } catch {
    // fall through to seed
  }
  return seedView
    .map((p) => ({ id: p.id, title: p.title, tags: p.tags, overlap: p.tags.filter((t) => tags.includes(t)).length }))
    .filter((p) => p.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map(({ id, title, tags }) => ({ id, title, tags }))
}
