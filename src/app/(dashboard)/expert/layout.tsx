import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Home, Users, AlertTriangle, CalendarClock, Wallet, CalendarCog, UsersRound, MessagesSquare, Newspaper, UserCircle, Lock } from 'lucide-react'
import '../app.css'
import Logo from '@/components/ui/Logo'
import { SidebarLink } from '@/components/expert/SidebarLink'
import { getTherapistContext, getRiskNotifications } from '@/lib/expert'
import { mustChangePassword } from '@/lib/accountSecurity'

export const metadata: Metadata = {
  title: 'Expert portal',
  robots: { index: false, follow: false },
}

export default async function ExpertLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')
  if (await mustChangePassword(ctx.userId)) redirect('/change-password')

  const risk = await getRiskNotifications(ctx.therapistProfileId)
  const openCount = risk.length

  return (
    <div className="calmly-app expert-theme">
      <aside className="app-sidebar">
        <div className="sb-logo">
          <Logo size={26} onDark tagline={false} href="/expert" tint="green" />
        </div>
        <div className="sb-section">CASELOAD</div>
        <nav className="sb-nav">
          <SidebarLink href="/expert" exact>
            <Home size={18} />
            <span>Dashboard</span>
          </SidebarLink>
          <SidebarLink href="/expert/patients">
            <Users size={18} />
            <span>My Patients</span>
          </SidebarLink>
          <SidebarLink href="/expert/schedule">
            <CalendarClock size={18} />
            <span>Schedule</span>
          </SidebarLink>
          <SidebarLink href="/expert/availability">
            <CalendarCog size={18} />
            <span>Availability</span>
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
        </nav>

        <div className="sb-section">PRACTICE</div>
        <nav className="sb-nav">
          <SidebarLink href="/expert/community">
            <MessagesSquare size={18} />
            <span>Community</span>
          </SidebarLink>
          <SidebarLink href="/expert/blogs">
            <Newspaper size={18} />
            <span>Blogs</span>
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
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="tb-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="tb-greeting">
              {(() => {
                const h = new Date().getHours()
                const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
                return (
                  <>
                    {g}, <span>{ctx.therapistName ?? 'Doctor'}</span>
                  </>
                )
              })()}
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
