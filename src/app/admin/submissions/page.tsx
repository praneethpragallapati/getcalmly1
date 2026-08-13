import { redirect } from 'next/navigation'
import { getAdminSession, getApplications, getContactMessages, getEnterpriseLeads, getCancellationRequests } from '@/lib/admin'
import { SubmissionsInbox } from '@/components/admin/SubmissionsInbox'

export const dynamic = 'force-dynamic'

export default async function AdminSubmissionsPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')

  const [applications, contacts, leads, cancellations] = await Promise.all([
    getApplications(),
    getContactMessages(),
    getEnterpriseLeads(),
    getCancellationRequests(),
  ])

  return <SubmissionsInbox applications={applications} contacts={contacts} leads={leads} cancellations={cancellations} />
}
