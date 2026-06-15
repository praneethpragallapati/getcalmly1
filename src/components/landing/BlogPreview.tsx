import Link from 'next/link'

const posts = [
  {
    title: 'Understanding Anxiety: Signs You Shouldn’t Ignore',
    author: 'Dr. Priya Sharma',
    category: 'Anxiety',
    read: '5 min read',
    accent: '#0D5C63',
  },
  {
    title: 'How to Talk to Your Child About Mental Health',
    author: 'Dr. Sneha Patil',
    category: 'Parenting',
    read: '6 min read',
    accent: '#6BAF92',
  },
  {
    title: 'Burnout vs. Stress: Know the Difference',
    author: 'Dr. Rahul Menon',
    category: 'Workplace',
    read: '4 min read',
    accent: '#8B9DC3',
  },
]

export default function BlogPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2
              style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
              className="text-4xl md:text-5xl font-black text-[#1a1a2e]"
            >
              From Our Therapists
            </h2>
            <p className="text-gray-600 mt-2">Evidence-based insights, written by professionals.</p>
          </div>
          <Link href="/blog" className="hidden sm:inline text-[#0D5C63] font-semibold hover:underline">
            View all articles →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link
              key={p.title}
              href="/blog"
              className="group bg-[#F9F5F0] rounded-2xl overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-40 flex items-center justify-center" style={{ background: p.accent }}>
                <span className="text-white/90 text-sm font-semibold uppercase tracking-wider">
                  {p.category}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-[#1a1a2e] group-hover:text-[#0D5C63] mb-3 leading-snug">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {p.author} • {p.read}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
