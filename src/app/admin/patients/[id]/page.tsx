import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminSession, getPatientDetail } from '@/lib/admin'
import { PatientAdmin } from '@/components/admin/PatientAdmin'
import { DeleteAccount } from '@/components/admin/DeleteAccount'
import { patientCode } from '@/lib/ids'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const p = await getPatientDetail(id)
  if (!p) notFound()

  // TEMP DIAGNOSTIC: show exactly what the DB holds, so we can see whether the
  // packages live under this user.id or a different row for the same email.
  const diag = await (async () => {
    try {
      const [byId, byEmail] = await Promise.all([
        prisma.subscription.findMany({ where: { userId: id }, select: { status: true, trackSlug: true, sessionsTotal: true, sessionsUsed: true } }),
        prisma.subscription.findMany({
          where: { user: { email: p.email } },
          select: { userId: true, status: true, trackSlug: true, sessionsTotal: true },
        }),
      ])
      const usersWithEmail = await prisma.user.count({ where: { email: p.email } })
      return { byId, byEmail, usersWithEmail }
    } catch (e) {
      return { error: String(e) }
    }
  })()

  return (
    <div className="stack">
      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 8, padding: 12, whiteSpace: 'pre-wrap' }}>
        <b>DIAGNOSTIC (temporary)</b>{'\n'}
        user.id = {id}{'\n'}
        email = {p.email}{'\n'}
        users with this email = {'usersWithEmail' in diag ? diag.usersWithEmail : 'n/a'}{'\n'}
        subs by this user.id = {JSON.stringify('byId' in diag ? diag.byId : diag)}{'\n'}
        subs by this email = {JSON.stringify('byEmail' in diag ? diag.byEmail : diag)}
      </div>
      <Link href="/admin/patients" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> All patients
      </Link>
      <div className="page-head">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {p.name}
          <span style={{ fontSize: 13, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#6D5BD0', background: 'rgba(109,91,208,.1)', padding: '3px 9px', borderRadius: 7 }}>{patientCode(p.userId)}</span>
        </div>
        <div className="page-meta">{p.email}</div>
      </div>
      <PatientAdmin p={p} />
      <DeleteAccount kind="patient" userId={p.userId} name={p.name} />
    </div>
  )
}
