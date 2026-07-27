import { redirect } from 'next/navigation'
import { getAdminSession, getApplications, getContactMessages, getEnterpriseLeads } from '@/lib/admin'
import { SubmissionsInbox } from '@/components/admin/SubmissionsInbox'

export const dynamic = 'force-dynamic'

export default async function AdminSubmissionsPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')

  const [applications, contacts, leads] = await Promise.all([
    getApplications(),
    getContactMessages(),
    getEnterpriseLeads(),
  ])

  return <SubmissionsInbox applications={applications} contacts={contacts} leads={leads} />
}
