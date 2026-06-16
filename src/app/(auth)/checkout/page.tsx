'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const charcoal = '#1C2B3A'
const coral = '#C8553D'

type PlanKey = 'therapy' | 'psychiatry' | 'app'

const plans: Record<PlanKey, {
  name: string; accent: string
  benefits: string[]
  payToday: string
  summary: { label: string; value: string }[]
  fineprint: string
  cta: string
}> = {
  therapy: {
    name: 'Therapy',
    accent: coral,
    benefits: [
      'Your first 50-minute session is completely free',
      'An RCI-verified psychologist matched to you',
      'A clear summary after every session',
      'Everything in Calm+: unlimited AI, insights, journaling',
      'A constant guide who stays with you the whole way',
    ],
    payToday: '₹0',
    summary: [
      { label: 'Plan', value: 'Therapy' },
      { label: 'First session', value: 'Free' },
      { label: 'After that', value: 'From ₹999 / session' },
      { label: 'Due today', value: '₹0' },
    ],
    fineprint: 'You will not be charged for your first session. You only pay when you choose a pack, and unused sessions are always refundable.',
    cta: 'Confirm and book my free session',
  },
  psychiatry: {
    name: 'Psychiatry',
    accent: '#1A7F7A',
    benefits: [
      'Your first consultation is free',
      'An NMC-registered psychiatrist for evaluation and care',
      'Medication support with a built-in tracker',
      'Medicines delivered to your door',
      'Everything in Calm+: unlimited AI, insights, journaling',
    ],
    payToday: '₹0',
    summary: [
      { label: 'Plan', value: 'Psychiatry' },
      { label: 'First consultation', value: 'Free' },
      { label: 'After that', value: 'From ₹1,099 / session' },
      { label: 'Due today', value: '₹0' },
    ],
    fineprint: 'You will not be charged for your first consultation. You only pay when you choose a pack, and unused sessions are always refundable.',
    cta: 'Confirm and book my free consultation',
  },
  app: {
    name: 'Calm+',
    accent: '#1A7F7A',
    benefits: [
      'Unlimited Calm AI chat and insights',
      'Daily mood tracker and smart journaling',
      'Daily and weekly insights on your patterns',
      'A constant guide for the everyday moments',
      '7 days completely free, then ₹99 / month billed yearly',
    ],
    payToday: '₹0',
    summary: [
      { label: 'Plan', value: 'Calm+ (yearly)' },
      { label: 'Free trial', value: '7 days' },
      { label: 'Then', value: '₹1,199 / year (₹99 / mo)' },
      { label: 'Due today', value: '₹0' },
    ],
    fineprint: 'Your 7-day trial is free. Cancel anytime before it ends and you will not be charged.',
    cta: 'Start my 7-day free trial',
  },
}

export default function CheckoutPage() {
  const [care, setCare] = useState<PlanKey>('therapy')
  const [method, setMethod] = useState<'upi' | 'card'>('upi')
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('care')
    if (c === 'therapy' || c === 'psychiatry' || c === 'app') setCare(c)
  }, [])

  const plan = plans[care]

  if (paid) {
    return (
      <div style={{ width: '100%', maxWidth: 460, textAlign: 'center' }}>
        <div style={{ fontSize: 46, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 34, color: charcoal, marginBottom: 12, lineHeight: 1.1 }}>
          {care === 'app' ? 'Your trial has started.' : "You're all set."}
        </h1>
        <p style={{ fontSize: 15, color: '#6B7D8E', lineHeight: 1.65, marginBottom: 28 }}>
          {care === 'app'
            ? 'Calm+ is unlocked. Open the app to meet Calm, start your first check-in, and explore your insights.'
            : 'Next, we will match you with the right professional and get your free first session on the calendar.'}
        </p>
        <Link href={care === 'app' ? '/' : '/assess'} style={btnPrimary(plan.accent)}>
          {care === 'app' ? 'Explore your space' : 'Find my match'}
        </Link>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#8E9EAE', marginBottom: 8 }}>Last step</p>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 34, color: charcoal, marginBottom: 6, lineHeight: 1.05 }}>
        {care === 'app' ? 'Start your Calm+ trial' : `Confirm your ${plan.name.toLowerCase()} plan`}
      </h1>
      <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.6, marginBottom: 24 }}>
        Here is exactly what you are getting, and what happens next.
      </p>

      {/* Benefits recap */}
      <div style={{ background: plan.accent + '0d', border: `1.5px solid ${plan.accent}33`, borderRadius: 16, padding: '18px 20px', marginBottom: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: plan.accent, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.4 }}>What you get</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {plan.benefits.map((b) => (
            <div key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: plan.accent, fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 13.8, color: '#3A4A5A', lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div style={{ border: '1.5px solid #E2E8F0', borderRadius: 16, padding: '16px 20px', marginBottom: 18 }}>
        {plan.summary.map((s, idx) => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: idx === plan.summary.length - 1 ? '1px solid #EEF0F3' : 'none', marginTop: idx === plan.summary.length - 1 ? 4 : 0 }}>
            <span style={{ fontSize: 13.5, color: '#6B7D8E', fontWeight: idx === plan.summary.length - 1 ? 700 : 400 }}>{s.label}</span>
            <span style={{ fontSize: 13.5, color: charcoal, fontWeight: idx === plan.summary.length - 1 ? 800 : 600 }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Payment method */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {(['upi', 'card'] as const).map((m) => (
          <button key={m} onClick={() => setMethod(m)} style={{
            flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            border: method === m ? `1.5px solid ${plan.accent}` : '1.5px solid #E2E8F0',
            background: method === m ? plan.accent + '0d' : '#fff', color: method === m ? plan.accent : '#6B7D8E',
          }}>{m === 'upi' ? 'UPI' : 'Card'}</button>
        ))}
      </div>
      <input
        placeholder={method === 'upi' ? 'yourname@upi' : 'Card number'}
        style={{ width: '100%', padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, color: charcoal, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', marginBottom: 18 }}
      />

      <button onClick={() => setPaid(true)} style={btnPrimary(plan.accent)}>{plan.cta}</button>
      <p style={{ fontSize: 12, color: '#A0ADB8', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
        🔒 Secure payment. {plan.fineprint}
      </p>
      <p style={{ fontSize: 13, color: '#8E9EAE', textAlign: 'center', marginTop: 16 }}>
        Changed your mind? <Link href="/pricing" style={{ color: plan.accent, fontWeight: 600, textDecoration: 'none' }}>Back to plans</Link>
      </p>
    </div>
  )
}

const btnPrimary = (c: string): React.CSSProperties => ({
  display: 'block', width: '100%', textAlign: 'center', padding: '15px', borderRadius: 12, border: 'none',
  background: c, color: '#fff', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', textDecoration: 'none',
  fontFamily: "'DM Sans', sans-serif", boxShadow: `0 6px 18px ${c}40`,
})
