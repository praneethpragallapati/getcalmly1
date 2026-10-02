'use client'

import Link from 'next/link'
import { Suspense, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'next/navigation'
import { getClinician, type Clinician } from '@/data/clinicians'

/** First-session price per care type, and the regular single-session price
 *  it is introduced below (null when there is no saving to show). */
export type CheckoutPrices = Record<'therapy' | 'psychiatry' | 'couples', { first: number; was: number | null; packFrom: number }>

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

const charcoal = '#1C2B3A'
const coral = '#C8553D'

type PlanKey = 'therapy' | 'psychiatry' | 'couples' | 'app'

type Plan = {
  name: string; accent: string
  benefits: string[]
  payToday: string
  summary: { label: string; value: string; was?: string; note?: string }[]
  fineprint: string
  cta: string
}

const plansFor = (p: CheckoutPrices): Record<PlanKey, Plan> => ({
  therapy: {
    name: 'Therapy',
    accent: coral,
    benefits: [
      `Your first 45-minute session at an introductory ${inr(p.therapy.first)}`,
      'An RCI licensed clinical psychologist matched to you',
      'A clear summary after every session',
      'Everything in Calm+: unlimited AI, insights, journaling',
      'A constant guide who stays with you the whole way',
    ],
    payToday: inr(p.therapy.first),
    summary: [
      { label: 'Plan', value: 'Therapy' },
      { label: 'First session', value: inr(p.therapy.first), was: p.therapy.was ? inr(p.therapy.was) : undefined, note: p.therapy.was ? 'Introductory price' : undefined },
      { label: 'After that', value: `Packs from ${inr(p.therapy.packFrom)} / session` },
      { label: 'Due today', value: inr(p.therapy.first) },
    ],
    fineprint: `Your first session is at an introductory ${inr(p.therapy.first)}. Session packs unlock after it, and unused sessions are always refundable.`,
    cta: 'Confirm and book my first session',
  },
  couples: {
    name: 'Couples therapy',
    accent: '#6D5BD0',
    benefits: [
      `Your first 45-minute session for both of you at an introductory ${inr(p.couples.first)}`,
      'An EFT & Gottman-informed couples therapist',
      'A clear summary after every session',
      'Shared exercises and check-ins between sessions',
      'Everything in Calm+ for both of you',
    ],
    payToday: inr(p.couples.first),
    summary: [
      { label: 'Plan', value: 'Couples therapy' },
      { label: 'First session', value: inr(p.couples.first), was: p.couples.was ? inr(p.couples.was) : undefined, note: p.couples.was ? 'Introductory price' : undefined },
      { label: 'After that', value: `Packs from ${inr(p.couples.packFrom)} / session` },
      { label: 'Due today', value: inr(p.couples.first) },
    ],
    fineprint: `Your first couples session is at an introductory ${inr(p.couples.first)}. Session packs unlock after it, and unused sessions are always refundable.`,
    cta: 'Confirm and book our first session',
  },
  psychiatry: {
    name: 'Psychiatry',
    accent: '#1A7F7A',
    benefits: [
      `Your first consultation at an introductory ${inr(p.psychiatry.first)}`,
      'An NMC licensed psychiatrist for evaluation and care',
      'Medication support with a built-in tracker',
      'Digital prescriptions after your consultation',
      'Everything in Calm+: unlimited AI, insights, journaling',
    ],
    payToday: inr(p.psychiatry.first),
    summary: [
      { label: 'Plan', value: 'Psychiatry' },
      { label: 'First consultation', value: inr(p.psychiatry.first), was: p.psychiatry.was ? inr(p.psychiatry.was) : undefined, note: p.psychiatry.was ? 'Introductory price' : undefined },
      { label: 'After that', value: `Packs from ${inr(p.psychiatry.packFrom)} / session` },
      { label: 'Due today', value: inr(p.psychiatry.first) },
    ],
    fineprint: `Your first consultation is at an introductory ${inr(p.psychiatry.first)}. Session packs unlock after it, and unused sessions are always refundable.`,
    cta: 'Confirm and book my consultation',
  },
  app: {
    name: 'Calm+',
    accent: '#1A7F7A',
    benefits: [
      'Unlimited getCalmly AI chat and insights',
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
})

const noSubscription = () => () => {}

function readBookingCookie(): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|;\s*)gc_book_clinician=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

function CheckoutContent({ prices }: { prices: CheckoutPrices }) {
  const c = useSearchParams().get('care')
  const care: PlanKey = c === 'therapy' || c === 'psychiatry' || c === 'couples' || c === 'app' ? c : 'therapy'
  const [method, setMethod] = useState<'upi' | 'card'>('upi')
  const [paid, setPaid] = useState(false)

  // Direct booking: a chosen clinician was carried here in a cookie, having
  // bypassed the assessment and matching. We assign this exact person.
  const slug = useSyncExternalStore(noSubscription, readBookingCookie, () => null)
  const clinician: Clinician | null = slug ? getClinician(slug) ?? null : null

  const plan = plansFor(prices)[care]

  if (paid) {
    const clinicianName = clinician ? clinician.name.split(' ').slice(0, 2).join(' ') : null
    return (
      <div style={{ width: '100%', maxWidth: 460, textAlign: 'center' }}>
        <div style={{ fontSize: 46, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 34, color: charcoal, marginBottom: 12, lineHeight: 1.1 }}>
          {care === 'app' ? 'Your trial has started.' : "You're all set."}
        </h1>
        <p style={{ fontSize: 15, color: '#6B7D8E', lineHeight: 1.65, marginBottom: 28 }}>
          {care === 'app'
            ? 'Calm+ is unlocked. Open the app to meet Calm, start your first check-in, and explore your insights.'
            : clinicianName
              ? `${clinicianName} is now your clinician. Head to your dashboard to pick a time and book your first session. No matching needed.`
              : 'Next, we will match you with the right professional and get your first session on the calendar.'}
        </p>
        <Link href={care === 'app' ? '/' : clinician ? '/app' : '/assess'} style={btnPrimary(plan.accent)}>
          {care === 'app' ? 'Explore your space' : clinician ? 'Go to my dashboard' : 'Find my match'}
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

      {clinician && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: clinician.accent + '12', border: `1.5px solid ${clinician.accent}40`, borderRadius: 14, padding: '13px 16px', marginBottom: 18 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: clinician.accent, color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: "'Big Shoulders Display', sans-serif" }}>
            {clinician.initials}
          </div>
          <div style={{ fontSize: 13.5, color: '#3A4A5A', lineHeight: 1.5 }}>
            Booking directly with <strong style={{ color: charcoal }}>{clinician.name}</strong>. They&apos;ll be assigned to you, no assessment or matching.
          </div>
        </div>
      )}

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
            <span style={{ fontSize: 13.5, color: charcoal, fontWeight: idx === plan.summary.length - 1 ? 800 : 600, textAlign: 'right' }}>
              {s.was && <s style={{ color: '#A0ADB8', fontWeight: 500, marginRight: 6 }}>{s.was}</s>}
              {s.value}
              {s.note && <span style={{ display: 'block', fontSize: 11.5, color: '#8E9EAE', fontWeight: 500 }}>{s.note}</span>}
            </span>
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

      <button
        onClick={() => {
          // Clear the direct-booking cookie now the assignment is done.
          if (clinician) document.cookie = 'gc_book_clinician=; path=/; max-age=0; samesite=lax'
          setPaid(true)
        }}
        style={btnPrimary(plan.accent)}
      >
        {clinician ? `Confirm & book with ${clinician.name.split(' ').slice(0, 2).join(' ')}` : plan.cta}
      </button>
      <p style={{ fontSize: 12, color: '#A0ADB8', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
        🔒 Secure payment. {plan.fineprint}
      </p>
      <p style={{ fontSize: 13, color: '#8E9EAE', textAlign: 'center', marginTop: 16 }}>
        Changed your mind? <Link href="/pricing" style={{ color: plan.accent, fontWeight: 600, textDecoration: 'none' }}>Back to plans</Link>
      </p>
    </div>
  )
}

export default function CheckoutClient({ prices }: { prices: CheckoutPrices }) {
  return (
    <Suspense fallback={null}>
      <CheckoutContent prices={prices} />
    </Suspense>
  )
}

const btnPrimary = (c: string): React.CSSProperties => ({
  display: 'block', width: '100%', textAlign: 'center', padding: '15px', borderRadius: 12, border: 'none',
  background: c, color: '#fff', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', textDecoration: 'none',
  fontFamily: "'DM Sans', sans-serif", boxShadow: `0 6px 18px ${c}40`,
})
