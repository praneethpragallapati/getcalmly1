import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin'
import { getPricingConfig } from '@/lib/pricingConfig'
import { PricingConfigForm } from './PricingConfigForm'

import { SectionTabs } from '@/components/ui/SectionTabs'
import { ADMIN_PRICING_TABS } from '@/data/sectionTabs'

export const metadata = { title: 'Admin · Pricing', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

/**
 * Admin pricing editor. ADMIN role only. Edits the customer-facing prices —
 * first-session fees, session packs per track, Calm+ plans and MRPs. Changes
 * take effect immediately on the public pricing page, the terms refund
 * examples, and the in-app buy flow (and are recorded on every purchase for
 * revenue reporting).
 */
export default async function AdminPricingPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const pricing = await getPricingConfig()

  return (
    <div className="stack">
      <SectionTabs title="Pricing &amp; offers" meta="What members pay, and what they earn for bringing a friend." tabs={ADMIN_PRICING_TABS} active="/admin/pricing" />
      <div className="page-head">
        <div className="page-title">Packages &amp; pricing</div>
        <div className="page-meta">
          What patients pay. Edits go live on the pricing page and the in-app buy flow, and set the amount recorded as revenue on each purchase.
        </div>
      </div>
      <PricingConfigForm initial={pricing} />
    </div>
  )
}
