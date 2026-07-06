import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCommunityPost, getRelatedDiscussions } from '@/lib/community'
import { getRelatedBlogPosts } from '@/lib/blog'
import BlogCover from '@/components/blog/BlogCover'
import { blogImage } from '@/data/blogImages'

const charcoal = '#1C2B3A'
const coral = '#C8553D'

const ROLE_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  'Paid Member': { bg: 'rgba(200,85,61,.1)', color: '#C8553D', label: 'Paid Member ⭐' },
  Member: { bg: 'rgba(0,0,0,.05)', color: '#6B7D8E', label: 'Member' },
  Therapist: { bg: 'rgba(61,158,114,.1)', color: '#2C7A57', label: 'Therapist 🧑‍⚕️' },
  Psychiatrist: { bg: 'rgba(100,80,180,.1)', color: '#5A40B0', label: 'Psychiatrist 👨‍⚕️' },
  Admin: { bg: 'rgba(28,43,58,.1)', color: '#1C2B3A', label: 'Admin 🛡️' },
}

const blogCoverGrad: Record<string, { from: string; to: string }> = {
  anxiety: { from: '#2E4A5C', to: '#1C2B3A' },
  postpartum: { from: '#7A4A52', to: '#3E2A38' },
  'men-mental-health': { from: '#2D4A45', to: '#1C302C' },
  cbt: { from: '#5A4A6E', to: '#2E2740' },
  grief: { from: '#3A4A6E', to: '#222B45' },
}
const gradFor = (t: string) => blogCoverGrad[t] ?? { from: '#2E4A5C', to: '#1C2B3A' }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const post = await getCommunityPost(id)
  if (!post) return {}
  return { title: `${post.title} | GetCalmly Community`, description: post.body.slice(0, 155) }
}

export default async function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getCommunityPost(id)
  if (!post) notFound()

  const relatedReads = await getRelatedBlogPosts(post.tags, undefined, 3)
  const moreDiscussions = (await getRelatedDiscussions(post.tags, 4)).filter((d) => d.id !== post.id).slice(0, 3)
  const role = ROLE_COLOR[post.role] ?? ROLE_COLOR.Member
  const paras = post.body.split(/\n{2,}/).filter(Boolean)

  return (
    <div style={{ background: '#FFFCFA', minHeight: '100vh' }}>
      {/* Header band */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29', padding: '56px 24px 40px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Link href="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 26 }}>
            ← Back to community
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {post.tags.map((t) => (
              <Link key={t} href="/community" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 13px', borderRadius: 999, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>
                #{t}
              </Link>
            ))}
          </div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 300, color: '#fff', lineHeight: 1.06, letterSpacing: '-0.5px', margin: 0 }}>
            {post.title}
          </h1>
        </div>
      </section>

      {/* Body card */}
      <section style={{ padding: '0 24px', maxWidth: 760, margin: '0 auto' }}>
        <article style={{ background: '#fff', borderRadius: 22, padding: 'clamp(24px, 5vw, 44px)', marginTop: -20, border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 12px 32px rgba(28,43,58,.08)' }}>
          {/* Author + votes row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 22, marginBottom: 24, borderBottom: '1px solid #f0eae6' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: coral, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 19, fontFamily: "'Big Shoulders Display', sans-serif", flexShrink: 0 }}>
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: charcoal }}>{post.author}</span>
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: role.bg, color: role.color }}>{role.label}</span>
              </div>
              <span style={{ fontSize: 12.5, color: '#9AABB8' }}>{post.date}{post.tenure ? ` · ${post.tenure}` : ''}</span>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(200,85,61,.07)', borderRadius: 12, padding: '8px 12px', flexShrink: 0 }}>
              <div style={{ color: coral, fontSize: 13, lineHeight: 1 }}>▲</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: charcoal, fontFamily: "'Big Shoulders Display', sans-serif" }}>{post.upvotes}</div>
              <div style={{ fontSize: 9, color: '#9AABB8', fontWeight: 700, letterSpacing: '.5px' }}>VOTES</div>
            </div>
          </div>

          {/* Body */}
          {paras.map((p, i) => (
            <p key={i} style={{ fontSize: 16.5, lineHeight: 1.8, color: '#2e3d4e', margin: 0, marginBottom: i < paras.length - 1 ? 18 : 0, whiteSpace: 'pre-wrap' }}>
              {p}
            </p>
          ))}

          {/* Footer */}
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid #f0eae6', display: 'flex', alignItems: 'center', gap: 18, fontSize: 13.5, color: '#6B7D8E', fontWeight: 600 }}>
            <span>💬 {post.comments} comments</span>
            <span>▲ {post.upvotes} upvotes</span>
          </div>
        </article>

        {/* Reply prompt (locked for guests) */}
        <Link href="/register" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 16, padding: '16px 20px', marginTop: 18, border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)' }}>
          <span style={{ flex: 1, fontSize: 14.5, color: '#9AABB8', fontWeight: 500 }}>Want to reply or add your experience?</span>
          <span style={{ padding: '8px 18px', borderRadius: 22, background: coral, color: '#fff', fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap' }}>🔒 Join to reply</span>
        </Link>
      </section>

      {/* Related reads (blogs sharing tags) */}
      {relatedReads.length > 0 && (
        <section style={{ padding: '40px 24px 8px', maxWidth: 760, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: coral, marginBottom: 8 }}>From our clinicians</p>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 26, fontWeight: 300, color: charcoal, marginBottom: 16 }}>Related reads</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {relatedReads.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: 'none' }}>
                <article style={{ height: '100%', background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)' }}>
                  <div style={{ position: 'relative', height: 96, background: `linear-gradient(140deg, ${gradFor(r.tags[0]).from}, ${gradFor(r.tags[0]).to})`, overflow: 'hidden' }}>
                    <BlogCover src={blogImage(r.tags)} alt={r.title} />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 17, fontWeight: 800, color: charcoal, lineHeight: 1.2, margin: '0 0 6px' }}>{r.title}</h3>
                    <p style={{ fontSize: 12.5, color: '#6B7D8E', margin: 0 }}>{r.readTime}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* More discussions on these themes */}
      {moreDiscussions.length > 0 && (
        <section style={{ padding: '32px 24px 16px', maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 26, fontWeight: 300, color: charcoal, marginBottom: 16 }}>More discussions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {moreDiscussions.map((d) => (
              <Link key={d.id} href={`/community/${d.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)' }}>
                  <span style={{ fontSize: 15, color: charcoal, fontWeight: 600, lineHeight: 1.4 }}>{d.title}</span>
                  <span style={{ fontSize: 12, color: coral, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>Read →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '32px 24px 80px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2A3F54 100%)', borderRadius: 22, padding: '40px 32px', textAlign: 'center', color: '#fff', boxShadow: '0 14px 36px rgba(28,43,58,.25)' }}>
          <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 26, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.2 }}>You&apos;re not alone in this.</p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.75)', margin: '0 auto 22px', maxWidth: 420, lineHeight: 1.6 }}>Join free to reply, share your own story, and talk to a verified clinician when you&apos;re ready.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '12px 30px', borderRadius: 28, background: coral, color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 6px 18px rgba(200,85,61,.4)' }}>Join for free</Link>
            <Link href="/assess" style={{ padding: '12px 30px', borderRadius: 28, background: 'rgba(255,255,255,.08)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '2px solid rgba(255,255,255,.25)' }}>Book a session</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
