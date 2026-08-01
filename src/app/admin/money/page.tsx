import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TrendingUp, CreditCard, Wallet, HandCoins } from 'lucide-react'
import { getAdminSession, getMoneyOverview, getMasterPayout } from '@/lib/admin'
import { expertCode } from '@/lib/ids'
import { MasterPayoutView } from '@/components/admin/MasterPayoutView'

export const dynamic = 'force-dynamic'

const charcoal = '#1C2B3A'
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default async function AdminMoneyPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [m, masterPayout] = await Promise.all([getMoneyOverview(), getMasterPayout()])

  // Payouts owed = part-time clinicians' earnings (full-timers are salaried).
  const partTime = m.payouts.filter((p) => p.employmentType === 'PART_TIME')
  const payoutOwedMonth = partTime.reduce((s, p) => s + p.thisMonth, 0)
  const payoutOwedTotal = partTime.reduce((s, p) => s + p.totalEarned, 0)

  const cards = [
    { label: 'Payouts owed this month', value: inr(payoutOwedMonth), icon: <HandCoins size={18} /> },
    { label: 'Payouts owed all time', value: inr(payoutOwedTotal), icon: <Wallet size={18} /> },
    { label: 'Completed sessions', value: String(m.completedSessions), icon: <CreditCard size={18} /> },
    { label: 'Revenue this month', value: inr(m.revenueThisMonth), icon: <TrendingUp size={18} /> },
  ]

  return (
    <div className="stack">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Therapist payout</div>
          <div className="page-meta">What every clinician is owed, at the day / month / year grain, broken down by session type and bonuses. Open one for their full statement, or download the master payout. Package sales live on the Revenue page.</div>
        </div>
        <Link href="/admin/revenue" className="btn" style={{ border: '1.5px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={15} /> Revenue &amp; package sales
        </Link>
      </div>

      <div className="grid-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <span style={{ color: 'var(--c-coral)' }}>{c.icon}</span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26, marginTop: 8 }}>{c.value}</div>
            <div className="muted">{c.label}</div>
          </div>
        ))}
      </div>

      <MasterPayoutView data={masterPayout} />

      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Clinician earnings</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
          Every clinician&apos;s earnings, computed from their own pay structure — a session counts once its clinical note is written.
          Open one for the day / week / month grain and downloadable statements. Full-time clinicians are salaried; the figures still show what their sessions would earn.
        </p>
        {m.payouts.length === 0 && <p className="muted">No clinicians with earnings yet.</p>}
        {m.payouts.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--c-line)' }}>
                  <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>Clinician</th>
                  <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>Engagement</th>
                  <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>Sessions</th>
                  <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>This month</th>
                  <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>Total earned</th>
                  <th style={{ padding: '8px 4px' }}></th>
                </tr>
              </thead>
              <tbody>
                {m.payouts.map((p) => (
                  <tr key={p.profileId} style={{ borderBottom: '1px solid var(--c-line)' }}>
                    <td style={{ padding: '10px 4px' }}>
                      <Link href={`/admin/money/${p.profileId}`} style={{ color: charcoal, fontWeight: 600, textDecoration: 'none' }}>{p.name}</Link>
                      <span style={{ marginLeft: 8, fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#6D5BD0' }}>{expertCode(p.profileId)}</span>
                    </td>
                    <td style={{ padding: '10px 4px', fontSize: 12.5, color: 'var(--c-gray-d)' }}>{p.employmentType === 'PART_TIME' ? 'Part-time' : 'Full-time'}</td>
                    <td style={{ padding: '10px 4px' }}>{p.sessions}</td>
                    <td style={{ padding: '10px 4px' }}>{inr(p.thisMonth)}</td>
                    <td style={{ padding: '10px 4px', fontWeight: 700 }}>{inr(p.totalEarned)}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                      <Link href={`/admin/money/${p.profileId}`} className="link-action">Open →</Link>
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
