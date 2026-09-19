import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { addressLines, contactEmail, legalName, socialLinks, supportPhone, supportPhoneTel } from '@/config/site'

const s = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor' } as const
const SOCIAL_ICON: Record<string, React.ReactNode> = {
  Instagram: (
    <svg {...s}><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.24A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.89A4.29 4.29 0 1 1 16.29 12 4.29 4.29 0 0 1 12 16.29Zm6.85-11.1a1.54 1.54 0 1 1-1.54-1.54 1.54 1.54 0 0 1 1.54 1.54Z"/></svg>
  ),
  YouTube: (
    <svg {...s}><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.55 15.57V8.43L15.82 12Z"/></svg>
  ),
  'X (Twitter)': (
    <svg {...s}><path d="M18.9 2.5h3.34l-7.3 8.34L23.5 21.5h-6.72l-5.26-6.88-6.02 6.88H2.16l7.8-8.92L1.5 2.5h6.9l4.76 6.29ZM17.73 19.5h1.85L7.36 4.4H5.38Z"/></svg>
  ),
  Facebook: (
    <svg {...s}><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></svg>
  ),
}

export default function SiteFooter() {
  return (
    <footer>
      <div className="foot-grid">
        <div className="foot-brand">
          <Logo size={52} href="/" onDark />
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            {socialLinks.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer" aria-label={link.label} className="foot-social">
                {SOCIAL_ICON[link.label] ?? link.label.charAt(0)}
              </a>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href={supportPhoneTel} style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📞</span> {supportPhone}
            </a>
            <a href={`mailto:${contactEmail}`} style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✉️</span> {contactEmail}
            </a>
            <p style={{ color: 'rgba(255,255,255,.56)', fontSize: 12.5, lineHeight: 1.6, marginTop: 4 }}>
              {legalName}<br />
              {addressLines[0]}<br />
              {addressLines[1]}
            </p>
          </div>
        </div>
        <div className="foot-col">
          <h4>Product</h4>
          <Link href="/#how">How it works</Link>
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/assess">Book session</Link>
        </div>
        <div className="foot-col">
          <h4>Care</h4>
          <Link href="/for-therapists">For Clinicians</Link>
          <Link href="/real-talk">Calm Club</Link>
          <Link href="/safety">Crisis resources</Link>
        </div>
        <div className="foot-col">
          <h4>Company</h4>
          <Link href="/about">About getCalmly</Link>
          <Link href="/enterprise">Enterprise</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/safety">Safety &amp; ethics</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms &amp; refund</Link>
        </div>
      </div>
      <div className="foot-bottom">
        <p>© {new Date().getFullYear()} {legalName}. Made with care in India.</p>
        <div className="foot-badges">
          <span className="fbadge">✓ Licensed clinicians</span>
          <span className="fbadge">🔒 DPDP Safe</span>
          <span className="fbadge">🇮🇳 India-made</span>
        </div>
      </div>
    </footer>
  )
}
