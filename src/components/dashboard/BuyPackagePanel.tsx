'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import {
  packsFor, calmPlusPacks, inr, FIRST_SESSION,
  type BuyableTrack, type BuyablePack,
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
  therapy: '50 min with an RCI-verified psychologist',
  psychiatry: 'Evaluation with an NMC-registered psychiatrist',
  couples: '50 min for you and your partner, together',
  calmplus: 'The everyday app, no sessions',
}

// What each package actually includes, shown inside its card so patients
// know what they're buying, not just how many sessions.
const INCLUDED: Record<PanelTab, string[]> = {
  therapy: [
    '50-minute sessions with an RCI-verified psychologist',
    'A clear summary after every session',
    'Calm+ included: unlimited AI, insights & journaling',
    'Priority matching and easy rescheduling',
  ],
  psychiatry: [
    'Consultations with an NMC-registered psychiatrist',
    'Medication support with a built-in tracker',
    'Medicines delivered to your door',
    'Coordinated with your therapist when needed',
  ],
  couples: [
    '50-minute sessions for you and your partner together',
    'An EFT & Gottman-informed couples therapist',
    'Shared exercises and check-ins between sessions',
    'Calm+ included, for both of you',
  ],
  calmplus: [
    'Unlimited Calm AI chat, day and night',
    'Daily and weekly insights on your patterns',
    'Smart journaling with reflections',
    'Mood tracking and guided exercises',
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

/** The round selection indicator that replaces the browser radio. */
function SelectDot({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: on ? 'none' : '2px solid var(--c-line)',
        background: on ? 'var(--c-coral)' : 'var(--c-white)',
        color: '#fff',
        transition: 'all .15s',
      }}
    >
      {on && <Check size={12} strokeWidth={3.5} />}
    </span>
  )
}

/** One selectable option row: shared frame for packs and first-session tracks. */
function OptionTile({
  selected,
  onSelect,
  name,
  children,
}: {
  selected: boolean
  onSelect: () => void
  name: string
  children: React.ReactNode
}) {
  return (
    <label
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
        name={name}
        checked={selected}
        onChange={onSelect}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      <SelectDot on={selected} />
      {children}
    </label>
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

/* ── Option rows ─────────────────────────────────────────────────────── */

function PackRow({ pack }: { pack: BuyablePack }) {
  return (
    <>
      <span style={{ width: 42, textAlign: 'center', flexShrink: 0 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, lineHeight: 1, color: 'var(--c-charcoal)' }}>
          {pack.sessions}
        </span>
        <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: 0.4, color: 'var(--c-gray)', textTransform: 'uppercase' }}>
          {pack.sessions === 1 ? 'session' : 'sessions'}
        </span>
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, color: 'var(--c-charcoal)' }}>
          {inr(pack.perSession)} <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--c-gray-d)' }}>/ session</span>
        </span>
        <span style={{ display: 'block', fontSize: 11.5, color: 'var(--c-gray)', marginTop: 2 }}>
          {inr(pack.total)} total · valid {pack.months} {pack.months === 1 ? 'month' : 'months'}
        </span>
      </span>
    </>
  )
}

function CalmPlusRow({ pack }: { pack: (typeof calmPlusPacks)[number] }) {
  const perMonth = Math.floor(pack.total / pack.months)
  return (
    <>
      <span style={{ width: 42, textAlign: 'center', flexShrink: 0 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, lineHeight: 1, color: 'var(--c-charcoal)' }}>
          {pack.months}
        </span>
        <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: 0.4, color: 'var(--c-gray)', textTransform: 'uppercase' }}>
          {pack.months === 1 ? 'month' : 'months'}
        </span>
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, color: 'var(--c-charcoal)' }}>
          {inr(perMonth)} <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--c-gray-d)' }}>/ month</span>
        </span>
        <span style={{ display: 'block', fontSize: 11.5, color: 'var(--c-gray)', marginTop: 2 }}>
          {inr(pack.total)} total · billed once
        </span>
      </span>
    </>
  )
}

/* ── One package card per track ──────────────────────────────────────── */

function TrackCard({
  tab,
  sessionsRemaining,
  hasPartner,
}: {
  tab: PanelTab
  sessionsRemaining: number
  hasPartner: boolean
}) {
  const router = useRouter()
  const isCalmPlus = tab === 'calmplus'
  const packs = isCalmPlus ? [] : packsFor(tab)
  const count = isCalmPlus ? calmPlusPacks.length : packs.length

  const [selected, setSelected] = useState(count - 1)
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [partner, setPartner] = useState<Partner>(EMPTY_PARTNER)

  const pack = packs[selected]
  const appPack = calmPlusPacks[selected]
  const needsPartner = tab === 'couples' && !hasPartner

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
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>{TAB_SUB[tab]}</p>

      {/* What's included */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--c-line)' }}>
        {INCLUDED[tab].map((f) => (
          <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--c-green)', flexShrink: 0, lineHeight: '17px' }}>
              <Check size={13} strokeWidth={3} />
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--c-gray-d)', lineHeight: 1.45 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Options */}
      <div className="stack" style={{ gap: 8, flex: 1 }}>
        {(isCalmPlus ? calmPlusPacks : packs).map((_, i) => (
          <div key={i} style={{ position: 'relative' }}>
            {i === count - 1 && (
              <span style={{ position: 'absolute', top: -8, right: 14, zIndex: 1 }}>
                <BestValue />
              </span>
            )}
            <OptionTile name={`pack-${tab}`} selected={selected === i} onSelect={() => setSelected(i)}>
              {isCalmPlus ? <CalmPlusRow pack={calmPlusPacks[i]} /> : <PackRow pack={packs[i]} />}
            </OptionTile>
          </div>
        ))}
      </div>

      {needsPartner && <PartnerFields partner={partner} onChange={setPartner} />}

      {error && <p style={{ color: 'var(--c-coral)', fontSize: 13, marginTop: 12 }}>{error}</p>}

      <button
        className="btn btn-primary"
        onClick={handleBuy}
        disabled={pending}
        style={{ marginTop: 16, width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
      >
        {pending
          ? 'Processing…'
          : isCalmPlus
            ? `Get Calm+ · ${appPack.label.toLowerCase()} · ${inr(appPack.total)}`
            : `Buy ${pack.sessions} ${pack.sessions === 1 ? 'session' : 'sessions'} · ${inr(pack.total)}`}
      </button>
      <p className="muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 9 }}>
        {FOOTNOTE[tab]}
      </p>
    </div>
  )
}

/**
 * In-app package purchase: one card per package type (therapy, psychiatry,
 * couples, Calm+), each with what it includes and its own options. Buying ADDS
 * sessions to the patient's existing balance and extends validity (never
 * resets); couples packs collect the partner's details when none is on record.
 */
export function BuyPackagePanel({
  sessionsRemaining,
  hasPartner = false,
}: {
  sessionsRemaining: number
  hasPartner?: boolean
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
        gap: 18,
        alignItems: 'stretch',
      }}
    >
      {(['therapy', 'psychiatry', 'couples', 'calmplus'] as const).map((t) => (
        <TrackCard key={t} tab={t} sessionsRemaining={sessionsRemaining} hasPartner={hasPartner} />
      ))}
    </div>
  )
}

/* ── First session ───────────────────────────────────────────────────── */

/**
 * The only purchase offered before a patient has completed their first session:
 * one session at the fixed intro price for their track (999 therapy, 1199
 * psychiatry, 1499 couples). Packages appear once the first session is done.
 */
export function FirstSessionPanel({ hasPartner = false }: { hasPartner?: boolean }) {
  const router = useRouter()
  const [track, setTrack] = useState<BuyableTrack>('therapy')
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [partner, setPartner] = useState<Partner>(EMPTY_PARTNER)

  const needsPartner = track === 'couples' && !hasPartner
  const price = FIRST_SESSION[track]

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
        {(['therapy', 'psychiatry', 'couples'] as const).map((t) => (
          <OptionTile key={t} name="first-track" selected={track === t} onSelect={() => setTrack(t)}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: 'var(--c-charcoal)' }}>
                {TAB_LABEL[t]}
              </span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--c-gray)', marginTop: 2 }}>
                {TAB_SUB[t]}
              </span>
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--c-charcoal)', flexShrink: 0 }}>
              {inr(FIRST_SESSION[t])}
            </span>
          </OptionTile>
        ))}
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
