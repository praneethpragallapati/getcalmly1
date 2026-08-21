import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin'
import { canAccess } from '@/lib/adminRoles'
import { getMoneyReport, listLedger } from '@/lib/ledger'
import { FinanceView } from '@/components/admin/FinanceView'

export const metadata = { title: 'Money · Admin', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  if (!canAccess(admin.adminType, 'money')) redirect('/admin')

  const [report, ledger] = await Promise.all([getMoneyReport(12), listLedger()])

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Money</div>
        <div className="page-meta">
          Everything in and out — member payments, investment, therapist pay and running costs
        </div>
      </div>
      <FinanceView report={report} ledger={ledger} />
    </div>
  )
}
