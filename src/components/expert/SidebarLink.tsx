'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Sidebar nav link for the expert portal that highlights when it matches the
 * current route. `exact` matches only that exact path (used for the Dashboard
 * root so it isn't lit up on every /expert/* page); otherwise a path and its
 * sub-routes both count as active (so /expert/blogs/x/edit still lights Blogs).
 */
export function SidebarLink({
  href, exact, children,
}: {
  href: string; exact?: boolean; children: React.ReactNode
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  return (
    <Link href={href} className={`sb-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  )
}
