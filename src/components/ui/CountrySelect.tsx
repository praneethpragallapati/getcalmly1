'use client'

import { useEffect, useRef, useState } from 'react'
import { countries, flagEmoji, type Country } from '@/data/countries'

/**
 * Compact dial-code picker: shows flag + code, opens a searchable list.
 * Sits inside a phone input as the left affordance.
 */
export default function CountrySelect({
  value,
  onChange,
}: {
  value: Country
  onChange: (c: Country) => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const filtered = q.trim()
    ? countries.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.dial.includes(q.replace('+', '')) ||
          c.code.toLowerCase() === q.toLowerCase(),
      )
    : countries

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, height: '100%',
          padding: '13px 12px', background: '#F5F7FA', color: '#1C2B3A',
          fontSize: 15, fontWeight: 600, border: 'none', borderRight: '1.5px solid #E2E8F0',
          cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span style={{ fontSize: 17 }}>{flagEmoji(value.code)}</span>
        +{value.dial}
        <span style={{ fontSize: 10, color: '#8E9EAE' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
          width: 280, maxHeight: 320, background: '#fff', borderRadius: 12,
          border: '1.5px solid #E2E8F0', boxShadow: '0 16px 48px rgba(28,43,58,.18)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: 10, borderBottom: '1px solid #EEF0F3' }}>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search country or code"
              style={{
                width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0',
                borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
          <div style={{ overflowY: 'auto' }}>
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c); setOpen(false); setQ('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 14px', background: c.code === value.code ? '#FFF1EC' : '#fff',
                  border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14,
                  color: '#1C2B3A', fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#F5F7FA')}
                onMouseOut={(e) => (e.currentTarget.style.background = c.code === value.code ? '#FFF1EC' : '#fff')}
              >
                <span style={{ fontSize: 18 }}>{flagEmoji(c.code)}</span>
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ color: '#8E9EAE', fontWeight: 600 }}>+{c.dial}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ padding: 16, fontSize: 13, color: '#8E9EAE', textAlign: 'center' }}>No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
