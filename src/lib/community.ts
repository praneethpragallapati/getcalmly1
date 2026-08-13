import { prisma } from '@/lib/prisma'
import {
  communitySeed,
  ENUM_TO_ROLE_NAME,
  type CommunityRoleName,
} from '@/data/communitySeed'
import { ensureSampleContent } from '@/lib/sampleContent'

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

export type CommunityCommentView = {
  id: string
  body: string
  author: string
  role: CommunityRoleName
  date: string
  upvotes: number
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

/** Comments on a discussion, oldest first. Empty when the DB is unavailable. */
export async function getCommunityComments(postId: string): Promise<CommunityCommentView[]> {
  try {
    const rows = await prisma.communityComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((r) => ({
      id: r.id,
      body: r.body,
      author: r.authorName,
      role: ENUM_TO_ROLE_NAME[r.authorRole] ?? 'Member',
      date: relativeTime(r.createdAt),
      upvotes: r.upvotes,
    }))
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
