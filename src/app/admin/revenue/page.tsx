import { redirect } from 'next/navigation'
import { getAdminSession, getRevenueReport } from '@/lib/admin'
import { RevenueView } from './RevenueView'

export const metadata = { title: 'Admin · Revenue', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminRevenuePage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const report = await getRevenueReport()
  return <RevenueView report={report} />
}
