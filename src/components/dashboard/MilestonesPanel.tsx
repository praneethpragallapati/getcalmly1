'use client'

import { useState } from 'react'
import { Check, Lock } from 'lucide-react'
import type { MilestoneView } from '@/lib/milestones'

/**
 * How many milestones are "live" at once. Deliberately small: showing forty
 * open goals makes none of them feel like a goal. Three is what a person can
 * hold in their head, and a new one takes its place the moment one is earned.
 */
const ACTIVE_N = 3

/**
 * Milestones as three live goals, not a checklist of forty.
 *
 * NEXT UP — the three nearest to completion, with their progress. These are the
 * only ones presented as things to go after.
 * EARNED — what's already unlocked, kept because it's the reward, but folded
 * away so it doesn't compete with the three that are still open.
 * LOCKED — a count, not a list. The catalogue is still there for anyone curious
 * enough to open it, but it stays out of the way by default.
 */
export function MilestonesPanel({ milestones }: { milestones: MilestoneView[] }) {
  const [showEarned, setShowEarned] = useState(false)
  const [showLocked, setShowLocked] = useState(false)

  const earned = milestones.filter((m) => m.done)
  // Nearest-to-complete first; ties keep catalogue order (roughly easiest→hardest).
  const open = milestones.filter((m) => !m.done).sort((a, b) => b.progress - a.progress)
  const active = open.slice(0, ACTIVE_N)
  const locked = open.slice(ACTIVE_N)

  return (
    <div className="card tint-gold">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div className="section-title" style={{ margin: 0 }}>Milestones</div>
        <span className="muted" style={{ fontSize: 12.5 }}>
          {earned.length} earned of {milestones.length}
        </span>
      </div>

      {active.length > 0 ? (
        <>
          <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 12px' }}>
            {active.length === 1 ? 'Your next win.' : `Your next ${active.length} wins — closest first.`}
          </p>
          {active.map((m) => (
            <div className="milestone" key={m.key}>
              <span className="ms-ic todo" aria-hidden>
                <span style={{ fontSize: 15 }}>{m.icon}</span>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ms-label todo">{m.label}</div>
                <div className="ms-sub">{m.sub}</div>
                <div style={{ height: 5, background: 'rgba(28,43,58,.08)', borderRadius: 3, marginTop: 6, overflow: 'hidden', maxWidth: 260 }}>
                  <div style={{ height: '100%', width: `${Math.max(2, Math.round(m.progress * 100))}%`, background: 'var(--c-coral)', borderRadius: 3 }} />
                </div>
              </div>
              <span className="muted" style={{ fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {Math.round(m.progress * 100)}%
              </span>
            </div>
          ))}
        </>
      ) : (
        <p className="muted" style={{ fontSize: 13.5, margin: '8px 0 0' }}>
          Every milestone is unlocked. Incredible work. 🎉
        </p>
      )}

      {/* Earned — the reward, folded away so it doesn't crowd the open goals. */}
      {earned.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(28,43,58,.08)' }}>
          <Toggle open={showEarned} onClick={() => setShowEarned((v) => !v)}>
            {showEarned ? 'Hide' : 'Show'} what you&apos;ve earned · {earned.length}
          </Toggle>
          {showEarned && (
            <div style={{ marginTop: 8 }}>
              {earned.map((m) => (
                <div className="milestone" key={m.key}>
                  <span className="ms-ic done" aria-hidden><Check size={16} strokeWidth={3} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ms-label">{m.label}</div>
                    <div className="ms-sub">{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Locked — a count by default. The list is available but not in the way. */}
      {locked.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(28,43,58,.08)' }}>
          <Toggle open={showLocked} onClick={() => setShowLocked((v) => !v)}>
            <Lock size={12} />
            {locked.length} more unlock as you go
          </Toggle>
          {showLocked && (
            <div style={{ marginTop: 8, opacity: 0.65 }}>
              {locked.map((m) => (
                <div className="milestone" key={m.key}>
                  <span className="ms-ic todo" aria-hidden><Lock size={13} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ms-label todo">{m.label}</div>
                    <div className="ms-sub">{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Toggle({ open, onClick, children }: { open: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      style={{
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        color: 'var(--c-coral)', fontWeight: 700, fontSize: 13,
        display: 'inline-flex', alignItems: 'center', gap: 5,
      }}
    >
      {children}
    </button>
  )
}
