import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAccount } from '@/lib/account'
import { getSessionUserId } from '@/lib/patient'
import { hasPartnerOnRecord } from '@/lib/billing'
import { getPricingConfig } from '@/lib/pricingConfig'
import { BuyPackagePanel, FirstSessionPanel } from '@/components/dashboard/BuyPackagePanel'

const BUYABLE = ['therapy', 'psychiatry', 'couples'] as const
type BuyableTrack = (typeof BUYABLE)[number]

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ track?: string }> }) {
  const sp = await searchParams
  const initialTrack: BuyableTrack | undefined = (BUYABLE as readonly string[]).includes(sp.track ?? '') ? (sp.track as BuyableTrack) : undefined
  const [{ plan }, userId, pricing] = await Promise.all([getAccount(), getSessionUserId(), getPricingConfig()])
  const hasPartner = userId ? await hasPartnerOnRecord(userId) : false
  const sessionsRemaining = Math.max(0, plan.sessionsTotal - plan.sessionsUsed)
  const expired = plan.sessionsTotal > 0 && sessionsRemaining === 0

  // A brand-new patient (nothing purchased yet) sees the flat first-session
  // offer. Once they've purchased anything — even before that first session is
  // completed — real package prices are available to buy.
  const firstSessionDone = plan.sessionsUsed >= 1
  const hasPurchased = plan.sessionsTotal > 0

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
            {hasPurchased ? 'Buy a package' : 'Book your first session'}
          </h1>
        </div>
        <span className="page-meta">{sessionsRemaining} sessions remaining</span>
      </div>

      <div className="stack" style={{ maxWidth: hasPurchased ? 1200 : 560 }}>
        {hasPurchased ? (
          <>
            <div className="card">
              <div className="section-title">Your current balance</div>
              <p className="muted" style={{ marginTop: 8 }}>
                {plan.planName} · {plan.sessionsUsed}/{plan.sessionsTotal} sessions used
                {expired ? ' · expired' : ''}
              </p>
              {!firstSessionDone && (
                <p className="muted" style={{ marginTop: 6 }}>
                  Your first session is booked — schedule it in{' '}
                  <Link href="/app/sessions" className="link-action">Sessions</Link>. You can add a package below whenever you&apos;re ready.
                </p>
              )}
              {expired && (
                <p className="muted" style={{ marginTop: 6 }}>
                  Your package has run out. Buying a new one renews your plan, any sessions you add stack on top.
                </p>
              )}
            </div>
            <BuyPackagePanel sessionsRemaining={sessionsRemaining} hasPartner={hasPartner} pricing={pricing} />
          </>
        ) : (
          <FirstSessionPanel hasPartner={hasPartner} pricing={pricing} initialTrack={initialTrack} />
        )}
      </div>
    </>
  )
}
