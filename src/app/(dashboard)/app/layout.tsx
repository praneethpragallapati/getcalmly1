import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { HelpCircle } from 'lucide-react'
import '../app.css'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AccountMenu } from '@/components/dashboard/AccountMenu'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { HelplineButton } from '@/components/dashboard/HelplineButton'
import { ToastProvider } from '@/components/ui/Toast'
import { getSidebarSummary } from '@/lib/dashboard'
import { getSessionUserId } from '@/lib/patient'
import { getUnreadCount, getNotifications } from '@/lib/notifications'
import { getSessionUser } from '@/lib/session'
import { attributeReferral } from '@/lib/referral'
import { getGuidedTracksForPatient } from '@/lib/guided'
import { fmtIST } from '@/lib/tz'

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

  // Claim a referral if this patient signed up via someone's link (?ref=CODE in
  // the gc_ref cookie). Idempotent + best-effort — no-ops once attributed. Run
  // it in the SAME wave as the summary/badge (not a sequential await before
  // them) so it never adds a round trip to the page load. cookies() is not a DB
  // hit. Its result is unused by the render.
  const refCode = userId ? (await cookies()).get('gc_ref')?.value : undefined

  const [d, unread, notes, guidedTracks] = await Promise.all([
    getSidebarSummary(),
    userId ? getUnreadCount(userId) : Promise.resolve(0),
    userId ? getNotifications(userId) : Promise.resolve([]),
    // Guided calm only earns a nav slot once there's something to play.
    getGuidedTracksForPatient(userId).catch(() => []),
    refCode && userId ? attributeReferral(userId, decodeURIComponent(refCode)) : Promise.resolve(),
  ])
  const now = new Date()
  const dateLine = fmtIST(now, {
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
        photoUrl={d.photoUrl}
        showGuided={guidedTracks.some((t) => t.videos.length > 0)}
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
            <NotificationBell items={notes} unread={unread} />
            <Link href="/contact" className="tb-icon" aria-label="Help &amp; support">
              <HelpCircle size={17} />
            </Link>
            <AccountMenu name={d.name} photoUrl={d.photoUrl} />
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
      <HelplineButton />
    </div>
    </ToastProvider>
  )
}
