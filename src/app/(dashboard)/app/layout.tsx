import type { Metadata } from 'next'
import Link from 'next/link'
import '../app.css'
import { BottomNav } from '@/components/dashboard/BottomNav'

export const metadata: Metadata = {
  title: 'Your space',
  robots: { index: false, follow: false },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="calmly-app">
      <div className="app-frame">
        <header className="app-header">
          <Link href="/app" className="app-logo" aria-label="getCalmly home">
            <span className="get">get</span>
            <span className="calmly">Calmly.</span>
          </Link>
          <div className="app-header-actions">
            <button className="icon-btn bell" aria-label="Notifications">
              🔔<span className="notif-dot" />
            </button>
            <Link href="/app/account" className="icon-btn avatar" aria-label="Account">
              A
            </Link>
          </div>
        </header>
        <div className="app-scroll">{children}</div>
        <BottomNav />
      </div>
    </div>
  )
}
