'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  therapyPacks, psychiatryPacks, calmPlusPacks, perSession, inr,
  THERAPY_FROM, PSYCHIATRY_FROM, freeFeatures, calmPlusFeatures, therapyFeatures, psychiatryFeatures,
  type SessionPack,
} from '@/data/pricing'

const charcoal = '#1C2B3A'
const coral = '#C8553D'
const green = '#3D9E72'
const teal = '#1A7F7A'

function CareCard({
  name, subtitle, accent, pale, packs, features, fromText, href, featured,
}: {
  name: string; subtitle: string; accent: string; pale: string
  packs: SessionPack[]; features: string[]; fromText: string; href: string; featured?: boolean
}) {
  const [i, setI] = useState(packs.length - 1) // default to the best-value 6-pack
  const pack = packs[i]
  const single = packs[0].total
  const ps = perSession(pack)
  const savePct = Math.round((1 - ps / single) * 100)

  return (
    <div style={{
      background: '#fff', borderRadius: 24, padding: '32px 28px',
      border: featured ? `2px solid ${accent}` : '1.5px solid rgba(0,0,0,.08)',
      boxShadow: featured ? `0 20px 50px ${accent}1f` : '0 6px 20px rgba(28,43,58,.05)',
      position: 'relative', display: 'flex', flexDirection: 'column',
    }}>
      {featured && (
        <div style={{ position: 'absolute', top: -13, left: 28, background: accent, color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 50 }}>
          Most chosen
        </div>
      )}
      <p style={{ fontSize: 20, fontWeight: 800, color: charcoal, fontFamily: "'DM Sans', sans-serif" }}>{name}</p>
      <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 4, marginBottom: 18 }}>{subtitle}</p>

      {/* Pack selector */}
      <div style={{ display: 'flex', gap: 6, background: '#F5F7FA', padding: 4, borderRadius: 12, marginBottom: 18 }}>
        {packs.map((p, idx) => (
          <button key={p.sessions} onClick={() => setI(idx)} style={{
            flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            background: idx === i ? '#fff' : 'transparent',
            color: idx === i ? accent : '#8E9EAE',
            boxShadow: idx === i ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
          }}>
            {p.sessions} {p.sessions === 1 ? 'session' : 'sessions'}
          </button>
        ))}
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 44, color: charcoal, lineHeight: 1 }}>{inr(pack.total)}</span>
        {savePct > 0 && (
          <span style={{ fontSize: 12.5, fontWeight: 700, color: green, background: 'rgba(61,158,114,.1)', padding: '3px 10px', borderRadius: 50 }}>Save {savePct}%</span>
        )}
      </div>
      <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 8 }}>
        <strong style={{ color: accent }}>{inr(ps)}</strong> per session · valid {pack.months} {pack.months === 1 ? 'month' : 'months'}
      </p>

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
        background: featured ? accent : '#fff', color: featured ? '#fff' : accent,
        border: featured ? 'none' : `1.5px solid ${accent}`,
        fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
        boxShadow: featured ? `0 6px 18px ${accent}40` : 'none',
      }}>
        Book session
      </Link>
      <p style={{ fontSize: 12, color: '#A0ADB8', textAlign: 'center', marginTop: 10 }}>{fromText}</p>
    </div>
  )
}

function CalmPlusCard() {
  const [i, setI] = useState(2) // default to 6 months
  const pack = calmPlusPacks[i]
  const perMonth = Math.round(pack.total / pack.months)

  return (
    <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', border: `2px solid ${teal}`, boxShadow: `0 16px 40px ${teal}1a`, display: 'flex', flexDirection: 'column' }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: charcoal, fontFamily: "'DM Sans', sans-serif" }}>Calm+</p>
      <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 4, marginBottom: 18 }}>All the everyday support, no sessions. Your AI companion, insights and journaling, unlimited.</p>

      <div style={{ display: 'flex', gap: 6, background: '#F5F7FA', padding: 4, borderRadius: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        {calmPlusPacks.map((p, idx) => (
          <button key={p.label} onClick={() => setI(idx)} style={{
            flex: '1 1 60px', padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontSize: 12.5, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            background: idx === i ? '#fff' : 'transparent', color: idx === i ? teal : '#8E9EAE',
            boxShadow: idx === i ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
          }}>{p.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 44, color: charcoal, lineHeight: 1 }}>{inr(pack.total)}</span>
        <span style={{ fontSize: 14, color: '#6B7D8E' }}>/ {pack.label}</span>
      </div>
      <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 8 }}><strong style={{ color: teal }}>{inr(perMonth)}</strong> per month</p>

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
        Start Calm+
      </Link>
    </div>
  )
}

function FreeCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', border: '1.5px solid rgba(0,0,0,.08)', display: 'flex', flexDirection: 'column' }}>
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
    <div style={{ background: '#F9F5F2' }}>
      {/* Hero */}
      <section style={{ background: charcoal, padding: '78px 24px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5, color: 'rgba(255,255,255,.45)', marginBottom: 16 }}>Pricing</p>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(38px, 6vw, 60px)', color: '#fff', lineHeight: 1.02, letterSpacing: '-1.5px', marginBottom: 18 }}>
            Real care, at a price<br /><span style={{ color: coral }}>that makes sense.</span>
          </h1>
          <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,.66)', lineHeight: 1.7, fontWeight: 300 }}>
            The more you commit to your healing, the less each session costs. Pick the care you need below, choose a pack, and book in minutes.
          </p>
        </div>
      </section>

      {/* Care with a professional */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px 24px' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
          <CareCard
            name="Therapy" subtitle="Talk therapy with an RCI-verified psychologist."
            accent={coral} pale="rgba(200,85,61,.08)" packs={therapyPacks} features={therapyFeatures}
            fromText={`From ${inr(THERAPY_FROM)} per session`} href="/register?care=therapy" featured
          />
          <CareCard
            name="Psychiatry" subtitle="Evaluation and medication care with an NMC-registered psychiatrist."
            accent={teal} pale="rgba(26,127,122,.08)" packs={psychiatryPacks} features={psychiatryFeatures}
            fromText={`From ${inr(PSYCHIATRY_FROM)} per session`} href="/register?care=psychiatry"
          />
        </div>
      </section>

      {/* App & Free */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '40px 24px 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(26px, 4vw, 36px)', color: charcoal, letterSpacing: '-0.5px' }}>
            Not ready for sessions yet?
          </h2>
          <p style={{ fontSize: 15, color: '#6B7D8E', marginTop: 8, maxWidth: 520, margin: '8px auto 0' }}>
            Start with the app. Build the habit, understand your patterns, and step up to a professional whenever you feel ready.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
          <CalmPlusCard />
          <FreeCard />
        </div>
      </section>

      {/* Assurance */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '44px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 28, textAlign: 'center' }}>
          {[
            ['Your first session is free', 'Try therapy with no card and no commitment before you choose a pack.'],
            ['Cancel anytime', 'Packs are validity-based, never auto-renewing subscriptions you forget about.'],
            ['Switch or pause', 'Move between individual and couples care, or pause when life gets busy.'],
          ].map(([t, d]) => (
            <div key={t}>
              <p style={{ fontSize: 15, fontWeight: 800, color: charcoal, marginBottom: 6 }}>{t}</p>
              <p style={{ fontSize: 13.5, color: '#6B7D8E', lineHeight: 1.6 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
