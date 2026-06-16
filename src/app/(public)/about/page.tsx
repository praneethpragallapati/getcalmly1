import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | GetCalmly',
  description:
    'GetCalmly bridges India’s mental health treatment gap with RCI-licensed, vernacular-first, culturally-aware therapy.',
}

const values = [
  { icon: '🔒', title: 'Privacy First', desc: 'DPDP-compliant, encrypted, and confidential by design.' },
  { icon: '🗣️', title: 'Culturally Attuned', desc: 'Care that understands your context — matched to fit, not one-size-fits-all.' },
  { icon: '✅', title: 'Clinically Credible', desc: 'Only RCI-licensed psychologists and NMC-registered psychiatrists.' },
  { icon: '🤝', title: 'Accessible & Affordable', desc: 'Quality care within your budget, from your couch or in person.' },
]

export default function AboutPage() {
  return (
    <div className="bg-[#FFF8F5]">
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
            className="text-4xl md:text-6xl font-black text-[#1C2B3A] mb-6"
          >
            Mental health support that understands you
          </h1>
          <p className="text-lg text-gray-600">
            GetCalmly is a privacy-first digital therapy platform connecting people across India
            with the right licensed professional — matched not just by symptoms, but by your needs,
            context, and budget.
          </p>
        </div>
      </section>

      <section className="pb-12 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#C8553D] mb-3">The Problem</h2>
            <p className="text-gray-600">
              India faces a mental health treatment gap exceeding 60%. With roughly 0.75 psychiatrists
              per 100,000 people and specialists concentrated in major cities, millions in Tier-2 and
              Tier-3 regions go underserved. NRIs, meanwhile, often pay high fees for therapists who
              don’t share their cultural context.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#C8553D] mb-3">Our Approach</h2>
            <p className="text-gray-600">
              A strictly-vetted network of RCI-licensed professionals, a “vibe-match” that pairs you
              on cultural fit and your needs — not just diagnosis — and a hybrid emergency protocol so
              care is safe, not just digital. After therapy, a supportive community stays with you.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
            className="text-3xl md:text-4xl font-black text-[#1C2B3A] text-center mb-10"
          >
            What We Stand For
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-[#1C2B3A] mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 style={{ fontFamily: "'Big Shoulders Display',sans-serif" }} className="text-2xl md:text-3xl font-black text-[#1C2B3A] mb-3">
                Let&apos;s stay connected
              </h2>
              <p className="text-gray-600 mb-5">
                Follow along for everyday mental health, honest conversations, and the occasional reminder to breathe. Questions about care, billing, or partnerships? We would love to hear from you.
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <a href="mailto:connect@getcalmly.com" className="text-[#C8553D] font-semibold">connect@getcalmly.com</a>
                <Link href="/contact" className="text-[#C8553D] font-semibold">Visit our Contact page →</Link>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              {[
                ['Instagram', 'https://instagram.com/getcalmly', '📷'],
                ['LinkedIn', 'https://linkedin.com/company/getcalmly', '💼'],
                ['X (Twitter)', 'https://x.com/getcalmly', '𝕏'],
                ['YouTube', 'https://youtube.com/@getcalmly', '▶️'],
                ['Facebook', 'https://facebook.com/getcalmly', '👍'],
              ].map(([name, url, icon]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex items-center gap-2 bg-[#FFF8F5] border border-[#F0D9D1] rounded-full px-4 py-2.5 text-sm font-semibold text-[#1C2B3A] hover:border-[#C8553D] transition"
                >
                  <span>{icon}</span>{name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto bg-[#C8553D] rounded-3xl p-10 text-center text-white">
          <h2
            style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
            className="text-3xl font-black mb-3"
          >
            Take the first step today
          </h2>
          <p className="opacity-90 mb-6">
            A confidential 3-minute assessment is all it takes to find your match.
          </p>
          <Link
            href="/assess"
            className="inline-block bg-white text-[#C8553D] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Begin Your Assessment
          </Link>
        </div>
      </section>
    </div>
  )
}
