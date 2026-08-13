'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { PollView } from '@/lib/polls'
import { PollBody } from '@/components/community/PollCard'

const charcoal = '#1C2B3A'

/**
 * Compact Calm Club polls for the patient home page: up to 5 latest polls as
 * collapsed rows (question + vote count). Tap a row to expand its options and
 * vote — keeps the home page tight instead of a full poll card per poll.
 */
export function HomePolls({ polls, canVote }: { polls: PollView[]; canVote: boolean }) {
  const list = polls.slice(0, 5)
  const [openId, setOpenId] = useState<string | null>(null)
  if (list.length === 0) return null

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div className="section-title">Calm Club polls</div>
        <Link href="/app/polls" className="link-action">All polls →</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {list.map((p, i) => {
          const open = openId === p.id
          return (
            <div key={p.id} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(28,43,58,.08)' }}>
              <button
                onClick={() => setOpenId(open ? null : p.id)}
                aria-expanded={open}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 2px', fontFamily: 'inherit',
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: charcoal, lineHeight: 1.35 }}>{p.question}</span>
                  <span className="muted" style={{ fontSize: 12, marginTop: 2, display: 'block' }}>
                    {p.totalVotes} vote{p.totalVotes === 1 ? '' : 's'}
                    {p.expired ? ' · closed' : p.myVote !== null ? ' · you voted' : ' · tap to vote'}
                  </span>
                </span>
                <ChevronDown size={18} style={{ color: '#8E9EAE', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }} />
              </button>
              {open && (
                <div style={{ padding: '2px 2px 16px' }}>
                  <PollBody poll={p} canVote={canVote && !p.expired} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
