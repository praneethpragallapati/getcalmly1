import { prisma } from '@/lib/prisma'
import { fmtIST } from '@/lib/tz'

/** A poll as shown to a member or admin: tallied counts + this viewer's vote(s). */
export type PollView = {
  id: string
  question: string
  options: string[]
  counts: number[] // votes per option, aligned to options
  totalVotes: number // distinct members who voted
  myVote: number | null // this viewer's first chosen optionIndex (null = not voted)
  myVotes: number[] // all of this viewer's chosen options (multi-select)
  multiple: boolean // members may pick more than one option
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
  multiple: boolean
  votes: { optionIndex: number; userId: string }[]
}

/**
 * Create the multi-select poll schema on demand (Poll.multiple + the per-option
 * unique index), so it works without the 0030 migration run by hand. Idempotent.
 */
let pollSchemaReady = false
export async function ensurePollSchema(): Promise<void> {
  if (pollSchemaReady) return
  await prisma.$executeRawUnsafe(`ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "multiple" BOOLEAN NOT NULL DEFAULT false`)
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "PollVote_pollId_userId_key"`)
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_userId_optionIndex_key" ON "PollVote"("pollId", "userId", "optionIndex")`)
  pollSchemaReady = true
}

function toView(p: PollWithVotes, userId: string | null): PollView {
  const counts = p.options.map(() => 0)
  const myVotes: number[] = []
  const voters = new Set<string>()
  for (const v of p.votes) {
    if (v.optionIndex >= 0 && v.optionIndex < counts.length) counts[v.optionIndex]++
    voters.add(v.userId)
    if (userId && v.userId === userId) myVotes.push(v.optionIndex)
  }
  return {
    id: p.id,
    question: p.question,
    options: p.options,
    counts,
    totalVotes: voters.size,
    myVote: myVotes.length ? myVotes[0] : null,
    myVotes,
    multiple: p.multiple,
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
    await ensurePollSchema()
    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, question: true, options: true, expiresAt: true, createdAt: true, pinned: true, multiple: true, votes: { select: { optionIndex: true, userId: true } } },
    })
    return polls.map((p) => toView(p, userId))
  } catch {
    return []
  }
}

/** All polls for the admin management view (with tallies). */
export async function getPollsForAdmin(): Promise<PollView[]> {
  try {
    await ensurePollSchema()
    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, question: true, options: true, expiresAt: true, createdAt: true, pinned: true, multiple: true, votes: { select: { optionIndex: true, userId: true } } },
    })
    return polls.map((p) => toView(p, null))
  } catch {
    return []
  }
}
