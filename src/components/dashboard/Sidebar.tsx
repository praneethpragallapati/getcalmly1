'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import {
  Home,
  Sparkles,
  BookOpen,
  Stethoscope,
  CalendarDays,
  Users,
  LineChart,
  Pill,
  FileText,
  Settings,
} from 'lucide-react'

type Item = { href: string; label: string; icon: typeof Home; badge?: string }

const GROUPS: { heading: string; items: Item[] }[] = [
  {
    heading: 'Main',
    items: [
      { href: '/app', label: 'Home', icon: Home },
      { href: '/app/calm-ai', label: 'Talk to Calm AI', icon: Sparkles, badge: 'New' },
      { href: '/app/journal', label: 'Journal', icon: BookOpen },
    ],
  },
  {
    heading: 'Care',
    items: [
      { href: '/app/therapist', label: 'My Therapist', icon: Stethoscope },
      { href: '/app/sessions', label: 'Sessions', icon: CalendarDays, badge: '1 today' },
      { href: '/app/forms', label: 'Forms', icon: FileText },
      { href: '/app/community', label: 'Community', icon: Users },
    ],
  },
  {
    heading: 'Account',
    items: [
      { href: '/app/progress', label: 'My Progress', icon: LineChart },
      { href: '/app/medications', label: 'Medications', icon: Pill },
      { href: '/app/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function Sidebar({ name, planLine }: { name: string; planLine: string }) {
  const pathname = usePathname()
  const initial = name.charAt(0).toUpperCase()

  return (
    <aside className="app-sidebar">
      <div className="sb-logo">
        <Logo size={26} onDark tagline={false} href="/app" />
      </div>

      <Link href="/app/settings" className="sb-profile">
        <span className="sb-avatar">{initial}</span>
        <span>
          <span className="sb-profile-name" style={{ display: 'block' }}>
            {name}
          </span>
          <span className="sb-profile-sub">{planLine}</span>
        </span>
      </Link>

      {GROUPS.map((g) => (
        <div key={g.heading}>
          <div className="sb-section">{g.heading.toUpperCase()}</div>
          <nav className="sb-nav">
            {g.items.map(({ href, label, icon: Icon, badge }) => {
              const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
              return (
                <Link key={href} href={href} className={`sb-link${active ? ' active' : ''}`}>
                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                  <span>{label}</span>
                  {badge && <span className="sb-badge">{badge}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      ))}

      <div className="sb-plan">
        <div className="sb-plan-label">CLINICAL PLAN</div>
        <div className="sb-plan-text">Unlimited sessions + dedicated care coordinator</div>
        <Link href="/app/settings" className="sb-plan-btn">
          See what&apos;s included →
        </Link>
      </div>
    </aside>
  )
}
