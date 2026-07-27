import { redirect } from 'next/navigation'
import { getAdminSession, getApplicationForPrefill } from '@/lib/admin'
import { CreateUserForm } from '@/components/admin/CreateUserForm'

export const dynamic = 'force-dynamic'

export default async function AdminCreatePage({ searchParams }: { searchParams: Promise<{ fromApp?: string }> }) {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const { fromApp } = await searchParams
  const prefill = fromApp ? await getApplicationForPrefill(fromApp) : null

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Create an account</div>
        <div className="page-meta">
          {prefill ? `Prefilled from ${prefill.name}'s application` : 'Onboard a clinician after their interview, or add an admin'} · a temporary password is generated to share
        </div>
      </div>
      <CreateUserForm prefill={prefill} />
    </div>
  )
}
