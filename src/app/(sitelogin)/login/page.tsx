'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import CountrySelect from '@/components/ui/CountrySelect'
import { defaultCountry } from '@/data/countries'

const CORAL = '#C8553D'
const CHARCOAL = '#241A12'
const BODY = "'DM Sans', sans-serif"

// Controls float directly on the photo now (no card), so each one is a solid
// chip with a soft shadow to keep it legible over the background.
const chip: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.7)', background: 'rgba(255,255,255,.97)',
  boxShadow: '0 12px 32px -16px rgba(40,20,10,.5)',
}
const field: React.CSSProperties = {
  width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 15, color: CHARCOAL,
  outline: 'none', fontFamily: BODY, boxSizing: 'border-box', ...chip,
}
const primaryBtn: React.CSSProperties = {
  width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: CORAL, color: '#fff',
  fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: BODY, boxShadow: '0 14px 30px -8px rgba(200,85,61,.5)',
}

// WhatsApp + Email are the only two channels; WhatsApp is the default.
const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.13c-1.53 0-3.03-.41-4.34-1.19l-.31-.18-3.12.82.83-3.04-.2-.32a8.13 8.13 0 0 1-1.25-4.34c0-4.5 3.66-8.16 8.17-8.16 4.5 0 8.16 3.66 8.16 8.16 0 4.51-3.66 8.17-8.16 8.17Zm4.47-6.12c-.24-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.97-1.21-.73-.65-1.22-1.45-1.36-1.69-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z"/></svg>
)
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
)

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  // WhatsApp ('phone' channel) is the default; Email is the alternative.
  const [tab, setTab] = useState<'phone' | 'email'>('phone')
  const [sent, setSent] = useState(false)
  const [country, setCountry] = useState(defaultCountry)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // A referral code may arrive on the login link (?ref=CODE) now that sign-up is
  // gone. Stash it so it survives the OTP round-trip and is claimed on first load.
  const refCode = params.get('ref')
  useEffect(() => {
    const clean = (refCode ?? '').trim().toUpperCase()
    if (clean) document.cookie = `gc_ref=${encodeURIComponent(clean)}; path=/; max-age=2592000; samesite=lax`
  }, [refCode])

  const mobile = `${country.dial}${phone.replace(/\D/g, '')}`

  // Members go to /welcome, which collects the one-time details a brand-new
  // account is missing and then forwards anyone already complete to /app.
  async function redirectAfterLogin() {
    const session = await getSession()
    const role = (session?.user as { role?: string } | undefined)?.role
    router.push(role === 'THERAPIST' ? '/expert' : role === 'ADMIN' ? '/admin' : '/welcome')
  }

  async function handleSend() {
    setError('')
    // TEMPORARY: Priya's test number signs in with no OTP — skip the code step
    // and go straight to sign-in. Remove with the matching bypass in lib/auth.ts.
    if (tab === 'phone' && mobile.replace(/\D/g, '') === '918884518688') {
      setLoading(true)
      try {
        const result = await signIn('phone-otp', { mobile, otp: 'bypass', redirect: false })
        // Straight to the existing dashboard — this is a known account, so skip
        // the first-time /welcome details step.
        if (result?.ok) { router.push('/app'); return }
        setError('Could not sign in. Please try again.')
      } catch { setError('Network error. Please try again.') } finally { setLoading(false) }
      return
    }
    // TEMPORARY: existing therapist/admin accounts sign in by email with no OTP.
    // Remove with the matching bypass in lib/auth.ts.
    const BYPASS_EMAILS = new Set(['hom.pragallapati@gmail.com', 'praneethadmin@gmail.com'])
    if (tab === 'email' && BYPASS_EMAILS.has(email.trim().toLowerCase())) {
      setLoading(true)
      try {
        const result = await signIn('email-otp', { email: email.trim().toLowerCase(), otp: 'bypass', redirect: false })
        if (result?.ok) { await redirectAfterLogin(); return }
        setError('Could not sign in. Please try again.')
      } catch { setError('Network error. Please try again.') } finally { setLoading(false) }
      return
    }
    const endpoint = tab === 'phone' ? '/api/otp/send' : '/api/otp/email-send'
    if (tab === 'phone' && phone.replace(/\D/g, '').length < 10) { setError('Enter a valid WhatsApp number.'); return }
    if (tab === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return }
    setLoading(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tab === 'phone' ? { mobile } : { email }),
      })
      const data = await res.json()
      if (data.ok) setSent(true)
      else setError(data.message || 'Could not send your code. Please try again.')
    } catch { setError('Network error. Please try again.') } finally { setLoading(false) }
  }

  async function handleVerify() {
    setError('')
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the 6-digit code.'); return }
    setLoading(true)
    try {
      const result = tab === 'phone'
        ? await signIn('phone-otp', { mobile, otp: code, redirect: false })
        : await signIn('email-otp', { email, otp: code, redirect: false })
      if (result?.ok) await redirectAfterLogin()
      else setError('That code did not match. Please try again.')
    } catch { setError('Could not verify. Please try again.') } finally { setLoading(false) }
  }

  function setOtpDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    setOtp((prev) => { const next = [...prev]; next[i] = d; return next })
    if (d && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null)?.focus()
  }

  return (
    <section className="login-hero">
      <div className="login-bg" />
      <div className="login-veil" />
      <div className="login-wrap">
        {/* Left — brand line, sitting on the terracotta */}
        <div className="login-left">
          <p className="login-eyebrow">India&apos;s mental healthcare, done right.</p>
          <h1 className="login-head">Small steps.<br /><span>Brighter days.</span></h1>
        </div>

        {/* Right — one-time-code login, floating on the photo */}
        <div className="login-card">
          <h2 className="login-card-title">Hey — let&apos;s get you in.</h2>
          <p className="login-card-sub">Pop in your number or email and we&apos;ll send you a one-time code.</p>

          {/* WhatsApp / Email */}
          <div className="login-tabs">
            {(['phone', 'email'] as const).map((t) => (
              <button key={t} className={tab === t ? 'on' : ''} onClick={() => { setTab(t); setSent(false); setError('') }}>
                {t === 'phone' ? <><WhatsAppIcon /> WhatsApp</> : <><MailIcon /> Email</>}
              </button>
            ))}
          </div>

          {!sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tab === 'phone' ? (
                <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', ...chip }}>
                  <CountrySelect value={country} onChange={setCountry} />
                  <input type="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)}
                    style={{ ...field, border: 'none', boxShadow: 'none', background: 'transparent', borderRadius: 0 }} />
                </div>
              ) : (
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={field} />
              )}
              <button onClick={handleSend} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'Sending…' : 'Continue →'}
              </button>
              {error && <p className="login-err">{error}</p>}
            </div>
          ) : (
            <div>
              <p className="login-card-sub" style={{ marginBottom: 14 }}>
                We&apos;ve sent a 6-digit code to your {tab === 'phone' ? 'WhatsApp' : 'email'}. Pop it in below.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginBottom: 14 }}>
                {[0,1,2,3,4,5].map((i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={otp[i]}
                    onChange={(e) => setOtpDigit(i, e.target.value)}
                    style={{ width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700, borderRadius: 10, color: CHARCOAL, outline: 'none', fontFamily: BODY, ...chip }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = CORAL)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.7)')} />
                ))}
              </div>
              {error && <p className="login-err" style={{ marginBottom: 12 }}>{error}</p>}
              <button onClick={handleVerify} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'Verifying…' : 'Verify & continue'}
              </button>
              <button onClick={() => { setSent(false); setOtp(['', '', '', '', '', '']); setError('') }}
                style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#7A5F52', fontSize: 13, cursor: 'pointer', fontFamily: BODY, fontWeight: 600 }}>
                ← Change {tab === 'phone' ? 'number' : 'email'}
              </button>
            </div>
          )}

          <p className="login-contact">Need a hand? <a href="/contact">Contact Calm Team</a></p>
        </div>
      </div>
    </section>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
