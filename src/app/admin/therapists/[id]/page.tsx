import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminSession, getClinicianDetail, getClinicianRoster, getTherapistTasks } from '@/lib/admin'
import { TherapistEditor } from '@/components/admin/TherapistEditor'
import { ClinicianRoster } from '@/components/admin/ClinicianRoster'
import { TherapistTasks } from '@/components/admin/TherapistTasks'
import { DeleteAccount } from '@/components/admin/DeleteAccount'

export const dynamic = 'force-dynamic'

export default async function AdminClinicianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [c, roster] = await Promise.all([getClinicianDetail(id), getClinicianRoster(id)])
  if (!c) notFound()
  const tasks = await getTherapistTasks(c.userId)

  return (
    <div className="stack">
      <Link href="/admin/therapists" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> All clinicians
      </Link>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">{c.name}</div>
          <div className="page-meta">{c.designation} · {c.rciNumber} · {c.yearsExp} yrs · {c.email}</div>
        </div>
        <Link href={`/admin/money/${c.profileId}`} className="btn" style={{ border: '1.5px solid #E2E8F0' }}>Earnings &amp; statements →</Link>
      </div>
      <TherapistEditor c={c} />
      <TherapistTasks therapistUserId={c.userId} profileId={c.profileId} tasks={tasks} />
      {roster && <ClinicianRoster roster={roster} />}
      <DeleteAccount kind="clinician" userId={c.userId} name={c.name} />
    </div>
  )
}
