import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | GetCalmly',
  description:
    'How GetCalmly collects, uses, stores, and protects your personal and health data, in line with the DPDP Act 2023.',
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#FFF8F5]">
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1
            style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
            className="text-4xl md:text-5xl font-black text-[#1C2B3A] mb-4"
          >
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-10">
            Your mental health data is among the most sensitive information you can share. This
            policy explains what we collect, why, and the rights you have over it. As a Data
            Fiduciary under India&apos;s Digital Personal Data Protection (DPDP) Act 2023, we hold
            ourselves to a high standard of care.
          </p>

          <div className="space-y-8">
            <Block title="What We Collect">
              Account details (name, email, phone), assessment responses, mood and journal entries,
              session records, and payment information processed by our payment partner. We collect
              only what we need to match you with the right professional and deliver care.
            </Block>

            <Block title="How We Use Your Data">
              To match you with an RCI-verified therapist or NMC-registered psychiatrist, to power
              your Calm AI insights and mood tracking, to prepare pre-session briefs for your
              clinician, and to operate and improve the service. We do not sell your data, and we do
              not use your private journal or session content for advertising.
            </Block>

            <Block title="Your Consent">
              We process your personal and health data on the basis of your consent, which you give
              at sign-up, before your pre-assessment, and before each session. You can withdraw
              consent at any time, withdrawal does not affect processing already carried out
              lawfully.
            </Block>

            <Block title="Storage & Security">
              Your data is encrypted in transit and at rest, and stored on secure infrastructure.
              Access is restricted to your care team and authorised staff on a need-to-know basis.
              We retain data only as long as necessary for your care and our legal obligations.
            </Block>

            <Block title="Sharing & Disclosure">
              We share data with your assigned clinician to provide care, and with service providers
              (payments, video, hosting) bound by confidentiality. We may disclose data where
              required by law or where there is a serious risk of harm to you or others, consistent
              with our Safety &amp; Ethics policy.
            </Block>

            <Block title="Your Rights">
              Under the DPDP Act you have the right to access, correct, and erase your data, to
              withdraw consent, to nominate someone to exercise your rights, and to raise a
              grievance. To exercise any of these, contact our Data Protection Officer at{' '}
              <a href="mailto:getcalmly@gmail.com" className="text-[#C8553D] font-medium">
                getcalmly@gmail.com
              </a>
              .
            </Block>

            <Block title="Cookies">
              We use essential cookies to keep you signed in and to remember your preferences, and
              limited analytics to understand how the service is used. You can manage your choice via
              the cookie banner or your browser settings.
            </Block>

            <Block title="Children">
              Where care is provided to a minor, we require verifiable consent from a parent or legal
              guardian, in line with the DPDP Act. We do not knowingly process a child&apos;s data
              without it.
            </Block>

            <Block title="Changes to This Policy">
              We may update this policy as the service and the law evolve. Material changes will be
              communicated to you, and the latest version will always be available here.
            </Block>
          </div>
        </div>
      </section>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#C8553D] mb-2">{title}</h2>
      <p className="text-gray-600 text-sm leading-relaxed">{children}</p>
    </div>
  )
}
