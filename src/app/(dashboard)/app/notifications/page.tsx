import { getSessionUserId } from '@/lib/patient'
import { getNotifications } from '@/lib/notifications'
import { MarkNotificationsRead } from '@/components/dashboard/MarkNotificationsRead'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const userId = await getSessionUserId()
  const notifications = userId ? await getNotifications(userId) : []
  const hasUnread = notifications.some((n) => !n.read)

  return (
    <>
      <MarkNotificationsRead hasUnread={hasUnread} />
      <NotificationCenter notifications={notifications} />
    </>
  )
}
