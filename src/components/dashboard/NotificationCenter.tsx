'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell, Pill, FileText, Truck, Wallet, CalendarPlus, CalendarX2, CalendarClock,
  UserRoundCheck, ListTodo, MessagesSquare, BarChart3, HeartPulse, Megaphone, Receipt,
} from 'lucide-react'
import type { NotificationView, NotificationCategory } from '@/lib/notifications'

const ICON: Record<string, typeof Bell> = {
  prescription: Pill,
  medication: Pill,
  order: Truck,
  form: FileText,
  wallet: Wallet,
  booking: CalendarPlus,
  cancellation: CalendarX2,
  reschedule: CalendarClock,
  therapist: UserRoundCheck,
  invoice: Receipt,
  task: ListTodo,
  community: MessagesSquare,
  poll: BarChart3,
  mood: HeartPulse,
  announcement: Megaphone,
}

export function NotificationCenter({ notifications }: { notifications: NotificationView[] }) {
  const [tab, setTab] = useState<NotificationCategory>('IMPORTANT')
  const important = notifications.filter((n) => n.category === 'IMPORTANT')
  const others = notifications.filter((n) => n.category === 'OTHER')
  const shown = tab === 'IMPORTANT' ? important : others
  const unreadImp = important.filter((n) => !n.read).length
  const unreadOth = others.filter((n) => !n.read).length

  const tabBtn = (key: NotificationCategory, label: string, count: number): React.ReactNode => (
    <button
      onClick={() => setTab(key)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10,
        border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
        background: tab === key ? '#fff' : 'transparent',
        color: tab === key ? 'var(--c-charcoal, #1C2B3A)' : 'var(--c-gray-d, #5A6A7A)',
        boxShadow: tab === key ? '0 1px 4px rgba(28,43,58,.1)' : 'none',
      }}
    >
      {label}
      {count > 0 && (
        <span style={{
          minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, fontSize: 11, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--c-coral, #C8553D)', color: '#fff',
        }}>{count > 9 ? '9+' : count}</span>
      )}
    </button>
  )

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Notifications</h1>
        <span className="page-meta">{notifications.length === 0 ? 'Nothing yet' : `${notifications.length} recent`}</span>
      </div>

      <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--c-coral-pale, #FDEAE6)', borderRadius: 12, marginBottom: 16 }}>
        {tabBtn('IMPORTANT', 'Important', unreadImp)}
        {tabBtn('OTHER', 'Others', unreadOth)}
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {shown.length === 0 && (
          <p className="muted">{tab === 'IMPORTANT' ? 'No important notifications.' : 'Nothing here right now.'}</p>
        )}
        {shown.map((n) => {
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
            <Link key={n.id} href={n.href} style={{ textDecoration: 'none' }}>{body}</Link>
          ) : (
            <div key={n.id}>{body}</div>
          )
        })}
      </div>
    </>
  )
}
