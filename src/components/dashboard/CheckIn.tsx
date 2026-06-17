'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
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
              }}
              style={{
                background: `linear-gradient(to right, ${color} ${v * 10}%, #efe7e2 ${v * 10}%)`,
              }}
            />
          </div>
        )
      })}

      <div className="checkin-foot">
        <button className="btn btn-primary" onClick={() => setSaved(true)} type="button">
          {saved ? (
            <>
              <Check size={15} /> Saved
            </>
          ) : (
            'Save check-in'
          )}
        </button>
        <span className="checkin-note">Saved privately · used to personalise your insights</span>
      </div>
    </div>
  )
}
