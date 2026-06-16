'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [inputMethod, setInputMethod] = useState<'phone' | 'email'>('phone')

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "'Big Shoulders Display', sans-serif",
          fontWeight: 900,
          fontSize: 36,
          color: '#1C2B3A',
          letterSpacing: '-0.5px',
          marginBottom: 8,
          lineHeight: 1.1,
        }}>
          Start your journey
        </h1>
        <p style={{ fontSize: 15, color: '#6B7D8E', lineHeight: 1.6, fontWeight: 400 }}>
          Free to join. No card required. Your first session is on us.
        </p>
      </div>

      {/* Social auth */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '13px 20px',
          fontSize: 15, fontWeight: 600, color: '#1C2B3A', background: '#fff',
          cursor: 'pointer', width: '100%',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign up with Google
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '13px 20px',
          fontSize: 15, fontWeight: 600, color: '#1C2B3A', background: '#fff',
          cursor: 'pointer', width: '100%',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Sign up with Apple
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 1, background: '#EEF0F3' }} />
        <span style={{ fontSize: 12, color: '#A0ADB8', fontWeight: 500 }}>or create with</span>
        <div style={{ flex: 1, height: 1, background: '#EEF0F3' }} />
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: '#F5F7FA', borderRadius: 10, padding: 3, marginBottom: 20 }}>
        {(['phone', 'email'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setInputMethod(t); setStep('form') }}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              background: inputMethod === t ? '#fff' : 'transparent',
              color: inputMethod === t ? '#1C2B3A' : '#8E9EAE',
              boxShadow: inputMethod === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {t === 'phone' ? '📱 Mobile' : '✉️ Email'}
          </button>
        ))}
      </div>

      {step === 'form' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text"
            placeholder="Your full name"
            style={{ width: '100%', padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, color: '#1C2B3A', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            onFocus={e => e.currentTarget.style.borderColor = '#C8553D'}
            onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
          />

          {inputMethod === 'phone' ? (
            <div style={{ display: 'flex', border: '1.5px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
              <span style={{ padding: '13px 16px', background: '#F5F7FA', color: '#6B7D8E', fontSize: 15, fontWeight: 600, borderRight: '1.5px solid #E2E8F0', whiteSpace: 'nowrap' }}>🇮🇳 +91</span>
              <input
                type="tel"
                placeholder="98765 43210"
                style={{ flex: 1, padding: '13px 16px', border: 'none', fontSize: 15, color: '#1C2B3A', background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          ) : (
            <input
              type="email"
              placeholder="you@example.com"
              style={{ width: '100%', padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, color: '#1C2B3A', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.borderColor = '#C8553D'}
              onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
            />
          )}

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#6B7D8E', cursor: 'pointer', lineHeight: 1.5 }}>
            <input type="checkbox" style={{ marginTop: 2, accentColor: '#C8553D', width: 16, height: 16, flexShrink: 0 }} />
            <span>
              I agree to the{' '}
              <Link href="/safety" style={{ color: '#C8553D', textDecoration: 'underline', fontWeight: 600 }}>Safety & Ethics</Link>{' '}
              policy and consent to data processing under the DPDP Act 2023.
            </span>
          </label>

          <button
            onClick={() => setStep('otp')}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: '#C8553D', color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 16px rgba(200,85,61,.3)',
            }}
          >
            Send verification code →
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 14, color: '#6B7D8E', marginBottom: 16, lineHeight: 1.6 }}>
            We sent a 6-digit code to your {inputMethod === 'phone' ? 'mobile number' : 'email'}.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {[0,1,2,3,4,5].map((i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
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
          <button style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: '#C8553D', color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 16px rgba(200,85,61,.3)',
          }}>
            Create my account
          </button>
          <button onClick={() => setStep('form')} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#6B7D8E', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            ← Go back
          </button>
        </div>
      )}

      <div style={{
        marginTop: 24, padding: '14px 16px', background: '#F0FAF5', border: '1px solid rgba(61,158,114,.15)',
        borderRadius: 10, fontSize: 13, color: '#6B7D8E', lineHeight: 1.6,
      }}>
        🎁 Your first session is completely free — no payment details needed at signup.
      </div>

      <p style={{ fontSize: 14, color: '#8E9EAE', textAlign: 'center', marginTop: 24 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#C8553D', fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
