import Link from 'next/link'
import type { Metadata } from 'next'
import {
  addressLines, contactEmail, socialLinks, supportHoursLines,
  supportPhone, supportPhoneTel,
} from '@/config/site'

export const metadata: Metadata = {
  // The root template appends '| getCalmly', so the brand must not repeat here.
  title: 'Our Story',
  description:
    'GetCalmly bridges India’s mental health treatment gap with RCI-verified, vernacular-first, culturally-aware therapy, amplified by thoughtful AI. Meet the team and the principles behind the care.',
  alternates: { canonical: '/about' },
}

const charcoal = '#1C2B3A'
// Brand coral is only AA-safe as large display text. Everything on this page
// uses it at body/eyebrow/button size, so it points at the darker ink cut
// (5.99:1 on cream, and on white behind a CTA) instead of #C8553D at 4.26:1.
const coral = '#A8432D'
const cream = '#FFFCFA'

const stats: [string, string][] = [
  ['60%+', 'treatment gap in India'],
  ['0.75', 'psychiatrists per 100,000 people'],
  ['100%', 'RCI & NMC-verified clinicians'],
]

const values: { title: string; desc: string }[] = [
  { title: 'Privacy first', desc: 'DPDP-compliant, encrypted, and confidential by design. What you share stays yours.' },
  { title: 'Culturally attuned', desc: 'Care that understands your context, matched to fit rather than one-size-fits-all.' },
  { title: 'Clinically credible', desc: 'Only RCI-verified clinical psychologists and NMC-verified psychiatrists. No exceptions.' },
  { title: 'Accessible & affordable', desc: 'Quality care within your budget, from your couch or in person.' },
]

const contacts: { label: string; value: string; href: string }[] = [
  { label: 'Email us', value: contactEmail, href: `mailto:${contactEmail}` },
  { label: 'Call us', value: supportPhone, href: supportPhoneTel },
  { label: 'Partnerships', value: contactEmail, href: `mailto:${contactEmail}` },
]

// The dark hero flips the requirement: the ink cut that clears AA on cream is
// 2.8:1 on charcoal, so eyebrows there take the LIGHT coral (6.6:1).
const eyebrow: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: coral,
}
const eyebrowOnDark: React.CSSProperties = { ...eyebrow, color: '#E8896F' }
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
      <section className="hero-dark" style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '113px 40px 100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -130, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="awrap about-hero" style={{ position: 'relative' }}>
          <div>
            <p style={{ ...eyebrowOnDark, marginBottom: 22 }}>About getCalmly</p>
            <h1 style={{
              ...heading, fontWeight: 300, fontSize: 'clamp(40px, 6vw, 76px)', color: '#fff',
              letterSpacing: '-2px', lineHeight: 1.02, marginBottom: 0,
            }}>
              Getting help shouldn&apos;t feel like a<br /><span style={{ color: '#C8553D', fontWeight: 900 }}>second full-time job.</span>
            </h1>
          </div>
          <p style={{ fontSize: 19, color: 'rgba(255,255,255,.74)', lineHeight: 1.8, fontWeight: 300, marginBottom: 6 }}>
            Finding someone qualified, someone who gets your context, someone you can actually afford — most
            people give up somewhere in that maze, long before a first session. We built getCalmly to make that
            first step the easy part.
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
              In India, the distance between &ldquo;I think I need help&rdquo; and actually getting it is measured
              in months, not minutes. We exist to close that gap.
            </p>
          </div>
          <div>
            {stats.map(([n, d], idx) => (
              <div key={d} style={{
                display: 'flex', alignItems: 'baseline', gap: 22,
                padding: '22px 0', borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,.09)',
              }}>
                <p style={{ ...heading, fontSize: 'clamp(38px, 5vw, 56px)', color: coral, lineHeight: 1, letterSpacing: '-1.5px', minWidth: 130 }}>{n}</p>
                <p style={{ fontSize: 15.5, color: '#5A6A7A', lineHeight: 1.55, fontWeight: 300 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE MISSION: charcoal band, single bold idea ─── */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', padding: '113px 40px' }}>
        <div className="awrap" style={{ maxWidth: 900, textAlign: 'center' }}>
          <p style={{ ...eyebrowOnDark, marginBottom: 24 }}>Our mission</p>
          <p style={{
            ...heading, fontWeight: 900, fontSize: 'clamp(30px, 4.6vw, 52px)',
            color: '#fff', letterSpacing: '-1px', lineHeight: 1.12, margin: '0 auto',
          }}>
            To make good mental healthcare feel ordinary — as reachable as any other kind of care, in the
            language you dream in, at a price that never becomes the reason you stop.
          </p>
        </div>
      </section>

      {/* ─── THE PROBLEM: editorial two-column ─── */}
      <section style={{ background: '#fff', padding: '109px 40px' }}>
        <div className="awrap about-edit">
          <div className="about-sticky">
            <p style={{ ...eyebrow, marginBottom: 18 }}>The problem</p>
            <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(28px, 3.4vw, 40px)', color: charcoal, marginBottom: 0, lineHeight: 1.1 }}>
              It&apos;s not a shortage of care. It&apos;s a shortage of access.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 18.5, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 22, marginTop: 0 }}>
              India has fewer than one psychiatrist for every lakh people, and most of them practise in a
              handful of big cities. For millions in smaller towns, &ldquo;just see a professional&rdquo; quietly
              translates to travel, wait, and hope.
            </p>
            <p style={{ fontSize: 18.5, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 0 }}>
              For Indians abroad, it often means paying a premium to first explain your own culture — before the
              conversation you actually came for can begin.
            </p>
          </div>
        </div>
      </section>

      {/* ─── OUR APPROACH: editorial two-column ─── */}
      <section style={{ padding: '109px 40px' }}>
        <div className="awrap about-edit">
          <div className="about-sticky">
            <p style={{ ...eyebrow, marginBottom: 18 }}>How we&apos;re different</p>
            <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(28px, 3.4vw, 40px)', color: charcoal, marginBottom: 0, lineHeight: 1.1 }}>
              We match first. Everything else follows.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 18.5, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 22, marginTop: 0 }}>
              Rather than hand you a directory and wish you luck, we pair you with a verified clinician on the
              things that actually decide fit: what you&apos;re facing, the language you&apos;re most yourself
              in, and what you can comfortably spend.
            </p>
            <p style={{ fontSize: 18.5, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, marginBottom: 0 }}>
              Then a context-aware companion keeps the thread between sessions — so you never restart from zero,
              and neither does the person treating you.
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
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#5F6E7D', marginBottom: 8 }}>{c.label}</span>
                <span style={{ display: 'block', fontSize: 18, fontWeight: 700, color: charcoal, letterSpacing: '-0.2px' }}>{c.value}</span>
              </a>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, marginTop: 56 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#5F6E7D', marginBottom: 12 }}>Visit / write to us</p>
              <p style={{ fontSize: 16, color: charcoal, fontWeight: 600, marginBottom: 4 }}>GetCalmly</p>
              <p style={{ fontSize: 16, color: '#5A6B7A', lineHeight: 1.7, fontWeight: 300 }}>
                {addressLines[0]}<br />{addressLines[1]}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#5F6E7D', marginBottom: 12 }}>Support hours</p>
              <p style={{ fontSize: 16, color: '#5A6B7A', lineHeight: 1.7, fontWeight: 300 }}>
                {supportHoursLines[0]}<br />{supportHoursLines[1]}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#5F6E7D', marginBottom: 16 }}>Follow along</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {socialLinks.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                  padding: '9px 18px', borderRadius: 50, background: 'transparent',
                  border: `1.5px solid ${coral}33`, color: coral, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                }}>{s.label}</a>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(0,0,0,.07)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <p style={{ fontSize: 16, color: '#5A6A7A', fontWeight: 300 }}>Prefer a structured message? Use our contact form.</p>
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
          <p style={{ ...eyebrowOnDark, marginBottom: 16 }}>Your first session, from ₹799</p>
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
