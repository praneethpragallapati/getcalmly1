import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bell, HelpCircle } from 'lucide-react'
import '../app.css'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AccountMenu } from '@/components/dashboard/AccountMenu'
import { ToastProvider } from '@/components/ui/Toast'
import { getSidebarSummary } from '@/lib/dashboard'
import { getSessionUserId } from '@/lib/patient'
import { getUnreadCount } from '@/lib/notifications'
import { getSessionUser } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Your space',
  robots: { index: false, follow: false },
}

function greetingFor(date: Date): string {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser()
  // Defense in depth behind the proxy gate: never render the patient area for a
  // signed-out visitor, and keep each role in its own area.
  if (!sessionUser?.id) redirect('/login')
  if (sessionUser.role === 'THERAPIST') redirect('/expert')
  if (sessionUser.role === 'ADMIN') redirect('/admin')

  const userId = await getSessionUserId()
  // Chrome-only summary (cheap) + unread badge, fetched together.
  const [d, unread] = await Promise.all([
    getSidebarSummary(),
    userId ? getUnreadCount(userId) : Promise.resolve(0),
  ])
  const now = new Date()
  const dateLine = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <ToastProvider>
    <div className="calmly-app">
      <Sidebar
        name={d.name}
        planLine={`${d.planActive ? 'Paid member' : 'Free member'} · ${d.streakDays}-day streak 🔥`}
        planActive={d.planActive}
        planName={d.planName}
        sessionsToday={d.sessionsToday}
      />

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="tb-date">{dateLine}</div>
            <div className="tb-greeting">
              {greetingFor(now)}, <span>{d.name}</span> ☀️
            </div>
          </div>
          <div className="tb-actions">
            <Link href="/app/notifications" className="tb-icon" aria-label="Notifications" style={{ position: 'relative' }}>
              <Bell size={17} />
              {unread > 0 && (
                <span
                  style={{
                    position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 4px',
                    borderRadius: 8, background: 'var(--c-coral)', color: '#fff', fontSize: 10, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
            <Link href="/contact" className="tb-icon" aria-label="Help &amp; support">
              <HelpCircle size={17} />
            </Link>
            <AccountMenu name={d.name} />
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
    </ToastProvider>
  )
}
