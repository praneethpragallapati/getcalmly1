import { redirect } from 'next/navigation'
import { Lock } from 'lucide-react'
import { getTherapistContext, getTherapistEarnings } from '@/lib/expert'
import { EarningsView } from '@/components/expert/EarningsView'

export const metadata = { title: 'Earnings · Expert portal', robots: { index: false, follow: false } }

export default async function EarningsPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  // Earnings apply to part-time (per-session) clinicians only. Full-time
  // clinicians are salaried, so instead of the per-session ledger they see the
  // compensation fields the admin has defined for them.
  if (ctx.employmentType !== 'PART_TIME') {
    const fields = ctx.compensationFields
    return (
      <div className="stack">
        <div className="page-head">
          <div className="page-title">Earnings</div>
          <div className="page-meta">Full-time (salaried) engagement</div>
        </div>
        {fields.length > 0 ? (
          <div className="card" style={{ maxWidth: 620 }}>
            <div className="section-title" style={{ marginBottom: 4 }}>Your compensation</div>
            <p className="muted" style={{ fontSize: 12.5, marginBottom: 16 }}>
              Details set by the GetCalmly admin team for your full-time engagement.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {fields.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(28,43,58,.08)' }}>
                  <span style={{ fontSize: 13.5, color: '#5A6B7A', fontWeight: 600 }}>{f.label}</span>
                  <span style={{ fontSize: 14, color: '#1C2B3A', fontWeight: 700, textAlign: 'right' }}>{f.value || <span className="muted" style={{ fontWeight: 400 }}>—</span>}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: 560, margin: '0 auto' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(28,43,58,.06)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Lock size={22} style={{ color: '#8E9EAE' }} />
            </div>
            <div className="section-title" style={{ marginBottom: 8 }}>Salaried engagement</div>
            <p className="muted" style={{ lineHeight: 1.65 }}>
              You&apos;re on a full-time (salaried) engagement, so per-session payouts don&apos;t apply.
              Your compensation details will appear here once the GetCalmly admin team adds them.
            </p>
          </div>
        )}
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
