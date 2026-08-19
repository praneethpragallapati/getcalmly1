import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { getAdminSession, getClinicians } from '@/lib/admin'
import { CliniciansTable } from '@/components/admin/CliniciansTable'

import { SectionTabs } from '@/components/ui/SectionTabs'
import { ADMIN_CLINICIAN_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function AdminCliniciansPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const rows = await getClinicians()

  return (
    <div className="stack">
      <SectionTabs title="Clinicians" meta="Your practising team and who supervises whom." tabs={ADMIN_CLINICIAN_TABS} active="/admin/therapists" />
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Clinicians</div>
          <div className="page-meta">Filter by name, ID, specialty, employment, language, status or rating · tap one to edit</div>
        </div>
        <Link href="/admin/create" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <UserPlus size={15} /> New clinician
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card"><p className="muted">No clinicians yet. Create one from an approved application or from scratch.</p></div>
      ) : (
        <CliniciansTable rows={rows} />
      )}
    </div>
  )
}
