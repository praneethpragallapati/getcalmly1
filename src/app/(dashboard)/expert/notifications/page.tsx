import { redirect } from 'next/navigation'
import { getTherapistContext } from '@/lib/expert'
import { getNotifications } from '@/lib/notifications'
import { MarkNotificationsRead } from '@/components/dashboard/MarkNotificationsRead'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'
import { markExpertNotificationsRead } from '@/app/(dashboard)/expert/actions'

export const dynamic = 'force-dynamic'

/** The clinician's full notification history — the same centre the patient
 *  portal uses, since notifications are stored per user rather than per role. */
export default async function ExpertNotificationsPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')
  const notifications = await getNotifications(ctx.userId)
  const hasUnread = notifications.some((n) => !n.read)

  return (
    <>
      <MarkNotificationsRead hasUnread={hasUnread} onMarkRead={markExpertNotificationsRead} />
      <NotificationCenter notifications={notifications} />
    </>
  )
}
