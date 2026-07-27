import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminSession, getClinicianEarnings } from '@/lib/admin'
import { ClinicianEarningsView } from './ClinicianEarningsView'

export const metadata = { title: 'Admin · Clinician earnings', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminClinicianMoneyPage({ params }: { params: Promise<{ profileId: string }> }) {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const { profileId } = await params
  const earnings = await getClinicianEarnings(profileId)
  if (!earnings) notFound()

  return (
    <div className="stack">
      <div className="page-head">
        <Link href="/admin/money" className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Money
        </Link>
        <div className="page-title" style={{ marginTop: 6 }}>{earnings.name}</div>
        <div className="page-meta">
          Earnings exactly as {earnings.name.split(' ')[0]} sees them — {earnings.employmentType === 'PART_TIME' ? 'part-time (per session)' : 'full-time (salaried)'}. Statements open in Excel and carry per-session detail for disbursement.
        </div>
      </div>
      <ClinicianEarningsView e={earnings} />
    </div>
  )
}
