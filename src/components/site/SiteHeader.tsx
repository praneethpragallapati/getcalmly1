'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { SERVICE_ICONS } from './serviceIcons'

// Ordered by how people actually arrive: core 1:1 care first, then the
// medical layer, then relationships, life-stage, tools, and specialised.
const SERVICES = [
  { slug: 'therapy', accent: '#C8553D', pale: 'rgba(200,85,61,.10)', title: 'Individual Therapy', tag: 'Anxiety, depression, stress & burnout' },
  { slug: 'psychiatry', accent: '#1A7F7A', pale: 'rgba(26,127,122,.10)', title: 'Psychiatry', tag: 'Evaluation, diagnosis & medication' },
  { slug: 'couples', accent: '#7C5CBF', pale: 'rgba(124,92,191,.10)', title: 'Couples & Relationships', tag: 'Communication, trust & repair' },
  { slug: 'child', accent: '#3D9E72', pale: 'rgba(61,158,114,.10)', title: 'Children & Teens', tag: 'Age-appropriate, judgment-free care' },
  { slug: 'maternal', accent: '#D98C5F', pale: 'rgba(217,140,95,.12)', title: 'Motherhood & Postpartum', tag: 'Support built for this season' },
  { slug: 'assessments', accent: '#C9973A', pale: 'rgba(201,151,58,.12)', title: 'Psychological Assessments', tag: 'Clarity through validated tools' },
  { slug: 'specialised', accent: '#C04B8A', pale: 'rgba(192,75,138,.10)', title: 'Specialised Support', tag: 'LGBTQIA+, grief, chronic illness' },
]

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Blog', href: '/blog' },
  { label: 'Community', href: '/community' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Enterprise', href: '/enterprise' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <nav id="nav">
      <Logo size={26} href="/" tagline />

      <ul className="nav-links">
        <li><Link href="/">Home</Link></li>

        {/* Services — hover mega-menu, no standalone tab */}
        <li className="nav-item">
          <span className="nav-trigger">
            Services
            <svg className="nav-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </span>
          <div className="nav-mega-wrap">
            <div className="nav-mega">
              {SERVICES.map((s) => {
                const Icon = SERVICE_ICONS[s.slug]
                return (
                  <Link key={s.slug} href={`/services/${s.slug}`} className="nav-mega-item">
                    <span className="nav-mega-ic" style={{ background: s.pale }}>
                      <Icon size={18} color={s.accent} strokeWidth={2} />
                    </span>
                    <span>
                      <span className="nav-mega-t">{s.title}</span>
                      <span className="nav-mega-d">{s.tag}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </li>

        {NAV.slice(1).map((n) => (
          <li key={n.href}>
            <Link href={n.href}>{n.label}</Link>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <Link
          href="/for-therapists"
          className="btn-ghost"
          style={{ color: '#3D9E72', borderColor: 'rgba(61,158,114,.35)' }}
        >
          Join our experts
        </Link>
        <Link href="/login" className="btn-ghost" style={{ border: 'none', padding: '8px 10px' }}>Log in</Link>
        <Link href="/pricing" className="btn-primary">Book session</Link>
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
            maxHeight: 'calc(100vh - 68px)',
            overflowY: 'auto',
          }}
        >
          <Link href="/" onClick={() => setOpen(false)} style={mobLink}>Home</Link>

          {/* Services group — expanded inline on mobile */}
          <p style={{ padding: '12px 0 4px', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--charcoal-l)' }}>Services</p>
          {SERVICES.map((s) => {
            const Icon = SERVICE_ICONS[s.slug]
            return (
              <Link key={s.slug} href={`/services/${s.slug}`} onClick={() => setOpen(false)} style={{ ...mobLink, paddingLeft: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: s.pale, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={s.accent} strokeWidth={2} />
                </span>
                {s.title}
              </Link>
            )
          })}

          {NAV.slice(1).map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} style={mobLink}>
              {n.label}
            </Link>
          ))}
          <Link href="/for-therapists" onClick={() => setOpen(false)} style={{ padding: '10px 0', fontSize: 15, fontWeight: 600, color: '#3D9E72', textDecoration: 'none' }}>Join our experts</Link>
          <Link href="/login" onClick={() => setOpen(false)} style={{ padding: '10px 0', fontSize: 15, color: 'var(--charcoal)', textDecoration: 'none' }}>Log in</Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="btn-primary" style={{ textAlign: 'center', marginTop: 6 }}>Book session</Link>
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

const mobLink: React.CSSProperties = { padding: '10px 0', fontSize: 15, fontWeight: 500, color: 'var(--charcoal)', textDecoration: 'none' }
