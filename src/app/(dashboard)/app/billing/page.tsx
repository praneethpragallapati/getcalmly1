import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSessionUserId } from '@/lib/patient'
import { hasPartnerOnRecord, getActivePackages } from '@/lib/billing'
import { getPricingConfig } from '@/lib/pricingConfig'
import { BuyPackagePanel, FirstSessionPanel } from '@/components/dashboard/BuyPackagePanel'

const BUYABLE = ['therapy', 'psychiatry', 'couples'] as const
type BuyableTrack = (typeof BUYABLE)[number]

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ track?: string }> }) {
  const sp = await searchParams
  const initialTrack: BuyableTrack | undefined = (BUYABLE as readonly string[]).includes(sp.track ?? '') ? (sp.track as BuyableTrack) : undefined
  const userId = await getSessionUserId()
  const [packages, pricing] = await Promise.all([
    userId ? getActivePackages(userId) : Promise.resolve([]),
    getPricingConfig(),
  ])
  const hasPartner = userId ? await hasPartnerOnRecord(userId) : false

  // Totals across every package type the patient holds.
  const sessionsRemaining = packages.reduce((n, p) => n + p.remaining, 0)
  const totalUsed = packages.reduce((n, p) => n + p.sessionsUsed, 0)

  // A brand-new patient (nothing purchased yet) sees the flat first-session
  // offer. Once they've purchased anything — even before that first session is
  // completed — real package prices are available to buy.
  const firstSessionDone = totalUsed >= 1
  const hasPurchased = packages.length > 0

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
              <div className="section-title">Your current balances</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {packages.map((pkg) => (
                  <div
                    key={pkg.track}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', paddingBottom: 10, borderBottom: '1px solid var(--c-line)' }}
                  >
                    <div>
                      <div className="doc-name" style={{ fontSize: 15 }}>{pkg.label}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>
                        {pkg.planName}{pkg.validUntil ? ` · valid until ${pkg.validUntil}` : ''}{pkg.expired ? ' · expired' : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: pkg.remaining > 0 ? 'var(--c-green, #3D9E72)' : 'var(--c-coral, #C8553D)' }}>
                      {pkg.remaining} of {pkg.sessionsTotal} left
                    </div>
                  </div>
                ))}
              </div>
              {!firstSessionDone && (
                <p className="muted" style={{ marginTop: 12 }}>
                  Your first session is booked — schedule it in{' '}
                  <Link href="/app/sessions" className="link-action">Sessions</Link>. You can add a package below whenever you&apos;re ready.
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
