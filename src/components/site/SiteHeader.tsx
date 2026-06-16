'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Community', href: '/community' },
  { label: 'About', href: '/about' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <nav id="nav">
      <Logo size={26} href="/" tagline />

      <ul className="nav-links">
        {NAV.map((n) => (
          <li key={n.href}>
            <Link href={n.href}>{n.label}</Link>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <Link
          href="/for-therapists"
          className="btn-ghost"
          style={{ color: '#1A7F7A', borderColor: 'rgba(26,127,122,.35)' }}
        >
          For Therapists
        </Link>
        <Link href="/login" className="btn-ghost" style={{ border: 'none', padding: '8px 10px' }}>Log in</Link>
        <Link href="/assess" className="btn-primary">Book a free session</Link>
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: 'var(--charcoal)',
            lineHeight: 0,
          }}
          className="nav-burger"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          )}
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
          .lp-page .nav-burger{display:inline-flex !important;}
        }
      `}</style>
    </nav>
  )
}
