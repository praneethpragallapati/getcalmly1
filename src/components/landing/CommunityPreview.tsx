import Link from 'next/link'

const categories = ['Anxiety Support', 'Student Life', 'Relationships', 'New Parents', 'Work & Burnout']

const posts = [
  {
    text: 'Six months into therapy and I finally had a week where I felt like myself again. Small wins count. 💛',
    meta: 'Anonymous • Anxiety Support',
  },
  {
    text: 'Exam season is brutal. How does everyone manage the pressure without burning out?',
    meta: 'Anonymous • Student Life',
  },
  {
    text: 'Just wanted to say this community has been a safe space when I had nowhere else to talk. Thank you all.',
    meta: 'Anonymous • New Parents',
  },
]

export default function CommunityPreview() {
  return (
    <section className="py-20 bg-[#F9F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-semibold text-[#0D5C63] bg-[#e0f7fa] px-3 py-1 rounded-full mb-4">
              A no-judgement space
            </span>
            <h2
              style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
              className="text-4xl md:text-5xl font-black text-[#1a1a2e] mb-4"
            >
              You’re Not Alone in This
            </h2>
            <p className="text-gray-600 mb-6">
              Join a moderated, anonymous community where people support each other through
              similar journeys — even after therapy ends.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((c) => (
                <span
                  key={c}
                  className="bg-white text-gray-700 text-sm px-3 py-1.5 rounded-full border border-gray-200"
                >
                  {c}
                </span>
              ))}
            </div>
            <Link
              href="/community"
              className="inline-block bg-[#0D5C63] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0a4a50] transition"
            >
              Explore the Community
            </Link>
          </div>

          <div className="space-y-4">
            {posts.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-gray-700 mb-3">{p.text}</p>
                <p className="text-xs text-gray-400">{p.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
