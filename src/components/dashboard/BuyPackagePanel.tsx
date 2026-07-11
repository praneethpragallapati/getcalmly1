'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { packsFor, inr, FIRST_SESSION, type BuyableTrack } from '@/data/pricing'
import { buyPackage, buyFirstSession } from '@/app/(dashboard)/app/actions'

const TRACK_LABEL: Record<BuyableTrack, string> = {
  therapy: 'Therapy',
  psychiatry: 'Psychiatry',
  couples: 'Couples',
}

type Partner = { name: string; phone: string; email: string }
const EMPTY_PARTNER: Partner = { name: '', phone: '', email: '' }

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid var(--c-border, #E2E8F0)',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
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
    <div style={{ background: 'var(--c-cream, #FFF8F5)', border: '1px solid var(--c-border, #E2E8F0)', borderRadius: 12, padding: '14px 16px', marginTop: 12 }}>
      <div className="section-title" style={{ fontSize: 13 }}>Your partner&apos;s details</div>
      <p className="muted" style={{ fontSize: 12.5, margin: '6px 0 10px' }}>
        Couples sessions include both of you, so we need your partner&apos;s contact details to
        set up their access and reminders.
      </p>
      <div className="stack" style={{ gap: 8 }}>
        <input
          placeholder="Partner's full name"
          value={partner.name}
          onChange={(e) => onChange({ ...partner, name: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Partner's phone"
          type="tel"
          value={partner.phone}
          onChange={(e) => onChange({ ...partner, phone: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Partner's email"
          type="email"
          value={partner.email}
          onChange={(e) => onChange({ ...partner, email: e.target.value })}
          style={inputStyle}
        />
      </div>
    </div>
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
      <p className="muted" style={{ marginBottom: 14 }}>
        New sessions are added to your current balance and your validity is extended. Nothing resets to zero.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {(['therapy', 'psychiatry', 'couples'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTrack(t); setSelected(0) }}
            className={`btn btn-sm ${track === t ? 'btn-primary' : 'btn-outline'}`}
          >
            {TRACK_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {packs.map((p, i) => (
          <label
            key={i}
            className="pattern"
            style={{
              cursor: 'pointer',
              border: `1.5px solid ${selected === i ? 'var(--c-coral)' : 'var(--c-border, #E2E8F0)'}`,
              borderRadius: 12,
            }}
          >
            <input
              type="radio"
              name="pack"
              checked={selected === i}
              onChange={() => setSelected(i)}
              style={{ marginRight: 4 }}
            />
            <div style={{ flex: 1 }}>
              <div className="pattern-title">
                {p.sessions} {p.sessions === 1 ? 'session' : 'sessions'} · {inr(p.total)}
              </div>
              <div className="pattern-sub">
                {inr(p.perSession)} / session · valid {p.months} {p.months === 1 ? 'month' : 'months'}
              </div>
            </div>
          </label>
        ))}
      </div>

      {needsPartner && <PartnerFields partner={partner} onChange={setPartner} />}

      {error && <p style={{ color: 'var(--c-coral)', fontSize: 13, marginTop: 12 }}>{error}</p>}

      <button className="btn btn-primary" onClick={handleBuy} disabled={pending} style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
        <Check size={16} /> {pending ? 'Processing…' : `Buy ${pack.sessions}-session pack · ${inr(pack.total)}`}
      </button>
    </div>
  )
}

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
      <p className="muted" style={{ marginBottom: 14 }}>
        One session, one flat price. Session packages unlock after your first session.
      </p>

      <div className="stack" style={{ gap: 10 }}>
        {(['therapy', 'psychiatry', 'couples'] as const).map((t) => (
          <label
            key={t}
            className="pattern"
            style={{
              cursor: 'pointer',
              border: `1.5px solid ${track === t ? 'var(--c-coral)' : 'var(--c-border, #E2E8F0)'}`,
              borderRadius: 12,
            }}
          >
            <input
              type="radio"
              name="first-track"
              checked={track === t}
              onChange={() => setTrack(t)}
              style={{ marginRight: 4 }}
            />
            <div style={{ flex: 1 }}>
              <div className="pattern-title">
                {TRACK_LABEL[t]} · {inr(FIRST_SESSION[t])}
              </div>
              <div className="pattern-sub">Your first 50-minute session</div>
            </div>
          </label>
        ))}
      </div>

      {needsPartner && <PartnerFields partner={partner} onChange={setPartner} />}

      {error && <p style={{ color: 'var(--c-coral)', fontSize: 13, marginTop: 12 }}>{error}</p>}

      <button className="btn btn-primary" onClick={handleBuy} disabled={pending} style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
        <Check size={16} /> {pending ? 'Processing…' : `Book first session · ${inr(price)}`}
      </button>
    </div>
  )
}
