import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, ArrowBigUp, ShieldCheck } from 'lucide-react'
import { getTherapistContext } from '@/lib/expert'
import { getCommunityPost, getCommunityComments } from '@/lib/community'
import { CommunityAnswer } from '@/components/expert/CommunityAnswer'

export const metadata = { title: 'Discussion · Expert portal', robots: { index: false, follow: false } }

const charcoal = '#1C2B3A'
const CLINICAL_ROLES = new Set(['Therapist', 'Psychiatrist', 'Admin'])

export default async function ExpertCommunityThread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const post = await getCommunityPost(id)
  if (!post) notFound()
  const comments = await getCommunityComments(id)

  return (
    <div className="stack">
      <Link href="/expert/community" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> All discussions
      </Link>

      {/* The question */}
      <div className="card">
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#8E9EAE' }}>
            <ArrowBigUp size={20} />
            <span style={{ fontWeight: 700, fontSize: 14, color: charcoal }}>{post.upvotes}</span>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: charcoal, marginBottom: 6 }}>{post.title}</h1>
            <div className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
              {post.author} · {post.role}{post.tenure ? ` · ${post.tenure}` : ''} · {post.date}
            </div>
            <p style={{ fontSize: 15, color: 'var(--c-gray-d)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{post.body}</p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
              {post.tags.map((t) => (
                <span key={t} style={{ fontSize: 11.5, fontWeight: 600, color: '#8E9EAE', background: 'rgba(28,43,58,.05)', padding: '4px 10px', borderRadius: 20 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Answer composer */}
      <CommunityAnswer postId={post.id} designation={ctx.designation} />

      {/* Replies */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>
          {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
        </div>
        {comments.length === 0 && <p className="muted" style={{ marginTop: 10 }}>No replies yet. Be the first professional to answer.</p>}
        <div style={{ marginTop: 8 }}>
          {comments.map((c) => {
            const clinical = CLINICAL_ROLES.has(c.role)
            return (
              <div key={c.id} style={{ padding: '14px 0', borderTop: '1px solid rgba(28,43,58,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: charcoal }}>{c.author}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    color: clinical ? '#1A7F7A' : '#8E9EAE',
                    background: clinical ? 'rgba(26,127,122,.1)' : 'rgba(28,43,58,.05)',
                  }}>
                    {clinical && <ShieldCheck size={11} />}{c.role}
                  </span>
                  <span className="muted" style={{ fontSize: 11.5, marginLeft: 'auto' }}>{c.date}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--c-gray-d)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{c.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
