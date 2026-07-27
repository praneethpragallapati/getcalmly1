import { redirect } from 'next/navigation'
import { getAdminSession, getOpsBoard } from '@/lib/admin'
import { OpsBoard } from '@/components/admin/OpsBoard'

export const dynamic = 'force-dynamic'

export default async function AdminOperationsPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const data = await getOpsBoard()
  return <OpsBoard data={data} />
}
