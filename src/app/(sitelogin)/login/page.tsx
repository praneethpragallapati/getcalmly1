'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import CountrySelect from '@/components/ui/CountrySelect'
import { defaultCountry } from '@/data/countries'

const CORAL = '#C8553D'
const CHARCOAL = '#1C2B3A'
const HEAD = "'Big Shoulders Display', sans-serif"
const BODY = "'DM Sans', sans-serif"

const trust = [
  { icon: '🔒', text: 'End-to-end encrypted sessions' },
  { icon: '🧑‍⚕️', text: 'RCI & NMC-verified professionals only' },
  { icon: '🇮🇳', text: 'DPDP Act 2023 compliant' },
  { icon: '💬', text: 'Care that speaks your language' },
]

const field: React.CSSProperties = {
  width: '100%', padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12,
  fontSize: 15, color: CHARCOAL, background: '#fff', outline: 'none', fontFamily: BODY, boxSizing: 'border-box',
}
const primaryBtn: React.CSSProperties = {
  width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: CORAL, color: '#fff',
  fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: BODY, boxShadow: '0 8px 22px rgba(200,85,61,.32)',
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const existsFlag = params.get('exists') === '1'
  // Only Mobile + Email. Email is the default.
  const [tab, setTab] = useState<'email' | 'phone'>(existsFlag ? 'email' : 'email')
  const [sent, setSent] = useState(false)
  const [country, setCountry] = useState(defaultCountry)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const notice = existsFlag ? 'Looks like you already have an account. Please sign in.' : ''

  const mobile = `${country.dial}${phone.replace(/\D/g, '')}`

  async function redirectAfterLogin() {
    const session = await getSession()
    const role = (session?.user as { role?: string } | undefined)?.role
    router.push(role === 'THERAPIST' ? '/expert' : role === 'ADMIN' ? '/admin' : '/app')
  }

  async function handleSend() {
    setError('')
    const endpoint = tab === 'phone' ? '/api/otp/send' : '/api/otp/email-send'
    if (tab === 'phone' && phone.replace(/\D/g, '').length < 10) { setError('Enter a valid mobile number.'); return }
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
        {/* Left — brand & reassurance */}
        <div className="login-left">
          <p className="login-eyebrow">India&apos;s mental healthcare, done right.</p>
          <h1 className="login-head">Small steps.<br /><span>Brighter days.</span></h1>
          <div className="login-trust">
            {trust.map((t) => (
              <div key={t.text} className="login-trust-item">
                <span className="login-trust-ic">{t.icon}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — auth card */}
        <div className="login-card">
          <h2 className="login-card-title">Good to see you again.</h2>
          <p className="login-card-sub">Pick up right where you left off — your space is exactly as you left it.</p>

          {notice && (
            <div className="login-notice"><span>👋</span><span>{notice}</span></div>
          )}

          {/* Google */}
          <button
            className="login-google"
            onClick={() => signIn('google', { callbackUrl: '/postlogin' })}
          >
            <svg width="19" height="19" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="login-divider"><span>or</span></div>

          {/* Mobile / Email tabs */}
          <div className="login-tabs">
            {(['email', 'phone'] as const).map((t) => (
              <button key={t} className={tab === t ? 'on' : ''} onClick={() => { setTab(t); setSent(false); setError('') }}>
                {t === 'email' ? '✉️ Email' : '📱 Mobile'}
              </button>
            ))}
          </div>

          {!sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tab === 'phone' ? (
                <div style={{ display: 'flex', border: '1.5px solid #E2E8F0', borderRadius: 12 }}>
                  <CountrySelect value={country} onChange={setCountry} />
                  <input type="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)}
                    style={{ ...field, border: 'none', borderRadius: '0 12px 12px 0' }} />
                </div>
              ) : (
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={field} />
              )}
              <button onClick={handleSend} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'Sending…' : tab === 'phone' ? 'Send OTP →' : 'Email me a sign-in code →'}
              </button>
              {error && <p className="login-err">{error}</p>}
            </div>
          ) : (
            <div>
              <p className="login-card-sub" style={{ marginBottom: 14 }}>
                We&apos;ve sent a 6-digit code to your {tab === 'phone' ? 'phone' : 'email'}. Enter it below.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginBottom: 14 }}>
                {[0,1,2,3,4,5].map((i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={otp[i]}
                    onChange={(e) => setOtpDigit(i, e.target.value)}
                    style={{ width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700, border: '1.5px solid #E2E8F0', borderRadius: 10, color: CHARCOAL, outline: 'none', fontFamily: BODY }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = CORAL)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')} />
                ))}
              </div>
              {error && <p className="login-err" style={{ marginBottom: 12 }}>{error}</p>}
              <button onClick={handleVerify} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'Verifying…' : 'Verify & sign in'}
              </button>
              <button onClick={() => { setSent(false); setOtp(['', '', '', '', '', '']); setError('') }}
                style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#6B7D8E', fontSize: 13, cursor: 'pointer', fontFamily: BODY }}>
                ← Change {tab === 'phone' ? 'number' : 'email'}
              </button>
            </div>
          )}

          <div className="login-privacy">
            <span>🔒</span>
            <span>We never share your information. Your data stays private and protected under India&apos;s DPDP Act 2023.</span>
          </div>

          <p className="login-newhere">
            New here? <Link href="/register">Create a free account</Link>
          </p>
        </div>
      </div>

      <style>{`
        /* Base is a terracotta→travertine split (fallback); the photo, if present
           at /login-bg.jpg, layers over it. If the file is missing the split shows. */
        .login-hero{position:relative;min-height:100vh;display:grid;place-items:center;padding:118px 6% 64px;overflow:hidden;
          background:linear-gradient(104deg,#8a4530 0%,#7a3a20 44%,#e9e1d5 44%,#efe8de 100%);}
        .login-bg{position:absolute;inset:0;z-index:0;background-image:url('/login-bg.jpg');background-size:cover;background-position:center;}
        .login-veil{position:absolute;inset:0;z-index:1;background:linear-gradient(104deg,rgba(60,26,14,.34) 0%,rgba(60,26,14,.12) 40%,transparent 60%);}
        .login-wrap{position:relative;z-index:2;width:100%;max-width:1180px;display:grid;grid-template-columns:1fr 468px;gap:56px;align-items:center;}
        .login-left{color:#fff;max-width:460px;}
        .login-eyebrow{font-size:12.5px;font-weight:600;letter-spacing:.3px;color:rgba(255,255,255,.8);margin:0 0 20px;}
        .login-head{font-family:${HEAD};font-weight:300;font-size:clamp(44px,6vw,78px);line-height:.98;letter-spacing:-1.5px;color:#fff;margin:0 0 34px;transform:scaleX(.94);transform-origin:left;}
        .login-head span{font-weight:900;color:#F0A488;}
        .login-trust{display:flex;flex-direction:column;gap:14px;}
        .login-trust-item{display:flex;align-items:center;gap:12px;font-size:14px;color:rgba(255,255,255,.9);font-weight:400;}
        .login-trust-ic{font-size:16px;width:24px;text-align:center;flex-shrink:0;}
        .login-card{background:rgba(255,255,255,.97);backdrop-filter:blur(8px);border-radius:24px;padding:34px 32px;
          box-shadow:0 34px 90px -24px rgba(40,20,10,.5);}
        .login-card-title{font-family:${HEAD};font-weight:900;font-size:32px;color:${CHARCOAL};letter-spacing:-.5px;line-height:1.02;margin:0 0 8px;}
        .login-card-sub{font-size:14.5px;color:#6B7D8E;line-height:1.6;margin:0 0 20px;font-weight:400;}
        .login-notice{display:flex;gap:10px;align-items:flex-start;padding:11px 13px;background:#FFF1EC;border:1px solid rgba(200,85,61,.2);border-radius:12px;margin-bottom:16px;font-size:13.5px;color:${CHARCOAL};line-height:1.5;}
        .login-google{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;border:1.5px solid #E2E8F0;border-radius:12px;padding:13px 20px;font-size:15px;font-weight:600;color:${CHARCOAL};background:#fff;cursor:pointer;font-family:${BODY};transition:border-color .2s,box-shadow .2s;}
        .login-google:hover{border-color:${CORAL};box-shadow:0 0 0 3px rgba(200,85,61,.08);}
        .login-divider{display:flex;align-items:center;gap:12px;margin:18px 0;}
        .login-divider::before,.login-divider::after{content:'';flex:1;height:1px;background:#EEF0F3;}
        .login-divider span{font-size:12px;color:#A0ADB8;font-weight:500;}
        .login-tabs{display:flex;background:#F5F7FA;border-radius:10px;padding:3px;margin-bottom:18px;}
        .login-tabs button{flex:1;padding:9px 0;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;background:transparent;color:#8E9EAE;font-family:${BODY};transition:all .2s;}
        .login-tabs button.on{background:#fff;color:${CHARCOAL};box-shadow:0 1px 4px rgba(0,0,0,.08);}
        .login-err{font-size:13px;color:${CORAL};text-align:center;margin:0;}
        .login-privacy{display:flex;gap:9px;align-items:flex-start;margin-top:22px;padding:13px 15px;background:#F9F5FF;border:1px solid rgba(100,80,180,.12);border-radius:10px;font-size:12.5px;color:#6B7D8E;line-height:1.55;}
        .login-newhere{font-size:14px;color:#8E9EAE;text-align:center;margin:22px 0 0;}
        .login-newhere a{color:${CORAL};font-weight:600;text-decoration:none;}
        @media(max-width:900px){
          .login-hero{background:linear-gradient(158deg,#8a4530 0%,#6f3319 100%);padding:104px 6% 56px;}
          .login-veil{display:none;}
          .login-wrap{grid-template-columns:1fr;max-width:468px;gap:34px;}
          .login-left{max-width:none;text-align:center;}
          .login-trust{align-items:flex-start;max-width:340px;margin:0 auto;}
        }
      `}</style>
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
