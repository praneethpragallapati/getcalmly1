import { redirect } from 'next/navigation'
import { getAdminSession, getFormsLibrary } from '@/lib/admin'
import { ConfigPanel } from '@/components/admin/ConfigPanel'

export const dynamic = 'force-dynamic'

export default async function AdminConfigPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const forms = await getFormsLibrary()
  return <ConfigPanel forms={forms} />
}
