'use client'

import { useState, useTransition } from 'react'
import { User, Users, Baby } from 'lucide-react'
import { switchCategory } from '@/app/(dashboard)/app/actions'
import type { CareCategoryName } from '@/data/dashboardDemo'

const OPTIONS: { value: CareCategoryName; label: string; desc: string; icon: typeof User }[] = [
  { value: 'Individual', label: 'Individual', desc: 'Therapy & care just for you', icon: User },
  { value: 'Couple', label: 'Couple', desc: 'Sessions with your partner', icon: Users },
  { value: 'Kids', label: 'Kids', desc: 'Child & adolescent care', icon: Baby },
]

/**
 * Switch the product care category — Individual / Couple / Kids (#19). The actual
 * clinical move (partner/child linking) is arranged with the care team; this
 * records the patient's chosen track.
 */
export function CategorySwitcher({ current }: { current: CareCategoryName }) {
  const [selected, setSelected] = useState<CareCategoryName>(current)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function choose(value: CareCategoryName) {
    if (value === selected) return
    const prev = selected
    setSelected(value)
    setError(null)
    startTransition(async () => {
      const res = await switchCategory(value)
      if (!res.ok) {
        setSelected(prev)
        setError(res.error ?? 'Could not switch.')
      }
    })
  }

  return (
    <div className="card">
      <div className="section-title">Care category</div>
      <p className="muted" style={{ margin: '6px 0 14px' }}>
        Choose who your care is for. Switching is arranged with your care team — they’ll reach out to
        set things up.
      </p>
      <div className="cat-options">
        {OPTIONS.map(({ value, label, desc, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            disabled={pending}
            className={`cat-option${selected === value ? ' active' : ''}`}
          >
            <span className="cat-ic">
              <Icon size={20} />
            </span>
            <span className="cat-label">{label}</span>
            <span className="cat-desc">{desc}</span>
          </button>
        ))}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: 'var(--c-coral)', marginTop: 12, display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}
