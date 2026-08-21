'use client'

import { useState, useTransition } from 'react'
import { Star } from 'lucide-react'
import { rateMember } from '@/app/(dashboard)/expert/actions'
import { useToast } from '@/components/ui/Toast'

/**
 * The clinician's own rating of a member for one session.
 *
 * Visible to clinicians and admins only. It is never returned on a
 * patient-facing query — a member who could see how they were scored would
 * start managing the score instead of bringing what they actually came with,
 * which defeats the point of asking.
 *
 * Kept to one tap plus an optional line: this sits at the end of a clinical
 * write-up, and anything longer would just not get filled in.
 */
export function RateMember({
  appointmentId,
  initial = null,
  initialNote = '',
}: {
  appointmentId: string
  initial?: number | null
  initialNote?: string
}) {
  const toast = useToast()
  const [pending, start] = useTransition()
  const [rating, setRating] = useState<number | null>(initial)
  const [note, setNote] = useState(initialNote)
  const [hover, setHover] = useState<number | null>(null)
  const [saved, setSaved] = useState(initial != null)

  const submit = (value: number, withNote: string) =>
    start(async () => {
      const res = await rateMember({ appointmentId, rating: value, note: withNote })
      if (res.ok) { setSaved(true); toast.success('Rating saved') }
      else toast.error(res.error ?? 'Could not save the rating.')
    })

  const shown = hover ?? rating ?? 0

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(28,43,58,.08)' }}>
      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
        How did this session go? <span style={{ opacity: 0.75 }}>· only you and the admin team see this</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', gap: 2 }} onMouseLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={pending}
              aria-label={`${n} out of 5`}
              aria-pressed={rating === n}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onClick={() => { setRating(n); submit(n, note) }}
              style={{
                background: 'none', border: 'none', padding: 2, cursor: pending ? 'wait' : 'pointer',
                color: n <= shown ? '#C9973A' : 'rgba(28,43,58,.22)', display: 'inline-flex',
              }}
            >
              <Star size={18} fill={n <= shown ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        {saved && <span className="muted" style={{ fontSize: 11.5 }}>Saved</span>}
      </div>
      {rating != null && (
        <input
          className="entry-input"
          style={{ marginTop: 8, fontSize: 13 }}
          value={note}
          maxLength={1000}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => { if (rating != null) submit(rating, note) }}
          placeholder="Anything worth noting for the team (optional)"
        />
      )}
    </div>
  )
}
