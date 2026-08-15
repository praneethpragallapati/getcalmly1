'use client'

import Link from 'next/link'
import type { PollView } from '@/lib/polls'
import { PollBody } from '@/components/community/PollCard'

const charcoal = '#1C2B3A'

/**
 * One Calm Club poll on the patient home page, shown with its options. We show
 * the most recent poll the patient hasn't voted on yet; once they vote, the data
 * refreshes and the next unvoted poll takes its place. Polls they've already
 * answered (or that have closed) are never shown again here.
 */
export function HomePolls({ polls, canVote }: { polls: PollView[]; canVote: boolean }) {
  // Most recent poll still open and not yet voted on by this patient.
  const poll = polls.find((p) => p.myVote === null && !p.expired)
  if (!poll) return null

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div className="section-title">Calm Club poll</div>
        <Link href="/app/polls" className="link-action">All polls →</Link>
      </div>

      <div style={{ fontSize: 15.5, fontWeight: 700, color: charcoal, lineHeight: 1.35, marginBottom: 14 }}>
        {poll.question}
      </div>
      <PollBody poll={poll} canVote={canVote} />
    </div>
  )
}
