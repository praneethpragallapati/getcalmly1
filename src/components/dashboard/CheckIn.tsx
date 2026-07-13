'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { saveCheckin } from '@/app/(dashboard)/app/actions'
import type { CheckinScores } from '@/data/dashboardDemo'

const DIMS: { key: keyof CheckinScores; label: string; color: string }[] = [
  { key: 'mood', label: 'Mood', color: '#c8553d' },
  { key: 'energy', label: 'Energy', color: '#6d5bd0' },
  { key: 'calm', label: 'Calm', color: '#3d9e72' },
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
    startTransition(async () => {
      const res = await saveCheckin(scores)
      if (res.ok) {
        setSaved(true)
        router.refresh() // pull the updated week chart / average from the server
      } else {
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
    <div className="card">
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

      {DIMS.map(({ key, label, color }) => {
        const v = scores[key]
        return (
          <div className="slider-row" key={key}>
            <div className="slider-top">
              <span className="slider-label">{label}</span>
              <span className="slider-val" style={{ color }}>
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
                background: `linear-gradient(to right, ${color} ${v * 10}%, #efe7e2 ${v * 10}%)`,
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
