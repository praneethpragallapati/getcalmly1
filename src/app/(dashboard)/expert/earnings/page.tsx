import { redirect } from 'next/navigation'
import { Lock } from 'lucide-react'
import { getTherapistContext, getTherapistEarnings } from '@/lib/expert'
import { EarningsView } from '@/components/expert/EarningsView'

export const metadata = { title: 'Earnings · Expert portal', robots: { index: false, follow: false } }

export default async function EarningsPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  // Earnings apply to part-time (per-session) clinicians only. Full-time
  // clinicians are salaried, so the ledger is not relevant to them.
  if (ctx.employmentType !== 'PART_TIME') {
    return (
      <div className="stack">
        <div className="page-head">
          <div className="page-title">Earnings</div>
          <div className="page-meta">Per-session payouts</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(28,43,58,.06)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Lock size={22} style={{ color: '#8E9EAE' }} />
          </div>
          <div className="section-title" style={{ marginBottom: 8 }}>Not applicable to your role</div>
          <p className="muted" style={{ lineHeight: 1.65 }}>
            The earnings ledger is for part-time clinicians paid per session. You&apos;re on a
            full-time (salaried) engagement, so per-session payouts don&apos;t apply. If this looks
            wrong, your engagement type is managed by the GetCalmly admin team.
          </p>
        </div>
      </div>
    )
  }

  const earnings = await getTherapistEarnings(ctx.therapistProfileId)

  return (
    <EarningsView
      earnings={earnings}
      clinicianName={ctx.therapistName ?? 'Doctor'}
      designation={ctx.designation}
    />
  )
}
