import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { LayoutDashboard, Inbox, Users, UserPlus, HeartPulse, CalendarClock, TrendingUp, Newspaper, Settings, Tags, MessageSquareHeart } from 'lucide-react'
import '../(dashboard)/app.css'
import Logo from '@/components/ui/Logo'
import { SidebarLink } from '@/components/expert/SidebarLink'
import { NavGroup } from '@/components/dashboard/NavGroup'
import { AdminAccountMenu } from '@/components/admin/AdminAccountMenu'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { markAdminNotificationsRead } from '@/app/admin/actions'
import { getNotifications, getUnreadCount } from '@/lib/notifications'
import { SidebarDrawerToggle } from '@/components/dashboard/SidebarDrawerToggle'
import { ToastProvider } from '@/components/ui/Toast'
import { roleHome } from '@/lib/roleHome'
import { mustChangePassword } from '@/lib/accountSecurity'
import { ensureContactSchema } from '@/lib/contactSchema'
import { backfillRegistrationNumbers } from '@/lib/registration'

export const metadata: Metadata = {
  title: 'Admin · GetCalmly',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Role read fresh from the DB (the session callback authoritatively refreshes
  // it), so this pins the area correctly the moment a role changes — no re-login.
  // Create the 0038 contact columns if the migration hasn't been run yet.
  // Flag-guarded, so this is one statement per process, not per request.
  await ensureContactSchema().catch(() => {})
  // Give any account created before registration numbers existed one now,
  // in signup order. One pass per process.
  await backfillRegistrationNumbers()
  const admin = await getSessionUser()
  if (!admin?.id) redirect('/login')
  if (admin.role !== 'ADMIN') redirect(roleHome(admin.role))
  if (await mustChangePassword(admin.id)) redirect('/change-password')

  // Applications, contact messages, enterprise leads, cancellation requests,
  // crisis alerts, blog submissions and purchases all ring this bell.
  const [unread, notes] = await Promise.all([
    getUnreadCount(admin.id),
    getNotifications(admin.id),
  ])

  return (
    <ToastProvider>
    <div className="calmly-app admin-theme">
      <SidebarDrawerToggle />
      <aside className="app-sidebar">
        <div className="sb-logo">
          <Logo size={26} onDark tagline={false} href="/admin" tint="purple" />
        </div>

        <NavGroup heading="OVERVIEW" storageKey="admin" hrefs={['/admin/submissions']}>
          <SidebarLink href="/admin" exact>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </SidebarLink>
          <SidebarLink href="/admin/submissions">
            <Inbox size={18} />
            <span>Clinician applications</span>
          </SidebarLink>
        </NavGroup>

        <NavGroup heading="PEOPLE" storageKey="admin" hrefs={['/admin/therapists', '/admin/supervision', '/admin/patients', '/admin/create', '/admin/feedback']}>
          {/* Clinicians also covers Supervision (tabbed together). */}
          <SidebarLink href="/admin/therapists" match={['/admin/supervision']}>
            <Users size={18} />
            <span>Clinicians</span>
          </SidebarLink>
          <SidebarLink href="/admin/patients">
            <HeartPulse size={18} />
            <span>Patients</span>
          </SidebarLink>
          <SidebarLink href="/admin/create">
            <UserPlus size={18} />
            <span>New account</span>
          </SidebarLink>
          <SidebarLink href="/admin/feedback">
            <MessageSquareHeart size={18} />
            <span>Feedback</span>
          </SidebarLink>
        </NavGroup>

        <NavGroup heading="OPERATIONS" storageKey="admin" hrefs={['/admin/operations', '/admin/money', '/admin/revenue', '/admin/pricing', '/admin/referrals']}>
          <SidebarLink href="/admin/operations">
            <CalendarClock size={18} />
            <span>Operations</span>
          </SidebarLink>
          {/* Money = revenue + clinician payouts. */}
          <SidebarLink href="/admin/revenue" match={['/admin/money']}>
            <TrendingUp size={18} />
            <span>Money</span>
          </SidebarLink>
          {/* Pricing also covers Referrals (both commercial levers). */}
          <SidebarLink href="/admin/pricing" match={['/admin/referrals']}>
            <Tags size={18} />
            <span>Pricing &amp; offers</span>
          </SidebarLink>
        </NavGroup>

        <NavGroup heading="PLATFORM" storageKey="admin" hrefs={['/admin/content', '/admin/perspectives', '/admin/guided', '/admin/config']}>
          {/* Content also covers Perspectives + Guided calm (tabbed together). */}
          <SidebarLink href="/admin/content" match={['/admin/perspectives', '/admin/guided']}>
            <Newspaper size={18} />
            <span>Content</span>
          </SidebarLink>
          <SidebarLink href="/admin/config">
            <Settings size={18} />
            <span>Configuration</span>
          </SidebarLink>
        </NavGroup>
      </aside>

      <div className="app-main">
        <header className="app-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div className="tb-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}
            </div>
            <div className="tb-greeting">
              Admin console<span> · {admin.name ?? 'GetCalmly'}</span>
            </div>
          </div>
          <div className="tb-actions">
            <NotificationBell
              items={notes}
              unread={unread}
              seeAllHref="/admin/notifications"
              onMarkRead={markAdminNotificationsRead}
            />
            <AdminAccountMenu name={admin.name ?? 'Admin'} />
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
    </ToastProvider>
  )
}
