'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Check, RotateCcw } from 'lucide-react'
import { saveCheckin } from '@/app/(dashboard)/app/actions'
import type { CheckinScores } from '@/data/dashboardDemo'

// Muted and harmonious rather than three saturated primaries, the same trio
// the mood chart uses, so a colour means the same thing in both places.
const DIMS: { key: keyof CheckinScores; label: string; color: string; tint: string }[] = [
  { key: 'mood', label: 'Mood', color: '#C8553D', tint: 'rgba(200,85,61,.10)' },
  { key: 'energy', label: 'Energy', color: '#D9A441', tint: 'rgba(217,164,65,.12)' },
  { key: 'sleep', label: 'Sleep', color: '#5B6FB0', tint: 'rgba(91,111,176,.12)' },
]

/**
 * Morning check-in with Mood / Energy / Sleep 0–10 sliders. On save the card
 * flips (3D rotate) to reveal this week's mood trend, the chart is passed in as
 * `back` so the server can render it with real data, and it only mounts once the
 * card has flipped so its left-to-right draw plays as the trend comes into view.
 * Local state only for the flip; persistence + privacy gating stay server-side.
 */
export function CheckIn({
  initial,
  streakDays,
  back,
}: {
  initial: CheckinScores
  streakDays: number
  back?: ReactNode
}) {
  const [scores, setScores] = useState<CheckinScores>(initial)
  const [saved, setSaved] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [popKey, setPopKey] = useState<keyof CheckinScores | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmZero, setConfirmZero] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const allZero = scores.mood === 0 && scores.energy === 0 && scores.sleep === 0

  function persist() {
    setError(null)
    setConfirmZero(false)
    // Optimistic: flip to the trend immediately; the write + chart refresh happen
    // in the background and only roll back if the server actually rejects it.
    setSaved(true)
    if (back) setFlipped(true)
    startTransition(async () => {
      const res = await saveCheckin(scores)
      if (res.ok) {
        router.refresh() // pull the updated week chart / average from the server
      } else {
        setSaved(false)
        setFlipped(false)
        setError(res.error ?? 'Something went wrong.')
      }
    })
  }

  function onSave() {
    // Guard against an accidental all-zero save (e.g. tapping Save before moving
    // any slider), ask once before recording "a really tough day".
    if (allZero && !confirmZero) {
      setConfirmZero(true)
      return
    }
    persist()
  }

  function flipBack() {
    setFlipped(false)
    setSaved(false)
  }

  const front = (
    <div className="card checkin-card">
      <div className="checkin-head">
        <div>
          <div className="eyebrow">MORNING CHECK-IN</div>
          <div className="checkin-q" style={{ marginTop: 4 }}>
            How are you arriving into today?
          </div>
        </div>
        <span className="streak-chip">🔥 {streakDays}-day streak</span>
      </div>

      {DIMS.map(({ key, label, color, tint }) => {
        const v = scores[key]
        return (
          <div className="slider-row" key={key}>
            <div className="slider-top">
              <span className="slider-label">{label}</span>
              <span
                key={popKey === key ? `${key}-${v}` : key}
                className={`slider-val${popKey === key ? ' pop' : ''}`}
                style={{ color, background: v > 0 ? tint : 'transparent' }}
              >
                {v}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={v}
              className="slider"
              onChange={(e) => {
                setScores((s) => ({ ...s, [key]: Number(e.target.value) }))
                setSaved(false)
                setConfirmZero(false)
                setPopKey(key)
              }}
              style={{
                color,
                background: `linear-gradient(to right, ${color} 0%, ${color} ${v * 10}%, rgba(28,43,58,.08) ${v * 10}%)`,
              }}
            />
          </div>
        )
      })}

      {confirmZero && allZero ? (
        <div className="checkin-foot" style={{ flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--c-coral, #C8553D)' }}>
            Save mood, energy and sleep all as 0? That marks today as a really tough day.
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={persist} type="button" disabled={pending}>
              {pending ? 'Saving…' : 'Yes, save all 0s'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmZero(false)}
              disabled={pending}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--c-gray-d, #6B7D8E)',
                cursor: 'pointer',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              Go back
            </button>
          </div>
        </div>
      ) : (
        <div className="checkin-foot">
          <button className="btn btn-primary" onClick={onSave} type="button" disabled={pending}>
            {saved ? (
              <>
                <Check size={15} /> Saved
              </>
            ) : pending ? (
              'Saving…'
            ) : (
              'Save check-in'
            )}
          </button>
          {error && <span className="checkin-note" style={{ color: 'var(--c-coral-d)' }}>{error}</span>}
        </div>
      )}
    </div>
  )

  // No chart to flip to (e.g. mobile stacks it elsewhere), just the card.
  if (!back) return front

  return (
    <div className="flip-wrap">
      <div className={`flip-inner${flipped ? ' flipped' : ''}`}>
        <div className="flip-face flip-front" aria-hidden={flipped}>
          {front}
        </div>
        <div className="flip-face flip-back" aria-hidden={!flipped}>
          {/* The chart stays mounted so the stacked card keeps a stable height,
              but it is keyed on `flipped` so it remounts when the card turns , 
              replaying its left-to-right draw as the trend comes into view. */}
          <div key={flipped ? 'trend-shown' : 'trend-idle'} className="flip-back-chart">
            {back}
          </div>
          <button type="button" className="flip-again" onClick={flipBack}>
            <RotateCcw size={13} /> Check in again
          </button>
        </div>
      </div>
    </div>
  )
}
