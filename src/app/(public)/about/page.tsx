import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | GetCalmly',
  description:
    'GetCalmly bridges India’s mental health treatment gap with RCI-licensed, vernacular-first, culturally-aware therapy, amplified by thoughtful AI.',
}

const charcoal = '#1C2B3A'
const coral = '#C8553D'
const cream = '#FFFCFA'

const stats: [string, string][] = [
  ['60%+', 'treatment gap in India'],
  ['0.75', 'psychiatrists per 100,000 people'],
  ['100%', 'RCI & NMC verified clinicians'],
]

const values: { title: string; desc: string }[] = [
  { title: 'Privacy first', desc: 'DPDP-compliant, encrypted, and confidential by design. What you share stays yours.' },
  { title: 'Culturally attuned', desc: 'Care that understands your context, matched to fit rather than one-size-fits-all.' },
  { title: 'Clinically credible', desc: 'Only RCI-licensed psychologists and NMC-registered psychiatrists. No exceptions.' },
  { title: 'Accessible & affordable', desc: 'Quality care within your budget, from your couch or in person.' },
]

const contacts: { label: string; value: string; href: string }[] = [
  { label: 'Email us', value: 'connect@getcalmly.com', href: 'mailto:connect@getcalmly.com' },
  { label: 'Call us', value: '+91 88845 18688', href: 'tel:+918884518688' },
  { label: 'Partnerships', value: 'connect@getcalmly.com', href: 'mailto:connect@getcalmly.com' },
]

const socials: [string, string][] = [
  ['Instagram', 'https://instagram.com/getcalmly'],
  ['LinkedIn', 'https://linkedin.com/company/getcalmly'],
  ['X (Twitter)', 'https://x.com/getcalmly'],
  ['YouTube', 'https://youtube.com/@getcalmly'],
]

const eyebrow: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: coral,
}
const heading: React.CSSProperties = {
  fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, letterSpacing: '-0.5px',
}

export default function AboutPage() {
  return (
    <div style={{ background: cream, minHeight: '100vh' }}>
      <style>{`
        .awrap{max-width:1140px;margin:0 auto;width:100%;}
        .about-hero{display:grid;grid-template-columns:1.35fr 1fr;gap:64px;align-items:end;}
        .about-split{display:grid;grid-template-columns:1.15fr 1fr;gap:72px;align-items:center;}
        .about-edit{display:grid;grid-template-columns:330px 1fr;gap:80px;align-items:start;}
        .about-edit .about-sticky{position:sticky;top:100px;}
        .about-values{display:grid;grid-template-columns:1fr 1fr;gap:4px 64px;}
        .about-contact{display:grid;grid-template-columns:0.85fr 1.15fr;gap:72px;align-items:start;}
        @media (max-width: 900px){
          .about-hero,.about-split,.about-edit,.about-values,.about-contact{
            grid-template-columns:1fr;gap:32px;
          }
          .about-edit .about-sticky{position:static;}
        }
      `}</style>

      {/* ─── HERO: lead with the human, not the company ─── */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '113px 40px 100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -130, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="awrap about-hero" style={{ position: 'relative' }}>
          <div>
            <p style={{ ...eyebrow, marginBottom: 22 }}>Our story</p>
            <h1 style={{
              ...heading, fontWeight: 300, fontSize: 'clamp(40px, 6vw, 76px)', color: '#fff',
              letterSpacing: '-2px', lineHeight: 1.02, marginBottom: 0,
            }}>
              Mental health support that understands you.
            </h1>
          </div>
          <p style={{ fontSize: 19, color: 'rgba(255,255,255,.74)', lineHeight: 1.8, fontWeight: 300, marginBottom: 6 }}>
            GetCalmly connects people across India with the right licensed professional, matched not just
            by symptoms but by your needs, context, language and budget. Real care from real experts, made
            easier to reach and easier to stay with.
          </p>
        </div>
      </section>

      {/* ─── WHY WE EXIST + THE NUMBERS: statement left, scale right ─── */}
      <section style={{ padding: '99px 40px 76px' }}>
        <div className="awrap about-split">
          <div>
            <p style={{ ...eyebrow, marginBottom: 22 }}>Why we exist</p>
            <p style={{
              ...heading, fontWeight: 700, fontSize: 'clamp(26px, 3.4vw, 40px)',
              color: charcoal, lineHeight: 1.18, marginBottom: 0,
            }}>
              Too many people in India carry their hardest moments alone, not because help doesn&apos;t exist,
              but because it never quite reaches them.
            </p>
          </div>
          <div>
            {stats.map(([n, d], idx) => (
              <div key={d} style={{
                display: 'flex', alignItems: 'baseline', gap: 22,
                padding: '22px 0', borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,.09)',
              }}>
                <p style={{ ...heading, fontSize: 'clamp(38px, 5vw, 56px)', color: coral, lineHeight: 1, letterSpacing: '-1.5px', minWidth: 130 }}>{n}</p>
                <p style={{ fontSize: 15.5, color: '#6B7D8E', lineHeight: 1.55, fontWeight: 300 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE MISSION: charcoal band, single bold idea ─── */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', padding: '113px 40px' }}>
        <div className="awrap" style={{ maxWidth: 900, textAlign: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: 24 }}>Our mission</p>
          <p style={{
            ...heading, fontWeight: 900, fontSize: 'clamp(30px, 4.6vw, 52px)',
            color: '#fff', letterSpacing: '-1px', lineHeight: 1.12, margin: '0 auto',
          }}>
            To make credible mental health care reach every corner of India, in the language you think in,
            at a price that never stands in the way.
          </p>
        </div>
      </section>

      {/* ─── THE PROBLEM: editorial two-column ─── */}
      <section style={{ background: '#fff', padding: '109px 40px' }}>
        <div className="awrap about-edit">
          <div className="about-sticky">
            <p style={{ ...eyebrow, marginBottom: 18 }}>The problem</p>
            <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(28px, 3.4vw, 40px)', color: charcoal, marginBottom: 0, lineHeight: 1.1 }}>
              Help exists. Reaching it is the hard part.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 18.5, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 22, marginTop: 0 }}>
              India faces a mental health treatment gap exceeding 60%. With roughly 0.75 psychiatrists per
              100,000 people, and specialists concentrated in major cities, millions in Tier-2 and Tier-3
              regions go underserved.
            </p>
            <p style={{ fontSize: 18.5, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 0 }}>
              NRIs, meanwhile, often pay high fees for therapists who don&apos;t share their cultural context,
              and end up explaining who they are before the real work can begin.
            </p>
          </div>
        </div>
      </section>

      {/* ─── OUR APPROACH: editorial two-column ─── */}
      <section style={{ padding: '109px 40px' }}>
        <div className="awrap about-edit">
          <div className="about-sticky">
            <p style={{ ...eyebrow, marginBottom: 18 }}>Our approach</p>
            <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(28px, 3.4vw, 40px)', color: charcoal, marginBottom: 0, lineHeight: 1.1 }}>
              Care that fits you, not the other way around.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 18.5, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 22, marginTop: 0 }}>
              We&apos;ve built a strictly vetted network of RCI-licensed professionals, and a match that pairs
              you on cultural fit and your needs rather than diagnosis alone. A hybrid safety protocol keeps
              care safe, not just digital.
            </p>
            <p style={{ fontSize: 18.5, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 0 }}>
              And because healing happens between sessions too, a supportive app and community stay with you
              the rest of the week, amplified by thoughtful AI that never replaces the human in the room.
            </p>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE STAND FOR: two-column value grid ─── */}
      <section style={{ background: '#fff', padding: '109px 40px' }}>
        <div className="awrap">
          <p style={{ ...eyebrow, marginBottom: 18 }}>What we stand for</p>
          <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(28px, 3.4vw, 40px)', color: charcoal, marginBottom: 44, lineHeight: 1.1 }}>
            The beliefs behind every match.
          </h2>
          <div className="about-values">
            {values.map((v) => (
              <div key={v.title} style={{
                display: 'grid', gridTemplateColumns: '12px 1fr', gap: 18, alignItems: 'flex-start',
                padding: '28px 0', borderTop: '1px solid rgba(0,0,0,.09)',
              }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: coral, marginTop: 9 }} />
                <div>
                  <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 22, fontWeight: 700, color: charcoal, marginBottom: 8, letterSpacing: 0 }}>{v.title}</p>
                  <p style={{ fontSize: 16, color: '#5A6B7A', lineHeight: 1.75, fontWeight: 300 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TALK TO US: intro left, details right ─── */}
      <section style={{ padding: '109px 40px' }}>
        <div className="awrap about-contact">
          <div className="about-sticky">
            <p style={{ ...eyebrow, marginBottom: 18 }}>Talk to us</p>
            <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(28px, 3.4vw, 40px)', color: charcoal, marginBottom: 16, lineHeight: 1.1 }}>
              We&apos;re real people. We&apos;d love to hear from you.
            </h2>
            <p style={{ fontSize: 18, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 0 }}>
              Questions about care, billing, or working together? We usually reply within a working day.
            </p>
          </div>
          <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 28, marginBottom: 8 }}>
            {contacts.map((c) => (
              <a key={c.label} href={c.href} style={{ textDecoration: 'none', display: 'block', paddingTop: 24, borderTop: '1px solid rgba(0,0,0,.07)' }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9AA8B4', marginBottom: 8 }}>{c.label}</span>
                <span style={{ display: 'block', fontSize: 18, fontWeight: 700, color: charcoal, letterSpacing: '-0.2px' }}>{c.value}</span>
              </a>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, marginTop: 56 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9AA8B4', marginBottom: 12 }}>Visit / write to us</p>
              <p style={{ fontSize: 16, color: charcoal, fontWeight: 600, marginBottom: 4 }}>GetCalmly</p>
              <p style={{ fontSize: 16, color: '#5A6B7A', lineHeight: 1.7, fontWeight: 300 }}>
                316, 11th A Main, Classic Paradise Layout,<br />Begur, Bengaluru 560068, India
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9AA8B4', marginBottom: 12 }}>Support hours</p>
              <p style={{ fontSize: 16, color: '#5A6B7A', lineHeight: 1.7, fontWeight: 300 }}>
                Monday to Saturday<br />9:00 AM to 8:00 PM IST
              </p>
            </div>
          </div>

          <div style={{ marginTop: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9AA8B4', marginBottom: 16 }}>Follow along</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {socials.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={{
                  padding: '9px 18px', borderRadius: 50, background: 'transparent',
                  border: `1.5px solid ${coral}33`, color: coral, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                }}>{name}</a>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(0,0,0,.07)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <p style={{ fontSize: 16, color: '#6B7D8E', fontWeight: 300 }}>Prefer a structured message? Use our contact form.</p>
            <Link href="/contact" style={{
              padding: '13px 26px', borderRadius: 50, background: charcoal, color: '#fff',
              fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
            }}>
              Go to Contact →
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* ─── CRISIS NOTICE: the one place a box genuinely belongs ─── */}
      <section style={{ padding: '0 24px 84px' }}>
        <div style={{
          maxWidth: 760, margin: '0 auto', background: '#FDECEC', border: '1px solid #F3C9C9',
          borderRadius: 16, padding: '24px 28px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 15.5, color: '#9A3B3B', lineHeight: 1.7 }}>
            <strong>In crisis or need urgent help?</strong> GetCalmly is not an emergency service. Please reach
            out to a helpline right away, find numbers on our{' '}
            <Link href="/safety" style={{ color: '#9A3B3B', textDecoration: 'underline', fontWeight: 700 }}>Safety &amp; Ethics</Link> page.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', padding: '104px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: 16 }}>Your first session is free</p>
          <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 46px)', color: '#fff', marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.05 }}>
            Take the first step today.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.62)', marginBottom: 32, lineHeight: 1.7, fontWeight: 300 }}>
            A confidential 5-minute assessment is all it takes to find your match.
          </p>
          <Link href="/assess" style={{
            display: 'inline-block', padding: '15px 30px', borderRadius: 50, background: coral, color: '#fff',
            fontSize: 16, fontWeight: 700, textDecoration: 'none',
            fontFamily: "'DM Sans', sans-serif", boxShadow: `0 8px 24px ${coral}55`,
          }}>
            ✦ Begin your assessment
          </Link>
        </div>
      </section>
    </div>
  )
}
