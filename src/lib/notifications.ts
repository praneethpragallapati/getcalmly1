/** In-app notifications: creation helper, category split (Important / Others),
 *  unread counts for the bell, list, and mark-read. */
import { prisma } from '@/lib/prisma'

export type NotificationCategory = 'IMPORTANT' | 'OTHER'

export type NotificationView = {
  id: string
  type: string
  category: NotificationCategory
  title: string
  body: string | null
  href: string | null
  read: boolean
  createdLabel: string
}

/**
 * Notification `type`s that belong under the "Others" tab — the low-urgency,
 * ambient ones. Everything else (bookings, cancellations, reschedules, therapist
 * changes, wallet, tasks, forms, announcements) is "Important".
 */
const OTHER_TYPES = new Set(['community', 'poll', 'mood', 'medication'])

export function categoryForType(type: string): NotificationCategory {
  return OTHER_TYPES.has(type) ? 'OTHER' : 'IMPORTANT'
}

/**
 * Create a notification for one user. Best-effort: a notification must NEVER
 * fail the action that triggered it (a booking still succeeds even if the bell
 * write hiccups), so this swallows errors.
 */
export async function notify(
  userId: string,
  n: { type: string; title: string; body?: string | null; href?: string | null }
): Promise<void> {
  try {
    await prisma.notification.create({
      data: { userId, type: n.type, title: n.title, body: n.body ?? null, href: n.href ?? null },
    })
  } catch {
    /* best-effort */
  }
}

/** Create the same notification for many users (broadcasts, new polls). */
export async function notifyMany(
  userIds: string[],
  n: { type: string; title: string; body?: string | null; href?: string | null }
): Promise<void> {
  if (userIds.length === 0) return
  try {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, type: n.type, title: n.title, body: n.body ?? null, href: n.href ?? null })),
    })
  } catch {
    /* best-effort */
  }
}

function relativeLabel(d: Date): string {
  const s = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.round(h / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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
      take: 80,
    })
    return rows.map((n) => ({
      id: n.id,
      type: n.type,
      category: categoryForType(n.type),
      title: n.title,
      body: n.body,
      href: n.href,
      read: n.read,
      createdLabel: relativeLabel(n.createdAt),
    }))
  } catch {
    return []
  }
}

export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
}
