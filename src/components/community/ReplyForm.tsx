'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addCommunityComment } from '@/app/(dashboard)/app/actions'

const coral = '#C8553D'

/**
 * Reply box on a community thread, shown to signed-in members in place of the
 * guest "Join to reply" lock. Posts via addCommunityComment and refreshes the
 * thread so the new comment appears.
 */
export function ReplyForm({ postId }: { postId: string }) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, start] = useTransition()
  const router = useRouter()

  function submit() {
    const text = body.trim()
    if (!text) {
      setError('Write a reply first.')
      return
    }
    setError(null)
    start(async () => {
      const res = await addCommunityComment({ postId, body: text })
      if (res.ok) {
        setBody('')
        setDone(true)
        setTimeout(() => setDone(false), 1600)
        router.refresh()
      } else {
        setError(res.error ?? 'Could not post your reply.')
      }
    })
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '18px 20px',
        marginTop: 18,
        border: '1px solid rgba(28,43,58,.07)',
        boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)',
      }}
    >
      <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#1C2B3A', marginBottom: 10 }}>
        Add your reply
      </label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your experience or a kind word. Be gentle — this is a moderated space."
        rows={4}
        style={{
          width: '100%',
          resize: 'vertical',
          border: '1px solid rgba(28,43,58,.16)',
          borderRadius: 12,
          padding: '12px 14px',
          fontSize: 14.5,
          lineHeight: 1.6,
          color: '#2e3d4e',
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          style={{
            padding: '10px 22px',
            borderRadius: 22,
            background: coral,
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.7 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {done ? 'Posted ✓' : pending ? 'Posting…' : 'Post reply'}
        </button>
        {error && <span style={{ fontSize: 12.5, color: '#C8553D', fontWeight: 600 }}>{error}</span>}
        {done && !error && <span style={{ fontSize: 12.5, color: '#2C7A57', fontWeight: 600 }}>Thanks for sharing.</span>}
      </div>
    </div>
  )
}
