import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin'
import { getReferralConfig, getReferralsForAdmin } from '@/lib/referral'
import { ReferralAdmin } from '@/components/admin/ReferralAdmin'

import { SectionTabs } from '@/components/ui/SectionTabs'
import { ADMIN_PRICING_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function AdminReferralsPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [config, referrals] = await Promise.all([getReferralConfig(), getReferralsForAdmin()])
  return (
    <>
      <SectionTabs title="Pricing &amp; offers" meta="What members pay, and what they earn for bringing a friend." tabs={ADMIN_PRICING_TABS} active="/admin/referrals" />
      <ReferralAdmin config={config} referrals={referrals} />
    </>
  )
}
