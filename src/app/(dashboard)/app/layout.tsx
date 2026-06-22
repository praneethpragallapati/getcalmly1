import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Search, Bell, HelpCircle } from 'lucide-react'
import '../app.css'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { getDashboardData } from '@/lib/dashboard'
import { getSessionUserId } from '@/lib/patient'
import { getUnreadCount } from '@/lib/notifications'
import { authOptions } from '@/lib/auth'

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
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string } | undefined)?.role === 'THERAPIST') redirect('/expert')

  const d = await getDashboardData()
  const userId = await getSessionUserId()
  const unread = userId ? await getUnreadCount(userId) : 0
  const now = new Date()
  const dateLine = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="calmly-app">
      <Sidebar name={d.name} planLine={`${d.planName} · ${d.streakDays}-day streak 🔥`} />

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="tb-date">{dateLine}</div>
            <div className="tb-greeting">
              {greetingFor(now)}, <span>{d.name}</span> ☀️
            </div>
          </div>
          <div className="tb-actions">
            <div className="tb-search">
              <Search size={15} /> Search anything…
            </div>
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
            <button className="tb-icon" aria-label="Help">
              <HelpCircle size={17} />
            </button>
            <Link href="/app/settings" className="tb-icon avatar" aria-label="Account">
              {d.name.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
