import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { Home, Users, AlertTriangle, CalendarClock, Wallet, UsersRound, MessagesSquare, UserCircle, Lock, FileText, Video, ListTodo } from 'lucide-react'
import '../app.css'
import Logo from '@/components/ui/Logo'
import { SidebarLink } from '@/components/expert/SidebarLink'
import { NavGroup } from '@/components/dashboard/NavGroup'
import { ExpertAccountMenu } from '@/components/expert/ExpertAccountMenu'
import { SidebarDrawerToggle } from '@/components/dashboard/SidebarDrawerToggle'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { markExpertNotificationsRead } from '@/app/(dashboard)/expert/actions'
import { ToastProvider } from '@/components/ui/Toast'
import { CallProvider } from '@/components/dashboard/CallDock'
import { getTherapistContext, getRiskNotifications, getExpertTaskCounts } from '@/lib/expert'
import { getNotifications, getUnreadCount } from '@/lib/notifications'
import { roleHome } from '@/lib/roleHome'
import { expertCode } from '@/lib/ids'
import { mustChangePassword } from '@/lib/accountSecurity'
import { fmtIST } from '@/lib/tz'
import { ensureContactSchema } from '@/lib/contactSchema'
import { backfillRegistrationNumbers } from '@/lib/registration'

export const metadata: Metadata = {
  title: 'Expert portal',
  robots: { index: false, follow: false },
}

export default async function ExpertLayout({ children }: { children: React.ReactNode }) {
  // Pin the area by fresh role (the session callback refreshes it from the DB):
  // a signed-in non-therapist is sent to their own dashboard, not left here.
  // Create the 0038 contact columns if the migration hasn't been run yet.
  // Flag-guarded, so this is one statement per process, not per request.
  await ensureContactSchema().catch(() => {})
  // Give any account created before registration numbers existed one now,
  // in signup order. One pass per process.
  await backfillRegistrationNumbers()
  const su = await getSessionUser()
  if (!su?.id) redirect('/login')
  if (su.role !== 'THERAPIST') redirect(roleHome(su.role))

  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')
  const [mustChange, risk, taskCounts, unread, notes] = await Promise.all([
    mustChangePassword(ctx.userId),
    getRiskNotifications(ctx.therapistProfileId),
    getExpertTaskCounts(ctx.therapistProfileId, ctx.userId),
    getUnreadCount(ctx.userId),
    getNotifications(ctx.userId),
  ])
  if (mustChange) redirect('/change-password')
  const openCount = risk.length

  return (
    <ToastProvider>
    {/* Above the routed content, so a live call survives navigation. */}
    <CallProvider>
    <div className="calmly-app expert-theme">
      <SidebarDrawerToggle />
      <aside className="app-sidebar">
        <div className="sb-logo">
          <Logo size={26} onDark tagline={false} href="/expert" tint="green" />
        </div>
        <NavGroup heading="CASELOAD" storageKey="expert" hrefs={['/expert/patients', '/expert/tasks', '/expert/schedule', '/expert/availability', '/expert/risk', '/expert/supervision']}>
          <SidebarLink href="/expert" exact>
            <Home size={18} />
            <span>Dashboard</span>
          </SidebarLink>
          <SidebarLink href="/expert/patients">
            <Users size={18} />
            <span>My Patients</span>
          </SidebarLink>
          {/* Session notes owed + anything admin has sent this clinician. */}
          <SidebarLink href="/expert/tasks">
            <ListTodo size={18} />
            <span>Tasks</span>
            {taskCounts.total > 0 && <span className="sb-badge">{taskCounts.total}</span>}
          </SidebarLink>
          {/* Schedule also covers Availability (tabbed together). */}
          <SidebarLink href="/expert/schedule" match={['/expert/availability']}>
            <CalendarClock size={18} />
            <span>Schedule</span>
          </SidebarLink>
          <SidebarLink href="/expert/risk">
            <AlertTriangle size={18} />
            <span>Risk notifications</span>
            {openCount > 0 && <span className="sb-badge">{openCount}</span>}
          </SidebarLink>
          <SidebarLink href="/expert/supervision">
            <UsersRound size={18} />
            <span>Supervision</span>
          </SidebarLink>
        </NavGroup>

        {/* Calm Club groups the community-facing surfaces, matching how the
            patient sidebar files the same two. */}
        <NavGroup heading="CALM CLUB" storageKey="expert" hrefs={['/expert/community', '/expert/blogs', '/expert/perspectives']}>
          <SidebarLink href="/expert/community">
            <MessagesSquare size={18} />
            <span>Real Talk</span>
          </SidebarLink>
          {/* Perspectives = essays (Read) + talks (Watch) — same as the patient side. */}
          <SidebarLink href="/expert/blogs" match={['/expert/perspectives']}>
            <Video size={18} />
            <span>Perspectives</span>
          </SidebarLink>
        </NavGroup>

        <NavGroup heading="PRACTICE" storageKey="expert" hrefs={['/expert/forms', '/expert/profile', '/expert/earnings']}>
          <SidebarLink href="/expert/forms">
            <FileText size={18} />
            <span>Default forms</span>
          </SidebarLink>
          <SidebarLink href="/expert/profile">
            <UserCircle size={18} />
            <span>Profile</span>
          </SidebarLink>
          {ctx.employmentType === 'PART_TIME' ? (
            <SidebarLink href="/expert/earnings">
              <Wallet size={18} />
              <span>Earnings</span>
            </SidebarLink>
          ) : (
            <span
              className="sb-link"
              aria-disabled="true"
              title="Earnings apply to part-time (per-session) clinicians. You're salaried full-time."
              style={{ opacity: 0.4, cursor: 'not-allowed' }}
            >
              <Wallet size={18} />
              <span>Earnings</span>
              <Lock size={13} style={{ marginLeft: 'auto' }} />
            </span>
          )}
        </NavGroup>
      </aside>

      <div className="app-main">
        <header className="app-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div className="tb-date">
              {fmtIST(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="tb-greeting" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {(() => {
                const h = new Date().getHours()
                const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
                return (
                  <>
                    {g}, <span>{ctx.therapistName ?? 'Doctor'}</span>
                  </>
                )
              })()}
              <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: 'var(--c-green, #3D9E72)', background: 'rgba(61,158,114,.12)', padding: '2px 8px', borderRadius: 6 }}>{ctx.registrationNo ?? expertCode(ctx.therapistProfileId)}</span>
            </div>
          </div>
          <div className="tb-actions">
            <NotificationBell
              items={notes}
              unread={unread}
              seeAllHref="/expert/notifications"
              onMarkRead={markExpertNotificationsRead}
            />
            <ExpertAccountMenu name={ctx.therapistName ?? 'Doctor'} />
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
    </CallProvider>
    </ToastProvider>
  )
}
