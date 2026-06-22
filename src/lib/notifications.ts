/** In-app notifications: unread count for the bell, list, and mark-read. */
import { prisma } from '@/lib/prisma'

export type NotificationView = {
  id: string
  type: string
  title: string
  body: string | null
  href: string | null
  read: boolean
  createdLabel: string
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({ where: { userId, read: false } })
  } catch {
    return 0
  }
}

export async function getNotifications(userId: string): Promise<NotificationView[]> {
  try {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return rows.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      href: n.href,
      read: n.read,
      createdLabel: n.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }))
  } catch {
    return []
  }
}

export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
}
