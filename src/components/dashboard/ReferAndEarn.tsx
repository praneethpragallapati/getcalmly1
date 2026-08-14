'use client'

import { useState } from 'react'
import { Gift, Copy, Check, Wallet, Ticket } from 'lucide-react'
import type { PatientReferralView } from '@/lib/referral'

export function ReferAndEarn({ data }: { data: PatientReferralView }) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const copy = async (text: string, which: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(null), 1600)
    } catch { /* clipboard unavailable */ }
  }

  if (!data.enabled) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <Gift size={22} style={{ color: 'var(--c-gray-d)' }} />
        <div className="section-title" style={{ margin: '10px 0 6px' }}>Referrals aren’t open yet</div>
        <p className="muted">Check back soon — we’re putting together a way to reward you for sharing getCalmly.</p>
      </div>
    )
  }

  const shareText = data.link ? `I’ve been using getCalmly for my mental health — join with my link and get ₹${data.refereeDiscount} off your first package: ${data.link}` : ''

  return (
    <div className="stack">
      {/* Hero */}
      <div className="card" style={{ background: 'radial-gradient(ellipse 70% 90% at 90% 0%, rgba(26,127,122,.14), transparent 60%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Gift size={20} style={{ color: 'var(--c-green, #1A7F7A)' }} />
          <div className="section-title" style={{ margin: 0 }}>Refer &amp; earn</div>
        </div>
        <p className="muted" style={{ maxWidth: 560, marginBottom: 18 }}>
          Share getCalmly with someone who could use support. When they buy their first package, <strong style={{ color: 'var(--c-charcoal)' }}>you get {data.referrerRewardLabel}</strong>
          {data.refereeDiscount > 0 ? <> and <strong style={{ color: 'var(--c-charcoal)' }}>they get ₹{data.refereeDiscount.toLocaleString('en-IN')} off</strong></> : null}.
        </p>

        {/* Code + link */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'stretch' }}>
          <div style={{ flex: '1 1 200px' }}>
            <div className="lbl" style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--c-gray-d)', marginBottom: 6 }}>Your code</div>
            <button onClick={() => data.code && copy(data.code, 'code')} disabled={!data.code}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '12px 14px', border: '1.5px solid var(--c-line)', borderRadius: 10, background: 'var(--c-surface, #fff)', cursor: 'pointer', fontFamily: 'inherit' }}>
              <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 800, fontSize: 20, letterSpacing: 2, color: 'var(--c-charcoal)' }}>{data.code ?? '—'}</span>
              {copied === 'code' ? <Check size={16} style={{ color: 'var(--c-green)' }} /> : <Copy size={16} style={{ color: 'var(--c-gray-d)' }} />}
            </button>
          </div>
          <div style={{ flex: '2 1 300px' }}>
            <div className="lbl" style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--c-gray-d)', marginBottom: 6 }}>Your link</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0, padding: '12px 14px', border: '1.5px solid var(--c-line)', borderRadius: 10, background: 'var(--c-surface, #fff)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13.5, color: 'var(--c-gray-d)' }}>{data.link ?? '—'}</div>
              <button onClick={() => data.link && copy(data.link, 'link')} disabled={!data.link} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                {copied === 'link' ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy link</>}
              </button>
            </div>
          </div>
        </div>

        {shareText && typeof navigator !== 'undefined' && 'share' in navigator && (
          <button onClick={() => navigator.share?.({ text: shareText }).catch(() => {})} className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
            Share…
          </button>
        )}
      </div>

      {/* Balances */}
      <div className="grid-2">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(26,127,122,.1)', color: 'var(--c-green, #1A7F7A)' }}><Wallet size={20} /></span>
          <div>
            <div className="section-title" style={{ margin: 0 }}>₹{data.walletCreditRupees.toLocaleString('en-IN')}</div>
            <div className="muted" style={{ fontSize: 13 }}>wallet credit · applied at your next checkout</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(201,151,58,.14)', color: '#B07D2B' }}><Ticket size={20} /></span>
          <div>
            <div className="section-title" style={{ margin: 0 }}>{data.bonusSessions}</div>
            <div className="muted" style={{ fontSize: 13 }}>bonus session{data.bonusSessions === 1 ? '' : 's'} · added to your next package</div>
          </div>
        </div>
      </div>

      {/* Invites */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="section-title">Your invites</div>
          <span className="muted" style={{ fontSize: 12 }}>{data.invitedCount} joined · {data.rewardedCount} rewarded</span>
        </div>
        {data.invites.length === 0 ? (
          <p className="muted" style={{ marginTop: 12 }}>No one has joined with your link yet. Share it to get started.</p>
        ) : (
          <div style={{ marginTop: 8 }}>
            {data.invites.map((inv, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderTop: '1px solid rgba(28,43,58,.06)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-charcoal)' }}>{inv.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>joined {inv.joinedLabel}</div>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: inv.status === 'Rewarded' ? '#2C7A57' : inv.status === 'Purchased' ? '#3E6E9C' : inv.status === 'Reversed' ? '#C0504B' : '#6B7D8E', background: 'rgba(28,43,58,.05)', padding: '3px 10px', borderRadius: 20 }}>{inv.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
