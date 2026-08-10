import { redirect } from 'next/navigation'
import { getAdminSession, getPatients } from '@/lib/admin'
import { PatientsTable } from '@/components/admin/PatientsTable'

export const dynamic = 'force-dynamic'

export default async function AdminPatientsPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const rows = await getPatients()

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Patients</div>
        <div className="page-meta">Filter by name, ID, email, sessions completed, package or language · open one to manage packages &amp; view progress</div>
      </div>

      {rows.length === 0 ? (
        <div className="card"><p className="muted">No patients found.</p></div>
      ) : (
        <PatientsTable rows={rows} />
      )}
    </div>
  )
}
