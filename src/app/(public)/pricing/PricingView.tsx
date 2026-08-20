'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  perSession, inr, discountVsBase,
  freeFeatures, calmPlusFeatures, therapyFeatures, psychiatryFeatures, couplesFeatures,
  type SessionPack, type AppPack, type PricingValues,
} from '@/data/pricing'
import { FaqSection } from '@/components/site/FaqSection'
import { PRICING_FAQ } from '@/data/siteFaq'

// The therapy accent doubles as 11px text — both as the ribbon fill under white
// and as the "Pay today" label on white. Brand coral is 4.35:1 either way, just
// under AA; this darker cut clears it at 5.2:1 and is indistinguishable at a
// glance. The other three accents already pass at this size.
const coral = '#B8482F'
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
            <span className="pr-tab-badge" style={{ color: idx === i ? accent : '#667585', background: (idx === i ? accent : '#667585') + '1f' }}>
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
  name, subtitle, accent, packs, features, href, base, firstSession, feat, delay,
}: {
  name: string; subtitle: string; accent: string; packs: SessionPack[]
  features: string[]; href: string; base: number
  firstSession: number; feat?: boolean; delay: string
}) {
  const [i, setI] = useState(packs.length - 1) // default to best-value pack
  const [open, setOpen] = useState(false)
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

      {/* Lead with the only thing you buy here: your first session */}
      <p className="pr-tier-label" style={{ color: accent }}>Pay today</p>
      <div className="pr-first" style={{ background: accent + '12', borderColor: accent + '33' }}>
        <span className="pr-first-label">Your first session</span>
        <span className="pr-first-val" style={{ color: accent }}>{inr(firstSession)}</span>
      </div>
      <Link
        href={href}
        className="pr-cta"
        style={feat
          ? { background: accent, color: '#fff', border: 'none', boxShadow: `0 8px 22px ${accent}45` }
          : { background: '#fff', color: accent, border: `1.5px solid ${accent}` }}
      >
        Book your first session
      </Link>

      <div className="pr-divider" />
      <div className="pr-feats">
        {features.map((f) => <Feature key={f} text={f} accent={accent} />)}
      </div>

      {/* Pack pricing lives behind a disclosure — it's for reference only, since
          packs are bought later from the dashboard, after the first session. */}
      <button
        type="button"
        className={`pr-disc ${open ? 'pr-disc-hd' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>After that · session packs</span>
        <span className="pr-disc-car">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="pr-disc-open">
          <PackSelector items={packs} i={i} setI={setI} accent={accent} badges={badges}
            label={(p) => `${p.sessions} ${p.sessions === 1 ? 'session' : 'sessions'}`} />
          <div className="pr-price-row">
            <span className="pr-price" style={{ color: accent }}>{inr(ps)}</span>
            <span className="pr-price-note">/ session</span>
            <span className="pr-save">Save {disc}%</span>
          </div>
          <p className="pr-valid">
            {inr(pack.total)} total for {pack.sessions} {pack.sessions === 1 ? 'session' : 'sessions'} · valid {pack.months} {pack.months === 1 ? 'month' : 'months'}
          </p>
          <p className="pr-cta-note" style={{ textAlign: 'left', marginTop: 12 }}>Buy packs from your dashboard after your first session.</p>
        </div>
      )}
    </div>
  )
}

function CalmPlusCard({ delay, packs, base }: { delay: string; packs: AppPack[]; base: number }) {
  const [i, setI] = useState(packs.length - 1)
  const pack = packs[i]
  const perMonth = Math.floor(pack.total / pack.months)
  const badges = { [packs.length - 2]: 'Popular', [packs.length - 1]: 'Best value' }

  return (
    <div className="pr-card pr-anim feat" style={{ ['--accent' as string]: teal, animationDelay: delay } as React.CSSProperties}>
      <span className="pr-chip-trial">✦ 7-day free trial</span>
      <div className="pr-card-head">
        <span className="pr-dot" style={{ background: teal }} />
        <p className="pr-card-name">Calm+</p>
      </div>
      <p className="pr-card-sub">All the everyday support, no sessions. Your AI companion, insights and journaling, unlimited.</p>

      <PackSelector items={packs} i={i} setI={setI} accent={teal} badges={badges} label={(p) => p.label} />

      <div className="pr-price-row">
        <span className="pr-from">From</span>
        <span className="pr-strike lg">{inr(base)}</span>
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

const TRUST = ['RCI & NMC-verified clinicians', 'DPDP-secure & confidential', 'Fair, no-questions refunds']

export default function PricingView({ pricing }: { pricing: PricingValues }) {
  const [tab, setTab] = useState<'pro' | 'app'>('pro')

  const STEPS: { n: string; t: string; d: string }[] = [
    { n: '01', t: `First session, flat ${inr(pricing.firstSession.therapy)}`, d: 'One real conversation with a matched clinician, at a fixed intro price. Charged once — never again.' },
    { n: '02', t: 'Pick a pack, price drops', d: 'After your first session, choose a session pack. The more you commit, the lower the per-session price.' },
    { n: '03', t: 'Change your mind anytime', d: 'Pause or switch whenever you need. Stop part-way and you only pay for the sessions you used.' },
  ]

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
            The more you commit to your healing, the less each session costs. Your first session is a flat {inr(pricing.firstSession.therapy)},
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

      {/* Plans — one screen, toggle between professional care and app-only */}
      <section className="pr-section" style={{ paddingTop: 64 }}>
        <div className="pr-head">
          <p className="pr-eyebrow" style={{ color: coral }}>Plans &amp; pricing</p>
          <h2 className="pr-h2">Care that fits where you are</h2>
          <p className="pr-head-sub">
            Start with a professional, or ease in with the app on its own. Switch between the two anytime.
          </p>
        </div>

        {/* Segmented toggle */}
        <div className="pr-toggle-wrap">
          <div className="pr-toggle" role="tablist" aria-label="Plan type">
            <button
              type="button" role="tab" aria-selected={tab === 'pro'}
              className={tab === 'pro' ? 'on' : ''} onClick={() => setTab('pro')}
            >
              With a professional
            </button>
            <button
              type="button" role="tab" aria-selected={tab === 'app'}
              className={tab === 'app' ? 'on' : ''} onClick={() => setTab('app')}
            >
              Just the app
            </button>
          </div>
        </div>
        <p className="pr-toggle-hint">
          {tab === 'pro'
            ? 'Every plan starts with a flat first session, then bigger packs lower your price per session — the full Calm+ app is included with all three.'
            : 'No sessions, no commitment. Everyday support you can start with in under a minute, and step up to a professional whenever you feel ready.'}
        </p>

        {tab === 'pro' ? (
          <div className="pr-grid" key="pro">
            <CareCard
              name="Therapy" subtitle="Talk therapy with an RCI-verified clinical psychologist."
              accent={coral} packs={pricing.therapyPacks} features={therapyFeatures} base={pricing.therapyBase} feat delay="pr-d1"
              firstSession={pricing.firstSession.therapy}
              href="/register?care=therapy"
            />
            <CareCard
              name="Psychiatry" subtitle="Evaluation and medication care with an NMC-registered psychiatrist."
              accent={teal} packs={pricing.psychiatryPacks} features={psychiatryFeatures} base={pricing.psychiatryBase} delay="pr-d2"
              firstSession={pricing.firstSession.psychiatry}
              href="/register?care=psychiatry"
            />
            <CareCard
              name="Couples" subtitle="Sessions for you and your partner, together."
              accent={purple} packs={pricing.couplesPacks} features={couplesFeatures} base={pricing.couplesBase} delay="pr-d3"
              firstSession={pricing.firstSession.couples}
              href="/register?care=couples"
            />
          </div>
        ) : (
          <div className="pr-grid two" key="app">
            <FreeCard delay="0.05s" />
            <CalmPlusCard delay="0.12s" packs={pricing.calmPlusPacks} base={pricing.calmPlusBase} />
          </div>
        )}
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

      {/* Objections belong where the money decision is made — and this is the
          page where FAQ rich results are worth most. */}
      <FaqSection
        eyebrow="Before you pay"
        heading="What people ask about cost."
        items={PRICING_FAQ}
        background="#FFFFFF"
      />
    </div>
  )
}

const CSS = `
  .pr-page{ background: var(--bg); }
  .pr-section{ max-width: 1200px; margin: 0 auto; padding: 40px 24px; }

  .pr-eyebrow{ font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; }
  .pr-h1{ font-family: 'Big Shoulders Display', sans-serif; font-weight: 300; font-size: clamp(42px, 6.4vw, 68px); color: #fff; line-height: 1.0; letter-spacing: -2px; margin-bottom: 20px; text-wrap: balance; }
  .pr-h2{ font-family: 'Big Shoulders Display', sans-serif; font-weight: 300; font-size: clamp(30px, 4.4vw, 44px); color: var(--charcoal); letter-spacing: -1px; line-height: 1.04; text-wrap: balance; }

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
  .pr-step-d{ font-size: 13.8px; color: #5A6A7A; line-height: 1.6; }

  /* Section head */
  .pr-head{ text-align: center; max-width: 620px; margin: 0 auto 34px; }
  .pr-head-sub{ font-size: 15.5px; color: #5A6A7A; margin: 12px auto 0; line-height: 1.6; }
  .pr-hint{ font-size: 13px; color: var(--green); font-weight: 700; margin-top: 16px; }

  /* Segmented plan toggle */
  .pr-toggle-wrap{ text-align: center; margin-top: 28px; }
  .pr-toggle{ display: inline-flex; gap: 5px; background: #fff; border: 1px solid var(--line-card);
    padding: 5px; border-radius: 14px; box-shadow: var(--sh-card); }
  .pr-toggle button{ border: none; cursor: pointer; background: transparent; font-family: 'DM Sans', sans-serif;
    font-size: 14.5px; font-weight: 700; color: #667585; padding: 11px 28px; border-radius: 10px;
    transition: background .22s, color .22s, box-shadow .22s; }
  .pr-toggle button.on{ background: var(--coral-cta); color: #fff; box-shadow: 0 6px 16px rgba(200,85,61,.32); }
  .pr-toggle button:not(.on):hover{ color: var(--charcoal); }
  .pr-toggle-hint{ font-size: 14px; color: #5A6A7A; text-align: center; max-width: 620px;
    margin: 16px auto 36px; line-height: 1.6; }

  /* Cards grid */
  .pr-grid{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; align-items: stretch; }
  .pr-grid.two{ grid-template-columns: repeat(2, 1fr); max-width: 900px; margin: 0 auto; }
  /* Explicit first-session callout */
  .pr-first{ display: flex; align-items: baseline; justify-content: space-between; gap: 10px;
    border: 1px solid; border-radius: 12px; padding: 13px 16px; margin-top: 16px; }
  .pr-first-label{ font-size: 13px; font-weight: 700; color: var(--charcoal); }
  .pr-first-val{ font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.5px; }
  .pr-first + .pr-cta{ margin-top: 12px; }
  .pr-packs-h{ font-size: 11.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #667585; margin-bottom: 10px; }
  .pr-tier-label{ font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; margin: 16px 0 8px; }

  /* Pack-pricing disclosure (kept out of the way until asked for) */
  .pr-disc{ display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 20px;
    padding: 13px 15px; border: 1px solid var(--line-card); border-radius: 12px; background: #fff; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 700; color: var(--charcoal);
    transition: background .18s, border-color .18s; }
  .pr-disc:hover{ background: #FBFBFC; }
  .pr-disc-car{ color: #667585; font-size: 11px; }
  .pr-disc.pr-disc-hd{ border-bottom-left-radius: 0; border-bottom-right-radius: 0; background: #F6F7F9; }
  .pr-disc-open{ border: 1px solid var(--line-card); border-top: none; border-radius: 0 0 12px 12px;
    background: #FBFBFC; padding: 16px 15px 18px; margin-top: -1px; }

  /* Transition between the professional plans and the app-only plans */
  .pr-more{ display: flex; align-items: center; gap: 16px; max-width: 720px; margin: 40px auto 8px; padding: 0 24px; }
  .pr-more-line{ flex: 1; height: 1px; background: var(--line-card); }
  .pr-more-text{ font-size: 13.5px; font-weight: 700; color: var(--coral-ink); white-space: nowrap; }

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
  .pr-card-sub{ font-size: 13.5px; color: #5A6A7A; margin: 6px 0 18px; min-height: 38px; line-height: 1.5; }

  .pr-seg{ display: flex; gap: 6px; background: #F4F6F9; padding: 4px; border-radius: 12px; margin-bottom: 18px; }
  .pr-seg button{ flex: 1; padding: 8px 2px; border-radius: 9px; border: none; cursor: pointer; background: transparent;
    display: flex; flex-direction: column; align-items: center; font-size: 12.5px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; color: #667585; transition: background .2s, color .2s, box-shadow .2s; }
  .pr-seg button.on{ background: #fff; box-shadow: 0 1px 5px rgba(28,43,58,.12); }
  .pr-tab-badge{ font-size: 9px; font-weight: 800; letter-spacing: .3px; padding: 2px 6px; border-radius: 50px;
    text-transform: uppercase; margin-top: 4px; }

  .pr-price-row{ display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .pr-price{ font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; font-size: 46px; line-height: 1; color: var(--charcoal); letter-spacing: -1px; }
  .pr-price-note{ font-size: 13px; color: #667585; }
  .pr-from{ font-size: 13px; color: #667585; font-weight: 500; }
  .pr-persession{ font-size: 13.5px; color: #5A6A7A; margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .pr-persession strong{ font-size: 15px; }
  .pr-strike{ text-decoration: line-through; color: #B6C0CA; }
  .pr-strike.lg{ font-size: 15px; font-weight: 600; }
  .pr-save{ font-size: 12px; font-weight: 700; color: var(--green); background: rgba(61,158,114,.1); padding: 2px 8px; border-radius: 50px; }
  .pr-valid{ font-size: 12.5px; color: #667585; margin-top: 6px; }

  .pr-divider{ height: 1px; background: #EEF0F3; margin: 20px 0; }
  .pr-feats{ display: flex; flex-direction: column; gap: 11px; flex: 1; }
  .pr-feat{ display: flex; gap: 10px; align-items: flex-start; font-size: 13.8px; color: #3A4A5A; line-height: 1.5; }
  .pr-feat-ic{ font-weight: 800; font-size: 14px; flex-shrink: 0; margin-top: 1px; }

  .pr-cta{ display: block; text-align: center; margin-top: 24px; padding: 14px; border-radius: 12px;
    font-size: 15px; font-weight: 700; text-decoration: none; font-family: 'DM Sans', sans-serif; transition: transform .2s, filter .2s; }
  .pr-cta:hover{ transform: translateY(-2px); filter: brightness(1.03); }
  .pr-cta-note{ font-size: 12px; color: #667585; text-align: center; margin-top: 10px; }

  /* Refund */
  .pr-refund{ background: #fff; border-radius: 22px; padding: 34px; border: 1.5px solid rgba(61,158,114,.25);
    text-align: center; box-shadow: var(--sh-card); }
  .pr-refund-badge{ font-size: 30px; margin-bottom: 10px; }
  .pr-refund-t{ font-size: 23px; font-weight: 800; color: var(--charcoal); margin-bottom: 10px; }
  .pr-refund-p{ font-size: 15px; color: #3A4A5A; line-height: 1.7; max-width: 540px; margin: 0 auto 18px; }
  .pr-refund-link{ font-size: 14px; color: var(--coral-ink); font-weight: 700; text-decoration: none; }
  .pr-refund-link:hover{ text-decoration: underline; }

  /* Entrance animation (self-contained, no observer dependency) */
  @keyframes prUp{ from{ opacity: 0; transform: translateY(22px); } to{ opacity: 1; transform: none; } }
  .pr-anim{ animation: prUp .6s cubic-bezier(.2,.7,.2,1) both; }
  .pr-d1{ animation-delay: .05s; } .pr-d2{ animation-delay: .13s; } .pr-d3{ animation-delay: .21s; }
  @media (prefers-reduced-motion: reduce){ .pr-anim{ animation: none; } .pr-card:hover{ transform: none; } }

  @media (max-width: 940px){
    .pr-grid, .pr-grid.two, .pr-steps{ grid-template-columns: 1fr; max-width: 460px; margin-left: auto; margin-right: auto; }
    .pr-card-sub{ min-height: 0; }
    .pr-more-text{ white-space: normal; text-align: center; }
  }
`
