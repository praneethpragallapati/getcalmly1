import Link from 'next/link'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/site/ContactForm'
import {
  addressLines, primaryHelplines, supportEmail, supportHours,
  supportHoursLines, supportPhone, supportPhoneTel,
} from '@/config/site'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Talk to the getCalmly team about starting therapy, your existing sessions, billing, or partnering with us. We reply on weekdays, usually within one working day.',
}

const charcoal = '#1C2B3A'
// Brand coral is only AA-safe as large display text. Everything on this page
// uses it at body/eyebrow/button size, so it points at the darker ink cut
// (5.99:1 on cream, and on white behind a CTA) instead of #C8553D at 4.26:1.
const coral = '#A8432D'
const cream = '#FFFCFA'
const heroBg =
  'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29'

// The dark hero flips the requirement: the ink cut that clears AA on cream is
// 2.8:1 on charcoal, so eyebrows there take the LIGHT coral (6.6:1).
const eyebrow: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: coral,
}
const eyebrowOnDark: React.CSSProperties = { ...eyebrow, color: '#E8896F' }
const heading: React.CSSProperties = {
  fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, letterSpacing: '-0.5px',
}

const channels: { label: string; value: string; href: string; note: string }[] = [
  { label: 'Email us', value: supportEmail, href: `mailto:${supportEmail}`, note: 'For anything, care, billing or feedback.' },
  { label: 'Call us', value: supportPhone, href: supportPhoneTel, note: `${supportHours}.` },
  { label: 'Join as an expert', value: 'Apply to our network', href: '/for-therapists', note: 'RCI-verified clinicians, we’d love to meet you.' },
]

export default function ContactPage() {
  return (
    <div style={{ background: cream, minHeight: '100vh' }}>
      <style>{`
        .cwrap{max-width:1140px;margin:0 auto;width:100%;}
        .contact-hero{display:grid;grid-template-columns:1.3fr 1fr;gap:64px;align-items:end;}
        .contact-grid{display:grid;grid-template-columns:0.9fr 1.1fr;gap:56px;align-items:start;}
        .cfield{width:100%;border:1px solid #E4E7EB;border-radius:12px;padding:13px 15px;font-size:15px;
          font-family:'DM Sans',sans-serif;color:#1C2B3A;background:#fff;transition:border-color .18s, box-shadow .18s;}
        .cfield:focus{outline:none;border-color:${coral};box-shadow:0 0 0 3px rgba(200,85,61,.12);}
        .clabel{display:block;font-size:13px;font-weight:600;color:#5A6B7A;margin-bottom:7px;}
        .cchan{display:block;text-decoration:none;padding:24px 0;border-top:1px solid rgba(0,0,0,.08);transition:padding-left .2s;}
        .cchan:hover{padding-left:6px;}
        @media (max-width:900px){
          .contact-hero,.contact-grid{grid-template-columns:1fr;gap:32px;}
        }
      `}</style>

      {/* Hero */}
      <section style={{ background: heroBg, padding: '120px 40px 88px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -130, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="cwrap contact-hero" style={{ position: 'relative' }}>
          <div>
            <p style={{ ...eyebrowOnDark, marginBottom: 22 }}>Contact</p>
            <h1 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(40px, 6vw, 72px)', color: '#fff', letterSpacing: '-2px', lineHeight: 1.02, marginBottom: 0 }}>
              We&apos;re real people.<br />Say hello.
            </h1>
          </div>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,.72)', lineHeight: 1.8, fontWeight: 300, marginBottom: 6 }}>
            Questions about care, billing, or working together? Send us a note and we&apos;ll usually reply
            within a working day.
          </p>
        </div>
      </section>

      {/* Channels + form */}
      <section style={{ padding: '80px 40px 96px' }}>
        <div className="cwrap contact-grid">
          {/* Left: channels + details */}
          <div>
            <p style={{ ...eyebrow, marginBottom: 18 }}>Reach us directly</p>
            <div style={{ marginBottom: 40 }}>
              {channels.map((c) => (
                <a key={c.label} href={c.href} className="cchan" style={{ borderTop: c === channels[0] ? 'none' : undefined }}>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#5F6E7D', marginBottom: 8 }}>{c.label}</span>
                  <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: charcoal, letterSpacing: '-0.3px', marginBottom: 5 }}>{c.value}</span>
                  <span style={{ display: 'block', fontSize: 14, color: '#5A6A7A', lineHeight: 1.5 }}>{c.note}</span>
                </a>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#5F6E7D', marginBottom: 12 }}>Write to us</p>
                <p style={{ fontSize: 15, color: '#5A6B7A', lineHeight: 1.7 }}>
                  {addressLines[0]}<br />{addressLines[1]}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#5F6E7D', marginBottom: 12 }}>Support hours</p>
                <p style={{ fontSize: 15, color: '#5A6B7A', lineHeight: 1.7 }}>
                  {supportHoursLines[0]}<br />{supportHoursLines[1]}
                </p>
              </div>
            </div>

            {/* Crisis notice */}
            <div style={{ marginTop: 40, background: '#FDECEC', border: '1px solid #F3C9C9', borderRadius: 16, padding: '18px 22px' }}>
              <p style={{ fontSize: 14.5, color: '#9A3B3B', lineHeight: 1.7 }}>
                <strong>In crisis?</strong> This form isn&apos;t monitored for emergencies. Call{' '}
                {/* The blanket "(24/7)" that used to follow both numbers was wrong for
                    iCall, which runs business hours. Each line states its own now. */}
                {primaryHelplines.map((h, i) => (
                  <span key={h.id}>
                    {i > 0 && ' or '}
                    <a href={`tel:${h.tel}`} style={{ color: '#9A3B3B', textDecoration: 'underline', fontWeight: 700 }}>
                      {h.name} {h.number}
                    </a>
                    {` (${h.hours})`}
                  </span>
                ))}
                , or see our{' '}
                <Link href="/safety" style={{ color: '#9A3B3B', textDecoration: 'underline', fontWeight: 700 }}>Safety &amp; Ethics</Link> page.
              </p>
            </div>
          </div>

          {/* Right: form card */}
          <div style={{ background: '#fff', borderRadius: 24, padding: '36px 34px', border: '1px solid rgba(0,0,0,.07)', boxShadow: '0 20px 56px rgba(28,43,58,.08)' }}>
            <h2 style={{ ...heading, fontWeight: 700, fontSize: 26, color: charcoal, marginBottom: 6 }}>Send a message</h2>
            <p style={{ fontSize: 14.5, color: '#5A6A7A', marginBottom: 26, lineHeight: 1.6 }}>
              Tell us what you need. Everything you share here is confidential.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
