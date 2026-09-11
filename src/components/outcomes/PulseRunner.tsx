'use client'

import { useState } from 'react'
import { submitPulse } from '@/app/(dashboard)/app/pulse/actions'

export type PulseDef = {
  id: string
  short: string
  blurb: string
  denotes: string
  items: { key: string; text: string }[]
  choices: { value: number; label: string }[]
}

type Phase = { mode: 'list' } | { mode: 'run'; id: string; step: number } | { mode: 'done'; short: string; band: string | null }

export function PulseRunner({ due, defs }: { due: string[]; defs: PulseDef[] }) {
  const byId = new Map(defs.map((d) => [d.id, d]))
  const [phase, setPhase] = useState<Phase>({ mode: 'list' })
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = (id: string) => { setAnswers({}); setError(null); setPhase({ mode: 'run', id, step: 0 }) }

  async function choose(def: PulseDef, itemKey: string, value: number, step: number) {
    const next = { ...answers, [itemKey]: value }
    setAnswers(next)
    if (step + 1 < def.items.length) {
      setPhase({ mode: 'run', id: def.id, step: step + 1 })
      return
    }
    // Last item answered — submit.
    setSaving(true); setError(null)
    const res = await submitPulse(def.id, next)
    setSaving(false)
    if (!res.ok) { setError(res.error ?? 'Something went wrong.'); return }
    setPhase({ mode: 'done', short: def.short, band: res.band ?? null })
  }

  if (phase.mode === 'done') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
        <div style={{ fontSize: 30 }}>✓</div>
        <div className="section-title" style={{ marginTop: 8 }}>{phase.short} saved</div>
        <p className="muted" style={{ marginTop: 6 }}>
          {phase.band ? `Result: ${phase.band}. ` : ''}Thanks for checking in. You can see the trend on your Progress page.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setPhase({ mode: 'list' })}>Back to checks</button>
          <a className="btn btn-outline" href="/app/progress">See my progress</a>
        </div>
      </div>
    )
  }

  if (phase.mode === 'run') {
    const def = byId.get(phase.id)
    if (!def) return null
    const item = def.items[phase.step]
    const pctDone = Math.round((phase.step / def.items.length) * 100)
    return (
      <div className="stack">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="pulse-eyebrow">{def.short}</span>
            <span className="muted" style={{ fontSize: 12 }}>{phase.step + 1} of {def.items.length}</span>
          </div>
          <div className="pulse-bar"><span style={{ width: `${pctDone}%` }} /></div>
          <p className="pulse-q">{item.text}</p>
          {def.id !== 'GAS' && <p className="muted" style={{ fontSize: 12.5, marginTop: -4, marginBottom: 12 }}>Over the last two weeks, how often?</p>}
          <div className={def.choices.length > 6 ? 'pulse-opts pulse-opts-grid' : 'pulse-opts'}>
            {def.choices.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`pulse-opt${answers[item.key] === c.value ? ' sel' : ''}`}
                disabled={saving}
                onClick={() => choose(def, item.key, c.value, phase.step)}
              >
                {c.label}
              </button>
            ))}
          </div>
          {error && <p style={{ color: 'var(--c-coral-d)', fontSize: 13, marginTop: 12 }}>{error}</p>}
          <div style={{ marginTop: 16 }}>
            <button
              className="btn btn-ghost btn-sm"
              disabled={saving}
              onClick={() => (phase.step === 0 ? setPhase({ mode: 'list' }) : setPhase({ mode: 'run', id: def.id, step: phase.step - 1 }))}
            >
              {phase.step === 0 ? 'Cancel' : 'Back'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // List view
  const dueDefs = due.map((id) => byId.get(id)).filter(Boolean) as PulseDef[]
  const otherDefs = defs.filter((d) => !due.includes(d.id))

  return (
    <div className="stack">
      {dueDefs.length > 0 ? (
        <>
          <div className="section-title">Due now</div>
          {dueDefs.map((d) => (
            <div key={d.id} className="card pulse-card">
              <div>
                <div className="pulse-card-t">{d.short}</div>
                <p className="muted">{d.blurb}</p>
              </div>
              <button className="btn btn-primary" onClick={() => start(d.id)}>Start</button>
            </div>
          ))}
        </>
      ) : (
        <div className="card tint-green">
          <div className="section-title" style={{ marginBottom: 6 }}>You are all caught up</div>
          <p className="muted">No checks are due right now. You can still take one anytime below.</p>
        </div>
      )}

      {otherDefs.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 6 }}>Anytime</div>
          {otherDefs.map((d) => (
            <div key={d.id} className="card pulse-card">
              <div>
                <div className="pulse-card-t">{d.short}</div>
                <p className="muted">{d.blurb}</p>
              </div>
              <button className="btn btn-outline" onClick={() => start(d.id)}>Take now</button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
