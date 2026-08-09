'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Check } from 'lucide-react'
import { submitSessionReview } from '@/app/(dashboard)/app/actions'

/** Filled/outline star row. `readOnly` shows a submitted rating without inputs. */
function Stars({ value, onPick, size = 26, readOnly }: { value: number; onPick?: (n: number) => void; size?: number; readOnly?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || value) >= n
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onPick?.(n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            style={{ background: 'none', border: 'none', padding: 0, cursor: readOnly ? 'default' : 'pointer', lineHeight: 0 }}
          >
            <Star size={size} strokeWidth={2} style={{ color: active ? 'var(--c-gold, #c9973a)' : '#CBD3DC', fill: active ? 'var(--c-gold, #c9973a)' : 'none', transition: 'color .12s' }} />
          </button>
        )
      })}
    </div>
  )
}

/**
 * Post-session rating. Shown for a past session: collects 1–5 stars + an optional
 * note, or displays the rating already given (which can be changed).
 */
export function RateSession({
  appointmentId,
  expert,
  initialRating,
  initialComment,
  compact = false,
}: {
  appointmentId: string
  expert: string
  initialRating: number | null
  initialComment?: string | null
  compact?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [rating, setRating] = useState(initialRating ?? 0)
  const [comment, setComment] = useState(initialComment ?? '')
  const [editing, setEditing] = useState(initialRating == null)
  const [submittedNow, setSubmittedNow] = useState(false)
  const [error, setError] = useState('')

  function submit() {
    if (rating < 1) { setError('Tap a star to rate.'); return }
    setError('')
    // Optimistic: show the "You rated this session" confirmation immediately, then
    // reconcile — roll back to the form only if the server rejects it.
    setEditing(false)
    setSubmittedNow(true)
    startTransition(async () => {
      const res = await submitSessionReview(appointmentId, rating, comment)
      if (res.ok) { router.refresh() }
      else { setEditing(true); setSubmittedNow(false); setError(res.error ?? 'Could not save your rating.') }
    })
  }

  // Submitted view (not editing): compact confirmation with an edit affordance.
  if (!editing && (initialRating != null || submittedNow)) {
    return (
      <div className={compact ? undefined : 'card'} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--c-green)', fontWeight: 700 }}>
          <Check size={15} /> You rated this session
        </span>
        <Stars value={rating} size={18} readOnly />
        <button onClick={() => setEditing(true)} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Change</button>
      </div>
    )
  }

  return (
    <div className={compact ? undefined : 'card'}>
      <div className="section-title" style={{ marginBottom: 4 }}>How was your session with {expert.split(' ')[0]}?</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Your rating stays private to the GetCalmly team and helps us keep care quality high.</p>
      <Stars value={rating} onPick={setRating} />
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything you'd like to share? (optional)"
        style={{ width: '100%', border: '1.5px solid var(--c-line)', borderRadius: 10, padding: '10px 12px', fontSize: 13.5, fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', marginTop: 12 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <button onClick={submit} disabled={pending} className="btn btn-primary" style={{ opacity: pending ? 0.6 : 1 }}>{pending ? 'Saving…' : 'Submit rating'}</button>
        {error && <span style={{ fontSize: 13, color: 'var(--c-coral)' }}>{error}</span>}
      </div>
    </div>
  )
}
