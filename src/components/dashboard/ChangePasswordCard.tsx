'use client'

import { useState, useTransition } from 'react'
import { changeMyPassword } from '@/app/change-password/actions'

const charcoal = '#1C2B3A'
const field: React.CSSProperties = { width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 13px', fontSize: 14.5, fontFamily: 'inherit', color: charcoal, boxSizing: 'border-box' }
const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#5A6B7A', marginBottom: 5 }

/**
 * Self-service password change for any signed-in user (patient / clinician /
 * admin). Requires the current password. Stays on the page and shows an inline
 * result instead of redirecting.
 */
export function ChangePasswordCard() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (next.length < 8) return setMsg({ ok: false, text: 'Use at least 8 characters.' })
    if (next !== confirm) return setMsg({ ok: false, text: 'New passwords do not match.' })
    start(async () => {
      const res = await changeMyPassword({ current, next })
      if (res.ok) {
        setMsg({ ok: true, text: 'Password updated.' })
        setCurrent(''); setNext(''); setConfirm('')
      } else {
        setMsg({ ok: false, text: res.error ?? 'Could not update your password.' })
      }
    })
  }

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Change password</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>Enter your current password and choose a new one (at least 8 characters).</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 380 }}>
        <div>
          <label style={label}>Current password</label>
          <input type="password" style={field} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </div>
        <div>
          <label style={label}>New password</label>
          <input type="password" style={field} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required placeholder="At least 8 characters" />
        </div>
        <div>
          <label style={label}>Confirm new password</label>
          <input type="password" style={field} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.6 : 1 }}>
            {pending ? 'Saving…' : 'Update password'}
          </button>
          {msg && <span style={{ fontSize: 13, fontWeight: 600, color: msg.ok ? '#2C7A57' : '#C8553D' }}>{msg.text}</span>}
        </div>
      </form>
    </div>
  )
}
