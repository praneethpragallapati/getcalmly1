'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import {
  buyablePacksIn, inr,
  type BuyableTrack, type PricingValues,
} from '@/data/pricing'
import { buyPackage, buyFirstSession, buyCalmPlus } from '@/app/(dashboard)/app/actions'

type PanelTab = BuyableTrack | 'calmplus'

const TAB_LABEL: Record<PanelTab, string> = {
  therapy: 'Therapy',
  psychiatry: 'Psychiatry',
  couples: 'Couples',
  calmplus: 'Calm+',
}

const TAB_SUB: Record<PanelTab, string> = {
  therapy: '50-minute one-on-one sessions with your clinical psychologist',
  psychiatry: 'Evaluation and medication care with your psychiatrist',
  couples: '50-minute sessions for you and your partner, together',
  calmplus: 'The everyday app, no sessions',
}

// What each package includes, shown under the price so the numbers lead.
const INCLUDED: Record<PanelTab, string[]> = {
  therapy: [
    'A clinical psychologist matched to you',
    'A clear summary after every session',
    'Calm+ included: unlimited AI, insights & journaling',
    'Priority matching and easy rescheduling',
  ],
  psychiatry: [
    'One-on-one consultations with your psychiatrist',
    'Medication support with a built-in tracker',
    'Digital prescriptions after your consultation',
    'Calm+ included: unlimited AI, insights & journaling',
  ],
  couples: [
    'A couples specialist matched to you both',
    'Shared exercises and check-ins between sessions',
    'A clear summary after every session',
    'Calm+ included, for both of you',
  ],
  calmplus: [
    'Unlimited Calm AI chat, day and night',
    'Daily and weekly insights on your patterns',
    'Smart journaling with reflections',
    'Mood tracking and daily check-ins',
  ],
}

const FOOTNOTE: Record<PanelTab, string> = {
  therapy: 'Unused sessions are refundable · validity extends on every purchase',
  psychiatry: 'Unused sessions are refundable · validity extends on every purchase',
  couples: 'Unused sessions are refundable · validity extends on every purchase',
  calmplus: 'Cancel anytime · included free with session plans',
}

type Partner = { name: string; phone: string; email: string }
const EMPTY_PARTNER: Partner = { name: '', phone: '', email: '' }

/* ── Shared bits ─────────────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  border: '1.5px solid var(--c-line)',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: 'var(--c-white)',
}

/** Side-by-side pack selector: one small tab per option. */
function PackTabs({
  labels,
  selected,
  onSelect,
}: {
  labels: string[]
  selected: number
  onSelect: (i: number) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#F4EEE9', padding: 4, borderRadius: 12 }}>
      {labels.map((l, i) => {
        const active = i === selected
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              flex: 1,
              padding: '9px 2px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'inherit',
              background: active ? 'var(--c-white)' : 'transparent',
              color: active ? 'var(--c-coral)' : 'var(--c-gray)',
              boxShadow: active ? '0 1px 4px rgba(28,43,58,.12)' : 'none',
              transition: 'all .15s',
              whiteSpace: 'nowrap',
            }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}

/** Small gold "Best value" chip. */
function BestValue() {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.3, color: 'var(--c-gold)', background: 'var(--c-gold-pale)', padding: '3px 9px', borderRadius: 50, whiteSpace: 'nowrap' }}>
      Best value
    </span>
  )
}

/** Partner contact fields shown for couples purchases when none is on record. */
function PartnerFields({
  partner,
  onChange,
}: {
  partner: Partner
  onChange: (p: Partner) => void
}) {
  return (
    <div style={{ background: '#FBF6F1', border: '1px solid var(--c-line)', borderRadius: 14, padding: '16px 18px', marginTop: 14 }}>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--c-charcoal)' }}>Your partner&apos;s details</div>
      <p className="muted" style={{ fontSize: 12.5, margin: '5px 0 12px', lineHeight: 1.55 }}>
        Couples sessions include both of you, so we need your partner&apos;s contact details to
        set up their access and reminders.
      </p>
      <div className="stack" style={{ gap: 8 }}>
        <input placeholder="Partner's full name" value={partner.name} onChange={(e) => onChange({ ...partner, name: e.target.value })} style={inputStyle} />
        <input placeholder="Partner's phone" type="tel" value={partner.phone} onChange={(e) => onChange({ ...partner, phone: e.target.value })} style={inputStyle} />
        <input placeholder="Partner's email" type="email" value={partner.email} onChange={(e) => onChange({ ...partner, email: e.target.value })} style={inputStyle} />
      </div>
    </div>
  )
}

/** The ✓ checklist of what a package includes. */
function IncludedList({ tab }: { tab: PanelTab }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {INCLUDED[tab].map((f) => (
        <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--c-green)', flexShrink: 0, lineHeight: '17px' }}>
            <Check size={13} strokeWidth={3} />
          </span>
          <span style={{ fontSize: 12.5, color: 'var(--c-gray-d)', lineHeight: 1.45 }}>{f}</span>
        </div>
      ))}
    </div>
  )
}

/* ── One package card per track ──────────────────────────────────────── */

function TrackCard({
  tab,
  sessionsRemaining,
  hasPartner,
  pricing,
}: {
  tab: PanelTab
  sessionsRemaining: number
  hasPartner: boolean
  pricing: PricingValues
}) {
  const router = useRouter()
  const isCalmPlus = tab === 'calmplus'
  const calmPlusPacks = pricing.calmPlusPacks
  const packs = isCalmPlus ? [] : buyablePacksIn(pricing, tab)
  const count = isCalmPlus ? calmPlusPacks.length : packs.length

  const [selected, setSelected] = useState(count - 1)
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [partner, setPartner] = useState<Partner>(EMPTY_PARTNER)

  const pack = packs[selected]
  const appPack = calmPlusPacks[selected]
  const needsPartner = tab === 'couples' && !hasPartner
  const isBest = selected === count - 1

  // Tab labels: session counts, or plan lengths for Calm+.
  const tabLabels = isCalmPlus
    ? calmPlusPacks.map((p) => (p.months === 12 ? '1 yr' : `${p.months} mo`))
    : packs.map((p) => `${p.sessions}`)

  // Selected option, summarised.
  const priceMain = isCalmPlus ? inr(Math.floor(appPack.total / appPack.months)) : inr(pack.perSession)
  const priceUnit = isCalmPlus ? '/ month' : '/ session'
  const priceSub = isCalmPlus
    ? `${inr(appPack.total)} total · billed once`
    : `${inr(pack.total)} total · valid ${pack.months} ${pack.months === 1 ? 'month' : 'months'}`

  function handleBuy() {
    setError('')
    if (needsPartner && !partner.name.trim()) {
      setError('Please add your partner’s name to continue.')
      return
    }
    startTransition(async () => {
      if (isCalmPlus) {
        const res = await buyCalmPlus(selected)
        if (res.ok && res.persisted) {
          setDone(`Calm+ is active for ${appPack.label.toLowerCase()} more. If you hold a session plan, its validity was extended too.`)
          router.refresh()
        } else if (res.ok && !res.persisted) {
          setError('Sign in to buy a plan.')
        } else {
          setError(res.error ?? 'Could not complete purchase.')
        }
        return
      }
      const res = await buyPackage(tab as BuyableTrack, selected, needsPartner ? partner : undefined)
      if (res.ok && res.persisted) {
        setDone(`${pack.sessions} ${pack.sessions === 1 ? 'session' : 'sessions'} added. You now have ${sessionsRemaining + pack.sessions} sessions remaining, earlier sessions were kept, not reset.`)
        router.refresh()
      } else if (res.ok && !res.persisted) {
        setError('Sign in to buy a package.')
      } else {
        setError(res.error ?? 'Could not complete purchase.')
      }
    })
  }

  if (done) {
    return (
      <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 34, marginBottom: 8 }}>🎉</div>
        <div className="section-title">{isCalmPlus ? 'Calm+ added' : `${TAB_LABEL[tab]} package added`}</div>
        <p className="muted" style={{ marginTop: 8 }}>{done}</p>
        <button className="btn btn-outline btn-sm" style={{ marginTop: 14, alignSelf: 'center' }} onClick={() => setDone(null)}>
          Buy another
        </button>
      </div>
    )
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="section-title" style={{ marginBottom: 2 }}>{TAB_LABEL[tab]}</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>{TAB_SUB[tab]}</p>

      {/* Pack selector: side-by-side tabs */}
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--c-gray)', textTransform: 'uppercase', marginBottom: 6 }}>
        {isCalmPlus ? 'Plan length' : 'Sessions'}
      </p>
      <PackTabs labels={tabLabels} selected={selected} onSelect={setSelected} />

      {/* Selected option, summarised */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--c-charcoal)', lineHeight: 1 }}>
            {priceMain}
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--c-gray-d)', marginLeft: 5 }}>{priceUnit}</span>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--c-gray)', marginTop: 4 }}>{priceSub}</span>
        </div>
        {isBest && <BestValue />}
      </div>

      {needsPartner && <PartnerFields partner={partner} onChange={setPartner} />}

      {error && <p style={{ color: 'var(--c-coral)', fontSize: 13, marginTop: 12 }}>{error}</p>}

      <button
        className="btn btn-primary"
        onClick={handleBuy}
        disabled={pending}
        style={{ marginTop: 14, width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
      >
        {pending
          ? 'Processing…'
          : isCalmPlus
            ? `Get Calm+ · ${appPack.label.toLowerCase()} · ${inr(appPack.total)}`
            : `Buy ${pack.sessions} ${pack.sessions === 1 ? 'session' : 'sessions'} · ${inr(pack.total)}`}
      </button>

      {/* What's included, below the numbers */}
      <div style={{ borderTop: '1px solid var(--c-line)', marginTop: 16, paddingTop: 14, flex: 1 }}>
        <IncludedList tab={tab} />
      </div>

      <p className="muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 12 }}>
        {FOOTNOTE[tab]}
      </p>
    </div>
  )
}

/**
 * Standalone Calm+ purchase card. Calm+ is app-only (AI companion, journaling,
 * mood tracker) and independent of session packages, so it can be bought before
 * a first session — shown on the first-session/billing view for new patients.
 */
export function CalmPlusPanel({ pricing }: { pricing: PricingValues }) {
  return <TrackCard tab="calmplus" sessionsRemaining={0} hasPartner={false} pricing={pricing} />
}

/**
 * In-app package purchase: the three session tracks side by side, with Calm+
 * on its own row below for people not ready for sessions. Buying ADDS sessions
 * to the patient's existing balance and extends validity (never resets);
 * couples packs collect the partner's details when none is on record.
 */
export function BuyPackagePanel({
  sessionsRemaining,
  hasPartner = false,
  pricing,
}: {
  sessionsRemaining: number
  hasPartner?: boolean
  pricing: PricingValues
}) {
  return (
    <>
      {/* The three session package types, one line */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 18,
          alignItems: 'stretch',
        }}
      >
        {(['therapy', 'psychiatry', 'couples'] as const).map((t) => (
          <TrackCard key={t} tab={t} sessionsRemaining={sessionsRemaining} hasPartner={hasPartner} pricing={pricing} />
        ))}
      </div>

      {/* Calm+, separately: for people not ready for sessions */}
      <div style={{ marginTop: 10 }}>
        <div className="section-title" style={{ marginBottom: 2 }}>Not ready for sessions yet?</div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Calm+ keeps the everyday support going, your AI companion, insights and journaling, without booking a session.
        </p>
        <div style={{ maxWidth: 560 }}>
          <TrackCard tab="calmplus" sessionsRemaining={sessionsRemaining} hasPartner={hasPartner} pricing={pricing} />
        </div>
      </div>
    </>
  )
}

/* ── First session ───────────────────────────────────────────────────── */

/**
 * The only purchase offered before a patient has completed their first session:
 * one session at the fixed intro price for their track (799 therapy, 1199
 * psychiatry, 1499 couples). Packages appear once the first session is done.
 */
export function FirstSessionPanel({ hasPartner = false, pricing, initialTrack }: { hasPartner?: boolean; pricing: PricingValues; initialTrack?: BuyableTrack }) {
  const router = useRouter()
  const [track, setTrack] = useState<BuyableTrack>(initialTrack ?? 'therapy')
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [partner, setPartner] = useState<Partner>(EMPTY_PARTNER)

  const needsPartner = track === 'couples' && !hasPartner
  const price = pricing.firstSession[track]

  function handleBuy() {
    setError('')
    if (needsPartner && !partner.name.trim()) {
      setError('Please add your partner’s name to continue.')
      return
    }
    startTransition(async () => {
      const res = await buyFirstSession(track, needsPartner ? partner : undefined)
      if (res.ok && res.persisted) {
        setDone(true)
        router.refresh()
      } else if (res.ok && !res.persisted) {
        setError('Sign in to book your first session.')
      } else {
        setError(res.error ?? 'Could not complete purchase.')
      }
    })
  }

  if (done) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
        <div className="section-title">Your first session is ready</div>
        <p className="muted" style={{ marginTop: 8 }}>
          Head to Sessions to pick a time with your {TAB_LABEL[track].toLowerCase()} specialist.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Book your first session</div>
      <p className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
        One session, one flat price. Session packages unlock after your first session.
      </p>

      <div className="stack" style={{ gap: 8 }}>
        {(['therapy', 'psychiatry', 'couples'] as const).map((t) => {
          const selected = track === t
          return (
            <label
              key={t}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 14,
                cursor: 'pointer',
                border: `1.5px solid ${selected ? 'var(--c-coral)' : 'var(--c-line)'}`,
                background: selected ? '#FFF6F2' : 'var(--c-white)',
                boxShadow: selected ? '0 4px 14px rgba(200,85,61,.10)' : 'none',
                transition: 'all .15s',
              }}
            >
              <input
                type="radio"
                name="first-track"
                checked={selected}
                onChange={() => setTrack(t)}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
              <span
                aria-hidden
                style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: selected ? 'none' : '2px solid var(--c-line)',
                  background: selected ? 'var(--c-coral)' : 'var(--c-white)',
                  color: '#fff', transition: 'all .15s',
                }}
              >
                {selected && <Check size={12} strokeWidth={3.5} />}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: 'var(--c-charcoal)' }}>
                  {TAB_LABEL[t]}
                </span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--c-gray)', marginTop: 2 }}>
                  {TAB_SUB[t]}
                </span>
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--c-charcoal)', flexShrink: 0 }}>
                {inr(pricing.firstSession[t])}
              </span>
            </label>
          )
        })}
      </div>

      {needsPartner && <PartnerFields partner={partner} onChange={setPartner} />}

      {error && <p style={{ color: 'var(--c-coral)', fontSize: 13, marginTop: 12 }}>{error}</p>}

      <button
        className="btn btn-primary"
        onClick={handleBuy}
        disabled={pending}
        style={{ marginTop: 18, width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14.5 }}
      >
        {pending ? 'Processing…' : `Book my first session · ${inr(price)}`}
      </button>
      <p className="muted" style={{ fontSize: 11.5, textAlign: 'center', marginTop: 10 }}>
        50 minutes with a licensed professional · reschedule anytime
      </p>
    </div>
  )
}
