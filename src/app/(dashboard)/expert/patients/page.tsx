import { redirect } from 'next/navigation'
import { getTherapistContext, getCaseload } from '@/lib/expert'
import { CaseloadTable } from '@/components/expert/CaseloadTable'

export default async function ExpertCaseloadPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const patients = await getCaseload(ctx.therapistProfileId)

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Patients</div>
        <div className="page-meta">{patients.length} in your caseload · filter by name, ID, sessions completed, package or language</div>
      </div>

      {patients.length === 0 ? (
        <div className="card"><p className="muted">No patients with scheduled appointments yet.</p></div>
      ) : (
        <CaseloadTable patients={patients} />
      )}
    </div>
  )
}
