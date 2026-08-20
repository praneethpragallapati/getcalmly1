'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell, Pill, FileText, Truck, Wallet, CalendarPlus, CalendarX2, CalendarClock,
  UserRoundCheck, ListTodo, MessagesSquare, BarChart3, HeartPulse, Megaphone, Receipt,
} from 'lucide-react'
import { markNotificationsRead } from '@/app/(dashboard)/app/actions'
import type { NotificationView } from '@/lib/notifications'

const ICON: Record<string, typeof Bell> = {
  prescription: Pill, medication: Pill, order: Truck, form: FileText, wallet: Wallet,
  booking: CalendarPlus, cancellation: CalendarX2, reschedule: CalendarClock, therapist: UserRoundCheck,
  invoice: Receipt, task: ListTodo, community: MessagesSquare, poll: BarChart3, mood: HeartPulse, announcement: Megaphone,
}

/**
 * Facebook-style notification bell: clicking opens a small dropdown (not the
 * full page) with the latest 10, grouped Today / Older with timestamps. Opening
 * it marks everything read (clears the badge). "See all" opens the full page.
 *
 * Notifications are stored per user, not per role, so the same bell serves the
 * patient and the expert portals. Each passes its own mark-read action and
 * "see all" route, since those live under different layouts.
 */
export function NotificationBell({ items, unread, seeAllHref = '/app/notifications', onMarkRead }: {
  items: NotificationView[]
  unread: number
  seeAllHref?: string
  /** Defaults to the patient action; the expert portal passes its own. */
  onMarkRead?: () => Promise<unknown>
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(unread)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setCount(unread), [unread])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && count > 0) {
      setCount(0)
      const mark = onMarkRead ?? markNotificationsRead
      mark().then(() => router.refresh()).catch(() => {})
    }
  }

  const top = items.slice(0, 10)
  const today = top.filter((n) => n.today)
  const older = top.filter((n) => !n.today)

  const row = (n: NotificationView) => {
    const Icon = ICON[n.type] ?? Bell
    const inner = (
      <div style={{ display: 'flex', gap: 11, padding: '10px 14px', alignItems: 'flex-start', background: n.read ? undefined : 'var(--c-coral-pale, #FDEEEA)' }}>
        <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'var(--c-coral-pale, #FDEAE6)', color: 'var(--c-coral, #C8553D)' }}>
          <Icon size={15} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-charcoal, #1C2B3A)', lineHeight: 1.3 }}>{n.title}</div>
          {n.body && <div style={{ fontSize: 12, color: 'var(--c-gray-d, #5A6A7A)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</div>}
          <div style={{ fontSize: 11, color: 'var(--c-gray, #8E9EAE)', marginTop: 2 }}>{n.timeLabel}</div>
        </div>
      </div>
    )
    return n.href
      ? <Link key={n.id} href={n.href} onClick={() => setOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
      : <div key={n.id}>{inner}</div>
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="tb-icon" aria-label="Notifications" onClick={toggle} style={{ position: 'relative', cursor: 'pointer' }}>
        <Bell size={17} />
        {count > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: 'var(--c-coral)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 360, maxWidth: '90vw',
          background: '#fff', borderRadius: 14, boxShadow: '0 18px 48px rgba(28,43,58,.22)', border: '1px solid rgba(28,43,58,.08)',
          zIndex: 80, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', borderBottom: '1px solid rgba(28,43,58,.07)' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-charcoal, #1C2B3A)' }}>Notifications</span>
          </div>

          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {top.length === 0 && <p style={{ padding: '22px 16px', margin: 0, color: 'var(--c-gray-d)', fontSize: 13 }}>You&apos;re all caught up.</p>}
            {today.length > 0 && (
              <>
                <div style={sectionLabel}>Today</div>
                {today.map(row)}
              </>
            )}
            {older.length > 0 && (
              <>
                <div style={sectionLabel}>Older</div>
                {older.map(row)}
              </>
            )}
          </div>

          {items.length > 0 && (
            <Link href={seeAllHref} onClick={() => setOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '11px', fontSize: 12.5, fontWeight: 600, color: 'var(--c-coral, #C8553D)', textDecoration: 'none', borderTop: '1px solid rgba(28,43,58,.07)' }}>
              See all notifications
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  padding: '9px 15px 5px', fontSize: 11, fontWeight: 700, letterSpacing: '.05em',
  textTransform: 'uppercase', color: 'var(--c-gray, #8E9EAE)', background: '#fbfcfd',
}
