'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { answerDiscussion } from '@/app/(dashboard)/expert/actions'

export function CommunityAnswer({ postId, designation }: { postId: string; designation: string }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function submit() {
    if (!body.trim()) return
    setMsg(null)
    startTransition(async () => {
      const res = await answerDiscussion({ postId, body })
      if (res.ok) {
        setBody('')
        setMsg({ ok: true, text: 'Answer posted.' })
        router.refresh()
      } else {
        setMsg({ ok: false, text: res.error ?? 'Could not post.' })
      }
    })
  }

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Answer as {designation}</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
        Your reply is public and carries your verified professional badge. Keep it supportive and general, not a diagnosis.
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Write a kind, clinically-sound reply…"
        style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', color: '#1C2B3A' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <button
          onClick={submit}
          disabled={pending || !body.trim()}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, opacity: pending || !body.trim() ? 0.6 : 1 }}
        >
          <Send size={14} /> {pending ? 'Posting…' : 'Post answer'}
        </button>
        {msg && <span style={{ fontSize: 13, color: msg.ok ? '#3D9E72' : '#C8553D' }}>{msg.text}</span>}
      </div>
    </div>
  )
}
