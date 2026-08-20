import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { CommunityPostView, CommunityCommentView } from '@/lib/community'
import { UpvoteButton } from '@/components/community/UpvoteButton'
import { ReplyForm } from '@/components/community/ReplyForm'

const charcoal = '#1C2B3A'
const coral = '#C8553D'

const ROLE_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  'Paid Member': { bg: 'rgba(200,85,61,.1)', color: '#C8553D', label: 'Paid Member ⭐' },
  Member: { bg: 'rgba(0,0,0,.05)', color: '#6B7D8E', label: 'Member' },
  Therapist: { bg: 'rgba(61,158,114,.1)', color: '#2C7A57', label: 'Therapist 🧑‍⚕️' },
  Psychiatrist: { bg: 'rgba(100,80,180,.1)', color: '#5A40B0', label: 'Psychiatrist 👨‍⚕️' },
  Admin: { bg: 'rgba(28,43,58,.1)', color: '#1C2B3A', label: 'Admin 🛡️' },
}

/** Small "on platform / streak" line shown under a community author, when known. */
function IdentityLine({ tenure, streak }: { tenure?: string | null; streak?: number | null }) {
  const bits: string[] = []
  if (tenure) bits.push(tenure)
  if (typeof streak === 'number' && streak > 0) bits.push(`🔥 ${streak}-day streak`)
  return (
    <>
      {bits.length > 0 && <span style={{ fontSize: 12, color: '#9AABB8' }}>{bits.join(' · ')}</span>}
    </>
  )
}

/**
 * In-dashboard community thread. Same content as the public detail page (post,
 * replies, reply box) but without the marketing / "Join for free" chrome, and
 * with a back link that stays inside the portal — so members and experts never
 * get bounced out to the public site when they open or answer a discussion.
 */
export function DashboardCommunityThread({
  post,
  comments,
  votes,
  backHref,
}: {
  post: CommunityPostView
  comments: CommunityCommentView[]
  votes: { post: boolean; comments: Set<string> }
  backHref: string
}) {
  const role = ROLE_COLOR[post.role] ?? ROLE_COLOR.Member
  const paras = post.body.split(/\n{2,}/).filter(Boolean)

  return (
    <div style={{ maxWidth: 720 }}>
      <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B7D8E', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', marginBottom: 18 }}>
        <ArrowLeft size={15} /> Back to community
      </Link>

      {/* Post */}
      <article style={{ background: '#fff', borderRadius: 18, padding: 'clamp(22px, 4vw, 32px)', border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {post.tags.map((t) => (
            <span key={t} style={{ background: 'rgba(200,85,61,.08)', color: coral, fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 999, letterSpacing: '.5px', textTransform: 'uppercase' }}>#{t}</span>
          ))}
        </div>
        <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: charcoal, lineHeight: 1.15, margin: '0 0 18px' }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 20, marginBottom: 22, borderBottom: '1px solid #f0eae6' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: coral, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17, fontFamily: "'Big Shoulders Display', sans-serif", flexShrink: 0 }}>
            {post.author.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: charcoal }}>{post.author}</span>
              <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: role.bg, color: role.color }}>{role.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
              <span style={{ fontSize: 12.5, color: '#9AABB8' }}>{post.date}</span>
              <IdentityLine tenure={post.tenure} streak={post.streak} />
            </div>
          </div>
          <UpvoteButton variant="post" target={{ postId: post.id }} count={post.upvotes} voted={votes.post} signedIn />
        </div>

        {paras.map((p, i) => (
          <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: '#2e3d4e', margin: 0, marginBottom: i < paras.length - 1 ? 16 : 0, whiteSpace: 'pre-wrap' }}>{p}</p>
        ))}
      </article>

      {/* Replies */}
      {comments.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 21, fontWeight: 700, color: charcoal, margin: '0 0 12px' }}>
            {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.map((c) => {
              const cRole = ROLE_COLOR[c.role] ?? ROLE_COLOR.Member
              return (
                <div key={c.id} style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: coral, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, fontFamily: "'Big Shoulders Display', sans-serif", flexShrink: 0 }}>
                      {c.author.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: charcoal }}>{c.author}</span>
                        <span style={{ padding: '1px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cRole.bg, color: cRole.color }}>{cRole.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#9AABB8' }}>{c.date}</span>
                        <IdentityLine tenure={c.tenure} streak={c.streak} />
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: '#2e3d4e', margin: 0, whiteSpace: 'pre-wrap' }}>{c.body}</p>
                  <div style={{ marginTop: 12, display: 'flex' }}>
                    <UpvoteButton target={{ commentId: c.id }} count={c.upvotes} voted={votes.comments.has(c.id)} signedIn />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <ReplyForm postId={post.id} />
    </div>
  )
}
