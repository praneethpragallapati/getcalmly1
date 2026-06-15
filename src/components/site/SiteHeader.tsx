'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Community', href: '/community' },
  { label: 'About', href: '/about' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <nav id="nav">
      <Logo size={24} href="/" />

      <ul className="nav-links">
        {NAV.map((n) => (
          <li key={n.href}>
            <Link href={n.href}>{n.label}</Link>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <Link href="/for-therapists" className="btn-ghost">For Therapists</Link>
        <Link href="/login" className="btn-ghost" style={{ border: 'none', padding: '8px 10px' }}>Log in</Link>
        <Link href="/assess" className="btn-primary">Book a free session</Link>
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 22,
            color: 'var(--charcoal)',
            lineHeight: 1,
          }}
          className="nav-burger"
        >
          ☰
        </button>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--white)',
            borderBottom: '1px solid var(--border)',
            boxShadow: 'var(--sh-md)',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 6%',
            gap: 4,
          }}
        >
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} style={{ padding: '10px 0', fontSize: 15, fontWeight: 500, color: 'var(--charcoal)', textDecoration: 'none' }}>
              {n.label}
            </Link>
          ))}
          <Link href="/for-therapists" onClick={() => setOpen(false)} style={{ padding: '10px 0', fontSize: 15, fontWeight: 600, color: 'var(--coral)', textDecoration: 'none' }}>For Therapists</Link>
          <Link href="/login" onClick={() => setOpen(false)} style={{ padding: '10px 0', fontSize: 15, color: 'var(--charcoal)', textDecoration: 'none' }}>Log in</Link>
          <Link href="/assess" onClick={() => setOpen(false)} className="btn-primary" style={{ textAlign: 'center', marginTop: 6 }}>Book a free session</Link>
        </div>
      )}

      <style>{`
        @media(max-width:1000px){
          .lp-page .nav-burger{display:inline-block !important;}
        }
      `}</style>
    </nav>
  )
}
