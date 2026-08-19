'use client'

import { useState } from 'react'
import { Check, Lock } from 'lucide-react'
import type { MilestoneView } from '@/lib/milestones'

const TOP_N = 10

/**
 * Milestones with two tabs — "In progress" (nearest to completion first, so the
 * most attainable next wins are on top) and "Completed". The in-progress tab
 * shows the top 10 with a "View all" toggle so the list never overwhelms.
 */
export function MilestonesPanel({ milestones }: { milestones: MilestoneView[] }) {
  const [tab, setTab] = useState<'todo' | 'done'>('todo')
  const [showAll, setShowAll] = useState(false)

  const done = milestones.filter((m) => m.done)
  // Nearest-to-complete first; ties keep catalogue order (roughly easiest→hardest).
  const todo = milestones.filter((m) => !m.done).sort((a, b) => b.progress - a.progress)

  const list = tab === 'done' ? done : (showAll ? todo : todo.slice(0, TOP_N))
  const hiddenCount = tab === 'todo' && !showAll ? Math.max(0, todo.length - TOP_N) : 0

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>Milestones</div>
        <div style={{ display: 'inline-flex', background: 'rgba(28,43,58,.05)', borderRadius: 999, padding: 3 }}>
          <TabBtn active={tab === 'todo'} onClick={() => setTab('todo')}>In progress · {todo.length}</TabBtn>
          <TabBtn active={tab === 'done'} onClick={() => setTab('done')}>Completed · {done.length}</TabBtn>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="muted" style={{ fontSize: 13.5, padding: '6px 0' }}>
          {tab === 'done' ? 'No milestones unlocked yet — your first ones are just a check-in away.' : 'Every milestone is unlocked. Incredible work. 🎉'}
        </p>
      ) : (
        list.map((m) => (
          <div className="milestone" key={m.key}>
            <span className={`ms-ic ${m.done ? 'done' : 'todo'}`} aria-hidden>
              {m.done ? <Check size={16} strokeWidth={3} /> : <span style={{ fontSize: 15 }}>{m.icon}</span>}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={`ms-label ${m.done ? '' : 'todo'}`}>{m.label}</div>
              <div className="ms-sub">{m.sub}</div>
              {!m.done && m.progress > 0 && (
                <div style={{ height: 5, background: 'rgba(28,43,58,.08)', borderRadius: 3, marginTop: 6, overflow: 'hidden', maxWidth: 220 }}>
                  <div style={{ height: '100%', width: `${Math.round(m.progress * 100)}%`, background: 'var(--c-coral)', borderRadius: 3 }} />
                </div>
              )}
            </div>
            {!m.done && <span style={{ color: 'var(--c-gray, #9AABB8)', flexShrink: 0 }}><Lock size={13} /></span>}
          </div>
        ))
      )}

      {tab === 'todo' && todo.length > TOP_N && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--c-coral)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', padding: 0 }}
        >
          {showAll ? 'Show less' : `View all ${todo.length} in progress${hiddenCount ? ` (+${hiddenCount})` : ''}`}
        </button>
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 'none', cursor: 'pointer', borderRadius: 999, padding: '6px 14px', fontSize: 12.5, fontWeight: 700,
        background: active ? '#fff' : 'transparent',
        color: active ? 'var(--c-ink, #1C2B3A)' : 'var(--c-gray, #6B7D8E)',
        boxShadow: active ? '0 1px 3px rgba(28,43,58,.12)' : 'none',
        transition: 'background .15s, color .15s',
      }}
    >
      {children}
    </button>
  )
}
