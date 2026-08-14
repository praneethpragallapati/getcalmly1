'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, Check, AlertTriangle } from 'lucide-react'
import { saveReferralConfig, revokeReferralReward } from '@/app/admin/actions'
import type { ReferralConfigValues, ReferrerRewardKind, AdminReferralRow } from '@/lib/referral'

const charcoal = '#1C2B3A'
const purple = '#6D5BD0'

const STATUS_COLOR: Record<string, string> = {
  Joined: '#6B7D8E', Purchased: '#3E6E9C', Rewarded: '#2C7A57', Reversed: '#C0504B',
}

export function ReferralAdmin({ config, referrals }: { config: ReferralConfigValues; referrals: AdminReferralRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [enabled, setEnabled] = useState(config.enabled)
  const [kind, setKind] = useState<ReferrerRewardKind>(config.referrerRewardKind)
  const [value, setValue] = useState(String(config.referrerRewardValue))
  const [discount, setDiscount] = useState(String(config.refereeDiscount))
  const [clawback, setClawback] = useState(config.clawback)

  const save = () => {
    setSaved(false)
    setError(null)
    startTransition(async () => {
      const res = await saveReferralConfig({
        enabled,
        referrerRewardKind: kind,
        referrerRewardValue: Number(value) || 0,
        refereeDiscount: Number(discount) || 0,
        clawback,
      })
      if (res?.ok) {
        setSaved(true)
        router.refresh()
      } else {
        // A failed save is why the toggle "reverts" on refresh: nothing was
        // persisted, so the page reloads the old (default/off) config. Surface it
        // instead of a false "Saved". The usual cause is the referral tables not
        // existing yet on this database.
        setError(res?.error || 'Could not save. The referral tables may not exist on this database yet — run the pending migration (0026_referrals).')
      }
    })
  }

  const field: React.CSSProperties = {
    border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '9px 11px', fontSize: 14,
    fontFamily: 'inherit', color: charcoal, background: '#fff', width: '100%',
  }
  const label: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: '#5A6B7A', marginBottom: 6, display: 'block' }
  const valueUnit = kind === 'FREE_SESSION' ? 'sessions' : '₹'

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Gift size={22} style={{ color: purple }} /> Referrals
        </div>
        <div className="page-meta">Reward patients for referring friends — set both sides’ benefits, or turn it off entirely</div>
      </div>

      {/* Settings */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Program settings</div>
        <p className="muted" style={{ marginBottom: 16 }}>
          When on, every patient gets a referral link. When a new person they refer buys their first package
          (Individual, Psychiatry or Couples), the referrer gets the reward below and the new person gets a discount.
        </p>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span style={{ fontWeight: 700, color: charcoal }}>Referral program is {enabled ? 'ON' : 'OFF'}</span>
        </label>

        <div className="grid-2" style={{ gap: 18, opacity: enabled ? 1 : 0.55 }}>
          <div>
            <span style={label}>Referrer reward — what the person who refers gets</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <select style={{ ...field, flex: 1 }} value={kind} onChange={(e) => setKind(e.target.value as ReferrerRewardKind)}>
                <option value="WALLET_CREDIT">Wallet credit (₹)</option>
                <option value="FREE_SESSION">Free session(s)</option>
                <option value="NONE">No reward</option>
              </select>
              {kind !== 'NONE' && (
                <div style={{ position: 'relative', width: 130 }}>
                  <input style={{ ...field, textAlign: 'right', paddingRight: kind === 'FREE_SESSION' ? 11 : 26 }}
                    type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
                  {kind === 'WALLET_CREDIT' && <span style={{ position: 'absolute', left: 11, top: 9, color: '#8E9EAE' }}>₹</span>}
                </div>
              )}
            </div>
            <span className="muted" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
              {kind === 'FREE_SESSION' ? 'Added to their most recent package (or next purchase).' :
                kind === 'WALLET_CREDIT' ? 'Added to their wallet, applied at their next checkout.' : 'The referrer earns nothing.'}
            </span>
          </div>

          <div>
            <span style={label}>Referee discount — ₹ off the new person’s first purchase</span>
            <div style={{ position: 'relative', maxWidth: 160 }}>
              <input style={{ ...field, textAlign: 'right' }} type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} />
              <span style={{ position: 'absolute', left: 11, top: 9, color: '#8E9EAE' }}>₹</span>
            </div>
            <span className="muted" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>Set 0 for no referee discount.</span>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 18, opacity: enabled ? 1 : 0.55 }}>
          <input type="checkbox" checked={clawback} onChange={(e) => setClawback(e.target.checked)} />
          <span style={{ fontSize: 13.5, color: charcoal }}>Claw back rewards if the qualifying purchase is refunded/voided</span>
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22 }}>
          <button onClick={save} disabled={pending} className="btn btn-primary" style={{ opacity: pending ? 0.6 : 1 }}>Save settings</button>
          {saved && !pending && !error && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#2C7A57', fontSize: 13.5 }}><Check size={15} /> Saved</span>}
          <span className="muted" style={{ fontSize: 12.5, marginLeft: 'auto' }}>Value in {valueUnit}</span>
        </div>
        {error && !pending && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 14, padding: '11px 13px', background: 'rgba(192,80,75,.08)', border: '1px solid rgba(192,80,75,.25)', borderRadius: 8, color: '#9E3B36', fontSize: 13 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Referrals list */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 22px 6px' }}>
          <div className="section-title">Referrals</div>
          <p className="muted" style={{ fontSize: 12.5 }}>Every referral and where it stands.</p>
        </div>
        {referrals.length === 0 ? (
          <p className="muted" style={{ padding: '4px 22px 22px' }}>No referrals yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560, fontSize: 14 }}>
              <thead>
                <tr>
                  {['Referrer', 'Friend', 'Status', 'Reward', 'Date', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8E9EAE', padding: '10px 22px', borderBottom: '1px solid rgba(28,43,58,.08)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: '12px 22px', borderBottom: '1px solid rgba(28,43,58,.05)', fontWeight: 600, color: charcoal }}>{r.referrer}</td>
                    <td style={{ padding: '12px 22px', borderBottom: '1px solid rgba(28,43,58,.05)', color: charcoal }}>{r.referee}</td>
                    <td style={{ padding: '12px 22px', borderBottom: '1px solid rgba(28,43,58,.05)' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: STATUS_COLOR[r.status] ?? '#6B7D8E', background: `${STATUS_COLOR[r.status] ?? '#6B7D8E'}1a`, padding: '3px 9px', borderRadius: 20 }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '12px 22px', borderBottom: '1px solid rgba(28,43,58,.05)', color: '#5A6B7A' }}>{r.reward}</td>
                    <td style={{ padding: '12px 22px', borderBottom: '1px solid rgba(28,43,58,.05)', color: '#8E9EAE' }}>{r.date}</td>
                    <td style={{ padding: '12px 22px', borderBottom: '1px solid rgba(28,43,58,.05)', textAlign: 'right' }}>
                      {r.status === 'Rewarded' && (
                        <button
                          onClick={() => startTransition(async () => { await revokeReferralReward({ id: r.id }); router.refresh() })}
                          disabled={pending}
                          className="link-action"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0504B', fontSize: 12.5 }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
