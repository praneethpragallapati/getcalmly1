'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { savePricingConfig } from '@/app/admin/actions'
import { perSession, inr, type PricingValues, type SessionPack, type AppPack, type BuyableTrack } from '@/data/pricing'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'

const cell: React.CSSProperties = {
  width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 10px',
  fontSize: 14, fontFamily: 'inherit', color: charcoal, boxSizing: 'border-box',
}
const th: React.CSSProperties = { textAlign: 'left', padding: '6px 8px', fontSize: 11.5, fontWeight: 700, color: '#8E9EAE', textTransform: 'uppercase', letterSpacing: 0.4 }
const td: React.CSSProperties = { padding: '5px 8px' }

function NumInput({ value, onChange, prefix }: { value: number; onChange: (n: number) => void; prefix?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, width: '100%' }}>
      {prefix && <span style={{ color: '#8E9EAE', fontSize: 13 }}>{prefix}</span>}
      <input type="number" min={0} value={value} onChange={(e) => onChange(Math.max(0, Math.round(Number(e.target.value) || 0)))} style={cell} />
    </span>
  )
}

/** Editable table of session packs for one track. Row count is fixed (re-price only). */
function PackTable({
  title, packs, base, onPacks, onBase,
}: {
  title: string; packs: SessionPack[]; base: number
  onPacks: (packs: SessionPack[]) => void; onBase: (n: number) => void
}) {
  const set = (i: number, key: keyof SessionPack, n: number) =>
    onPacks(packs.map((p, idx) => (idx === i ? { ...p, [key]: n } : p)))

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 2 }}>{title}</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
        Per-session price is derived from the total. The largest pack is shown as “Best value”.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
          <thead>
            <tr>
              <th style={th}>Sessions</th>
              <th style={th}>Validity (months)</th>
              <th style={th}>Total (₹)</th>
              <th style={th}>Per session</th>
            </tr>
          </thead>
          <tbody>
            {packs.map((p, i) => (
              <tr key={i}>
                <td style={{ ...td, width: 110 }}><NumInput value={p.sessions} onChange={(n) => set(i, 'sessions', n)} /></td>
                <td style={{ ...td, width: 140 }}><NumInput value={p.months} onChange={(n) => set(i, 'months', n)} /></td>
                <td style={{ ...td, width: 150 }}><NumInput value={p.total} onChange={(n) => set(i, 'total', n)} prefix="₹" /></td>
                <td style={{ ...td, color: '#5A6B7A', fontWeight: 600 }}>{p.sessions > 0 ? inr(perSession(p)) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 13.5, color: '#3A4A5A' }}>
        <span style={{ fontWeight: 600 }}>List price / session (MRP, struck through)</span>
        <span style={{ width: 130 }}><NumInput value={base} onChange={onBase} prefix="₹" /></span>
      </label>
    </div>
  )
}

export function PricingConfigForm({ initial }: { initial: PricingValues }) {
  const [values, setValues] = useState<PricingValues>(initial)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const patch = (p: Partial<PricingValues>) => setValues((v) => ({ ...v, ...p }))
  const setFirst = (track: BuyableTrack, n: number) => patch({ firstSession: { ...values.firstSession, [track]: n } })
  const setCalmPack = (i: number, key: keyof AppPack, n: number | string) =>
    patch({ calmPlusPacks: values.calmPlusPacks.map((p, idx) => (idx === i ? { ...p, [key]: n } : p)) })

  function save() {
    setMsg(null)
    startTransition(async () => {
      const res = await savePricingConfig(values)
      setMsg(res.ok
        ? { ok: true, text: 'Saved. New prices are live on the pricing page and in-app buy flow.' }
        : { ok: false, text: res.error ?? 'Failed.' })
    })
  }

  return (
    <div className="stack">
      {/* First session */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 2 }}>First session (flat intro price)</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
          The only price a new patient sees until their first session is done — never discounted or bundled.
        </p>
        <div className="grid-4" style={{ maxWidth: 560 }}>
          {(['therapy', 'psychiatry', 'couples'] as const).map((t) => (
            <label key={t} style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#5A6B7A', marginBottom: 5, textTransform: 'capitalize' }}>{t}</span>
              <NumInput value={values.firstSession[t]} onChange={(n) => setFirst(t, n)} prefix="₹" />
            </label>
          ))}
        </div>
      </div>

      {/* Session packs */}
      <PackTable title="Therapy packs" packs={values.therapyPacks} base={values.therapyBase}
        onPacks={(p) => patch({ therapyPacks: p })} onBase={(n) => patch({ therapyBase: n })} />
      <PackTable title="Psychiatry packs" packs={values.psychiatryPacks} base={values.psychiatryBase}
        onPacks={(p) => patch({ psychiatryPacks: p })} onBase={(n) => patch({ psychiatryBase: n })} />
      <PackTable title="Couples packs" packs={values.couplesPacks} base={values.couplesBase}
        onPacks={(p) => patch({ couplesPacks: p })} onBase={(n) => patch({ couplesBase: n })} />

      {/* Calm+ */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 2 }}>Calm+ plans (app-only)</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Billed by validity. The last plan is shown as “Best value”.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
            <thead>
              <tr>
                <th style={th}>Label</th>
                <th style={th}>Validity (months)</th>
                <th style={th}>Total (₹)</th>
                <th style={th}>Per month</th>
              </tr>
            </thead>
            <tbody>
              {values.calmPlusPacks.map((p, i) => (
                <tr key={i}>
                  <td style={{ ...td, width: 160 }}>
                    <input value={p.label} onChange={(e) => setCalmPack(i, 'label', e.target.value)} style={cell} />
                  </td>
                  <td style={{ ...td, width: 140 }}><NumInput value={p.months} onChange={(n) => setCalmPack(i, 'months', n)} /></td>
                  <td style={{ ...td, width: 150 }}><NumInput value={p.total} onChange={(n) => setCalmPack(i, 'total', n)} prefix="₹" /></td>
                  <td style={{ ...td, color: '#5A6B7A', fontWeight: 600 }}>{p.months > 0 ? inr(Math.floor(p.total / p.months)) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 13.5, color: '#3A4A5A' }}>
          <span style={{ fontWeight: 600 }}>List price / month (MRP, struck through)</span>
          <span style={{ width: 130 }}><NumInput value={values.calmPlusBase} onChange={(n) => patch({ calmPlusBase: n })} prefix="₹" /></span>
        </label>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', bottom: 0, background: 'var(--c-bg, #F7F4F1)', padding: '12px 0' }}>
        <button onClick={save} disabled={pending} className="btn btn-primary" style={{ opacity: pending ? 0.6 : 1 }}>
          {pending ? 'Saving…' : 'Save pricing'}
        </button>
        {msg && (
          <span style={{ fontSize: 13.5, color: msg.ok ? '#2C7A57' : coral, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {msg.ok && <Check size={14} />}{msg.text}
          </span>
        )}
      </div>
    </div>
  )
}
