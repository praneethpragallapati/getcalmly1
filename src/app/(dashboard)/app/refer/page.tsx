import { redirect } from 'next/navigation'
import { getSessionUserId } from '@/lib/patient'
import { getPatientReferral } from '@/lib/referral'
import { ReferAndEarn } from '@/components/dashboard/ReferAndEarn'

export const dynamic = 'force-dynamic'

export default async function ReferPage() {
  const userId = await getSessionUserId()
  if (!userId) redirect('/login')
  const data = await getPatientReferral(userId)

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Refer &amp; earn</h1>
        <span className="page-meta">Share getCalmly, earn rewards</span>
      </div>
      <ReferAndEarn data={data} />
    </>
  )
}
