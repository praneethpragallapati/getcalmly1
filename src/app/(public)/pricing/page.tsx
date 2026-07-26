'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  therapyPacks, couplesPacks, calmPlusPacks, perSession, inr, discountVsBase,
  THERAPY_FROM, COUPLES_FROM, THERAPY_BASE, COUPLES_BASE,
  CALMPLUS_BASE, FIRST_SESSION,
  freeFeatures, calmPlusFeatures, therapyFeatures, couplesFeatures,
  type SessionPack,
} from '@/data/pricing'

const coral = '#C8553D'
const charcoal = '#1C2B3A'
const green = '#3D9E72'
const teal = '#1A7F7A'
const purple = '#7C5CBF'

function PackSelector<T>({ items, i, setI, label, badges, accent }: {
  items: T[]; i: number; setI: (n: number) => void
  label: (t: T) => string; badges: Record<number, string>; accent: string
}) {
  return (
    <div className="pr-seg">
      {items.map((t, idx) => (
        <button
          key={idx}
          onClick={() => setI(idx)}
          aria-pressed={idx === i}
          className={idx === i ? 'on' : ''}
          style={idx === i ? { color: accent } : undefined}
        >
          {label(t)}
          {badges[idx] && (
            <span className="pr-tab-badge" style={{ color: idx === i ? accent : '#8E9EAE', background: (idx === i ? accent : '#8E9EAE') + '1f' }}>
              {badges[idx]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function Feature({ text, accent, muted }: { text: string; accent: string; muted?: boolean }) {
  return (
    <div className="pr-feat" style={muted ? { opacity: 0.55 } : undefined}>
      <span className="pr-feat-ic" style={{ color: muted ? '#9AA6B2' : accent }}>{muted ? '✕' : '✓'}</span>
      <span>{text}</span>
    </div>
  )
}

function CareCard({
  name, subtitle, accent, packs, features, fromText, href, base, firstSession, feat, delay,
}: {
  name: string; subtitle: string; accent: string; packs: SessionPack[]
  features: string[]; fromText: string; href: string; base: number
  firstSession: number; feat?: boolean; delay: string
}) {
  const [i, setI] = useState(packs.length - 1) // default to best-value pack
  const pack = packs[i]
  const ps = perSession(pack)
  const disc = discountVsBase(ps, base)
  const badges = { [packs.length - 1]: 'Best value' }

  return (
    <div className={`pr-card pr-anim ${delay} ${feat ? 'feat' : ''}`} style={feat ? ({ '--accent': accent } as React.CSSProperties) : undefined}>
      {feat && <span className="pr-ribbon">Most popular</span>}
      <div className="pr-card-head">
        <span className="pr-dot" style={{ background: accent }} />
        <p className="pr-card-name">{name}</p>
      </div>
      <p className="pr-card-sub">{subtitle}</p>

      <PackSelector items={packs} i={i} setI={setI} accent={accent} badges={badges}
        label={(p) => `${p.sessions} ${p.sessions === 1 ? 'session' : 'sessions'}`} />

      <div className="pr-price-row">
        <span className="pr-price">{inr(pack.total)}</span>
        <span className="pr-price-note">for {pack.sessions} {pack.sessions === 1 ? 'session' : 'sessions'}</span>
      </div>
      <p className="pr-persession">
        <span className="pr-strike">{inr(base)}</span>
        <strong style={{ color: accent }}>{inr(ps)}</strong>
        <span>per session</span>
        <span className="pr-save">Save {disc}%</span>
      </p>
      <p className="pr-valid">Valid for {pack.months} {pack.months === 1 ? 'month' : 'months'}</p>

      <div className="pr-divider" />
      <div className="pr-feats">
        {features.map((f) => <Feature key={f} text={f} accent={accent} />)}
      </div>

      <Link
        href={href}
        className="pr-cta"
        style={feat
          ? { background: accent, color: '#fff', border: 'none', boxShadow: `0 8px 22px ${accent}45` }
          : { background: '#fff', color: accent, border: `1.5px solid ${accent}` }}
      >
        Book session
      </Link>
      <p className="pr-cta-note">{fromText} · first session {inr(firstSession)}</p>
    </div>
  )
}

function CalmPlusCard({ delay }: { delay: string }) {
  const [i, setI] = useState(3)
  const pack = calmPlusPacks[i]
  const perMonth = Math.floor(pack.total / pack.months)
  const badges = { 2: 'Popular', 3: 'Best value' }

  return (
    <div className="pr-card pr-anim feat" style={{ ['--accent' as string]: teal, animationDelay: delay } as React.CSSProperties}>
      <span className="pr-chip-trial">✦ 7-day free trial</span>
      <div className="pr-card-head">
        <span className="pr-dot" style={{ background: teal }} />
        <p className="pr-card-name">Calm+</p>
      </div>
      <p className="pr-card-sub">All the everyday support, no sessions. Your AI companion, insights and journaling, unlimited.</p>

      <PackSelector items={calmPlusPacks} i={i} setI={setI} accent={teal} badges={badges} label={(p) => p.label} />

      <div className="pr-price-row">
        <span className="pr-from">From</span>
        <span className="pr-strike lg">{inr(CALMPLUS_BASE)}</span>
        <span className="pr-price">{inr(perMonth)}</span>
        <span className="pr-price-note">/ month</span>
      </div>
      <p className="pr-valid">Billed {pack.label.toLowerCase()} · {inr(pack.total)} total</p>

      <div className="pr-divider" />
      <div className="pr-feats">
        {calmPlusFeatures.included.map((f) => <Feature key={f} text={f} accent={teal} />)}
        {calmPlusFeatures.missing.map((f) => <Feature key={f} text={f} accent={teal} muted />)}
      </div>

      <Link href="/register?care=app" className="pr-cta" style={{ background: teal, color: '#fff', border: 'none', boxShadow: `0 8px 22px ${teal}45` }}>
        Start 7-day free trial
      </Link>
      <p className="pr-cta-note">Cancel anytime during the trial</p>
    </div>
  )
}

function FreeCard({ delay }: { delay: string }) {
  return (
    <div className="pr-card pr-anim" style={{ animationDelay: delay }}>
      <div className="pr-card-head">
        <span className="pr-dot" style={{ background: '#9AA6B2' }} />
        <p className="pr-card-name">Free</p>
      </div>
      <p className="pr-card-sub">A genuine place to start. No card, no pressure.</p>
      <div className="pr-price-row" style={{ marginTop: 6 }}>
        <span className="pr-price">₹0</span>
        <span className="pr-price-note">forever</span>
      </div>
      <div className="pr-divider" />
      <div className="pr-feats">
        {freeFeatures.included.map((f) => <Feature key={f} text={f} accent={green} />)}
        {freeFeatures.missing.map((f) => <Feature key={f} text={f} accent={green} muted />)}
      </div>
      <Link href="/register?care=free" className="pr-cta" style={{ background: '#fff', color: charcoal, border: '1.5px solid #D8DEE6' }}>
        Get started free
      </Link>
      <p className="pr-cta-note">No credit card required</p>
    </div>
  )
}

const STEPS: { n: string; t: string; d: string }[] = [
  { n: '01', t: `First session, flat ${inr(FIRST_SESSION.therapy)}`, d: 'One real conversation with a matched clinician, at a fixed intro price. Charged once — never again.' },
  { n: '02', t: 'Pick a pack, price drops', d: 'After your first session, choose a session pack. The more you commit, the lower the per-session price.' },
  { n: '03', t: 'Change your mind anytime', d: 'Pause or switch whenever you need. Stop part-way and you only pay for the sessions you used.' },
]

const TRUST = ['RCI-verified clinicians', 'DPDP-secure & confidential', 'Fair, no-questions refunds']

export default function PricingPage() {
  return (
    <div className="pr-page">
      <style>{CSS}</style>

      {/* Hero */}
      <section className="pr-hero">
        <div className="pr-hero-glow" />
        <div className="pr-hero-inner">
          <p className="pr-eyebrow" style={{ color: 'rgba(255,255,255,.5)' }}>Pricing</p>
          <h1 className="pr-h1">
            Real care, at a price<br /><span style={{ color: coral }}>that makes sense.</span>
          </h1>
          <p className="pr-hero-sub">
            The more you commit to your healing, the less each session costs. Your first session is a flat {inr(FIRST_SESSION.therapy)},
            and if you ever stop early, you only pay for the sessions you used.
          </p>
          <div className="pr-trust">
            {TRUST.map((t) => (
              <span key={t} className="pr-trust-chip"><span className="pr-check">✓</span>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How pricing works */}
      <section className="pr-section" style={{ paddingTop: 64, paddingBottom: 8 }}>
        <div className="pr-steps">
          {STEPS.map((s, idx) => (
            <div key={s.n} className={`pr-step pr-anim pr-d${idx + 1}`}>
              <span className="pr-step-n">{s.n}</span>
              <p className="pr-step-t">{s.t}</p>
              <p className="pr-step-d">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Care with a professional */}
      <section className="pr-section" style={{ paddingTop: 64 }}>
        <div className="pr-head">
          <p className="pr-eyebrow" style={{ color: coral }}>With a professional</p>
          <h2 className="pr-h2">Sessions that fit your life</h2>
          <p className="pr-head-sub">
            Every plan includes the full app — unlimited Calm AI, daily tracking, insights, and a guide who stays with you between sessions.
          </p>
          <p className="pr-hint">💚 Bigger packs unlock a lower price per session</p>
        </div>
        <div className="pr-grid two">
          <CareCard
            name="Therapy" subtitle="Talk therapy with an RCI-verified psychologist."
            accent={coral} packs={therapyPacks} features={therapyFeatures} base={THERAPY_BASE} feat delay="pr-d1"
            firstSession={FIRST_SESSION.therapy}
            fromText={`From ${inr(THERAPY_FROM)} per session`} href="/register?care=therapy"
          />
          <CareCard
            name="Couples" subtitle="Sessions for you and your partner, together."
            accent={purple} packs={couplesPacks} features={couplesFeatures} base={COUPLES_BASE} delay="pr-d2"
            firstSession={FIRST_SESSION.couples}
            fromText={`From ${inr(COUPLES_FROM)} per session`} href="/register?care=therapy"
          />
        </div>
      </section>

      {/* App & Free */}
      <section className="pr-section" style={{ paddingTop: 24 }}>
        <div className="pr-head">
          <p className="pr-eyebrow" style={{ color: teal }}>No sessions needed</p>
          <h2 className="pr-h2">Not ready for sessions yet?</h2>
          <p className="pr-head-sub">
            Start with the app. Build the habit, understand your patterns, and step up to a professional whenever you feel ready.
          </p>
        </div>
        <div className="pr-grid two">
          <CalmPlusCard delay="0.05s" />
          <FreeCard delay="0.12s" />
        </div>
      </section>

      {/* Money-back reassurance */}
      <section className="pr-section" style={{ maxWidth: 780, paddingTop: 24, paddingBottom: 96 }}>
        <div className="pr-refund pr-anim pr-d1">
          <div className="pr-refund-badge">🤍</div>
          <h3 className="pr-refund-t">Changed your mind? That&apos;s okay.</h3>
          <p className="pr-refund-p">
            You can drop out or switch your plan whenever you need to. If you stop part-way, we work out a fair
            refund for the rest — no awkward questions and no fine print to fight.
          </p>
          <Link href="/terms" className="pr-refund-link">See how refunds work →</Link>
        </div>
      </section>
    </div>
  )
}

const CSS = `
  .pr-page{ background: var(--bg); }
  .pr-section{ max-width: 1200px; margin: 0 auto; padding: 40px 24px; }

  .pr-eyebrow{ font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; }
  .pr-h1{ font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; font-size: clamp(40px, 6.2vw, 66px); color: #fff; line-height: .98; letter-spacing: -1.5px; margin-bottom: 20px; text-wrap: balance; }
  .pr-h2{ font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; font-size: clamp(30px, 4.4vw, 44px); color: var(--charcoal); letter-spacing: -1px; line-height: 1.02; text-wrap: balance; }

  /* Hero */
  .pr-hero{ position: relative; overflow: hidden; text-align: center; padding: 96px 24px 68px;
    background: radial-gradient(ellipse 60% 70% at 86% 6%, rgba(200,85,61,.30), transparent 55%),
                radial-gradient(ellipse 46% 60% at 4% 84%, rgba(200,85,61,.14), transparent 60%), #141E29; }
  .pr-hero-glow{ position: absolute; top: -140px; right: -110px; width: 440px; height: 440px; border-radius: 50%;
    background: radial-gradient(circle, rgba(200,85,61,.20) 0%, transparent 70%); pointer-events: none; }
  .pr-hero-inner{ max-width: 720px; margin: 0 auto; position: relative; }
  .pr-hero-sub{ font-size: 17px; color: rgba(255,255,255,.7); line-height: 1.7; max-width: 600px; margin: 0 auto; }
  .pr-trust{ display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 28px; }
  .pr-trust-chip{ display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,.82); background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
    padding: 8px 15px; border-radius: 40px; }
  .pr-check{ color: var(--green); font-weight: 800; }

  /* Steps */
  .pr-steps{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .pr-step{ background: #fff; border: 1px solid var(--line-card); border-radius: 18px; padding: 24px 24px 26px; box-shadow: var(--sh-card); }
  .pr-step-n{ font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; font-size: 30px; color: var(--coral-l); letter-spacing: -1px; }
  .pr-step-t{ font-size: 16.5px; font-weight: 800; color: var(--charcoal); margin: 8px 0 6px; }
  .pr-step-d{ font-size: 13.8px; color: #6B7D8E; line-height: 1.6; }

  /* Section head */
  .pr-head{ text-align: center; max-width: 620px; margin: 0 auto 34px; }
  .pr-head-sub{ font-size: 15.5px; color: #6B7D8E; margin: 12px auto 0; line-height: 1.6; }
  .pr-hint{ font-size: 13px; color: var(--green); font-weight: 700; margin-top: 16px; }

  /* Cards grid */
  .pr-grid{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; align-items: stretch; }
  .pr-grid.two{ grid-template-columns: repeat(2, 1fr); max-width: 900px; margin: 0 auto; }

  .pr-card{ position: relative; background: #fff; border-radius: 22px; padding: 32px 26px;
    border: 1px solid var(--line-card); box-shadow: var(--sh-card); display: flex; flex-direction: column;
    transition: transform .28s cubic-bezier(.2,.7,.2,1), box-shadow .28s; }
  .pr-card:hover{ transform: translateY(-5px); box-shadow: var(--sh-card-h); }
  .pr-card.feat{ border: 2px solid var(--accent, #C8553D); box-shadow: 0 20px 52px color-mix(in srgb, var(--accent, #C8553D) 18%, transparent); }
  .pr-ribbon{ position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--accent, #C8553D);
    color: #fff; font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; padding: 5px 16px;
    border-radius: 50px; box-shadow: 0 6px 16px color-mix(in srgb, var(--accent, #C8553D) 40%, transparent); white-space: nowrap; }
  .pr-chip-trial{ display: inline-flex; align-self: flex-start; align-items: center; gap: 6px; background: rgba(26,127,122,.1);
    color: ${teal}; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 50px; margin-bottom: 14px; }

  .pr-card-head{ display: flex; align-items: center; gap: 9px; }
  .pr-dot{ width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .pr-card-name{ font-size: 20px; font-weight: 800; color: var(--charcoal); }
  .pr-card-sub{ font-size: 13.5px; color: #6B7D8E; margin: 6px 0 18px; min-height: 38px; line-height: 1.5; }

  .pr-seg{ display: flex; gap: 6px; background: #F4F6F9; padding: 4px; border-radius: 12px; margin-bottom: 18px; }
  .pr-seg button{ flex: 1; padding: 8px 2px; border-radius: 9px; border: none; cursor: pointer; background: transparent;
    display: flex; flex-direction: column; align-items: center; font-size: 12.5px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; color: #8E9EAE; transition: background .2s, color .2s, box-shadow .2s; }
  .pr-seg button.on{ background: #fff; box-shadow: 0 1px 5px rgba(28,43,58,.12); }
  .pr-tab-badge{ font-size: 9px; font-weight: 800; letter-spacing: .3px; padding: 2px 6px; border-radius: 50px;
    text-transform: uppercase; margin-top: 4px; }

  .pr-price-row{ display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .pr-price{ font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; font-size: 46px; line-height: 1; color: var(--charcoal); letter-spacing: -1px; }
  .pr-price-note{ font-size: 13px; color: #A0ADB8; }
  .pr-from{ font-size: 13px; color: #A0ADB8; font-weight: 500; }
  .pr-persession{ font-size: 13.5px; color: #6B7D8E; margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .pr-persession strong{ font-size: 15px; }
  .pr-strike{ text-decoration: line-through; color: #B6C0CA; }
  .pr-strike.lg{ font-size: 15px; font-weight: 600; }
  .pr-save{ font-size: 12px; font-weight: 700; color: var(--green); background: rgba(61,158,114,.1); padding: 2px 8px; border-radius: 50px; }
  .pr-valid{ font-size: 12.5px; color: #A0ADB8; margin-top: 6px; }

  .pr-divider{ height: 1px; background: #EEF0F3; margin: 20px 0; }
  .pr-feats{ display: flex; flex-direction: column; gap: 11px; flex: 1; }
  .pr-feat{ display: flex; gap: 10px; align-items: flex-start; font-size: 13.8px; color: #3A4A5A; line-height: 1.5; }
  .pr-feat-ic{ font-weight: 800; font-size: 14px; flex-shrink: 0; margin-top: 1px; }

  .pr-cta{ display: block; text-align: center; margin-top: 24px; padding: 14px; border-radius: 12px;
    font-size: 15px; font-weight: 700; text-decoration: none; font-family: 'DM Sans', sans-serif; transition: transform .2s, filter .2s; }
  .pr-cta:hover{ transform: translateY(-2px); filter: brightness(1.03); }
  .pr-cta-note{ font-size: 12px; color: #A0ADB8; text-align: center; margin-top: 10px; }

  /* Refund */
  .pr-refund{ background: #fff; border-radius: 22px; padding: 34px; border: 1.5px solid rgba(61,158,114,.25);
    text-align: center; box-shadow: var(--sh-card); }
  .pr-refund-badge{ font-size: 30px; margin-bottom: 10px; }
  .pr-refund-t{ font-size: 23px; font-weight: 800; color: var(--charcoal); margin-bottom: 10px; }
  .pr-refund-p{ font-size: 15px; color: #3A4A5A; line-height: 1.7; max-width: 540px; margin: 0 auto 18px; }
  .pr-refund-link{ font-size: 14px; color: var(--coral); font-weight: 700; text-decoration: none; }
  .pr-refund-link:hover{ text-decoration: underline; }

  /* Entrance animation (self-contained, no observer dependency) */
  @keyframes prUp{ from{ opacity: 0; transform: translateY(22px); } to{ opacity: 1; transform: none; } }
  .pr-anim{ animation: prUp .6s cubic-bezier(.2,.7,.2,1) both; }
  .pr-d1{ animation-delay: .05s; } .pr-d2{ animation-delay: .13s; } .pr-d3{ animation-delay: .21s; }
  @media (prefers-reduced-motion: reduce){ .pr-anim{ animation: none; } .pr-card:hover{ transform: none; } }

  @media (max-width: 940px){
    .pr-grid, .pr-grid.two, .pr-steps{ grid-template-columns: 1fr; max-width: 460px; margin-left: auto; margin-right: auto; }
    .pr-card-sub{ min-height: 0; }
  }
`
