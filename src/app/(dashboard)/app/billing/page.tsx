import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAccount } from '@/lib/account'
import { getSessionUserId } from '@/lib/patient'
import { hasPartnerOnRecord } from '@/lib/billing'
import { BuyPackagePanel, FirstSessionPanel } from '@/components/dashboard/BuyPackagePanel'

export default async function BillingPage() {
  const [{ plan }, userId] = await Promise.all([getAccount(), getSessionUserId()])
  const hasPartner = userId ? await hasPartnerOnRecord(userId) : false
  const sessionsRemaining = Math.max(0, plan.sessionsTotal - plan.sessionsUsed)
  const expired = plan.sessionsTotal > 0 && sessionsRemaining === 0

  // Packages stay hidden until the first session is behind them; before that a
  // new patient only ever sees the flat first-session offer.
  const firstSessionDone = plan.sessionsUsed >= 1
  const firstSessionWaiting = !firstSessionDone && plan.sessionsTotal > 0

  return (
    <>
      <div className="page-head">
        <div>
          <Link
            href="/app/settings"
            className="muted"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> Back to settings
          </Link>
          <h1 className="page-title" style={{ marginTop: 6 }}>
            {firstSessionDone ? 'Buy a package' : 'Book your first session'}
          </h1>
        </div>
        <span className="page-meta">{sessionsRemaining} sessions remaining</span>
      </div>

      <div className="stack" style={{ maxWidth: firstSessionDone ? 1200 : 560 }}>
        {firstSessionDone ? (
          <>
            <div className="card">
              <div className="section-title">Your current balance</div>
              <p className="muted" style={{ marginTop: 8 }}>
                {plan.planName} · {plan.sessionsUsed}/{plan.sessionsTotal} sessions used
                {expired ? ' · expired' : ''}
              </p>
              {expired && (
                <p className="muted" style={{ marginTop: 6 }}>
                  Your package has run out. Buying a new one renews your plan, any sessions you add stack on top.
                </p>
              )}
            </div>
            <BuyPackagePanel sessionsRemaining={sessionsRemaining} hasPartner={hasPartner} />
          </>
        ) : firstSessionWaiting ? (
          <div className="card">
            <div className="section-title">Your first session is booked in</div>
            <p className="muted" style={{ marginTop: 8 }}>
              {plan.planName} · head to Sessions to schedule it. Session packages unlock here once
              your first session is done.
            </p>
            <Link href="/app/sessions" className="btn btn-primary" style={{ marginTop: 14 }}>
              Go to Sessions
            </Link>
          </div>
        ) : (
          <FirstSessionPanel hasPartner={hasPartner} />
        )}
      </div>
    </>
  )
}
