'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { saveAiSettings } from '@/app/admin/ai-settings/actions'
import type { AiConfig, UserType, FeatureKey } from '@/lib/ai/settings'

const USER_TYPES: UserType[] = ['free', 'paid', 'couples']
const FEATURES: { key: FeatureKey; label: string }[] = [
  { key: 'chatbot', label: 'Chatbot' },
  { key: 'daily', label: 'Daily insight' },
  { key: 'weekly', label: 'Weekly insight' },
  { key: 'synthesizer', label: 'Synthesizer' },
  { key: 'copilot', label: 'Copilot' },
]

type Opt = { key: string; id: string }

function ModelSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Opt[] }) {
  return (
    <select className="entry-input" value={value} onChange={(e) => onChange(e.target.value)} style={{ minWidth: 120 }}>
      {options.map((m) => <option key={m.key} value={m.key}>{m.id}</option>)}
    </select>
  )
}

/** Model options: key -> display id. Passed from the server so labels stay in sync. */
export function AiSettingsForm({ initial, modelOptions }: { initial: AiConfig; modelOptions: Opt[] }) {
  const [cfg, setCfg] = useState<AiConfig>(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, start] = useTransition()

  const update = (fn: (c: AiConfig) => AiConfig) => { setCfg(fn(structuredClone(cfg))); setSaved(false) }

  function save() {
    setError(null)
    start(async () => {
      const res = await saveAiSettings(cfg)
      if (res.ok) { setSaved(true) } else setError(res.error ?? 'Could not save.')
    })
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      {/* Non-chat feature models */}
      <div className="card">
        <div className="section-title" style={{ fontSize: 18, marginBottom: 10 }}>Models per feature</div>
        <div className="grid-2" style={{ gap: 14 }}>
          <label className="muted" style={{ fontSize: 12 }}>Chatbot · classification
            <div style={{ marginTop: 4 }}><ModelSelect options={modelOptions} value={cfg.models.classifier} onChange={(v) => update((c) => { c.models.classifier = v as never; return c })} /></div>
          </label>
          <label className="muted" style={{ fontSize: 12 }}>Daily insight
            <div style={{ marginTop: 4 }}><ModelSelect options={modelOptions} value={cfg.models.daily} onChange={(v) => update((c) => { c.models.daily = v as never; return c })} /></div>
          </label>
          <label className="muted" style={{ fontSize: 12 }}>Weekly insight
            <div style={{ marginTop: 4 }}><ModelSelect options={modelOptions} value={cfg.models.weekly} onChange={(v) => update((c) => { c.models.weekly = v as never; return c })} /></div>
          </label>
          <label className="muted" style={{ fontSize: 12 }}>Synthesizer
            <div style={{ marginTop: 4 }}><ModelSelect options={modelOptions} value={cfg.models.synthesizer} onChange={(v) => update((c) => { c.models.synthesizer = v as never; return c })} /></div>
          </label>
          <label className="muted" style={{ fontSize: 12 }}>Clinician Copilot
            <div style={{ marginTop: 4 }}><ModelSelect options={modelOptions} value={cfg.models.copilot} onChange={(v) => update((c) => { c.models.copilot = v as never; return c })} /></div>
          </label>
        </div>
        <p className="muted" style={{ fontSize: 11.5, marginTop: 10 }}>Chatbot reply model is set per user type below (routine vs high-stake).</p>
      </div>

      {/* Per user type */}
      {USER_TYPES.map((t) => (
        <div className="card" key={t}>
          <div className="section-title" style={{ fontSize: 18, marginBottom: 10, textTransform: 'capitalize' }}>{t} members</div>

          <div className="section-title" style={{ fontSize: 13 }}>Features enabled</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '8px 0 14px' }}>
            {FEATURES.map((f) => (
              <label key={f.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={cfg.features[t][f.key]} onChange={(e) => update((c) => { c.features[t][f.key] = e.target.checked; return c })} />
                {f.label}
              </label>
            ))}
          </div>

          <div className="grid-2" style={{ gap: 14 }}>
            <label className="muted" style={{ fontSize: 12 }}>Chat reply · routine
              <div style={{ marginTop: 4 }}><ModelSelect options={modelOptions} value={cfg.models.chatReply[t].routine} onChange={(v) => update((c) => { c.models.chatReply[t].routine = v as never; return c })} /></div>
            </label>
            <label className="muted" style={{ fontSize: 12 }}>Chat reply · high-stake (crisis/distress)
              <div style={{ marginTop: 4 }}><ModelSelect options={modelOptions} value={cfg.models.chatReply[t].highStake} onChange={(v) => update((c) => { c.models.chatReply[t].highStake = v as never; return c })} /></div>
            </label>
            <label className="muted" style={{ fontSize: 12 }}>Chats per day (0 = unlimited)
              <input className="entry-input" type="number" min={0} style={{ marginTop: 4 }} value={cfg.limits.chatsPerDay[t]}
                onChange={(e) => update((c) => { c.limits.chatsPerDay[t] = Math.max(0, Number(e.target.value) || 0); return c })} />
            </label>
            <label className="muted" style={{ fontSize: 12 }}>Monthly token cap per user (0 = unlimited)
              <input className="entry-input" type="number" min={0} style={{ marginTop: 4 }} value={cfg.limits.monthlyTokenCap[t]}
                onChange={(e) => update((c) => { c.limits.monthlyTokenCap[t] = Math.max(0, Number(e.target.value) || 0); return c })} />
            </label>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-primary" disabled={busy} onClick={save}>
          {saved ? <><Check size={15} /> Saved</> : busy ? 'Saving…' : 'Save settings'}
        </button>
        {error && <span style={{ color: 'var(--c-coral-d)', fontWeight: 600, fontSize: 13 }}>{error}</span>}
      </div>
    </div>
  )
}
