import { redirect } from 'next/navigation'
import { ExternalLink, Clock } from 'lucide-react'
import { getTherapistContext, getExpertBlogPosts } from '@/lib/expert'
import { BlogComposer } from '@/components/expert/BlogComposer'

export const metadata = { title: 'Blogs · Expert portal', robots: { index: false, follow: false } }

const charcoal = '#1C2B3A'

export default async function ExpertBlogsPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')
  const posts = await getExpertBlogPosts(ctx.userId)

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Blogs</div>
        <div className="page-meta">Write for the public blog · bylined as <b>{ctx.designation}</b></div>
      </div>

      <BlogComposer designation={ctx.designation} />

      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Your posts</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>{posts.length} published</p>
        {posts.length === 0 && <p className="muted">You haven&apos;t published anything yet. Your first post will appear here and on the public blog.</p>}
        <div>
          {posts.map((p) => (
            <div key={p.slug} style={{ padding: '14px 0', borderTop: '1px solid rgba(28,43,58,.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: charcoal }}>{p.title}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: p.published ? '#3D9E72' : '#8E9EAE', background: p.published ? 'rgba(61,158,114,.1)' : 'rgba(28,43,58,.06)', padding: '2px 8px', borderRadius: 20 }}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, margin: '5px 0 8px' }}>{p.excerpt}</p>
                  <div className="muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span>{p.dateLabel}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {p.readTime}</span>
                    <span>{p.paragraphs} paragraph{p.paragraphs === 1 ? '' : 's'}</span>
                    {p.tags.map((t) => (
                      <span key={t} style={{ fontWeight: 600, color: '#8E9EAE', background: 'rgba(28,43,58,.05)', padding: '2px 8px', borderRadius: 20 }}>{t}</span>
                    ))}
                  </div>
                </div>
                <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  View <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
