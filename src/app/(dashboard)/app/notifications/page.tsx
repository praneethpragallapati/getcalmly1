import Link from 'next/link'
import { Bell, Pill, FileText, Truck } from 'lucide-react'
import { getSessionUserId } from '@/lib/patient'
import { getNotifications } from '@/lib/notifications'
import { MarkNotificationsRead } from '@/components/dashboard/MarkNotificationsRead'

const ICON: Record<string, typeof Bell> = {
  prescription: Pill,
  order: Truck,
  form: FileText,
}

export default async function NotificationsPage() {
  const userId = await getSessionUserId()
  const notifications = userId ? await getNotifications(userId) : []
  const hasUnread = notifications.some((n) => !n.read)

  return (
    <>
      <MarkNotificationsRead hasUnread={hasUnread} />
      <div className="page-head">
        <h1 className="page-title">Notifications</h1>
        <span className="page-meta">{notifications.length === 0 ? 'Nothing yet' : `${notifications.length} recent`}</span>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {notifications.length === 0 && <p className="muted">You&apos;re all caught up.</p>}
        {notifications.map((n) => {
          const Icon = ICON[n.type] ?? Bell
          const body = (
            <div className="pattern" style={{ background: n.read ? undefined : 'var(--c-coral-pale, #FDEEEA)', borderRadius: 10 }}>
              <span className={`pattern-ic ${n.read ? 't-purple' : 't-coral'}`}>
                <Icon size={16} />
              </span>
              <div style={{ flex: 1 }}>
                <div className="pattern-title">{n.title}</div>
                {n.body && <div className="pattern-sub">{n.body}</div>}
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{n.createdLabel}</div>
              </div>
            </div>
          )
          return n.href ? (
            <Link key={n.id} href={n.href} style={{ textDecoration: 'none' }}>
              {body}
            </Link>
          ) : (
            <div key={n.id}>{body}</div>
          )
        })}
      </div>
    </>
  )
}
