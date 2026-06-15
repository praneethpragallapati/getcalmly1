import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Therapists — Practice on getCalmly | RCI-verified Clinicians',
  description:
    'Join getCalmly as an RCI-verified therapist or psychiatrist. AI pre-session briefs, mood history, structured notes, and a steady stream of matched clients. Less admin, better care.',
  alternates: { canonical: '/for-therapists' },
}

const benefits = [
  { icon: '🧠', t: 'AI pre-session briefs', d: 'Walk into every session knowing your client’s week — mood trends, journal themes, and risk flags summarised for you.' },
  { icon: '🗓️', t: 'Matched clients, not cold leads', d: 'We match clients to you by specialty, language and availability. No bidding, no chasing — just the right fit.' },
  { icon: '📋', t: 'Structured clinical notes', d: 'Session notes, referral letters and progress reports built for hospital workflows — exportable instantly.' },
  { icon: '🔔', t: 'Between-session monitoring', d: 'AI watches mood patterns and alerts you when a client needs attention, so nothing slips through.' },
  { icon: '💳', t: 'Reliable, transparent payouts', d: 'Razorpay-backed payments, clear fees, and on-time settlements. You focus on care, we handle billing.' },
  { icon: '🔒', t: 'Privacy & compliance built in', d: 'DPDP-aligned data handling, encrypted records, and consent management — from day one.' },
]

export default function ForTherapistsPage() {
  return (
    <>
      <section className="how-section" id="for-therapists">
        <div className="sec-label reveal">For therapists &amp; psychiatrists</div>
        <h2 className="sec-h2 reveal">
          Clinical tools that let you<br />
          <span>focus on what matters.</span>
        </h2>
        <p className="sec-p reveal" style={{ marginBottom: 8 }}>
          Every clinician on getCalmly gets a powerful portal — patient mood history, AI-generated
          pre-session briefs, structured notes, and referral tracking. Less admin. Better care.
        </p>
        <div className="hero-actions reveal" style={{ marginTop: 28 }}>
          <Link href="/register" className="btn-hero fill">Apply to join →</Link>
          <Link href="/contact" className="btn-hero outline">Talk to our team</Link>
        </div>
      </section>

      <section className="features-section">
        <div className="feat-grid">
          {benefits.map((b, i) => (
            <div key={b.t} className={`feat-card reveal${i % 3 ? ` d${i % 3}` : ''}`}>
              <span className="feat-icon">{b.icon}</span>
              <div className="feat-t">{b.t}</div>
              <div className="feat-d">{b.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div className="fcta">
          <div className="sec-label">Ready when you are</div>
          <h2 className="sec-h2 reveal">Build your practice<br /><span>on solid ground.</span></h2>
          <p className="sec-p reveal">
            We verify every clinician with the Rehabilitation Council of India. Join a platform that
            takes clinical quality as seriously as you do.
          </p>
          <div className="fcta-btns reveal">
            <Link href="/register" className="btn-xl c">Apply to join →</Link>
            <Link href="/contact" className="btn-xl o">Ask a question</Link>
          </div>
        </div>
      </section>
    </>
  )
}
