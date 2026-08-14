import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin'
import { getReferralConfig, getReferralsForAdmin } from '@/lib/referral'
import { ReferralAdmin } from '@/components/admin/ReferralAdmin'

export const dynamic = 'force-dynamic'

export default async function AdminReferralsPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [config, referrals] = await Promise.all([getReferralConfig(), getReferralsForAdmin()])
  return <ReferralAdmin config={config} referrals={referrals} />
}
