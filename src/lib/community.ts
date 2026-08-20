import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import {
  communitySeed,
  ENUM_TO_ROLE_NAME,
  type CommunityRoleName,
} from '@/data/communitySeed'
import { ensureSampleContent } from '@/lib/sampleContent'

type AuthorExtras = { tenure: string | null; streak: number | null }

const startOfDayKey = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

/** Consecutive days ending today/yesterday with at least one mood check-in. */
function streakFromDates(dates: Date[]): number {
  const days = new Set(dates.map(startOfDayKey))
  let streak = 0
  const cursor = new Date()
  if (!days.has(startOfDayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(startOfDayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/**
 * Batched author identity extras for the community — how long they've been on
 * the platform (live tenure from their active plan), current check-in streak,
 * and their "how I'm feeling" status. Keyed by userId. Best-effort: any part
 * that can't be read is simply omitted, never throwing.
 */
export async function authorExtrasFor(userIds: string[]): Promise<Map<string, AuthorExtras>> {
  const out = new Map<string, AuthorExtras>()
  const ids = Array.from(new Set(userIds.filter(Boolean)))
  if (ids.length === 0) return out

  const since = new Date()
  since.setDate(since.getDate() - 60)

  const [moods, subs] = await Promise.all([
    prisma.moodEntry.findMany({
      where: { userId: { in: ids }, createdAt: { gte: since } },
      select: { userId: true, createdAt: true },
    }).catch(() => [] as { userId: string; createdAt: Date }[]),
    prisma.subscription.findMany({
      where: { userId: { in: ids }, status: 'ACTIVE' },
      select: { userId: true, paidMonths: true },
    }).catch(() => [] as { userId: string; paidMonths: number }[]),
  ])

  const moodByUser = new Map<string, Date[]>()
  for (const m of moods) {
    const arr = moodByUser.get(m.userId) ?? []
    arr.push(m.createdAt)
    moodByUser.set(m.userId, arr)
  }
  const monthsByUser = new Map<string, number>()
  for (const s of subs) monthsByUser.set(s.userId, Math.max(monthsByUser.get(s.userId) ?? 0, s.paidMonths))

  for (const id of ids) {
    const months = monthsByUser.get(id)
    const dates = moodByUser.get(id)
    const streak = dates ? streakFromDates(dates) : 0
    out.set(id, {
      tenure: months ? `${months} month${months === 1 ? '' : 's'} on getCalmly` : null,
      streak: streak > 0 ? streak : null,
    })
  }
  return out
}

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
  // Author identity extras, filled where known (community feed / thread).
  streak?: number | null
}

export type CommunityCommentView = {
  id: string
  body: string
  author: string
  role: CommunityRoleName
  date: string
  upvotes: number
  tenure?: string | null
  streak?: number | null
}

export type RelatedDiscussion = { id: string; title: string; tags: string[] }

export type CommunityIdentity = {
  name: string
  role: 'PAID_MEMBER' | 'MEMBER' | 'THERAPIST' | 'PSYCHIATRIST' | 'ADMIN'
  tenure: string | null
}

/**
 * The identity a signed-in user posts/comments under. Clinicians post as
 * Therapist / Psychiatrist with their full name; admins as Admin; everyone else
 * as a Member (Paid Member with tenure while they hold an active subscription).
 * Shared by the post and comment actions so a user's badge is consistent
 * whether they write from the public site or a dashboard.
 */
export async function communityIdentity(userId: string): Promise<CommunityIdentity> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true, therapistProfile: { select: { specializations: true } } },
  })
  if (user?.therapistProfile) {
    const isPsych = user.therapistProfile.specializations.some((s) => /psychiat|medication|pharma/i.test(s))
    return { name: user.name ?? 'Clinician', role: isPsych ? 'PSYCHIATRIST' : 'THERAPIST', tenure: null }
  }
  if (user?.role === 'ADMIN') return { name: user.name ?? 'GetCalmly', role: 'ADMIN', tenure: null }

  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    select: { paidMonths: true },
  })
  const parts = (user?.name ?? 'Member').split(' ')
  const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.` : parts[0]
  return {
    name,
    role: sub ? 'PAID_MEMBER' : 'MEMBER',
    tenure: sub ? `${sub.paidMonths} months` : null,
  }
}

/** IDs of discussions authored by this user, so the feed can offer a "My posts" filter. */
export async function getMyCommunityPostIds(userId: string): Promise<string[]> {
  try {
    const rows = await prisma.communityPost.findMany({ where: { authorId: userId }, select: { id: true } })
    return rows.map((r) => r.id)
  } catch {
    return []
  }
}

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
    await ensureSampleContent()
    const rows = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { comments: true } } },
    })
    if (rows.length === 0) return seedView
    // Author extras (live tenure / streak / feeling) for non-anonymous posters.
    const extras = await authorExtrasFor(rows.filter((r) => !r.anonymous && r.authorId).map((r) => r.authorId as string))
    return rows.map((r) => {
      const ex = !r.anonymous && r.authorId ? extras.get(r.authorId) : undefined
      return {
        id: r.id,
        title: r.title,
        body: r.body,
        author: r.authorName,
        role: ENUM_TO_ROLE_NAME[r.authorRole] ?? 'Member',
        tenure: ex?.tenure ?? r.tenure,
        streak: ex?.streak ?? null,
        date: relativeTime(r.createdAt),
        tags: r.tags,
        upvotes: r.upvotes,
        comments: r._count.comments,
      }
    })
  } catch {
    return seedView
  }
}

/**
 * The community feed is the same for everyone (not per-user), yet it was being
 * re-queried on every personal dashboard load — an unbounded findMany + a count
 * subquery on the hot path. Serve the dashboard preview from Next's data cache
 * (revalidated every 60s and deduped across all users) so it costs the home
 * page nothing on a cache hit. The live /community page keeps the uncached
 * read, where up-to-the-second freshness matters.
 */
export const getCommunityPostsCached = unstable_cache(
  getCommunityPosts,
  ['community-posts-feed'],
  { revalidate: 60 },
)

/**
 * Real headline counts for the community page: registered members and the
 * number of discussions. Falls back to the bundled sample content's own totals
 * when the DB is unavailable, so the numbers always reflect what is on screen.
 */
export async function getCommunityStats(): Promise<{
  members: number
  discussions: number
  replies: number
}> {
  try {
    const [members, discussions, replies] = await Promise.all([
      prisma.user.count(),
      prisma.communityPost.count(),
      prisma.communityComment.count(),
    ])
    return { members, discussions, replies }
  } catch {
    return {
      members: new Set(seedView.map((p) => p.author)).size,
      discussions: seedView.length,
      replies: seedView.reduce((n, p) => n + p.comments, 0),
    }
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
      const ex = !r.anonymous && r.authorId ? (await authorExtrasFor([r.authorId])).get(r.authorId) : undefined
      return {
        id: r.id,
        title: r.title,
        body: r.body,
        author: r.authorName,
        role: ENUM_TO_ROLE_NAME[r.authorRole] ?? 'Member',
        tenure: ex?.tenure ?? r.tenure,
        streak: ex?.streak ?? null,
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

/** Comments on a discussion, oldest first. Empty when the DB is unavailable. */
export async function getCommunityComments(postId: string): Promise<CommunityCommentView[]> {
  try {
    const rows = await prisma.communityComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    })
    const extras = await authorExtrasFor(rows.filter((r) => !r.anonymous && r.authorId).map((r) => r.authorId as string))
    return rows.map((r) => {
      const ex = !r.anonymous && r.authorId ? extras.get(r.authorId) : undefined
      return {
        id: r.id,
        body: r.body,
        author: r.authorName,
        role: ENUM_TO_ROLE_NAME[r.authorRole] ?? 'Member',
        date: relativeTime(r.createdAt),
        upvotes: r.upvotes,
        tenure: ex?.tenure ?? null,
        streak: ex?.streak ?? null,
      }
    })
  } catch {
    return []
  }
}

/**
 * Which targets a given member has already upvoted on a thread: the post itself
 * and any of its comments. Used to render vote buttons in their active state.
 */
export async function getUserCommunityVotes(
  userId: string,
  postId: string,
): Promise<{ post: boolean; comments: Set<string> }> {
  try {
    const rows = await prisma.communityUpvote.findMany({
      where: {
        userId,
        OR: [{ postId }, { comment: { postId } }],
      },
      select: { postId: true, commentId: true },
    })
    return {
      post: rows.some((r) => r.postId === postId),
      comments: new Set(rows.filter((r) => r.commentId).map((r) => r.commentId as string)),
    }
  } catch {
    return { post: false, comments: new Set() }
  }
}

/**
 * Discussions that share at least one tag with the given set, used to surface
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
