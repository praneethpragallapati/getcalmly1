import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminSession, getPatientDetail, getPatientActivity } from '@/lib/admin'
import { PatientAdmin } from '@/components/admin/PatientAdmin'
import { PatientActivitySections } from '@/components/admin/PatientActivity'
import { DeleteAccount } from '@/components/admin/DeleteAccount'
import { patientCode } from '@/lib/ids'
import { PersonDetailsCard } from '@/components/ui/PersonDetailsCard'
import { PatientTimeline } from '@/components/admin/PatientTimeline'
import { getPatientTimeline } from '@/lib/patientTimeline'

export const dynamic = 'force-dynamic'

export default async function AdminPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [p, activity, timeline] = await Promise.all([
    getPatientDetail(id), getPatientActivity(id), getPatientTimeline(id),
  ])
  if (!p) notFound()

  return (
    <div className="stack">
      <Link href="/admin/patients" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> All patients
      </Link>
      <div className="page-head">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {p.name}
          <span style={{ fontSize: 13, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#6D5BD0', background: 'rgba(109,91,208,.1)', padding: '3px 9px', borderRadius: 7 }}>{p.contact.code ?? patientCode(p.userId)}</span>
        </div>
        <div className="page-meta">{p.email}</div>
      </div>
      <PersonDetailsCard
        contact={p.contact}
        name={p.name}
        note="Everything on file for this patient."
      />
      <PatientAdmin p={p} />
      <PatientTimeline events={timeline} />
      <PatientActivitySections activity={activity} />
      <DeleteAccount kind="patient" userId={p.userId} name={p.name} />
    </div>
  )
}
