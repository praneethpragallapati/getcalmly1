'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, Check } from 'lucide-react'
import { updateContact } from '@/app/(dashboard)/app/actions'

type Channel = 'email' | 'phone'

/**
 * Change the login email or phone, verified by an OTP sent to the NEW value.
 * Reuses the same /api/otp send endpoints as sign-in, then hands the code to
 * the updateContact server action, which verifies it and moves the identity.
 */
function ChangeRow({ channel, current }: { channel: Channel; current: string | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const label = channel === 'email' ? 'Email' : 'Phone'
  const Icon = channel === 'email' ? Mail : Phone
  const placeholder = channel === 'email' ? 'you@example.com' : '+91 98765 43210'

  function reset() {
    setOpen(false); setValue(''); setOtp(''); setSent(false); setError(''); setDone(false)
  }

  async function sendCode() {
    setError('')
    const v = value.trim()
    if (channel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError('Enter a valid email address.'); return }
    if (channel === 'phone' && v.replace(/\D/g, '').length < 10) { setError('Enter a valid phone number.'); return }
    setSending(true)
    try {
      const endpoint = channel === 'email' ? '/api/otp/email-send' : '/api/otp/send'
      const body = channel === 'email' ? { email: v } : { mobile: v }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.ok) setSent(true)
      else setError(data.message || 'Could not send the code. Please try again.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  function save() {
    setError('')
    if (otp.trim().length < 4) { setError('Enter the code we sent.'); return }
    start(async () => {
      const res = await updateContact({ channel, value: value.trim(), otp: otp.trim() })
      if (res.ok) { setDone(true); router.refresh() }
      else setError(res.error ?? 'Could not update. Please try again.')
    })
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--c-line, #EDEFF2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <Icon size={15} style={{ color: 'var(--c-gray-d, #5F6E7D)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div className="field-label" style={{ marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 14, color: 'var(--c-charcoal, #1C2B3A)', wordBreak: 'break-all' }}>{current || 'Not set'}</div>
          </div>
        </div>
        {!open && (
          <button className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setOpen(true)}>
            Change
          </button>
        )}
      </div>

      {open && !done && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380 }}>
          <input
            className="field-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            type={channel === 'email' ? 'email' : 'tel'}
            disabled={sent}
          />
          {sent && (
            <input
              className="field-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              inputMode="numeric"
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {!sent ? (
              <button className="btn btn-primary" disabled={sending} onClick={sendCode}>{sending ? 'Sending…' : 'Send code'}</button>
            ) : (
              <button className="btn btn-primary" disabled={pending} onClick={save}>{pending ? 'Saving…' : `Verify & update ${label.toLowerCase()}`}</button>
            )}
            <button className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={reset}>Cancel</button>
            {sent && <button className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={sendCode} disabled={sending}>Resend</button>}
          </div>
          {sent && !error && <p className="muted" style={{ fontSize: 12.5, margin: 0 }}>We sent a code to your new {label.toLowerCase()}. Enter it to confirm the change.</p>}
          {error && <p style={{ fontSize: 13, color: 'var(--c-coral-d, #B8482F)', margin: 0 }}>{error}</p>}
        </div>
      )}

      {done && (
        <p style={{ marginTop: 10, fontSize: 13.5, color: 'var(--c-green, #3D9E72)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Check size={15} /> {label} updated.
        </p>
      )}
    </div>
  )
}

export function ContactMethods({ email, phone }: { email: string | null; phone: string | null }) {
  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Sign-in &amp; contact</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 6 }}>
        Change the email or phone you sign in with. We&apos;ll send a code to the new one to confirm it&apos;s yours.
      </p>
      <ChangeRow channel="email" current={email} />
      <ChangeRow channel="phone" current={phone} />
    </div>
  )
}
