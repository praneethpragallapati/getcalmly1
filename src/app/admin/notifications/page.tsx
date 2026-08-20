import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin'
import { getNotifications } from '@/lib/notifications'
import { MarkNotificationsRead } from '@/components/dashboard/MarkNotificationsRead'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'
import { markAdminNotificationsRead } from '@/app/admin/actions'

export const dynamic = 'force-dynamic'

/** The admin team's notification history — the same centre the other two
 *  portals use, since notifications are stored per user rather than per role. */
export default async function AdminNotificationsPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const notifications = await getNotifications(admin.id)
  const hasUnread = notifications.some((n) => !n.read)

  return (
    <>
      <MarkNotificationsRead hasUnread={hasUnread} onMarkRead={markAdminNotificationsRead} />
      <NotificationCenter notifications={notifications} />
    </>
  )
}
