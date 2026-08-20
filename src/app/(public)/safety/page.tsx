import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Safety & Ethics | GetCalmly',
  description:
    'Our ethical standards, confidentiality policy, online therapy disclaimer, and emergency protocol.',
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

const helplines: [string, string, string][] = [
  ['iCall (TISS)', '9152987821', '+919152987821'],
  ['Asra (24/7)', '+91-22-27546669', '+912227546669'],
  ['One Life (24/7)', '78930-78930', '+917893078930'],
  ['CHILDLINE (children)', '1098', '1098'],
  ["Women's Helpline", '1091', '1091'],
]

const badges = ['RCI-licensed clinical psychologists', 'NMC-registered psychiatrists', 'DPDP Act 2023 compliant', 'MHCA 2017 aligned']

const blocks: { n: string; title: string; body: React.ReactNode }[] = [
  {
    n: '01',
    title: 'Ethical standards for every professional',
    body: (
      <>
        Every professional on GetCalmly is bound by the ethical codes of their regulating body, the{' '}
        <strong>Rehabilitation Council of India (RCI)</strong> for clinical psychologists and the{' '}
        <strong>National Medical Commission (NMC)</strong> for psychiatrists. They practise strictly within
        their scope: counsellors do not diagnose or treat severe disorders reserved for clinical psychologists
        and psychiatrists under the Mental Healthcare Act (MHCA) 2017.
      </>
    ),
  },
  {
    n: '02',
    title: 'Confidentiality and its limits',
    body: (
      <>
        Your sessions and records are confidential and encrypted. As a Data Fiduciary under the DPDP Act 2023,
        we store your data securely and only share it with your consent. Confidentiality may be limited by law
        where there is a serious risk of harm to you or others, or where disclosure is legally mandated.
      </>
    ),
  },
  {
    n: '03',
    title: 'Online therapy disclaimer',
    body: (
      <>
        Online therapy is effective for many concerns but is not suitable for medical emergencies, acute
        psychiatric crises, or severe conditions requiring in-person or inpatient care. Pre-assessments and
        self-help tools are screening aids, not clinical diagnoses. Our first session is conducted via video,
        in line with the Telemedicine Practice Guidelines (2020).
      </>
    ),
  },
  {
    n: '04',
    title: 'Emergency protocol',
    body: (
      <>
        We maintain a documented emergency plan. If risk is detected, we provide immediate crisis resources,
        can prioritise urgent professional support, and work toward local hospital coordination. We keep your
        local emergency contact and nearest hospital details on file where you provide them.
      </>
    ),
  },
  {
    n: '05',
    title: 'Complaints & grievances',
    body: (
      <>
        We are committed to a fair and prompt grievance process. To raise a concern about a professional or
        your experience, contact us at{' '}
        <a href="mailto:getcalmly@gmail.com" style={{ color: coral, fontWeight: 600 }}>getcalmly@gmail.com</a>{' '}
        and our team will respond confidentially.
      </>
    ),
  },
  {
    n: '06',
    title: 'Regulatory compliance',
    body: (
      <>
        GetCalmly operates in line with the Mental Healthcare Act 2017, the Telemedicine Practice Guidelines
        2020, the DPDP Act 2023, and the evolving NCAHP framework. We appoint a Data Protection Officer and
        store health data securely.
      </>
    ),
  },
]

export default function SafetyPage() {
  return (
    <div style={{ background: cream, minHeight: '100vh' }}>
      <style>{`
        .swrap{max-width:1140px;margin:0 auto;width:100%;}
        .safety-hero{display:grid;grid-template-columns:1.3fr 1fr;gap:64px;align-items:end;}
        .safety-blocks{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
        .safety-help{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;}
        .safety-block{background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:20px;padding:30px 28px;
          box-shadow:0 12px 40px rgba(28,43,58,.05);transition:transform .28s cubic-bezier(.2,.7,.2,1),box-shadow .28s;}
        .safety-block:hover{transform:translateY(-4px);box-shadow:0 22px 56px rgba(28,43,58,.10);}
        @media (max-width:900px){
          .safety-hero,.safety-blocks{grid-template-columns:1fr;gap:28px;}
        }
      `}</style>

      {/* Hero */}
      <section style={{ background: heroBg, padding: '120px 40px 88px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -130, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="swrap safety-hero" style={{ position: 'relative' }}>
          <div>
            <p style={{ ...eyebrow, marginBottom: 22 }}>Safety &amp; Ethics</p>
            <h1 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(38px, 5.6vw, 68px)', color: '#fff', letterSpacing: '-2px', lineHeight: 1.04, marginBottom: 0 }}>
              Care you can trust,<br />held to a real standard.
            </h1>
          </div>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,.72)', lineHeight: 1.8, fontWeight: 300, marginBottom: 6 }}>
            We take the ethical and legal responsibilities of providing mental health care seriously. This is
            how we protect your safety, your privacy, and your trust, every step of the way.
          </p>
        </div>
        <div className="swrap" style={{ position: 'relative', marginTop: 44, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {badges.map((b) => (
            <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.82)', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', padding: '8px 15px', borderRadius: 40 }}>
              <span style={{ color: '#3D9E72', fontWeight: 800 }}>✓</span>{b}
            </span>
          ))}
        </div>
      </section>

      {/* Crisis panel */}
      <section style={{ padding: '64px 40px 0' }}>
        <div className="swrap">
          <div style={{ background: '#1C2B3A', borderRadius: 24, padding: '38px 36px', boxShadow: '0 24px 64px rgba(28,43,58,.25)', border: '1.5px solid rgba(200,85,61,.25)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -80, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: 30, marginBottom: 12 }}>🫂</p>
              <h2 style={{ ...heading, fontWeight: 900, fontSize: 28, color: '#fff', marginBottom: 10 }}>In a crisis? Get help now.</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,.66)', lineHeight: 1.7, maxWidth: 620, marginBottom: 26 }}>
                If you are experiencing a crisis or contemplating suicide, please contact a helpline below or
                proceed to the nearest emergency centre. <strong style={{ color: 'rgba(255,255,255,.9)' }}>This website is not intended for emergency intervention.</strong>
              </p>
              <div className="safety-help">
                {helplines.map(([name, num, tel]) => (
                  <a key={name} href={`tel:${tel}`} style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(200,85,61,.22)', borderRadius: 14, padding: '14px 16px', textDecoration: 'none' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.72)' }}>{name}</span>
                    <span style={{ fontSize: 17, fontWeight: 800, color: '#E8896F', letterSpacing: '.3px' }}>{num}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy blocks */}
      <section style={{ padding: '64px 40px 100px' }}>
        <div className="swrap">
          <p style={{ ...eyebrow, marginBottom: 18 }}>How we protect you</p>
          <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(28px, 3.6vw, 42px)', color: charcoal, marginBottom: 40, lineHeight: 1.1 }}>
            The standards behind every session.
          </h2>
          <div className="safety-blocks">
            {blocks.map((b) => (
              <div key={b.n} className="safety-block">
                <p style={{ ...heading, fontSize: 30, color: 'rgba(200,85,61,.35)', letterSpacing: '-1px', marginBottom: 12 }}>{b.n}</p>
                <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 22, fontWeight: 700, color: charcoal, marginBottom: 10 }}>{b.title}</h3>
                <p style={{ fontSize: 14.5, color: '#5A6B7A', lineHeight: 1.75 }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ background: heroBg, padding: '96px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: 16 }}>Questions about safety?</p>
          <h2 style={{ ...heading, fontWeight: 300, fontSize: 'clamp(30px, 5vw, 44px)', color: '#fff', marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.06 }}>
            We&apos;re here to answer them.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.62)', marginBottom: 32, lineHeight: 1.7 }}>
            Reach our care team anytime, we usually reply within a working day.
          </p>
          <Link href="/contact" style={{ display: 'inline-block', padding: '15px 30px', borderRadius: 50, background: coral, color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: `0 8px 24px ${coral}55` }}>
            Contact us →
          </Link>
        </div>
      </section>
    </div>
  )
}
