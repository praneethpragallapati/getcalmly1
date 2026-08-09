import Link from 'next/link'
import type { Metadata } from 'next'
import { perSession, inr } from '@/data/pricing'
import { getPricingConfig } from '@/lib/pricingConfig'

// ISR: serve a cached render and revalidate at most every 600s. Admin edits
// call revalidatePath() so changes still appear immediately; this is the cap.
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Terms & Refund Policy | GetCalmly',
  description: 'GetCalmly terms of use, refund and cancellation policy. Stop a pack anytime and get refunded for the sessions you have not used.',
  alternates: { canonical: '/terms' },
}

const charcoal = '#1C2B3A'
const coral = '#C8553D'

function H({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300, fontSize: 26, color: charcoal, margin: '40px 0 14px' }}>{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: '#3A4A5A', lineHeight: 1.75, marginBottom: 14 }}>{children}</p>
}

export default async function TermsPage() {
  const { therapyPacks, psychiatryPacks } = await getPricingConfig()
  return (
    <div style={{ background: '#FFFCFA' }}>
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '76px 24px 52px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>Last updated 16 June 2026</p>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300, fontSize: 'clamp(34px, 5vw, 50px)', color: '#fff', letterSpacing: '-1px', lineHeight: 1.05 }}>
            Terms &amp; refund policy
          </h1>
        </div>
      </section>

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '32px 36px', border: '1.5px solid rgba(0,0,0,.06)' }}>

          <H>Refund &amp; cancellation</H>
          <P>
            Changing your mind is completely okay. You can drop out or switch your plan at any time, and we will always work out a fair refund for the rest of your pack. No awkward questions.
          </P>
          <P>
            Here is exactly how we keep it fair. Larger packs are priced lower per session, so when you stop early we simply re-price the sessions you have already had at the rate of the <strong>nearest smaller pack</strong>, and return the balance to your original payment method.
          </P>

          <div style={{ background: '#FFF8F5', border: '1px solid rgba(200,85,61,.2)', borderRadius: 14, padding: '20px 22px', margin: '8px 0 14px' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: charcoal, marginBottom: 10 }}>How the re-pricing works</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: '#3A4A5A', lineHeight: 1.8 }}>
              <li>You bought a <strong>6-session therapy pack</strong> and completed <strong>3</strong> sessions. The nearest smaller pack is the 2-session pack, so your 3 sessions are charged at {inr(perSession(therapyPacks[1]))}/session. The rest is refunded.</li>
              <li>You completed <strong>5</strong> sessions of that pack. The nearest smaller pack is the 4-session pack, so they are charged at {inr(perSession(therapyPacks[2]))}/session, and the rest is refunded.</li>
              <li>The same rule applies to psychiatry packs (for example, used sessions re-priced at {inr(perSession(psychiatryPacks[1]))}–{inr(perSession(psychiatryPacks[2]))}/session depending on how many you took).</li>
            </ul>
          </div>
          <P>
            Your free first session is never charged. Refunds are processed within 7–10 working days. Pack validity (1 to 6 months depending on the pack) applies from the date of purchase; unused sessions after the validity period are not carried forward but remain eligible for the same refund treatment.
          </P>
          <P>
            <strong>Calm+</strong> includes a 7-day free trial. Cancel during the trial and you are not charged. After the trial, Calm+ is billed for the chosen validity and is non-refundable for time already elapsed, but you can cancel renewal anytime.
          </P>

          <H>Your first session</H>
          <P>Your first therapy session is free, with no card required. There is no obligation to continue, and we will only ask for payment if you choose to book further sessions.</P>

          <H>Use of AI features</H>
          <P>
            Calm AI, insights, and journaling reflections are supportive tools, not a substitute for professional care. They may be inaccurate, and GetCalmly does not guarantee the accuracy of any AI-generated content. Every clinical summary shared with your professional is reviewed by a human before it counts. AI features are optional and can be turned off anytime in Settings.
          </P>

          <H>Not an emergency service</H>
          <P>
            GetCalmly is not an emergency service. If you are in crisis or at risk, please contact local emergency services or a helpline immediately. You can find helplines on our <Link href="/safety" style={{ color: coral, fontWeight: 600 }}>Safety &amp; Ethics</Link> page.
          </P>

          <H>Privacy &amp; data</H>
          <P>
            Your information is handled in line with India&apos;s DPDP Act 2023. See our <Link href="/privacy" style={{ color: coral, fontWeight: 600 }}>Privacy Policy</Link> for how data is stored, retained, and, only with your consent, shared with trusted AI partners in de-identified form.
          </P>

          <H>Questions</H>
          <P>
            For anything about these terms, billing, or a refund, reach us through the <Link href="/contact" style={{ color: coral, fontWeight: 600 }}>Contact</Link> page and our team will help.
          </P>
        </div>
      </section>
    </div>
  )
}
