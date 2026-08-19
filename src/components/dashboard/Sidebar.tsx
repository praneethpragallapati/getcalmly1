'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
  LineChart,
  FileText,
  Gift,
  Settings,
  LogOut,
  Menu,
  Video,
  Waves,
  ChevronDown,
  X,
} from 'lucide-react'

const COLLAPSE_KEY = 'gc-sidebar-collapsed'

// `match` lists the sibling routes a merged entry also owns, so the item stays
// highlighted across every tab of its section (see data/sectionTabs).
type Item = { href: string; label: string; icon: typeof Home; badge?: string; match?: string[] }

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
      // My Care Team also covers Medications (tabbed together).
      { href: '/app/therapist', label: 'My Care Team', icon: Stethoscope, match: ['/app/medications'] },
      { href: '/app/sessions', label: 'Sessions', icon: CalendarDays },
      { href: '/app/guided', label: 'Guided calm', icon: Waves, badge: 'Soon' },
      { href: '/app/forms', label: 'Forms', icon: FileText },
    ],
  },
  {
    heading: 'Calm Club',
    items: [
      // Real Talk = community feed + polls. Perspectives = blogs (read) + talks (watch).
      { href: '/app/community', label: 'Real Talk', icon: Users, match: ['/app/polls'] },
      { href: '/app/blogs', label: 'Perspectives', icon: Video, match: ['/app/perspectives'] },
    ],
  },
  {
    heading: 'Account',
    items: [
      { href: '/app/progress', label: 'My Progress', icon: LineChart },
      { href: '/app/refer', label: 'Refer & earn', icon: Gift },
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
  // Collapsed group headings, persisted so the sidebar stays how you left it.
  const [collapsed, setCollapsed] = useState<string[]>([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_KEY)
      if (raw) setCollapsed(JSON.parse(raw) as string[])
    } catch { /* first visit / storage blocked */ }
  }, [])
  const toggleGroup = (heading: string) =>
    setCollapsed((prev) => {
      const next = prev.includes(heading) ? prev.filter((h) => h !== heading) : [...prev, heading]
      try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })

  const initial = name.charAt(0).toUpperCase()
  // Only show the Sessions badge when there's genuinely a session today.
  const badgeFor = (href: string): string | undefined =>
    href === '/app/sessions' && sessionsToday > 0 ? `${sessionsToday} today` : undefined

  const isActive = (item: Item) => {
    if (item.href === '/app') return pathname === '/app'
    return [item.href, ...(item.match ?? [])].some((h) => pathname.startsWith(h))
  }

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

        {GROUPS.map((g) => {
          // A group holding the current page never hides it.
          const hasActive = g.items.some(isActive)
          const isCollapsed = collapsed.includes(g.heading) && !hasActive
          return (
            <div key={g.heading}>
              <button
                type="button"
                className="sb-section sb-section-btn"
                aria-expanded={!isCollapsed}
                onClick={() => toggleGroup(g.heading)}
              >
                <span>{g.heading.toUpperCase()}</span>
                <ChevronDown
                  size={13}
                  style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none', transition: 'transform .18s' }}
                />
              </button>
              {!isCollapsed && (
                <nav className="sb-nav">
                  {g.items.map((item) => {
                    const { href, label, icon: Icon, badge } = item
                    const active = isActive(item)
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
              )}
            </div>
          )
        })}

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
