'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pin } from 'lucide-react'
import { votePoll } from '@/app/(dashboard)/app/actions'
import type { PollView } from '@/lib/polls'

const HEAD_FONT = "'Big Shoulders Display', sans-serif"
const coral = '#C8553D'
const charcoal = '#1C2B3A'

/**
 * The interactive part of a poll: options to vote on (or result bars) plus the
 * footer. Shared by the full PollCard and the compact home list, so voting
 * behaves identically everywhere.
 */
export function PollBody({ poll, canVote = false }: { poll: PollView; canVote?: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [myVote, setMyVote] = useState<number | null>(poll.myVote)

  const showResults = myVote !== null || poll.expired || !canVote
  const total = poll.totalVotes

  function vote(i: number) {
    if (!canVote || poll.expired || pending) return
    setError(null)
    setMyVote(i) // optimistic
    start(async () => {
      const res = await votePoll({ pollId: poll.id, optionIndex: i })
      if (res.ok) router.refresh()
      else { setError(res.error ?? 'Could not record your vote.'); setMyVote(poll.myVote) }
    })
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {poll.options.map((opt, i) => {
          const count = poll.counts[i] ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          const mine = myVote === i
          if (showResults) {
            return (
              <div key={i} style={{ position: 'relative', border: `1.5px solid ${mine ? 'rgba(200,85,61,.4)' : 'rgba(28,43,58,.1)'}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: mine ? 'rgba(200,85,61,.14)' : 'rgba(28,43,58,.06)', transition: 'width .4s ease' }} />
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '11px 14px' }}>
                  <span style={{ fontSize: 14, fontWeight: mine ? 700 : 500, color: charcoal }}>{opt}{mine ? ' ✓' : ''}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: mine ? coral : '#5A6B7A', whiteSpace: 'nowrap' }}>{pct}% · {count}</span>
                </div>
              </div>
            )
          }
          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={pending}
              style={{
                textAlign: 'left', border: '1.5px solid rgba(28,43,58,.14)', borderRadius: 12, padding: '11px 14px',
                background: '#fff', cursor: pending ? 'default' : 'pointer', fontSize: 14, fontWeight: 600, color: charcoal,
                transition: 'border-color .15s, background .15s',
              }}
              onMouseEnter={(e) => { if (!pending) { e.currentTarget.style.borderColor = coral; e.currentTarget.style.background = 'rgba(200,85,61,.04)' } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(28,43,58,.14)'; e.currentTarget.style.background = '#fff' }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <span style={{ fontSize: 12, color: '#9AABB8' }}>
          {total} vote{total === 1 ? '' : 's'}
          {myVote !== null && !poll.expired && canVote && ' · tap another option to change'}
        </span>
        {error && <span style={{ fontSize: 12.5, color: coral, fontWeight: 600 }}>{error}</span>}
        {!canVote && !poll.expired && <span style={{ fontSize: 12, color: '#9AABB8' }}>Sign in to vote</span>}
      </div>
    </>
  )
}

/** Poll status line: label, pinned badge, expiry. Shared header. */
export function PollMeta({ poll }: { poll: PollView }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: coral }}>📊 Community poll</span>
      {poll.pinned && <span style={{ fontSize: 10.5, fontWeight: 700, color: coral, background: 'rgba(200,85,61,.1)', padding: '1px 7px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Pin size={10} /> Pinned</span>}
      {poll.expired
        ? <span style={{ fontSize: 11, fontWeight: 700, color: '#8A97A4' }}>· closed</span>
        : poll.expiresAtLabel && <span style={{ fontSize: 11, color: '#8A97A4' }}>· closes {poll.expiresAtLabel}</span>}
    </div>
  )
}

/**
 * A full Calm Club poll card. Members vote once (changeable) until it closes;
 * results show as bars. Guests / expired polls are read-only.
 */
export function PollCard({ poll, canVote = false }: { poll: PollView; canVote?: boolean }) {
  return (
    <div
      style={{
        background: '#fff', borderRadius: 18, padding: '22px 24px',
        boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)',
        border: '1px solid rgba(200,85,61,.16)',
      }}
    >
      <div style={{ marginBottom: 8 }}><PollMeta poll={poll} /></div>
      <h3 style={{ fontFamily: HEAD_FONT, fontSize: 21, fontWeight: 700, color: charcoal, margin: '0 0 14px', lineHeight: 1.2 }}>
        {poll.question}
      </h3>
      <PollBody poll={poll} canVote={canVote} />
    </div>
  )
}
