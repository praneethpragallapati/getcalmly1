'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { changeMyPassword } from '@/app/change-password/actions'

const coral = '#C8553D'
const charcoal = '#1C2B3A'

const field: React.CSSProperties = {
  width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '12px 14px',
  fontSize: 15, fontFamily: 'inherit', color: charcoal, boxSizing: 'border-box',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6B7A', marginBottom: 6 }

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (next.length < 8) { setErr('Use at least 8 characters.'); return }
    if (next !== confirm) { setErr('New passwords do not match.'); return }
    startTransition(async () => {
      const res = await changeMyPassword({ current, next })
      if (res.ok) {
        const dest = res.role === 'THERAPIST' ? '/expert' : res.role === 'ADMIN' ? '/admin' : '/app'
        router.replace(dest)
        router.refresh()
      } else {
        setErr(res.error ?? 'Could not update your password.')
      }
    })
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={label}>Current {forced ? 'temporary ' : ''}password</label>
        <input type="password" style={field} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required placeholder={forced ? 'The temp password you were given' : ''} />
      </div>
      <div>
        <label style={label}>New password</label>
        <input type="password" style={field} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required placeholder="At least 8 characters" />
      </div>
      <div>
        <label style={label}>Confirm new password</label>
        <input type="password" style={field} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
      </div>
      <button type="submit" disabled={pending} style={{ background: coral, color: '#fff', padding: '14px', borderRadius: 12, fontSize: 15.5, fontWeight: 700, border: 'none', cursor: pending ? 'wait' : 'pointer', boxShadow: `0 8px 22px ${coral}45`, opacity: pending ? 0.7 : 1, fontFamily: 'inherit' }}>
        {pending ? 'Saving…' : 'Set new password'}
      </button>
      {err && <p style={{ fontSize: 13.5, color: coral, textAlign: 'center', margin: 0 }}>{err}</p>}
    </form>
  )
}
