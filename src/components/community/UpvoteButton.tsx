'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toggleCommunityUpvote } from '@/app/(dashboard)/app/actions'

const coral = '#C8553D'
const charcoal = '#1C2B3A'
const HEAD = "'Big Shoulders Display', sans-serif"

/**
 * Upvote control for a community post or comment. Signed-in members get an
 * optimistic one-tap toggle backed by toggleCommunityUpvote; guests get the same
 * affordance but it links to /register instead of voting. `variant` switches
 * between the large post box and the compact inline comment pill.
 */
export function UpvoteButton({
  target,
  count,
  voted,
  signedIn,
  variant = 'comment',
}: {
  target: { postId: string } | { commentId: string }
  count: number
  voted: boolean
  signedIn: boolean
  variant?: 'post' | 'comment'
}) {
  const [state, setState] = useState({ count, voted })
  const [pending, start] = useTransition()

  function toggle() {
    const prev = state
    setState({ count: prev.voted ? prev.count - 1 : prev.count + 1, voted: !prev.voted })
    start(async () => {
      const res = await toggleCommunityUpvote(target)
      if (res.ok) setState({ count: res.count, voted: res.voted })
      else setState(prev)
    })
  }

  const active = state.voted

  if (variant === 'post') {
    const box: React.CSSProperties = {
      textAlign: 'center',
      borderRadius: 12,
      padding: '8px 12px',
      flexShrink: 0,
      border: '1px solid',
      cursor: signedIn ? 'pointer' : 'pointer',
      background: active ? coral : 'rgba(200,85,61,.07)',
      borderColor: active ? coral : 'transparent',
      transition: 'background .15s, border-color .15s, transform .12s',
    }
    const inner = (
      <>
        <div style={{ color: active ? '#fff' : coral, fontSize: 13, lineHeight: 1 }}>▲</div>
        <div style={{ fontWeight: 800, fontSize: 16, color: active ? '#fff' : charcoal, fontFamily: HEAD }}>
          {state.count}
        </div>
        <div style={{ fontSize: 9, color: active ? 'rgba(255,255,255,.8)' : '#9AABB8', fontWeight: 700, letterSpacing: '.5px' }}>
          VOTES
        </div>
      </>
    )
    if (!signedIn) {
      return (
        <Link href="/register" title="Join to vote" style={{ ...box, textDecoration: 'none', display: 'block' }}>
          {inner}
        </Link>
      )
    }
    return (
      <button type="button" onClick={toggle} disabled={pending} aria-pressed={active} style={box}>
        {inner}
      </button>
    )
  }

  // compact inline pill for comments
  const pill: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12.5,
    fontWeight: 700,
    padding: '4px 11px',
    borderRadius: 999,
    border: '1px solid',
    cursor: 'pointer',
    background: active ? 'rgba(200,85,61,.12)' : 'transparent',
    borderColor: active ? 'rgba(200,85,61,.4)' : 'rgba(28,43,58,.14)',
    color: active ? coral : '#6B7D8E',
    transition: 'background .15s, border-color .15s, color .15s',
  }
  const inner = (
    <>
      <span style={{ fontSize: 11 }}>▲</span> {state.count}
    </>
  )
  if (!signedIn) {
    return (
      <Link href="/register" title="Join to vote" style={{ ...pill, textDecoration: 'none' }}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" onClick={toggle} disabled={pending} aria-pressed={active} style={pill}>
      {inner}
    </button>
  )
}
