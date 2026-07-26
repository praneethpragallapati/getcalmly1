import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function SiteFooter() {
  return (
    <footer>
      <div className="foot-grid">
        <div className="foot-brand">
          <Logo size={36} href="/" onDark />
          <p style={{ marginTop: 16, lineHeight: 1.6 }}>
            Mental wellness reimagined. Clinical-grade therapy, AI insights, and a community that
            understands, all in one calm, trustworthy space.
          </p>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="tel:+918884518688" style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📞</span> +91 88845 18688
            </a>
            <a href="mailto:connect@getcalmly.com" style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✉️</span> connect@getcalmly.com
            </a>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12.5, lineHeight: 1.6, marginTop: 4 }}>
              GetCalmly Private Limited<br />
              316, 11th A Cross, Classic Layout,<br />
              Begur, Bengaluru 560068, India
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
          <Link href="/services">Services</Link>
          <Link href="/for-therapists">Join our experts</Link>
          <Link href="/real-talk">Real Talk</Link>
          <Link href="/safety">Crisis resources</Link>
        </div>
        <div className="foot-col">
          <h4>Company</h4>
          <Link href="/about">About GetCalmly</Link>
          <Link href="/enterprise">Enterprise</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/safety">Safety &amp; ethics</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms &amp; refund</Link>
        </div>
      </div>
      <div className="foot-bottom">
        <p>© {new Date().getFullYear()} GetCalmly Private Limited. Made with care in India.</p>
        <div className="foot-badges">
          <span className="fbadge">✓ Licensed clinicians</span>
          <span className="fbadge">🔒 DPDP Safe</span>
          <span className="fbadge">🇮🇳 India-made</span>
        </div>
      </div>
    </footer>
  )
}
