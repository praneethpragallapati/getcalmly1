'use client'

import { useState, useTransition } from 'react'
import { saveEarningsConfig } from '../actions'
import type { EarningsConfigValues } from '@/lib/earningsConfig'

const FIELDS: { key: keyof EarningsConfigValues; label: string }[] = [
  { key: 'baseFeeIndividual', label: 'Base fee · individual therapy' },
  { key: 'baseFeeCouples', label: 'Base fee · couples therapy' },
  { key: 'baseFeePsychiatry', label: 'Base fee · psychiatry' },
  { key: 'secondSessionBonus', label: '2nd session bonus' },
  { key: 'thirdOnwardsBonus', label: '3rd session onwards bonus' },
  { key: 'miscBonus', label: 'Misc bonus' },
  { key: 'nightSessionBonus', label: 'Night session bonus' },
]

export function EarningsConfigForm({ initial }: { initial: EarningsConfigValues }) {
  const [values, setValues] = useState<EarningsConfigValues>(initial)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function save() {
    setMsg(null)
    startTransition(async () => {
      const res = await saveEarningsConfig(values)
      setMsg(res.ok ? { ok: true, text: 'Saved. Earnings now use these values.' } : { ok: false, text: res.error ?? 'Failed.' })
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
      {FIELDS.map((f) => (
        <label key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: '#3A4A5A' }}>{f.label}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#8E9EAE' }}>₹</span>
            <input
              type="number"
              min={0}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: Number(e.target.value) }))}
              style={{ width: 110, padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
            />
          </span>
        </label>
      ))}

      <button
        onClick={save}
        disabled={pending}
        style={{
          marginTop: 6, padding: '12px', borderRadius: 10, border: 'none', background: '#1A7F7A',
          color: '#fff', fontSize: 15, fontWeight: 700, cursor: pending ? 'wait' : 'pointer',
        }}
      >
        {pending ? 'Saving…' : 'Save configuration'}
      </button>
      {msg && <p style={{ margin: 0, fontSize: 13, color: msg.ok ? '#1A7F7A' : '#C8553D' }}>{msg.text}</p>}
    </div>
  )
}
