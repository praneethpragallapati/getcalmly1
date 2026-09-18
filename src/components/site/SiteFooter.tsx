import Link from 'next/link'
import { Instagram, Youtube, Twitter, Facebook } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { addressLines, contactEmail, legalName, socialLinks, supportPhone, supportPhoneTel } from '@/config/site'

const SOCIAL_ICON: Record<string, typeof Instagram> = {
  Instagram, YouTube: Youtube, 'X (Twitter)': Twitter, Facebook,
}

export default function SiteFooter() {
  return (
    <footer>
      <div className="foot-grid">
        <div className="foot-brand">
          <Logo size={52} href="/" onDark />
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            {socialLinks.map((s) => {
              const Icon = SOCIAL_ICON[s.label]
              return (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} className="foot-social">
                  {Icon ? <Icon size={16} /> : s.label.charAt(0)}
                </a>
              )
            })}
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
