import { redirect } from 'next/navigation'
import { getAdminSession, getRevenueReport } from '@/lib/admin'
import { RevenueView } from './RevenueView'

import { SectionTabs } from '@/components/ui/SectionTabs'
import { ADMIN_MONEY_TABS } from '@/data/sectionTabs'

export const metadata = { title: 'Admin · Revenue', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminRevenuePage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const report = await getRevenueReport()
  return (
    <>
      <SectionTabs title="Money" meta="Package sales and what every clinician is owed." tabs={ADMIN_MONEY_TABS} active="/admin/revenue" />
      <RevenueView report={report} />
    </>
  )
}
