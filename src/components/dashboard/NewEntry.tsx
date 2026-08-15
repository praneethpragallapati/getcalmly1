'use client'

import { useState, useTransition } from 'react'
import { PenLine, Check } from 'lucide-react'
import { createJournalEntry } from '@/app/(dashboard)/app/actions'

const MOODS = ['Calm', 'Good', 'Okay', 'Low', 'Anxious']

/**
 * "Write something new" card (#1). Reveals an inline editor and persists via the
 * createJournalEntry server action.
 */
export function NewEntry() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string>('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const res = await createJournalEntry({ title, content, moodTag: mood || undefined })
      if (res.ok) {
        setDone(true)
        setTitle('')
        setContent('')
        setMood('')
        setTimeout(() => {
          setDone(false)
          setOpen(false)
        }, 1200)
      } else {
        setError(res.error ?? 'Could not save.')
      }
    })
  }

  return (
    <div className="card entry-dark" style={{ background: '#1c2b3a', color: '#fff', border: 'none' }}>
      <div className="section-title" style={{ color: '#fff' }}>
        Write something new ✍️
      </div>
      <p style={{ fontSize: 13, color: '#b9c3cd', margin: '8px 0 16px', lineHeight: 1.5 }}>
        Your journal is private. No judgement, no audience, just you and your thoughts.
      </p>

      {!open ? (
        <button className="btn btn-primary" onClick={() => setOpen(true)} type="button">
          <PenLine size={15} /> Start writing
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            className="entry-input"
            placeholder="Give it a title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="entry-input"
            placeholder="What's on your mind?"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(mood === m ? '' : m)}
                className="tag"
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  background: mood === m ? '#c8553d' : 'rgba(255,255,255,.1)',
                  color: '#fff',
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <button className="btn btn-primary" onClick={save} type="button" disabled={pending}>
              {done ? (
                <>
                  <Check size={15} /> Saved
                </>
              ) : pending ? (
                'Saving…'
              ) : (
                'Save entry'
              )}
            </button>
            <button
              className="note-link"
              type="button"
              onClick={() => setOpen(false)}
              style={{ color: '#b9c3cd', cursor: 'pointer' }}
            >
              Cancel
            </button>
            {error && <span style={{ fontSize: 12, color: '#e8896f' }}>{error}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
