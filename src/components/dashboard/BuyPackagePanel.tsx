'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { packsFor, inr, FIRST_SESSION, type BuyableTrack, type BuyablePack } from '@/data/pricing'
import { buyPackage, buyFirstSession } from '@/app/(dashboard)/app/actions'

const TRACK_LABEL: Record<BuyableTrack, string> = {
  therapy: 'Therapy',
  psychiatry: 'Psychiatry',
  couples: 'Couples',
}

const TRACK_SUB: Record<BuyableTrack, string> = {
  therapy: '50 min with an RCI-verified psychologist',
  psychiatry: 'Evaluation with an NMC-registered psychiatrist',
  couples: '50 min for you and your partner, together',
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

/** Segmented track switcher, matching the public pricing selector. */
function TrackTabs({ track, onChange }: { track: BuyableTrack; onChange: (t: BuyableTrack) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#F4EEE9', padding: 4, borderRadius: 12, marginBottom: 16 }}>
      {(['therapy', 'psychiatry', 'couples'] as const).map((t) => {
        const active = track === t
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              flex: 1,
              padding: '9px 4px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: 'inherit',
              background: active ? 'var(--c-white)' : 'transparent',
              color: active ? 'var(--c-coral)' : 'var(--c-gray)',
              boxShadow: active ? '0 1px 4px rgba(28,43,58,.12)' : 'none',
              transition: 'all .15s',
            }}
          >
            {TRACK_LABEL[t]}
          </button>
        )
      })}
    </div>
  )
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
        gap: 14,
        padding: '14px 16px',
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

/** Small savings / best-value pills. */
function Pill({ text, tone }: { text: string; tone: 'green' | 'gold' }) {
  const c = tone === 'green'
    ? { color: 'var(--c-green)', bg: 'var(--c-green-pale)' }
    : { color: 'var(--c-gold)', bg: 'var(--c-gold-pale)' }
  return (
    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.3, color: c.color, background: c.bg, padding: '3px 9px', borderRadius: 50, whiteSpace: 'nowrap' }}>
      {text}
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

/* ── Package purchase ────────────────────────────────────────────────── */

function PackRow({ pack, base }: { pack: BuyablePack; base: number }) {
  const save = Math.round((1 - pack.perSession / base) * 100)
  return (
    <>
      {/* Session count as the anchor of the row */}
      <span style={{ width: 44, textAlign: 'center', flexShrink: 0 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1, color: 'var(--c-charcoal)' }}>
          {pack.sessions}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4, color: 'var(--c-gray)', textTransform: 'uppercase' }}>
          {pack.sessions === 1 ? 'session' : 'sessions'}
        </span>
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: 'var(--c-charcoal)' }}>
          {inr(pack.perSession)} <span style={{ fontWeight: 500, fontSize: 12.5, color: 'var(--c-gray-d)' }}>/ session</span>
        </span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--c-gray)', marginTop: 2 }}>
          {inr(pack.total)} total · valid {pack.months} {pack.months === 1 ? 'month' : 'months'}
        </span>
      </span>

      <span style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
        {save > 0 && <Pill text={`Save ${save}%`} tone="green" />}
      </span>
    </>
  )
}

/**
 * In-app package purchase. Buying ADDS sessions to the patient's existing balance
 * and extends validity (never resets), handled server-side in lib/billing. Couples
 * packs collect the partner's details when none is on record yet.
 */
export function BuyPackagePanel({
  defaultTrack = 'therapy',
  sessionsRemaining,
  hasPartner = false,
}: {
  defaultTrack?: BuyableTrack
  sessionsRemaining: number
  hasPartner?: boolean
}) {
  const router = useRouter()
  const [track, setTrack] = useState<BuyableTrack>(defaultTrack)
  const [selected, setSelected] = useState(0)
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState<{ total: number; remaining: number } | null>(null)
  const [error, setError] = useState('')
  const [partner, setPartner] = useState<Partner>(EMPTY_PARTNER)

  const packs = packsFor(track)
  const pack = packs[selected]
  const base = packs[0].perSession // single-session price anchors the savings
  const bestValueIndex = packs.length - 1
  const needsPartner = track === 'couples' && !hasPartner

  function handleBuy() {
    setError('')
    if (needsPartner && !partner.name.trim()) {
      setError('Please add your partner’s name to continue.')
      return
    }
    startTransition(async () => {
      const res = await buyPackage(track, selected, needsPartner ? partner : undefined)
      if (res.ok && res.persisted) {
        setDone({ total: pack.sessions, remaining: sessionsRemaining + pack.sessions })
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
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
        <div className="section-title">Package added</div>
        <p className="muted" style={{ marginTop: 8 }}>
          {done.total} sessions added to your balance. You now have <strong>{done.remaining}</strong> sessions
          remaining, your earlier sessions were kept, not reset.
        </p>
        <button className="btn btn-outline btn-sm" style={{ marginTop: 14 }} onClick={() => setDone(null)}>
          Buy another
        </button>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Buy a package</div>
      <p className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
        {TRACK_SUB[track]}. New sessions stack on your current balance, nothing resets.
      </p>

      <TrackTabs track={track} onChange={(t) => { setTrack(t); setSelected(0) }} />

      <div className="stack" style={{ gap: 8 }}>
        {packs.map((p, i) => (
          <div key={i} style={{ position: 'relative' }}>
            {i === bestValueIndex && packs.length > 1 && (
              <span style={{ position: 'absolute', top: -8, right: 14, zIndex: 1 }}>
                <Pill text="Best value" tone="gold" />
              </span>
            )}
            <OptionTile name="pack" selected={selected === i} onSelect={() => setSelected(i)}>
              <PackRow pack={p} base={base} />
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
        style={{ marginTop: 18, width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14.5 }}
      >
        {pending ? 'Processing…' : `Continue · ${pack.sessions} ${pack.sessions === 1 ? 'session' : 'sessions'} for ${inr(pack.total)}`}
      </button>
      <p className="muted" style={{ fontSize: 11.5, textAlign: 'center', marginTop: 10 }}>
        Unused sessions are refundable · validity extends on every purchase
      </p>
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
          Head to Sessions to pick a time with your {TRACK_LABEL[track].toLowerCase()} specialist.
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
                {TRACK_LABEL[t]}
              </span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--c-gray)', marginTop: 2 }}>
                {TRACK_SUB[t]}
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
