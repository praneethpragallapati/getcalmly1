'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { packsFor, inr, type BuyableTrack } from '@/data/pricing'
import { buyPackage } from '@/app/(dashboard)/app/actions'

/**
 * In-app package purchase. Buying ADDS sessions to the patient's existing balance
 * and extends validity (never resets) — handled server-side in lib/billing. Shows
 * a confirmation with the new balance afterwards.
 */
export function BuyPackagePanel({
  defaultTrack = 'therapy',
  sessionsRemaining,
}: {
  defaultTrack?: BuyableTrack
  sessionsRemaining: number
}) {
  const router = useRouter()
  const [track, setTrack] = useState<BuyableTrack>(defaultTrack)
  const [selected, setSelected] = useState(0)
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState<{ total: number; remaining: number } | null>(null)
  const [error, setError] = useState('')

  const packs = packsFor(track)
  const pack = packs[selected]

  function handleBuy() {
    setError('')
    startTransition(async () => {
      const res = await buyPackage(track, selected)
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
          remaining — your earlier sessions were kept, not reset.
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
        {(['therapy', 'psychiatry'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTrack(t); setSelected(0) }}
            className={`btn btn-sm ${track === t ? 'btn-primary' : 'btn-outline'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {t}
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

      {error && <p style={{ color: 'var(--c-coral)', fontSize: 13, marginTop: 12 }}>{error}</p>}

      <button className="btn btn-primary" onClick={handleBuy} disabled={pending} style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
        <Check size={16} /> {pending ? 'Processing…' : `Buy ${pack.sessions}-session pack · ${inr(pack.total)}`}
      </button>
    </div>
  )
}
