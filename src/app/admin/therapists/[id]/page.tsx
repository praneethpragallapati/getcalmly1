import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminSession, getClinicianDetail } from '@/lib/admin'
import { TherapistEditor } from '@/components/admin/TherapistEditor'

export const dynamic = 'force-dynamic'

export default async function AdminClinicianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const c = await getClinicianDetail(id)
  if (!c) notFound()

  return (
    <div className="stack">
      <Link href="/admin/therapists" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> All clinicians
      </Link>
      <div className="page-head">
        <div className="page-title">{c.name}</div>
        <div className="page-meta">{c.designation} · {c.rciNumber} · {c.yearsExp} yrs · {c.email}</div>
      </div>
      <TherapistEditor c={c} />
    </div>
  )
}
