'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Logo from '@/components/ui/Logo'
import {
  Home,
  Sparkles,
  BookOpen,
  Stethoscope,
  CalendarDays,
  Users,
  Newspaper,
  LineChart,
  Pill,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
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
      { href: '/app/sessions', label: 'Sessions', icon: CalendarDays },
      { href: '/app/forms', label: 'Forms', icon: FileText },
    ],
  },
  {
    heading: 'Calm Club',
    items: [
      { href: '/app/blogs', label: 'Blogs', icon: Newspaper },
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

export function Sidebar({
  name,
  planLine,
  planActive = false,
  planName = 'No active plan',
  sessionsToday = 0,
}: {
  name: string
  planLine: string
  planActive?: boolean
  planName?: string
  sessionsToday?: number
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const initial = name.charAt(0).toUpperCase()
  // Only show the Sessions badge when there's genuinely a session today.
  const badgeFor = (href: string): string | undefined =>
    href === '/app/sessions' && sessionsToday > 0 ? `${sessionsToday} today` : undefined

  return (
    <>
      {/* Mobile hamburger — hidden on desktop via CSS */}
      <button
        type="button"
        className="sb-burger"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Backdrop when the drawer is open on mobile */}
      {open && <button className="sb-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <aside className={`app-sidebar${open ? ' sb-open' : ''}`}>
        <div className="sb-logo" style={{ justifyContent: 'space-between' }}>
          <Logo size={26} onDark tagline={false} href="/app" />
          <button
            type="button"
            className="sb-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <Link href="/app/settings" className="sb-profile" onClick={() => setOpen(false)}>
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
                const shownBadge = badge ?? badgeFor(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`sb-link${active ? ' active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                    <span>{label}</span>
                    {shownBadge && <span className="sb-badge">{shownBadge}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}

        <div className="sb-plan">
          <div className="sb-plan-label">{planActive ? 'YOUR PLAN' : 'NO ACTIVE PLAN'}</div>
          <div className="sb-plan-text">
            {planActive ? planName : 'Book your first session to get started'}
          </div>
          <Link href={planActive ? '/app/settings' : '/app/billing'} className="sb-plan-btn">
            {planActive ? 'Manage plan →' : 'Book a session →'}
          </Link>
        </div>

        <button type="button" className="sb-logout" onClick={() => signOut({ callbackUrl: '/' })}>
          <LogOut size={17} strokeWidth={2} />
          <span>Log out</span>
        </button>
      </aside>
    </>
  )
}
