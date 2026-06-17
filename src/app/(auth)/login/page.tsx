'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import CountrySelect from '@/components/ui/CountrySelect'
import { defaultCountry } from '@/data/countries'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'phone' | 'email' | 'password'>('phone')
  const [sent, setSent] = useState(false)
  const [country, setCountry] = useState(defaultCountry)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePasswordLogin() {
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }
    setLoading(true)
    try {
      const result = await signIn('password', { email, password, redirect: false })
      if (result?.ok) router.push('/app')
      else setError('Email or password is incorrect.')
    } catch {
      setError('Could not sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const mobile = `${country.dial}${phone.replace(/\D/g, '')}`

  async function handleSend() {
    setError('')
    if (tab === 'phone') {
      if (phone.replace(/\D/g, '').length < 10) {
        setError('Enter a valid mobile number.')
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile }),
        })
        const data = await res.json()
        if (data.ok) setSent(true)
        else setError(data.message || 'Could not send OTP. Please try again.')
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Enter a valid email address.')
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/otp/email-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (data.ok) setSent(true)
        else setError(data.message || 'Could not send code. Please try again.')
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleVerify() {
    setError('')
    const code = otp.join('')
    if (code.length < 6) {
      setError('Enter the 6-digit code.')
      return
    }
    setLoading(true)
    try {
      const result = tab === 'phone'
        ? await signIn('phone-otp', { mobile, otp: code, redirect: false })
        : await signIn('email-otp', { email, otp: code, redirect: false })
      if (result?.ok) router.push('/app')
      else setError('That code did not match. Please try again.')
    } catch {
      setError('Could not verify. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function setOtpDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    setOtp((prev) => {
      const next = [...prev]
      next[i] = d
      return next
    })
    if (d && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null
      el?.focus()
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "'Big Shoulders Display', sans-serif",
          fontWeight: 900,
          fontSize: 38,
          color: '#1C2B3A',
          letterSpacing: '-0.5px',
          marginBottom: 8,
          lineHeight: 1.05,
        }}>
          Good to see you again.
        </h1>
        <p style={{ fontSize: 15, color: '#6B7D8E', lineHeight: 1.6, fontWeight: 400 }}>
          Pick up right where you left off, your space is exactly as you left it.
        </p>
      </div>

      {/* Social auth */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '13px 20px',
          fontSize: 15, fontWeight: 600, color: '#1C2B3A', background: '#fff',
          cursor: 'pointer', transition: 'border-color .2s, box-shadow .2s', width: '100%',
          fontFamily: "'DM Sans', sans-serif",
        }}
          onClick={() => signIn('google', { callbackUrl: '/app' })}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#C8553D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,85,61,.08)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '13px 20px',
          fontSize: 15, fontWeight: 600, color: '#1C2B3A', background: '#fff',
          cursor: 'pointer', transition: 'border-color .2s, box-shadow .2s', width: '100%',
          fontFamily: "'DM Sans', sans-serif",
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#C8553D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,85,61,.08)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Continue with Apple
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 1, background: '#EEF0F3' }} />
        <span style={{ fontSize: 12, color: '#A0ADB8', fontWeight: 500 }}>or sign in with</span>
        <div style={{ flex: 1, height: 1, background: '#EEF0F3' }} />
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: '#F5F7FA', borderRadius: 10, padding: 3, marginBottom: 20 }}>
        {(['phone', 'email', 'password'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSent(false); setError('') }}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, transition: 'all .2s',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#1C2B3A' : '#8E9EAE',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {t === 'phone' ? '📱 Mobile' : t === 'email' ? '✉️ Email' : '🔑 Password'}
          </button>
        ))}
      </div>

      {/* Form */}
      {tab === 'password' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, color: '#1C2B3A', background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordLogin() }}
            style={{ width: '100%', padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, color: '#1C2B3A', background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
          />
          <button
            onClick={handlePasswordLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: '#C8553D', color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 16px rgba(200,85,61,.3)', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
          {error && <p style={{ fontSize: 13, color: '#C8553D', textAlign: 'center', margin: 0 }}>{error}</p>}
        </div>
      ) : !sent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'phone' ? (
            <div style={{ display: 'flex', border: '1.5px solid #E2E8F0', borderRadius: 12, overflow: 'visible' }}>
              <CountrySelect value={country} onChange={setCountry} />
              <input
                type="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ flex: 1, padding: '13px 16px', border: 'none', fontSize: 15, color: '#1C2B3A', background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", borderRadius: '0 12px 12px 0' }}
              />
            </div>
          ) : (
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, color: '#1C2B3A', background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
          )}
          <button
            onClick={() => (tab === 'phone' ? handleSend() : setSent(true))}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: '#C8553D', color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 16px rgba(200,85,61,.3)', transition: 'opacity .2s',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseOver={e => e.currentTarget.style.opacity = loading ? '.7' : '.9'}
            onMouseOut={e => e.currentTarget.style.opacity = loading ? '.7' : '1'}
          >
            {loading ? 'Sending…' : tab === 'phone' ? 'Send OTP →' : 'Send Code →'}
          </button>
          {error && <p style={{ fontSize: 13, color: '#C8553D', textAlign: 'center', margin: 0 }}>{error}</p>}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 14, color: '#6B7D8E', marginBottom: 16, lineHeight: 1.6 }}>
            We&apos;ve sent a 6-digit code to your {tab === 'phone' ? 'phone' : 'email'}. Enter it below.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {[0,1,2,3,4,5].map((i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[i]}
                onChange={(e) => setOtpDigit(i, e.target.value)}
                style={{
                  width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700,
                  border: '1.5px solid #E2E8F0', borderRadius: 10, color: '#1C2B3A',
                  outline: 'none', fontFamily: "'DM Sans', sans-serif",
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#C8553D'}
                onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
              />
            ))}
          </div>
          {error && <p style={{ fontSize: 13, color: '#C8553D', textAlign: 'center', marginTop: 0, marginBottom: 12 }}>{error}</p>}
          <button
            onClick={handleVerify}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: '#C8553D', color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 16px rgba(200,85,61,.3)', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Verifying…' : 'Verify & Sign in'}
          </button>
          <button onClick={() => { setSent(false); setOtp(['', '', '', '', '', '']); setError('') }} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#6B7D8E', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            ← Change {tab === 'phone' ? 'number' : 'email'}
          </button>
        </div>
      )}

      {/* Reassurance note */}
      <div style={{
        marginTop: 24, padding: '14px 16px', background: '#F9F5FF', border: '1px solid rgba(100,80,180,.12)',
        borderRadius: 10, fontSize: 13, color: '#6B7D8E', lineHeight: 1.6,
      }}>
        🔒 We never share your information. Your data stays private and protected under India&apos;s DPDP Act 2023.
      </div>

      <p style={{ fontSize: 14, color: '#8E9EAE', textAlign: 'center', marginTop: 24 }}>
        New here?{' '}
        <Link href="/register" style={{ color: '#C8553D', fontWeight: 600, textDecoration: 'none' }}>
          Create a free account
        </Link>
      </p>
    </div>
  )
}
