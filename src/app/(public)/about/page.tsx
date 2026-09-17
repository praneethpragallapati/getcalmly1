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

// Founders — details from the deck. Photos live at /public/team/<img> (colour
// is fine; the section renders them black & white). A soft placeholder shows
// until each file is added. Role colours are AA-safe cuts on white.
const team: { name: string; role: string; accent: string; img: string; bio: string }[] = [
  {
    name: 'Dr. Riya Lokesh', role: 'Co-Founder & Director · Chief Clinician', accent: '#5B47B5', img: 'riya.jpg',
    bio: 'M.Phil and Ph.D in clinical psychology, with years in active practice. She leads clinical protocols, therapist vetting, and the standard of care that runs through everything we build.',
  },
  {
    name: 'Praneeth Pragallapati', role: 'Co-Founder & Director · Product & Data', accent: '#A8432D', img: 'praneeth.jpg',
    bio: 'B.Tech in Computer Science with a postgraduate focus in AI/ML. He drives AI-powered product, data architecture, and the scalable infrastructure that makes context-aware care possible.',
  },
  {
    name: 'Satya K. Gundavarapu', role: 'Co-Founder & Director · Ops & Global Markets', accent: '#276B4B', img: 'satya.jpg',
    bio: 'MBA in Engineering Management and an MS in Robotics. He runs operations, partnerships, and market expansion — across India and beyond.',
  },
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
        /* Team: portrait cards, rendered black & white with a gentle colour
           reveal on hover, over a faint checked texture. */
        .team-section{position:relative;overflow:hidden;}
        .team-section::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.5;
          background-image:linear-gradient(rgba(28,43,58,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(28,43,58,.035) 1px,transparent 1px);
          background-size:26px 26px;-webkit-mask-image:radial-gradient(ellipse 80% 70% at 50% 30%,#000,transparent 78%);mask-image:radial-gradient(ellipse 80% 70% at 50% 30%,#000,transparent 78%);}
        .team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;position:relative;}
        .team-card{background:#fff;border:1px solid rgba(28,43,58,.08);border-radius:18px;overflow:hidden;
          box-shadow:0 1px 2px rgba(28,43,58,.04),0 16px 40px -28px rgba(28,43,58,.22);
          transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s;}
        .team-card:hover{transform:translateY(-5px);box-shadow:0 24px 56px -28px rgba(28,43,58,.3);}
        .tm-photo{aspect-ratio:4/5;background-color:#E7E2DD;
          background-image:var(--img),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='46' viewBox='0 0 24 24' fill='none' stroke='%23B7ADA4' stroke-width='1.4'%3E%3Ccircle cx='12' cy='9' r='3.2'/%3E%3Cpath d='M5.2 20a6.8 6.8 0 0 1 13.6 0'/%3E%3C/svg%3E");
          background-size:cover,46px;background-position:center top,center;background-repeat:no-repeat;
          filter:grayscale(100%) contrast(1.03);transition:filter .45s ease;}
        .team-card:hover .tm-photo{filter:grayscale(0) contrast(1);}
        .tm-body{padding:22px 22px 26px;}
        .tm-name{font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:24px;color:#1C2B3A;letter-spacing:-.3px;line-height:1;margin:0 0 9px;}
        .tm-role{font-size:13px;font-weight:700;letter-spacing:.2px;margin:0 0 12px;}
        .tm-bio{font-size:14.5px;color:#5A6A7A;line-height:1.7;font-weight:300;margin:0;}
        .team-why{position:relative;margin-top:44px;border-radius:18px;padding:34px 38px;
          background:radial-gradient(ellipse 60% 60% at 90% 10%,rgba(200,85,61,.24),transparent 55%),#141E29;}
        .join-band{display:grid;grid-template-columns:1.3fr .7fr;gap:40px;align-items:center;border-radius:22px;padding:48px 44px;
          background:radial-gradient(ellipse 55% 60% at 88% 12%,rgba(61,158,114,.26),transparent 55%),radial-gradient(ellipse 45% 50% at 6% 90%,rgba(61,158,114,.12),transparent 60%),#12241E;}
        .join-cta{display:flex;flex-direction:column;gap:12px;}
        @media (max-width: 900px){
          .about-hero,.about-split,.about-edit,.about-values,.about-contact,.join-band{
            grid-template-columns:1fr;gap:32px;
          }
          .about-edit .about-sticky{position:static;}
          .join-band{gap:24px;padding:36px 28px;}
        }
        @media (max-width: 820px){ .team-grid{grid-template-columns:1fr 1fr;} }
        @media (max-width: 520px){ .team-grid{grid-template-columns:1fr;} }
      `}</style>

      {/* ─── HERO: lead with the human, not the company ─── */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '113px 40px 100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -130, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="awrap about-hero" style={{ position: 'relative' }}>
          <div>
            <p style={{ ...eyebrowOnDark, marginBottom: 22 }}>Our story</p>
            <h1 style={{
              ...heading, fontWeight: 300, fontSize: 'clamp(40px, 6vw, 76px)', color: '#fff',
              letterSpacing: '-2px', lineHeight: 1.02, marginBottom: 0,
            }}>
              Mental health support that understands you.
            </h1>
          </div>
          <p style={{ fontSize: 19, color: 'rgba(255,255,255,.74)', lineHeight: 1.8, fontWeight: 300, marginBottom: 6 }}>
            GetCalmly connects people across India with the right verified professional, matched by your needs,
            context, language and budget rather than symptoms alone. Care from verified experts, made
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
              We&apos;ve built a strictly vetted network of RCI-verified professionals, and a match that pairs
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

      {/* ─── OUR TEAM: the people behind the care ─── */}
      <section id="team" className="team-section" style={{ background: '#fff', padding: '109px 40px' }}>
        <div className="awrap" style={{ position: 'relative' }}>
          <p style={{ ...eyebrow, marginBottom: 18 }}>Our team</p>
          <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(28px, 3.6vw, 44px)', color: charcoal, marginBottom: 20, lineHeight: 1.06 }}>
            A rare pairing: <span style={{ color: coral, fontWeight: 900 }}>clinical depth × technical scale.</span>
          </h2>
          <p style={{ fontSize: 18.5, color: '#3A4A5A', lineHeight: 1.85, fontWeight: 300, maxWidth: 720, margin: '0 0 52px' }}>
            We didn&apos;t read about this problem in a market report. We&apos;re clinicians who watched people slip through
            the cracks between sessions, and founders who once sat on the other side of that gap. getCalmly is built by
            people who have lived both halves of the story, and are a little obsessed with closing the distance between them.
          </p>

          <div className="team-grid">
            {team.map((m) => (
              <div key={m.name} className="team-card">
                <div className="tm-photo" style={{ ['--img' as string]: `url('/team/${m.img}')` } as React.CSSProperties} role="img" aria-label={m.name} />
                <div className="tm-body">
                  <p className="tm-name">{m.name}</p>
                  <p className="tm-role" style={{ color: m.accent }}>{m.role}</p>
                  <p className="tm-bio">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="team-why">
            <p style={{ ...eyebrowOnDark, marginBottom: 12 }}>Why we&apos;re building this</p>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,.82)', lineHeight: 1.85, fontWeight: 300, margin: 0, maxWidth: 900 }}>
              Riya saw it play out in her practice: clinicians lose touch with the people they&apos;re helping in the weeks
              between sessions. Praneeth and Satya lived the other side of it, moving through their darkest stretches without
              knowing help was even within reach. We&apos;re not building from a market report. We bring clinical expertise{' '}
              <strong style={{ color: '#fff', fontWeight: 700 }}>and the lived experience of needing it</strong>, and we&apos;re
              emotionally invested in closing the gap for good.
            </p>
          </div>
        </div>
      </section>

      {/* ─── JOIN OUR EXPERTS: clinician recruitment, moved under About ─── */}
      <section id="join" style={{ padding: '0 40px 8px' }}>
        <div className="awrap">
          <div className="join-band">
            <div>
              <p style={{ ...eyebrowOnDark, color: '#7FD4A8', marginBottom: 14 }}>Join our experts</p>
              <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(28px, 3.6vw, 42px)', color: '#fff', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 16 }}>
                Spend your time on <span style={{ color: '#7FD4A8', fontWeight: 900 }}>care, not admin.</span>
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,.68)', lineHeight: 1.8, fontWeight: 300, maxWidth: 520, margin: 0 }}>
                Matched clients, an AI clinical co-pilot, supervision tools, and a calendar that runs itself. Every clinician
                is RCI / NMC verified before going live.
              </p>
            </div>
            <div className="join-cta">
              <Link href="/for-therapists/apply" style={{
                display: 'inline-block', textAlign: 'center', padding: '15px 26px', borderRadius: 50, background: '#3D9E72',
                color: '#fff', fontSize: 15.5, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 10px 26px rgba(61,158,114,.4)',
              }}>Apply to join →</Link>
              <Link href="/for-therapists" style={{
                display: 'inline-block', textAlign: 'center', padding: '15px 26px', borderRadius: 50, background: 'transparent',
                color: '#fff', fontSize: 15.5, fontWeight: 600, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
                border: '1.5px solid rgba(255,255,255,.35)',
              }}>See how it works</Link>
            </div>
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
