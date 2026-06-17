import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { getTherapistContext, getRiskNotifications } from '@/lib/expert'
import { resolveAlert } from '../actions'

export default async function RiskNotificationsPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const notifications = await getRiskNotifications(ctx.therapistProfileId)

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Risk notifications</div>
        <div className="page-meta">{notifications.length} active</div>
      </div>

      <div className="card">
        {notifications.length === 0 && <p className="muted">Nothing flagged right now.</p>}
        {notifications.map((n) => (
          <div key={n.id} className="pattern">
            <span className={`pattern-ic ${n.kind === 'crisis' ? 't-coral' : 't-gold'}`}>
              {n.kind === 'crisis' ? <AlertTriangle size={16} /> : <TrendingDown size={16} />}
            </span>
            <div style={{ flex: 1 }}>
              <div className="pattern-title">
                <Link href={`/expert/patients/${n.patientId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {n.patientName}
                </Link>
                {' — '}
                {n.message}
              </div>
              <div className="pattern-sub">{n.detail}</div>
              <div className="pattern-sub">{n.createdAt.toLocaleString('en-IN')}</div>
            </div>
            {n.kind === 'crisis' && (
              <form action={resolveAlert}>
                <input type="hidden" name="alertId" value={n.id} />
                <button type="submit" className="btn btn-outline btn-sm">
                  Mark resolved
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
