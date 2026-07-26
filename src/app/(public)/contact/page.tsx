import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | GetCalmly',
  description: 'Get in touch with the GetCalmly team, questions about care, billing, or partnerships.',
}

const charcoal = '#1C2B3A'
const coral = '#C8553D'
const cream = '#FFFCFA'
const heroBg =
  'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29'

const eyebrow: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: coral,
}
const heading: React.CSSProperties = {
  fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, letterSpacing: '-0.5px',
}

const channels: { label: string; value: string; href: string; note: string }[] = [
  { label: 'Email us', value: 'getcalmly@gmail.com', href: 'mailto:getcalmly@gmail.com', note: 'For anything, care, billing or feedback.' },
  { label: 'Call us', value: '+91 88845 18688', href: 'tel:+918884518688', note: 'Mon to Sat, 9:00 AM to 8:00 PM IST.' },
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
            <p style={{ ...eyebrow, marginBottom: 22 }}>Contact</p>
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
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9AA8B4', marginBottom: 8 }}>{c.label}</span>
                  <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: charcoal, letterSpacing: '-0.3px', marginBottom: 5 }}>{c.value}</span>
                  <span style={{ display: 'block', fontSize: 14, color: '#6B7D8E', lineHeight: 1.5 }}>{c.note}</span>
                </a>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9AA8B4', marginBottom: 12 }}>Write to us</p>
                <p style={{ fontSize: 15, color: '#5A6B7A', lineHeight: 1.7 }}>
                  316, 11th A Main, Classic Paradise Layout,<br />Begur, Bengaluru 560068, India
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9AA8B4', marginBottom: 12 }}>Support hours</p>
                <p style={{ fontSize: 15, color: '#5A6B7A', lineHeight: 1.7 }}>
                  Monday to Saturday<br />9:00 AM to 8:00 PM IST
                </p>
              </div>
            </div>

            {/* Crisis notice */}
            <div style={{ marginTop: 40, background: '#FDECEC', border: '1px solid #F3C9C9', borderRadius: 16, padding: '18px 22px' }}>
              <p style={{ fontSize: 14.5, color: '#9A3B3B', lineHeight: 1.7 }}>
                <strong>In crisis?</strong> This form isn&apos;t monitored for emergencies. Call{' '}
                <a href="tel:+919152987821" style={{ color: '#9A3B3B', textDecoration: 'underline', fontWeight: 700 }}>iCall 9152987821</a> or{' '}
                <a href="tel:+917893078930" style={{ color: '#9A3B3B', textDecoration: 'underline', fontWeight: 700 }}>One Life 78930-78930</a> (24/7), or see our{' '}
                <Link href="/safety" style={{ color: '#9A3B3B', textDecoration: 'underline', fontWeight: 700 }}>Safety &amp; Ethics</Link> page.
              </p>
            </div>
          </div>

          {/* Right: form card */}
          <div style={{ background: '#fff', borderRadius: 24, padding: '36px 34px', border: '1px solid rgba(0,0,0,.07)', boxShadow: '0 20px 56px rgba(28,43,58,.08)' }}>
            <h2 style={{ ...heading, fontWeight: 700, fontSize: 26, color: charcoal, marginBottom: 6 }}>Send a message</h2>
            <p style={{ fontSize: 14.5, color: '#6B7D8E', marginBottom: 26, lineHeight: 1.6 }}>
              Tell us what you need. Everything you share here is confidential.
            </p>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="clabel">Name</label>
                <input type="text" className="cfield" placeholder="Your name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="clabel">Email</label>
                  <input type="email" className="cfield" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="clabel">Phone <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(optional)</span></label>
                  <input type="tel" className="cfield" placeholder="+91" />
                </div>
              </div>
              <div>
                <label className="clabel">Message</label>
                <textarea rows={5} className="cfield" placeholder="How can we help?" style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" style={{ background: coral, color: '#fff', padding: '15px', borderRadius: 12, fontSize: 15.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 8px 22px ${coral}45` }}>
                Send message →
              </button>
              <p style={{ fontSize: 12.5, color: '#A0ADB8', textAlign: 'center', lineHeight: 1.6 }}>
                By sending, you agree to our{' '}
                <Link href="/privacy" style={{ color: coral, fontWeight: 600 }}>Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
