'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Sparkles, Stethoscope, User } from 'lucide-react'

const TABS = [
  { href: '/app', label: 'Home', icon: Home },
  { href: '/app/journal', label: 'Journal', icon: BookOpen },
  { href: '/app/calm-ai', label: 'Calm AI', icon: Sparkles },
  { href: '/app/care', label: 'Care', icon: Stethoscope },
  { href: '/app/account', label: 'Account', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="bottom-nav">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
        return (
          <Link key={href} href={href} className={`nav-item${active ? ' active' : ''}`}>
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            <span className="nav-label">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
