import { redirect } from 'next/navigation'
import { getAdminSession, getCrisisAlerts } from '@/lib/admin'
import { SafetyConsole } from '@/components/admin/SafetyConsole'

export const dynamic = 'force-dynamic'

export default async function AdminSafetyPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const rows = await getCrisisAlerts()
  return <SafetyConsole rows={rows} />
}
