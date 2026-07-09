import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAccount } from '@/lib/account'
import { BuyPackagePanel } from '@/components/dashboard/BuyPackagePanel'

export default async function BillingPage() {
  const { plan } = await getAccount()
  const sessionsRemaining = Math.max(0, plan.sessionsTotal - plan.sessionsUsed)
  const expired = plan.sessionsTotal > 0 && sessionsRemaining === 0

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
          <h1 className="page-title" style={{ marginTop: 6 }}>Buy a package</h1>
        </div>
        <span className="page-meta">{sessionsRemaining} sessions remaining</span>
      </div>

      <div className="stack" style={{ maxWidth: 560 }}>
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

        <BuyPackagePanel sessionsRemaining={sessionsRemaining} />
      </div>
    </>
  )
}
