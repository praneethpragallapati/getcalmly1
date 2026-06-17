'use client'

import { useState } from 'react'

const MOODS = [
  { emoji: '😣', name: 'Awful', score: 1 },
  { emoji: '😔', name: 'Low', score: 2 },
  { emoji: '😐', name: 'Okay', score: 3 },
  { emoji: '🙂', name: 'Good', score: 4 },
  { emoji: '😄', name: 'Great', score: 5 },
]

/**
 * Today's mood check-in. Local-state only for now; wiring to MoodEntry comes
 * with the data layer. Respects the privacy opt-out conceptually (the row simply
 * won't be persisted when mood collection is off).
 */
export function MoodCheckIn() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="app-card mood-card">
      <span className="app-pill">DAILY CHECK-IN</span>
      <div className="mood-q">How are you feeling right now?</div>
      <div className="mood-options">
        {MOODS.map((m) => (
          <button
            key={m.score}
            className={`mood-opt${selected === m.score ? ' selected' : ''}`}
            onClick={() => setSelected(m.score)}
            type="button"
          >
            <span className="emoji">{m.emoji}</span>
            <span className="mood-name">{m.name}</span>
          </button>
        ))}
      </div>
      {selected !== null && <div className="mood-saved">Saved — see you tomorrow 💛</div>}
    </div>
  )
}
