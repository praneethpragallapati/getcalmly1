'use client'

import { useEffect, useRef, useState } from 'react'
import { LifeBuoy, Phone, X } from 'lucide-react'

/**
 * A discreet, always-available helpline access point pinned to the corner of the
 * dashboard. Collapsed it's a small pill (doesn't cover content); tapping it
 * opens a short list of 24/7 India helplines with tap-to-call links. Closes on
 * outside click / Escape.
 */
const HELPLINES = [
  { name: 'KIRAN (Govt. mental health)', number: '1800-599-0019', tel: '18005990019' },
  { name: 'iCall (TISS)', number: '9152987821', tel: '9152987821' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', tel: '18602662345' },
]

export function HelplineButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div ref={ref} style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 70 }}>
      {open && (
        <div style={{
          position: 'absolute', right: 0, bottom: 'calc(100% + 12px)', width: 288, maxWidth: '86vw',
          background: '#fff', borderRadius: 16, boxShadow: '0 18px 48px rgba(28,43,58,.24)', border: '1px solid rgba(28,43,58,.08)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', background: '#1c2b3a' }}>
            <span style={{ color: '#fff', fontSize: 13.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <LifeBuoy size={15} /> 24/7 helplines
            </span>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.8)', display: 'inline-flex' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: '6px 6px 8px' }}>
            {HELPLINES.map((h) => (
              <a key={h.tel} href={`tel:${h.tel}`} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', textDecoration: 'none', borderRadius: 10 }}
                 onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-coral-pale, #FDEAE6)')}
                 onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'var(--c-coral-pale, #FDEAE6)', color: 'var(--c-coral, #C8553D)', flexShrink: 0 }}>
                  <Phone size={15} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--c-charcoal, #1C2B3A)' }}>{h.name}</span>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--c-coral, #C8553D)' }}>{h.number}</span>
                </span>
              </a>
            ))}
          </div>
          <div style={{ padding: '8px 14px 12px', fontSize: 11, color: 'var(--c-gray, #8E9EAE)', borderTop: '1px solid rgba(28,43,58,.06)' }}>
            If you&apos;re in immediate danger, call emergency services (112).
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Helplines"
        aria-expanded={open}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 15px', borderRadius: 999,
          border: '1px solid rgba(200,85,61,.25)', background: '#fff', color: 'var(--c-coral, #C8553D)',
          fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 8px 24px rgba(28,43,58,.16)',
        }}
      >
        <LifeBuoy size={16} /> Helpline
      </button>
    </div>
  )
}
