'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Sidebar nav link for the expert portal that highlights when it matches the
 * current route. `exact` matches only that exact path (used for the Dashboard
 * root so it isn't lit up on every /expert/* page); otherwise a path and its
 * sub-routes both count as active (so /expert/blogs/x/edit still lights Blogs).
 * `match` adds sibling routes the entry also owns, so a merged entry stays lit
 * across every tab of its section (see data/sectionTabs).
 */
export function SidebarLink({
  href, exact, match, children,
}: {
  href: string; exact?: boolean; match?: string[]; children: React.ReactNode
}) {
  const pathname = usePathname()
  const owns = (h: string) => pathname === h || pathname.startsWith(h + '/')
  const active = exact ? pathname === href : owns(href) || (match ?? []).some(owns)
  return (
    <Link href={href} className={`sb-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  )
}
