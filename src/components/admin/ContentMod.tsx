'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Newspaper, MessagesSquare, Trash2, ExternalLink, Plus, Check, X } from 'lucide-react'
import {
  setBlogPublished, deleteBlogPost, deleteCommunityPost, deleteCommunityComment,
  createAdminBlogPost, createAdminCommunityPost,
} from '@/app/admin/actions'
import type { BlogModRow, CommunityModRow } from '@/lib/admin'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'
const field: React.CSSProperties = { width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 14, fontFamily: 'inherit', color: charcoal, boxSizing: 'border-box' }
const flabel: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#5A6B7A', marginBottom: 5 }

/** Compose a blog post or community discussion under the GetCalmly Team / admin badge. */
function Composer({ kind, onDone }: { kind: 'blog' | 'community'; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [cover, setCover] = useState('')
  const [err, setErr] = useState('')

  function submit() {
    setErr('')
    startTransition(async () => {
      const res = kind === 'blog'
        ? await createAdminBlogPost({ title, excerpt, body, tags, coverImage: cover })
        : await createAdminCommunityPost({ title, body, tags })
      if (res.ok) onDone()
      else setErr(res.error ?? 'Failed.')
    })
  }

  return (
    <div className="card" style={{ border: `1.5px solid ${coral}33`, background: `${coral}08` }}>
      <div className="section-title" style={{ marginBottom: 12 }}>
        New {kind === 'blog' ? 'blog post' : 'community discussion'} · <span style={{ color: coral }}>GetCalmly Team</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div><label style={flabel}>Title</label><input style={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === 'blog' ? 'A clear, human headline' : 'What do you want to open up for discussion?'} /></div>
        {kind === 'blog' && (
          <>
            <div><label style={flabel}>Excerpt <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(optional — first paragraph used if blank)</span></label><input style={field} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} /></div>
            <div><label style={flabel}>Cover image URL <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(optional)</span></label><input style={field} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://…" /></div>
          </>
        )}
        <div><label style={flabel}>{kind === 'blog' ? 'Body' : 'Message'} <span style={{ color: '#A0ADB8', fontWeight: 400 }}>{kind === 'blog' ? '(blank line between paragraphs)' : ''}</span></label><textarea rows={kind === 'blog' ? 8 : 4} style={{ ...field, resize: 'vertical' }} value={body} onChange={(e) => setBody(e.target.value)} /></div>
        <div><label style={flabel}>Tags <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(comma-separated)</span></label><input style={field} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Anxiety, Self-care" /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={submit} disabled={pending || !title.trim() || !body.trim()} className="btn btn-primary" style={{ opacity: pending || !title.trim() || !body.trim() ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Check size={15} /> {pending ? 'Publishing…' : 'Publish'}
          </button>
          <button onClick={onDone} className="btn" style={{ border: '1.5px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', gap: 6 }}><X size={14} /> Cancel</button>
          {err && <span style={{ fontSize: 13, color: coral }}>{err}</span>}
        </div>
      </div>
    </div>
  )
}

export function ContentMod({ blogs, community }: { blogs: BlogModRow[]; community: CommunityModRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [tab, setTab] = useState<'blogs' | 'community'>('blogs')
  const [composing, setComposing] = useState(false)
  const run = (fn: () => Promise<{ ok: boolean }>) => startTransition(async () => { await fn(); router.refresh() })
  const finishCompose = () => { setComposing(false); router.refresh() }

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Content moderation</div>
        <div className="page-meta">Publish or remove blog posts; remove community discussions and replies</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(28,43,58,.05)', padding: 4, borderRadius: 10 }}>
          {([['blogs', `Blogs (${blogs.length})`, <Newspaper key="b" size={15} />], ['community', `Community (${community.length})`, <MessagesSquare key="c" size={15} />]] as const).map(([k, lbl, icon]) => (
            <button key={k} onClick={() => { setTab(k as 'blogs' | 'community'); setComposing(false) }} style={{
              border: 'none', cursor: 'pointer', padding: '9px 16px', borderRadius: 7, fontSize: 13.5, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
              background: tab === k ? '#fff' : 'transparent', color: tab === k ? coral : '#8E9EAE', boxShadow: tab === k ? '0 1px 5px rgba(28,43,58,.12)' : 'none',
            }}>{icon}{lbl}</button>
          ))}
        </div>
        {!composing && (
          <button onClick={() => setComposing(true)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> New {tab === 'blogs' ? 'blog post' : 'discussion'}
          </button>
        )}
      </div>

      {composing && <Composer kind={tab === 'blogs' ? 'blog' : 'community'} onDone={finishCompose} />}

      {tab === 'blogs' && (
        <div className="card" style={{ padding: 0 }}>
          {blogs.map((b) => (
            <div key={b.slug} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: '1px solid rgba(28,43,58,.07)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: charcoal }}>{b.title}</div>
                <div className="muted" style={{ fontSize: 12.5 }}>{b.author} · {b.role} · {b.date}</div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: b.published ? '#2C7A57' : '#8E9EAE', background: b.published ? 'rgba(61,158,114,.1)' : 'rgba(28,43,58,.06)', padding: '3px 9px', borderRadius: 20 }}>{b.published ? 'Published' : 'Hidden'}</span>
              <a href={`/blog/${b.slug}`} target="_blank" rel="noopener noreferrer" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>View <ExternalLink size={12} /></a>
              <button onClick={() => run(() => setBlogPublished({ slug: b.slug, published: !b.published }))} disabled={pending} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{b.published ? 'Unpublish' : 'Publish'}</button>
              <button onClick={() => run(() => deleteBlogPost({ slug: b.slug }))} disabled={pending} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', color: coral, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Trash2 size={13} /></button>
            </div>
          ))}
          {blogs.length === 0 && <p className="muted" style={{ padding: 20 }}>No blog posts.</p>}
        </div>
      )}

      {tab === 'community' && (
        <div className="stack" style={{ gap: 12 }}>
          {community.map((p) => (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: charcoal }}>{p.title}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{p.author} · {p.role} · {p.createdAt} · {p.comments.length} repl{p.comments.length === 1 ? 'y' : 'ies'}</div>
                </div>
                <button onClick={() => run(() => deleteCommunityPost({ id: p.id }))} disabled={pending} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', color: coral, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}><Trash2 size={13} /> Delete thread</button>
              </div>
              {p.comments.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {p.comments.map((c) => (
                    <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(28,43,58,.03)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: charcoal }}>{c.author}</span>
                        <span className="muted" style={{ fontSize: 11.5 }}> · {c.date}</span>
                        <p style={{ fontSize: 13, color: '#3A4A5A', lineHeight: 1.5, marginTop: 2 }}>{c.body}</p>
                      </div>
                      <button onClick={() => run(() => deleteCommunityComment({ id: c.id }))} disabled={pending} title="Delete reply" style={{ background: 'none', border: 'none', cursor: 'pointer', color: coral, flexShrink: 0 }}><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {community.length === 0 && <div className="card"><p className="muted">No community discussions.</p></div>}
        </div>
      )}
    </div>
  )
}
