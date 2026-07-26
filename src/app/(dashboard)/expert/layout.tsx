import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Users, AlertTriangle, CalendarClock, Wallet, CalendarCog, UsersRound, MessagesSquare, Newspaper, UserCircle, Lock } from 'lucide-react'
import '../app.css'
import Logo from '@/components/ui/Logo'
import { getTherapistContext, getRiskNotifications } from '@/lib/expert'

export const metadata: Metadata = {
  title: 'Expert portal',
  robots: { index: false, follow: false },
}

export default async function ExpertLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const risk = await getRiskNotifications(ctx.therapistProfileId)
  const openCount = risk.length

  return (
    <div className="calmly-app expert-theme">
      <aside className="app-sidebar">
        <div className="sb-logo">
          <Logo size={26} onDark tagline={false} href="/expert" />
        </div>
        <div className="sb-section">CASELOAD</div>
        <nav className="sb-nav">
          <Link href="/expert" className="sb-link">
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/expert/patients" className="sb-link">
            <Users size={18} />
            <span>My Patients</span>
          </Link>
          <Link href="/expert/schedule" className="sb-link">
            <CalendarClock size={18} />
            <span>Schedule</span>
          </Link>
          <Link href="/expert/availability" className="sb-link">
            <CalendarCog size={18} />
            <span>Availability</span>
          </Link>
          <Link href="/expert/risk" className="sb-link">
            <AlertTriangle size={18} />
            <span>Risk notifications</span>
            {openCount > 0 && <span className="sb-badge">{openCount}</span>}
          </Link>
          <Link href="/expert/supervision" className="sb-link">
            <UsersRound size={18} />
            <span>Supervision</span>
          </Link>
        </nav>

        <div className="sb-section">PRACTICE</div>
        <nav className="sb-nav">
          <Link href="/expert/community" className="sb-link">
            <MessagesSquare size={18} />
            <span>Community</span>
          </Link>
          <Link href="/expert/blogs" className="sb-link">
            <Newspaper size={18} />
            <span>Blogs</span>
          </Link>
          <Link href="/expert/profile" className="sb-link">
            <UserCircle size={18} />
            <span>Profile</span>
          </Link>
          {ctx.employmentType === 'PART_TIME' ? (
            <Link href="/expert/earnings" className="sb-link">
              <Wallet size={18} />
              <span>Earnings</span>
            </Link>
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
