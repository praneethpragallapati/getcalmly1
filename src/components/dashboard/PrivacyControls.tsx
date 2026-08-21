'use client'

import { useState, useTransition } from 'react'
import { ShieldCheck, Check } from 'lucide-react'
import { updatePrivacy, type PrivacyInput } from '@/app/(dashboard)/app/actions'
import type { PrivacyFlags } from '@/data/dashboardDemo'

const CATEGORIES: { key: keyof Omit<PrivacyInput, 'feedToLlm'>; label: string; desc: string }[] = [
  { key: 'collectMood', label: 'Mood check-ins', desc: 'Daily mood, energy & calm scores' },
  { key: 'collectJournals', label: 'Journal entries', desc: 'What you write in your journal' },
  { key: 'collectSessions', label: 'Session notes', desc: 'Pre-session notes & summaries' },
  { key: 'collectChats', label: 'Calm AI chats', desc: 'Your conversations with Calm AI' },
]

function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      disabled={disabled}
      className={`switch${on ? ' on' : ''}${disabled ? ' disabled' : ''}`}
    >
      <span className="switch-knob" />
    </button>
  )
}

/**
 * Per-category data-collection switches + the master LLM kill switch (#17). This
 * is the patient's compliance surface: a category turned off keeps the raw record
 * but excludes it from the AI pipeline; feedToLlm off excludes everything.
 */
export function PrivacyControls({ initial }: { initial: PrivacyFlags }) {
  const [flags, setFlags] = useState<PrivacyInput>({
    collectMood: initial.collectMood,
    collectJournals: initial.collectJournals,
    collectSessions: initial.collectSessions,
    collectChats: initial.collectChats,
    feedToLlm: initial.feedToLlm,
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function persist(next: PrivacyInput) {
    setFlags(next)
    setSaved(false)
    setError(null)
    startTransition(async () => {
      const res = await updatePrivacy(next)
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 1600)
      } else {
        setError(res.error ?? 'Could not save.')
      }
    })
  }

  return (
    <div className="card">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldCheck size={17} /> Privacy & AI data controls
      </div>
      <p className="muted" style={{ margin: '6px 0 4px' }}>
        You decide what helps personalise your insights. Turning something off keeps your own record
        intact, it’s simply never used by Calm AI.
      </p>

      <div className="priv-master">
        <div>
          <div className="priv-label">Use my data to personalise Calm AI</div>
          <div className="priv-desc">
            Master switch. When off, nothing below is ever sent to the AI, regardless of the
            individual toggles.
          </div>
        </div>
        <Toggle on={flags.feedToLlm} onChange={() => persist({ ...flags, feedToLlm: !flags.feedToLlm })} />
      </div>

      {CATEGORIES.map(({ key, label, desc }) => (
        <div className="priv-row" key={key}>
          <div>
            <div className="priv-label">{label}</div>
            <div className="priv-desc">{desc}</div>
          </div>
          <Toggle
            on={flags.feedToLlm && flags[key]}
            disabled={!flags.feedToLlm}
            onChange={() => persist({ ...flags, [key]: !flags[key] })}
          />
        </div>
      ))}

      <div style={{ marginTop: 14, minHeight: 18 }}>
        {error ? (
          <span style={{ fontSize: 12, color: 'var(--c-coral-d)' }}>{error}</span>
        ) : saved ? (
          <span style={{ fontSize: 12, color: 'var(--c-green)', display: 'inline-flex', gap: 5, alignItems: 'center' }}>
            <Check size={13} /> Saved {pending ? '…' : ''}
          </span>
        ) : pending ? (
          <span style={{ fontSize: 12, color: 'var(--c-gray)' }}>Saving…</span>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--c-gray)' }}>
            Changes save automatically and apply right away.
          </span>
        )}
      </div>
    </div>
  )
}
