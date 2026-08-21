import Link from 'next/link'
import type { Metadata } from 'next'
import { supportEmail } from '@/config/site'

export const metadata: Metadata = {
  title: 'Privacy Policy | GetCalmly',
  description:
    'How GetCalmly collects, uses, stores, and protects your personal and health data, in line with the DPDP Act 2023.',
}

const charcoal = '#1C2B3A'
// Brand coral is only AA-safe as large display text. Everything on this page
// uses it at body/eyebrow/button size, so it points at the darker ink cut
// (5.99:1 on cream, and on white behind a CTA) instead of #C8553D at 4.26:1.
const coral = '#A8432D'
const cream = '#FFFCFA'
const heroBg =
  'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29'

const eyebrow: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: coral,
}
const heading: React.CSSProperties = {
  fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, letterSpacing: '-0.5px',
}

const promises = [
  ['We never sell your data', 'Not to advertisers, not to anyone. Your journal and sessions are never used for ads.'],
  ['Encrypted end to end', 'Your data is encrypted in transit and at rest, on secure infrastructure.'],
  ['You stay in control', 'Access, correct, or erase your data, and withdraw consent, at any time.'],
]

const blocks: { title: string; body: React.ReactNode }[] = [
  {
    title: 'What we collect',
    body: (
      <>
        Account details (name, email, phone), assessment responses, mood and journal entries, session records,
        and payment information processed by our payment partner. We collect only what we need to match you with
        the right professional and provide care.
      </>
    ),
  },
  {
    title: 'How we use your data',
    body: (
      <>
        To match you with an RCI-verified clinical psychologist or NMC-registered psychiatrist, to power your
        Calm AI insights and mood tracking, to prepare pre-session briefs for your clinician, and to operate and
        improve the service. We do not sell your data, and we do not use your private journal or session content
        for advertising.
      </>
    ),
  },
  {
    title: 'Your consent',
    body: (
      <>
        We process your personal and health data on the basis of your consent, which you give at sign-up, before
        your pre-assessment, and before each session. You can withdraw consent at any time, withdrawal does not
        affect processing already carried out lawfully.
      </>
    ),
  },
  {
    title: 'Storage & security',
    body: (
      <>
        Your data is encrypted in transit and at rest, and stored on secure infrastructure. Access is restricted
        to your care team and authorised staff on a need-to-know basis. We retain data only as long as necessary
        for your care and our legal obligations.
      </>
    ),
  },
  {
    title: 'Sharing & disclosure',
    body: (
      <>
        We share data with your assigned clinician to provide care, and with service providers (payments, video,
        hosting) bound by confidentiality. We may disclose data where required by law or where there is a serious
        risk of harm to you or others, consistent with our Safety &amp; Ethics policy.
      </>
    ),
  },
  {
    title: 'Your rights',
    body: (
      <>
        Under the DPDP Act you have the right to access, correct, and erase your data, to withdraw consent, to
        nominate someone to exercise your rights, and to raise a grievance. To exercise any of these, contact our
        Data Protection Officer at{' '}
        <a href={`mailto:${supportEmail}`} style={{ color: coral, fontWeight: 600 }}>{supportEmail}</a>.
      </>
    ),
  },
  {
    title: 'Cookies',
    body: (
      <>
        We use essential cookies to keep you signed in and to remember your preferences, and limited analytics to
        understand how the service is used. You can manage your choice via the cookie banner or your browser
        settings.
      </>
    ),
  },
  {
    title: 'Children',
    body: (
      <>
        Where care is provided to a minor, we require verifiable consent from a parent or legal guardian, in line
        with the DPDP Act. We do not knowingly process a child&apos;s data without it.
      </>
    ),
  },
  {
    title: 'Changes to this policy',
    body: (
      <>
        We may update this policy as the service and the law evolve. Material changes will be communicated to you,
        and the latest version will always be available here.
      </>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ background: cream, minHeight: '100vh' }}>
      <style>{`
        .pwrap{max-width:1140px;margin:0 auto;width:100%;}
        .priv-hero{display:grid;grid-template-columns:1.3fr 1fr;gap:64px;align-items:end;}
        .priv-promises{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .priv-body{display:grid;grid-template-columns:300px 1fr;gap:72px;align-items:start;}
        .priv-body .priv-sticky{position:sticky;top:100px;}
        .priv-item{padding:30px 0;border-top:1px solid rgba(0,0,0,.09);}
        .priv-item:first-child{border-top:none;padding-top:0;}
        @media (max-width:900px){
          .priv-hero,.priv-promises,.priv-body{grid-template-columns:1fr;gap:28px;}
          .priv-body .priv-sticky{position:static;}
        }
      `}</style>

      {/* Hero */}
      <section style={{ background: heroBg, padding: '120px 40px 88px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -130, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="pwrap priv-hero" style={{ position: 'relative' }}>
          <div>
            <p style={{ ...eyebrow, marginBottom: 22 }}>Privacy</p>
            <h1 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(40px, 6vw, 72px)', color: '#fff', letterSpacing: '-2px', lineHeight: 1.02, marginBottom: 0 }}>
              Your data is yours.<br />Full stop.
            </h1>
          </div>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,.72)', lineHeight: 1.8, fontWeight: 300, marginBottom: 6 }}>
            Your mental health data is among the most sensitive information you can share. As a Data Fiduciary
            under India&apos;s DPDP Act 2023, we hold ourselves to a high standard of care, and to you.
          </p>
        </div>
      </section>

      {/* Promises */}
      <section style={{ padding: '72px 40px 24px' }}>
        <div className="pwrap priv-promises">
          {promises.map(([t, d]) => (
            <div key={t} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 20, padding: '28px 26px', boxShadow: '0 12px 40px rgba(28,43,58,.05)' }}>
              <span style={{ display: 'inline-flex', width: 34, height: 34, borderRadius: 10, background: 'rgba(200,85,61,.10)', color: coral, alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: 14 }}>✓</span>
              <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 21, fontWeight: 700, color: charcoal, marginBottom: 8 }}>{t}</p>
              <p style={{ fontSize: 14.5, color: '#5A6B7A', lineHeight: 1.7 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed policy */}
      <section style={{ padding: '64px 40px 100px' }}>
        <div className="pwrap priv-body">
          <div className="priv-sticky">
            <p style={{ ...eyebrow, marginBottom: 18 }}>The full policy</p>
            <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(26px, 3.2vw, 36px)', color: charcoal, marginBottom: 16, lineHeight: 1.12 }}>
              Everything, in plain language.
            </h2>
            <p style={{ fontSize: 16, color: '#5A6B7A', lineHeight: 1.75 }}>
              No dark patterns, no buried clauses. Here&apos;s exactly what we collect, why, and the rights you
              have over it.
            </p>
          </div>
          <div>
            {blocks.map((b) => (
              <div key={b.title} className="priv-item">
                <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 23, fontWeight: 700, color: charcoal, marginBottom: 10 }}>{b.title}</h3>
                <p style={{ fontSize: 15.5, color: '#3A4A5A', lineHeight: 1.8 }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ background: heroBg, padding: '96px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: 16 }}>Data questions?</p>
          <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(30px, 5vw, 44px)', color: '#fff', marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.06 }}>
            Talk to our Data Protection Officer.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.62)', marginBottom: 32, lineHeight: 1.7 }}>
            Access, correct, or erase your data anytime, we&apos;re one email away.
          </p>
          <a href={`mailto:${supportEmail}`} style={{ display: 'inline-block', padding: '15px 30px', borderRadius: 50, background: coral, color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: `0 8px 24px ${coral}55` }}>
            {supportEmail}
          </a>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', marginTop: 24 }}>
            See also our <Link href="/safety" style={{ color: 'rgba(255,255,255,.8)', textDecoration: 'underline' }}>Safety &amp; Ethics</Link> and{' '}
            <Link href="/terms" style={{ color: 'rgba(255,255,255,.8)', textDecoration: 'underline' }}>Terms</Link>.
          </p>
        </div>
      </section>
    </div>
  )
}
