import Link from 'next/link'
import { redirect } from 'next/navigation'
import { IndianRupee, TrendingUp, CreditCard, Wallet } from 'lucide-react'
import { getAdminSession, getMoneyOverview } from '@/lib/admin'

export const dynamic = 'force-dynamic'

const charcoal = '#1C2B3A'
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default async function AdminMoneyPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const m = await getMoneyOverview()

  const cards = [
    { label: 'Revenue this month', value: inr(m.revenueThisMonth), icon: <TrendingUp size={18} /> },
    { label: 'Revenue all time', value: inr(m.revenueAllTime), icon: <IndianRupee size={18} /> },
    { label: 'Completed sessions', value: String(m.completedSessions), icon: <CreditCard size={18} /> },
    { label: 'Active subscriptions', value: String(m.activeSubscriptions), icon: <Wallet size={18} /> },
  ]

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Money</div>
        <div className="page-meta">Revenue from completed sessions and per-clinician payouts owed to part-time clinicians</div>
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

      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Part-time payouts</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
          Computed from the pay structure — a session counts once its clinical note is written. Salaried (full-time) clinicians aren&apos;t shown.
        </p>
        {m.payouts.length === 0 && <p className="muted">No part-time clinicians with earnings yet.</p>}
        {m.payouts.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--c-line)' }}>
                <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>Clinician</th>
                <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>Sessions</th>
                <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>This month</th>
                <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>Total earned</th>
              </tr>
            </thead>
            <tbody>
              {m.payouts.map((p) => (
                <tr key={p.profileId} style={{ borderBottom: '1px solid var(--c-line)' }}>
                  <td style={{ padding: '10px 4px' }}>
                    <Link href={`/admin/therapists/${p.profileId}`} style={{ color: charcoal, fontWeight: 600, textDecoration: 'none' }}>{p.name}</Link>
                  </td>
                  <td style={{ padding: '10px 4px' }}>{p.sessions}</td>
                  <td style={{ padding: '10px 4px' }}>{inr(p.thisMonth)}</td>
                  <td style={{ padding: '10px 4px', fontWeight: 700 }}>{inr(p.totalEarned)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
