import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, AlertTriangle } from 'lucide-react'
import '../app.css'
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
    <div className="calmly-app">
      <aside className="app-sidebar">
        <Link href="/expert" className="sb-logo" aria-label="getCalmly expert portal">
          <span className="get">get</span>
          <span className="calmly">Calmly.</span>
        </Link>
        <div className="sb-section">CASELOAD</div>
        <nav className="sb-nav">
          <Link href="/expert" className="sb-link">
            <Users size={18} />
            <span>Patients</span>
          </Link>
          <Link href="/expert/risk" className="sb-link">
            <AlertTriangle size={18} />
            <span>Risk notifications</span>
            {openCount > 0 && <span className="sb-badge">{openCount}</span>}
          </Link>
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="tb-date">Expert portal</div>
            <div className="tb-greeting">Your caseload</div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
