import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Inbox, Users, UsersRound, UserPlus, HeartPulse, CalendarClock, Banknote, TrendingUp, Newspaper, Settings, Tags } from 'lucide-react'
import '../(dashboard)/app.css'
import Logo from '@/components/ui/Logo'
import { SidebarLink } from '@/components/expert/SidebarLink'
import { getAdminSession } from '@/lib/admin'
import { mustChangePassword } from '@/lib/accountSecurity'

export const metadata: Metadata = {
  title: 'Admin · GetCalmly',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  if (await mustChangePassword(admin.id)) redirect('/change-password')

  return (
    <div className="calmly-app admin-theme">
      <aside className="app-sidebar">
        <div className="sb-logo">
          <Logo size={26} onDark tagline={false} href="/admin" />
        </div>

        <div className="sb-section">OVERVIEW</div>
        <nav className="sb-nav">
          <SidebarLink href="/admin" exact>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </SidebarLink>
          <SidebarLink href="/admin/submissions">
            <Inbox size={18} />
            <span>Submissions</span>
          </SidebarLink>
        </nav>

        <div className="sb-section">PEOPLE</div>
        <nav className="sb-nav">
          <SidebarLink href="/admin/therapists">
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
          <SidebarLink href="/admin/supervision">
            <UsersRound size={18} />
            <span>Supervision</span>
          </SidebarLink>
        </nav>

        <div className="sb-section">OPERATIONS</div>
        <nav className="sb-nav">
          <SidebarLink href="/admin/operations">
            <CalendarClock size={18} />
            <span>Operations</span>
          </SidebarLink>
          <SidebarLink href="/admin/money">
            <Banknote size={18} />
            <span>Money</span>
          </SidebarLink>
          <SidebarLink href="/admin/revenue">
            <TrendingUp size={18} />
            <span>Revenue</span>
          </SidebarLink>
          <SidebarLink href="/admin/pricing">
            <Tags size={18} />
            <span>Pricing</span>
          </SidebarLink>
        </nav>

        <div className="sb-section">PLATFORM</div>
        <nav className="sb-nav">
          <SidebarLink href="/admin/content">
            <Newspaper size={18} />
            <span>Content</span>
          </SidebarLink>
          <SidebarLink href="/admin/config">
            <Settings size={18} />
            <span>Configuration</span>
          </SidebarLink>
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="tb-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="tb-greeting">
              Admin console<span> · {admin.name ?? 'GetCalmly'}</span>
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
