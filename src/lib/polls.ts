import { prisma } from '@/lib/prisma'
import { fmtIST } from '@/lib/tz'

/** A poll as shown to a member or admin: tallied counts + this viewer's vote. */
export type PollView = {
  id: string
  question: string
  options: string[]
  counts: number[] // votes per option, aligned to options
  totalVotes: number
  myVote: number | null // this viewer's chosen optionIndex, or null
  expiresAtLabel: string | null
  expired: boolean
  createdAtLabel: string
  pinned: boolean
}

type PollWithVotes = {
  id: string
  question: string
  options: string[]
  expiresAt: Date | null
  createdAt: Date
  pinned: boolean
  votes: { optionIndex: number; userId: string }[]
}

function toView(p: PollWithVotes, userId: string | null): PollView {
  const counts = p.options.map(() => 0)
  let myVote: number | null = null
  for (const v of p.votes) {
    if (v.optionIndex >= 0 && v.optionIndex < counts.length) counts[v.optionIndex]++
    if (userId && v.userId === userId) myVote = v.optionIndex
  }
  return {
    id: p.id,
    question: p.question,
    options: p.options,
    counts,
    totalVotes: p.votes.length,
    myVote,
    expiresAtLabel: p.expiresAt ? fmtIST(p.expiresAt, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : null,
    expired: Boolean(p.expiresAt && p.expiresAt.getTime() < Date.now()),
    createdAtLabel: fmtIST(p.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }),
    pinned: p.pinned,
  }
}

/** Polls for the community feed / tab: newest first (the query order). The polls
 *  page puts pinned ones on top; the home page picks the most recent unvoted. */
export async function getCommunityPolls(userId: string | null): Promise<PollView[]> {
  try {
    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { votes: { select: { optionIndex: true, userId: true } } },
    })
    return polls.map((p) => toView(p, userId))
  } catch {
    return []
  }
}

/** All polls for the admin management view (with tallies). */
export async function getPollsForAdmin(): Promise<PollView[]> {
  try {
    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: 'desc' },
      include: { votes: { select: { optionIndex: true, userId: true } } },
    })
    return polls.map((p) => toView(p, null))
  } catch {
    return []
  }
}
