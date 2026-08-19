'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

/**
 * A collapsible sidebar group. The heading is a button; collapsed state persists
 * per group in localStorage so the sidebar stays how you left it. A group that
 * contains the current page never collapses, so the active item can't hide
 * itself. Children are the group's links (server-rendered is fine).
 */
export function NavGroup({
  heading,
  storageKey,
  hrefs = [],
  children,
}: {
  heading: string
  /** Namespace for persistence, e.g. 'expert' | 'admin'. */
  storageKey: string
  /** Routes this group owns — used to keep it open on the active page. */
  hrefs?: string[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const key = `gc-nav-collapsed:${storageKey}:${heading}`
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(key) === '1')
    } catch { /* first visit / storage blocked */ }
  }, [key])

  const hasActive = hrefs.some((h) => pathname === h || pathname.startsWith(`${h}/`))
  const isCollapsed = collapsed && !hasActive

  const toggle = () =>
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem(key, next ? '1' : '0') } catch { /* ignore */ }
      return next
    })

  return (
    <div>
      <button type="button" className="sb-section sb-section-btn" aria-expanded={!isCollapsed} onClick={toggle}>
        <span>{heading}</span>
        <ChevronDown size={13} style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none', transition: 'transform .18s' }} />
      </button>
      {!isCollapsed && <nav className="sb-nav">{children}</nav>}
    </div>
  )
}
