import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowBigUp, MessageSquare, ArrowRight } from 'lucide-react'
import { getTherapistContext } from '@/lib/expert'
import { getCommunityPosts, getCommunityStats } from '@/lib/community'

export const metadata = { title: 'Community · Expert portal', robots: { index: false, follow: false } }

const charcoal = '#1C2B3A'

export default async function ExpertCommunityPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const [posts, stats] = await Promise.all([getCommunityPosts(), getCommunityStats()])

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Community</div>
        <div className="page-meta">
          {stats.discussions} discussions · {stats.replies} replies · answer as <b>{ctx.designation}</b>
        </div>
      </div>

      <div className="card" style={{ background: 'radial-gradient(ellipse 70% 90% at 90% 0%, rgba(200,85,61,.16), transparent 60%), #fff' }}>
        <p style={{ fontSize: 14, color: 'var(--c-gray-d)', lineHeight: 1.7, margin: 0 }}>
          These are real member questions. A short, kind, clinically-sound answer from a verified
          professional goes a long way, and your <b>{ctx.designation}</b> badge is shown on every reply.
          Keep it general and supportive, never a diagnosis.
        </p>
      </div>

      <div className="stack" style={{ gap: 12 }}>
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/expert/community/${p.id}`}
            className="card"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: charcoal, marginBottom: 5 }}>{p.title}</div>
                <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.body}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                  <span className="muted" style={{ fontSize: 12 }}>{p.author} · {p.role} · {p.date}</span>
                  <span className="muted" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowBigUp size={14} /> {p.upvotes}</span>
                  <span className="muted" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}><MessageSquare size={13} /> {p.comments}</span>
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} style={{ fontSize: 11, fontWeight: 600, color: '#8E9EAE', background: 'rgba(28,43,58,.05)', padding: '3px 9px', borderRadius: 20 }}>{t}</span>
                  ))}
                </div>
              </div>
              <ArrowRight size={17} style={{ color: '#C8553D', flexShrink: 0, marginTop: 4 }} />
            </div>
          </Link>
        ))}
        {posts.length === 0 && <div className="card"><p className="muted">No discussions yet.</p></div>}
      </div>
    </div>
  )
}
