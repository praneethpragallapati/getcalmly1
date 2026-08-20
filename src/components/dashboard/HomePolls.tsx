'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { needsAnswer, isPollOpen, type PollView } from '@/lib/polls'
import { PollBody } from '@/components/community/PollCard'

const charcoal = '#1C2B3A'

/**
 * One Calm Club poll on the patient home page.
 *
 * The card sticks to whichever poll it first showed, for as long as that poll is
 * open. Picking an option triggers a server refresh, and choosing the poll fresh
 * each render meant a multi-select poll was swapped out after the first tap —
 * the member never got to pick their remaining options. Staying put also means a
 * single-select voter sees the result they just contributed to; the next poll
 * comes up on their next visit.
 */
export function HomePolls({ polls, canVote }: { polls: PollView[]; canVote: boolean }) {
  // Survives the re-render a vote causes; a ref (not state) because changing it
  // must never itself schedule a render.
  const shownId = useRef<string | null>(null)

  const pinned = shownId.current ? polls.find((p) => p.id === shownId.current) : undefined
  const poll = pinned && isPollOpen(pinned)
    ? pinned
    : polls.find(needsAnswer) ?? null
  if (!poll) return null
  shownId.current = poll.id

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
