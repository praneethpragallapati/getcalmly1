import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function SiteFooter() {
  return (
    <footer>
      <div className="foot-grid">
        <div className="foot-brand">
          <Logo size={36} href="/" onDark />
          <p style={{ marginTop: 16 }}>
            Mental wellness reimagined. Clinical-grade therapy, AI insights, and a community that
            understands — all in one calm, trustworthy space.
          </p>
        </div>
        <div className="foot-col">
          <h4>Product</h4>
          <Link href="/#how">How it works</Link>
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/pricing">Book session</Link>
        </div>
        <div className="foot-col">
          <h4>Care</h4>
          <Link href="/services">Services</Link>
          <Link href="/for-therapists">Join our team</Link>
          <Link href="/community">Community</Link>
          <Link href="/safety">Crisis resources</Link>
        </div>
        <div className="foot-col">
          <h4>Company</h4>
          <Link href="/about">About getCalmly</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/safety">Safety &amp; ethics</Link>
        </div>
      </div>
      <div className="foot-bottom">
        <p>© {new Date().getFullYear()} getCalmly. Made with care in India.</p>
        <div className="foot-badges">
          <span className="fbadge">✓ RCI Compliant</span>
          <span className="fbadge">🔒 DPDP Safe</span>
          <span className="fbadge">🇮🇳 India-made</span>
        </div>
      </div>
    </footer>
  )
}
