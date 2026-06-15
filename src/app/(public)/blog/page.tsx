import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — Mental Health Insights from Experts | getCalmly',
  description:
    'Evidence-based articles on anxiety, depression, relationships, work stress and wellbeing — written and reviewed by RCI-verified mental health professionals.',
  alternates: { canonical: '/blog' },
}

const posts = [
  { cat: 'Anxiety', title: 'The 5-4-3-2-1 grounding technique, explained by a clinical psychologist', read: '6 min', emoji: '🌿' },
  { cat: 'Work & Stress', title: 'Burnout isn’t a badge of honour: spotting the early signs', read: '8 min', emoji: '💼' },
  { cat: 'Relationships', title: 'How to set boundaries without guilt', read: '5 min', emoji: '🤝' },
  { cat: 'Depression', title: 'Small wins: why progress in therapy is often quiet', read: '7 min', emoji: '🕊️' },
  { cat: 'Sleep', title: 'A therapist’s guide to winding down a racing mind', read: '6 min', emoji: '🌙' },
  { cat: 'Parenting', title: 'Supporting a teenager through exam stress', read: '9 min', emoji: '📚' },
]

export default function BlogPage() {
  return (
    <section className="features-section" id="blog">
      <div className="feat-header">
        <div>
          <div className="sec-label reveal">The getCalmly blog</div>
          <h2 className="sec-h2 reveal">Insights from<br /><span>the experts.</span></h2>
        </div>
        <p className="sec-p reveal">
          Practical, evidence-based reads on mental health — every article written or reviewed by
          RCI-verified clinicians. New pieces published weekly.
        </p>
      </div>
      <div className="feat-grid">
        {posts.map((p, i) => (
          <Link
            key={p.title}
            href="/blog"
            className={`feat-card reveal${i % 3 ? ` d${i % 3}` : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <span className="feat-icon">{p.emoji}</span>
            <span className="feat-badge fb-c" style={{ marginTop: 0, marginBottom: 12 }}>{p.cat}</span>
            <div className="feat-t">{p.title}</div>
            <div className="feat-d">{p.read} read · Expert reviewed</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
