'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { saveCheckin } from '@/app/(dashboard)/app/actions'
import type { CheckinScores } from '@/data/dashboardDemo'

// Muted and harmonious rather than three saturated primaries — the same trio
// the mood chart uses, so a colour means the same thing in both places.
const DIMS: { key: keyof CheckinScores; label: string; color: string; tint: string }[] = [
  { key: 'mood', label: 'Mood', color: '#C8553D', tint: 'rgba(200,85,61,.10)' },
  { key: 'energy', label: 'Energy', color: '#D9A441', tint: 'rgba(217,164,65,.12)' },
  { key: 'calm', label: 'Calm', color: '#4E9E8F', tint: 'rgba(78,158,143,.12)' },
]

/**
 * Morning check-in with Mood / Energy / Calm 0–10 sliders (matches the web
 * mockup). Local state only for now; persistence + privacy gating land with the
 * data layer (a check-in is simply not stored when mood collection is off).
 */
export function CheckIn({ initial, streakDays }: { initial: CheckinScores; streakDays: number }) {
  const [scores, setScores] = useState<CheckinScores>(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmZero, setConfirmZero] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const allZero = scores.mood === 0 && scores.energy === 0 && scores.calm === 0

  function persist() {
    setError(null)
    setConfirmZero(false)
    // Optimistic: flip to "Saved" immediately; the write + chart refresh happen in
    // the background and only roll back if the server actually rejects it.
    setSaved(true)
    startTransition(async () => {
      const res = await saveCheckin(scores)
      if (res.ok) {
        router.refresh() // pull the updated week chart / average from the server
      } else {
        setSaved(false)
        setError(res.error ?? 'Something went wrong.')
      }
    })
  }

  function onSave() {
    // Guard against an accidental all-zero save (e.g. tapping Save before moving
    // any slider) — ask once before recording "a really tough day".
    if (allZero && !confirmZero) {
      setConfirmZero(true)
      return
    }
    persist()
  }

  return (
    <div className="card checkin-card">
      <div className="checkin-head">
        <div>
          <div className="eyebrow">MORNING CHECK-IN</div>
          <div className="checkin-q" style={{ marginTop: 4 }}>
            How are you arriving into today?
          </div>
          <div className="muted" style={{ marginTop: 2 }}>
            A few honest seconds sets the tone for the whole day.
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
              <span className="slider-val" style={{ color, background: v > 0 ? tint : 'transparent' }}>
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
            Save mood, energy and calm all as 0? That marks today as a really tough day.
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
          <span className="checkin-note">
            {error ?? 'Saved privately · used to personalise your insights'}
          </span>
        </div>
      )}
    </div>
  )
}
