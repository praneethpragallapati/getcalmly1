'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Shows one measure at a time behind tabs, so the Progress page presents a
 * single chart rather than a tall stack. Panels are server-rendered and passed
 * in; this only toggles which one is visible.
 */
export function OutcomeTabs({ tabs, panels }: { tabs: { id: string; label: string }[]; panels: ReactNode[] }) {
  const [i, setI] = useState(0)
  if (tabs.length === 0) return null
  return (
    <div className="card">
      <div className="oc-tabs" role="tablist">
        {tabs.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={idx === i}
            className={`oc-tab${idx === i ? ' sel' : ''}`}
            onClick={() => setI(idx)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>{panels[i]}</div>
    </div>
  )
}
