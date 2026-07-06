'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  therapyPacks, psychiatryPacks, calmPlusPacks, perSession, inr, discountVsBase,
  THERAPY_FROM, PSYCHIATRY_FROM, THERAPY_BASE, PSYCHIATRY_BASE, CALMPLUS_BASE,
  freeFeatures, calmPlusFeatures, therapyFeatures, psychiatryFeatures,
  type SessionPack,
} from '@/data/pricing'

const charcoal = '#1C2B3A'
const coral = '#C8553D'
const green = '#3D9E72'
const teal = '#1A7F7A'

// Small pill shown on/under a pack option (e.g. "Most chosen", "Cheapest").
function tabBadge(text: string, color: string) {
  return (
    <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.3, color, background: color + '1f', padding: '2px 6px', borderRadius: 50, textTransform: 'uppercase', marginTop: 4, display: 'inline-block' }}>{text}</span>
  )
}

function PackSelector<T>({ items, i, setI, label, badges, accent }: {
  items: T[]; i: number; setI: (n: number) => void
  label: (t: T) => string; badges: Record<number, string>; accent: string
}) {
  return (
    <div style={{ display: 'flex', gap: 6, background: '#F5F7FA', padding: 4, borderRadius: 12, marginBottom: 18 }}>
      {items.map((t, idx) => (
        <button key={idx} onClick={() => setI(idx)} style={{
          flex: 1, padding: '8px 2px', borderRadius: 9, border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          fontSize: 12.5, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          background: idx === i ? '#fff' : 'transparent', color: idx === i ? accent : '#8E9EAE',
          boxShadow: idx === i ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
        }}>
          {label(t)}
          {badges[idx] && tabBadge(badges[idx], idx === i ? accent : '#8E9EAE')}
        </button>
      ))}
    </div>
  )
}

function CareCard({
  name, subtitle, accent, packs, features, fromText, href, base, fill,
}: {
  name: string; subtitle: string; accent: string; packs: SessionPack[]
  features: string[]; fromText: string; href: string; base: number; fill?: boolean
}) {
  const [i, setI] = useState(packs.length - 1) // default to best-value 6-pack
  const pack = packs[i]
  const ps = perSession(pack)
  const disc = discountVsBase(ps, base)
  const badges = { [packs.length - 1]: 'Most chosen' }

  return (
    <div style={{
      background: '#fff', borderRadius: 24, padding: '32px 28px',
      border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)',
      display: 'flex', flexDirection: 'column',
    }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: charcoal, fontFamily: "'DM Sans', sans-serif" }}>{name}</p>
      <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 4, marginBottom: 18, minHeight: 38 }}>{subtitle}</p>

      <PackSelector items={packs} i={i} setI={setI} accent={accent} badges={badges}
        label={(p) => `${p.sessions} ${p.sessions === 1 ? 'session' : 'sessions'}`} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 44, color: charcoal, lineHeight: 1 }}>{inr(pack.total)}</span>
        <span style={{ fontSize: 13, color: '#A0ADB8' }}>for {pack.sessions} {pack.sessions === 1 ? 'session' : 'sessions'}</span>
      </div>
      <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ textDecoration: 'line-through', color: '#B6C0CA' }}>{inr(base)}</span>
        <strong style={{ color: accent, fontSize: 15 }}>{inr(ps)}</strong>
        <span>per session</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: green, background: 'rgba(61,158,114,.1)', padding: '2px 8px', borderRadius: 50 }}>Save {disc}%</span>
      </p>
      <p style={{ fontSize: 12.5, color: '#A0ADB8', marginTop: 6 }}>Valid for {pack.months} {pack.months === 1 ? 'month' : 'months'}</p>

      <div style={{ height: 1, background: '#EEF0F3', margin: '20px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
        {features.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: accent, fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: 13.8, color: '#3A4A5A', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      <Link href={href} style={{
        display: 'block', textAlign: 'center', marginTop: 24, padding: '14px', borderRadius: 12,
        background: fill ? accent : '#fff', color: fill ? '#fff' : accent,
        border: fill ? 'none' : `1.5px solid ${accent}`,
        fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
        boxShadow: fill ? `0 6px 18px ${accent}40` : 'none',
      }}>
        Book session
      </Link>
      <p style={{ fontSize: 12, color: '#A0ADB8', textAlign: 'center', marginTop: 10 }}>{fromText} · first session free</p>
    </div>
  )
}

function CalmPlusCard() {
  const [i, setI] = useState(3) // default to 1 year (the cheapest per month)
  const pack = calmPlusPacks[i]
  const perMonth = Math.floor(pack.total / pack.months)
  const badges = { 2: 'Most chosen', 3: 'Cheapest' }

  return (
    <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', border: `2px solid ${teal}`, boxShadow: `0 16px 40px ${teal}1a`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6, background: 'rgba(26,127,122,.1)', color: teal, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 50, marginBottom: 12 }}>
        ✦ 7-day free trial
      </div>
      <p style={{ fontSize: 20, fontWeight: 800, color: charcoal, fontFamily: "'DM Sans', sans-serif" }}>Calm+</p>
      <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 4, marginBottom: 18 }}>All the everyday support, no sessions. Your AI companion, insights and journaling, unlimited.</p>

      <PackSelector items={calmPlusPacks} i={i} setI={setI} accent={teal} badges={badges} label={(p) => p.label} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#A0ADB8', fontWeight: 500 }}>From</span>
        <span style={{ fontSize: 15, color: '#A0ADB8', textDecoration: 'line-through', fontWeight: 600 }}>{inr(CALMPLUS_BASE)}</span>
        <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 44, color: charcoal, lineHeight: 1 }}>{inr(perMonth)}</span>
        <span style={{ fontSize: 14, color: '#6B7D8E' }}>/ month</span>
      </div>
      <p style={{ fontSize: 13, color: '#6B7D8E', marginTop: 6 }}>Billed {pack.label.toLowerCase()} · {inr(pack.total)} total</p>

      <div style={{ height: 1, background: '#EEF0F3', margin: '20px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
        {calmPlusFeatures.included.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: teal, fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: 13.8, color: '#3A4A5A', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
        {calmPlusFeatures.missing.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', opacity: 0.5 }}>
            <span style={{ fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✕</span>
            <span style={{ fontSize: 13.8, color: '#6B7D8E', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      <Link href="/register?care=app" style={{ display: 'block', textAlign: 'center', marginTop: 24, padding: '14px', borderRadius: 12, background: teal, color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 6px 18px ${teal}40` }}>
        Start 7-day free trial
      </Link>
      <p style={{ fontSize: 12, color: '#A0ADB8', textAlign: 'center', marginTop: 10 }}>Cancel anytime during the trial</p>
    </div>
  )
}

function FreeCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)', display: 'flex', flexDirection: 'column' }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: charcoal, fontFamily: "'DM Sans', sans-serif" }}>Free</p>
      <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 4, marginBottom: 18 }}>A genuine place to start. No card, no pressure.</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 44, color: charcoal, lineHeight: 1 }}>₹0</span>
        <span style={{ fontSize: 14, color: '#6B7D8E' }}>forever</span>
      </div>
      <div style={{ height: 1, background: '#EEF0F3', margin: '20px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
        {freeFeatures.included.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: green, fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: 13.8, color: '#3A4A5A', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
        {freeFeatures.missing.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', opacity: 0.5 }}>
            <span style={{ fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✕</span>
            <span style={{ fontSize: 13.8, color: '#6B7D8E', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>
      <Link href="/register?care=free" style={{ display: 'block', textAlign: 'center', marginTop: 24, padding: '14px', borderRadius: 12, background: '#fff', color: charcoal, border: '1.5px solid #D8DEE6', fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
        Get started free
      </Link>
    </div>
  )
}

export default function PricingPage() {
  return (
    <div style={{ background: '#FFFCFA' }}>
      {/* Hero */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '92px 24px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5, color: 'rgba(255,255,255,.45)', marginBottom: 16 }}>Pricing</p>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300, fontSize: 'clamp(38px, 6vw, 60px)', color: '#fff', lineHeight: 1.02, letterSpacing: '-1.5px', marginBottom: 18 }}>
            Real care, at a price<br /><span style={{ color: coral }}>that makes sense.</span>
          </h1>
          <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,.66)', lineHeight: 1.7, fontWeight: 300 }}>
            The more you commit to your healing, the less each session costs. Your first session is free, and if you ever stop early, you only pay for the sessions you used.
          </p>
        </div>
      </section>

      {/* Care with a professional */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '76px 24px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(26px, 4vw, 36px)', color: charcoal, letterSpacing: '-0.5px' }}>
            Care with a professional
          </h2>
          <p style={{ fontSize: 15, color: '#6B7D8E', marginTop: 8, maxWidth: 520, margin: '8px auto 0' }}>
            Every plan includes the full app: unlimited Calm AI, daily tracking, insights, and a guide who stays with you between sessions.
          </p>
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: green, fontWeight: 700, marginBottom: 30 }}>
          💚 Bigger packs unlock a lower price per session
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 22, alignItems: 'stretch' }}>
          <CareCard
            name="Therapy" subtitle="Talk therapy with an RCI-verified psychologist."
            accent={coral} packs={therapyPacks} features={therapyFeatures} base={THERAPY_BASE} fill
            fromText={`From ${inr(THERAPY_FROM)} per session`} href="/register?care=therapy"
          />
          <CareCard
            name="Psychiatry" subtitle="Evaluation and medication care with an NMC-registered psychiatrist."
            accent={teal} packs={psychiatryPacks} features={psychiatryFeatures} base={PSYCHIATRY_BASE}
            fromText={`From ${inr(PSYCHIATRY_FROM)} per session`} href="/register?care=psychiatry"
          />
        </div>
      </section>

      {/* App & Free */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '40px 24px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(26px, 4vw, 36px)', color: charcoal, letterSpacing: '-0.5px' }}>
            Not ready for sessions yet?
          </h2>
          <p style={{ fontSize: 15, color: '#6B7D8E', marginTop: 8, maxWidth: 520, margin: '8px auto 0' }}>
            Start with the app. Build the habit, understand your patterns, and step up to a professional whenever you feel ready.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 22, alignItems: 'stretch' }}>
          <CalmPlusCard />
          <FreeCard />
        </div>
      </section>

      {/* Refund / money-back reassurance */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '12px 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '30px 34px', border: '1.5px solid rgba(61,158,114,.25)', textAlign: 'center' }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>🤍</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: charcoal, fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>Changed your mind? That&apos;s okay.</h3>
          <p style={{ fontSize: 15, color: '#3A4A5A', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 18px' }}>
            You can drop out or switch your plan whenever you need to. If you stop part-way, we work out a fair refund for the rest, no awkward questions and no fine print to fight.
          </p>
          <Link href="/terms" style={{ fontSize: 14, color: coral, fontWeight: 700, textDecoration: 'none' }}>
            See how refunds work →
          </Link>
        </div>
      </section>
    </div>
  )
}
