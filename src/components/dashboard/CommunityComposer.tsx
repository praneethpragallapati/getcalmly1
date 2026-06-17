'use client'

import { useState, useTransition } from 'react'
import { PenLine, Check, X } from 'lucide-react'
import { createCommunityPost } from '@/app/(dashboard)/app/actions'

const TOPIC_TAGS = ['anxiety', 'depression', 'sleep', 'work-stress', 'relationships', 'mindfulness']

/**
 * "Start a discussion" composer for the in-app community (#20). Posts via the
 * createCommunityPost action under the patient's Paid Member identity.
 */
export function CommunityComposer() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function post() {
    setError(null)
    startTransition(async () => {
      const res = await createCommunityPost({ title, body, tags })
      if (res.ok) {
        setDone(true)
        setTitle('')
        setBody('')
        setTags([])
        setTimeout(() => {
          setDone(false)
          setOpen(false)
        }, 1400)
      } else {
        setError(res.error ?? 'Could not post.')
      }
    })
  }

  return (
    <div className="card" style={{ background: '#1c2b3a', color: '#fff', border: 'none' }}>
      <div className="section-title" style={{ color: '#fff' }}>
        Start a discussion
      </div>
      <p style={{ fontSize: 13, color: '#b9c3cd', margin: '8px 0 16px', lineHeight: 1.5 }}>
        Ask a question or share what’s helping you. This is a kind, moderated space — be gentle with
        yourself and others.
      </p>

      {!open ? (
        <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
          <PenLine size={15} /> New post
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            className="entry-input"
            placeholder="A short, clear title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="entry-input"
            placeholder="What would you like to share or ask?"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TOPIC_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}
                className="tag"
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  background: tags.includes(t) ? '#c8553d' : 'rgba(255,255,255,.1)',
                  color: '#fff',
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <button className="btn btn-primary" type="button" onClick={post} disabled={pending}>
              {done ? (
                <>
                  <Check size={15} /> Posted
                </>
              ) : pending ? (
                'Posting…'
              ) : (
                'Post discussion'
              )}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#b9c3cd',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
              }}
            >
              <X size={14} /> Cancel
            </button>
            {error && <span style={{ fontSize: 12, color: '#e8896f' }}>{error}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
