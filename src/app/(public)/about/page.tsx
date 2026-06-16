import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | GetCalmly',
  description:
    'GetCalmly bridges India’s mental health treatment gap with RCI-licensed, vernacular-first, culturally-aware therapy, amplified by thoughtful AI.',
}

const stats = [
  ['60%+', 'treatment gap in India'],
  ['0.75', 'psychiatrists per 100,000 people'],
  ['15+', 'languages we support'],
  ['100%', 'RCI & NMC verified clinicians'],
]

const values = [
  { icon: '🔒', title: 'Privacy First', desc: 'DPDP-compliant, encrypted, and confidential by design.' },
  { icon: '🗣️', title: 'Culturally Attuned', desc: 'Care that understands your context, matched to fit rather than one-size-fits-all.' },
  { icon: '✅', title: 'Clinically Credible', desc: 'Only RCI-licensed psychologists and NMC-registered psychiatrists.' },
  { icon: '🤝', title: 'Accessible & Affordable', desc: 'Quality care within your budget, from your couch or in person.' },
]

const contacts = [
  { icon: '✉️', label: 'Email us', value: 'connect@getcalmly.com', href: 'mailto:connect@getcalmly.com' },
  { icon: '📞', label: 'Call us', value: '+91 88845 18688', href: 'tel:+918884518688' },
  { icon: '💬', label: 'Partnerships', value: 'connect@getcalmly.com', href: 'mailto:connect@getcalmly.com' },
]

const socials = [
  ['Instagram', 'https://instagram.com/getcalmly', '📷'],
  ['LinkedIn', 'https://linkedin.com/company/getcalmly', '💼'],
  ['X (Twitter)', 'https://x.com/getcalmly', '𝕏'],
  ['YouTube', 'https://youtube.com/@getcalmly', '▶️'],
]

export default function AboutPage() {
  return (
    <div className="bg-[#FFF8F5]">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#C8553D] mb-4">Our story</p>
          <h1 style={{ fontFamily: "'Big Shoulders Display',sans-serif" }} className="text-4xl md:text-6xl font-black text-[#1C2B3A] mb-6 leading-[1.02]">
            Mental health support<br />that understands you
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            GetCalmly is a privacy-first platform connecting people across India with the right licensed
            professional, matched not just by symptoms but by your needs, context, language and budget.
            Real care from real experts, made easier to reach and easier to stay with.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(([n, d]) => (
            <div key={d} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <p style={{ fontFamily: "'Big Shoulders Display',sans-serif" }} className="text-3xl md:text-4xl font-black text-[#C8553D] leading-none">{n}</p>
              <p className="text-xs text-gray-500 mt-2 leading-snug">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="pb-12 px-4">
        <div className="max-w-4xl mx-auto bg-[#1C2B3A] rounded-3xl p-8 md:p-12 text-center">
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#E8896F] mb-4">Our mission</p>
          <p style={{ fontFamily: "'Big Shoulders Display',sans-serif" }} className="text-2xl md:text-4xl font-black text-white leading-snug max-w-3xl mx-auto">
            To make credible mental health care reach every corner of India, in the language you think in and at a price that never stands in the way.
          </p>
        </div>
      </section>

      {/* Problem / Approach */}
      <section className="pb-12 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#C8553D] mb-3">The problem</h2>
            <p className="text-gray-600 leading-relaxed">
              India faces a mental health treatment gap exceeding 60%. With roughly 0.75 psychiatrists per
              100,000 people and specialists concentrated in major cities, millions in Tier-2 and Tier-3
              regions go underserved. NRIs, meanwhile, often pay high fees for therapists who don’t share
              their cultural context.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#C8553D] mb-3">Our approach</h2>
            <p className="text-gray-600 leading-relaxed">
              A strictly vetted network of RCI-licensed professionals, a match that pairs you on cultural fit
              and your needs rather than diagnosis alone, and a hybrid safety protocol so care is safe, not
              just digital. Between sessions, a supportive app and community stay with you.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 style={{ fontFamily: "'Big Shoulders Display',sans-serif" }} className="text-3xl md:text-4xl font-black text-[#1C2B3A] text-center mb-10">
            What we stand for
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-[#1C2B3A] mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact + social */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 style={{ fontFamily: "'Big Shoulders Display',sans-serif" }} className="text-2xl md:text-3xl font-black text-[#1C2B3A] mb-3">
                Talk to us
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Questions about care, billing, or working together? We are real people and we would love to hear
                from you. We usually reply within a working day.
              </p>
              <div className="flex flex-col gap-3">
                {contacts.map((c) => (
                  <a key={c.label} href={c.href} className="flex items-center gap-3 group">
                    <span className="w-10 h-10 rounded-xl bg-[#FFF1EC] flex items-center justify-center text-lg shrink-0">{c.icon}</span>
                    <span>
                      <span className="block text-xs text-gray-400 font-semibold">{c.label}</span>
                      <span className="block text-[#1C2B3A] font-semibold group-hover:text-[#C8553D] transition">{c.value}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="md:border-l md:border-[#F0E4DE] md:pl-10">
              <h3 className="text-sm font-bold text-[#1C2B3A] mb-2">Visit / write to us</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-1">GetCalmly</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                316, 11th A Main, Classic Paradise Layout,<br />Begur, Bengaluru 560068, India
              </p>
              <h3 className="text-sm font-bold text-[#1C2B3A] mb-2">Support hours</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">Monday to Saturday · 9:00 AM to 8:00 PM IST</p>

              <h3 className="text-sm font-bold text-[#1C2B3A] mb-3">Follow along</h3>
              <div className="flex flex-wrap gap-2.5">
                {socials.map(([name, url, icon]) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name}
                    className="flex items-center gap-2 bg-[#FFF8F5] border border-[#F0D9D1] rounded-full px-4 py-2 text-sm font-semibold text-[#1C2B3A] hover:border-[#C8553D] transition">
                    <span>{icon}</span>{name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#F0E4DE] flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-500">Prefer a structured message? Use our contact form.</p>
            <Link href="/contact" className="bg-[#1C2B3A] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#0F1C28] transition">
              Go to Contact →
            </Link>
          </div>
        </div>
      </section>

      {/* If in crisis */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto bg-[#FDECEC] border border-[#F3C9C9] rounded-2xl p-6 text-center">
          <p className="text-sm text-[#9A3B3B] leading-relaxed">
            <strong>In crisis or need urgent help?</strong> GetCalmly is not an emergency service. Please reach out to a
            helpline right away, find numbers on our{' '}
            <Link href="/safety" className="underline font-semibold">Safety &amp; Ethics</Link> page.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto bg-[#C8553D] rounded-3xl p-10 text-center text-white">
          <h2 style={{ fontFamily: "'Big Shoulders Display',sans-serif" }} className="text-3xl font-black mb-3">
            Take the first step today
          </h2>
          <p className="opacity-90 mb-6">A confidential 5-minute assessment is all it takes to find your match.</p>
          <Link href="/assess" className="inline-block bg-white text-[#C8553D] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
            Begin your assessment
          </Link>
        </div>
      </section>
    </div>
  )
}
