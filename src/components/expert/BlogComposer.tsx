'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PenLine, ExternalLink } from 'lucide-react'
import { publishBlog } from '@/app/(dashboard)/expert/actions'

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '11px 13px',
  fontSize: 14, fontFamily: 'inherit', color: '#1C2B3A',
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6B7A', marginBottom: 6 }

export function BlogComposer({ designation }: { designation: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string; slug?: string } | null>(null)

  function submit() {
    setMsg(null)
    startTransition(async () => {
      const res = await publishBlog({
        title,
        excerpt,
        body,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      if (res.ok) {
        setTitle(''); setExcerpt(''); setBody(''); setTags('')
        setMsg({ ok: true, text: 'Published to the public blog.', slug: res.slug })
        router.refresh()
      } else {
        setMsg({ ok: false, text: res.error ?? 'Could not publish.' })
      }
    })
  }

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Write a new blog</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 16 }}>
        Published to the public blog under your name as <b>{designation}</b>. Separate paragraphs with a blank line.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="e.g. Five gentle ways to sit with anxiety" />
        </div>
        <div>
          <label style={labelStyle}>Excerpt <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(one-line summary)</span></label>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} style={inputStyle} placeholder="A short teaser shown on the blog list." />
        </div>
        <div>
          <label style={labelStyle}>Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={9} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'Write your post here.\n\nLeave a blank line between paragraphs.'} />
        </div>
        <div>
          <label style={labelStyle}>Tags <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(comma-separated)</span></label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} style={inputStyle} placeholder="anxiety, self-care" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={submit}
            disabled={pending}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, opacity: pending ? 0.6 : 1 }}
          >
            <PenLine size={14} /> {pending ? 'Publishing…' : 'Publish post'}
          </button>
          {msg && (
            <span style={{ fontSize: 13, color: msg.ok ? '#3D9E72' : '#C8553D', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {msg.text}
              {msg.ok && msg.slug && (
                <a href={`/blog/${msg.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#C8553D', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  View <ExternalLink size={12} />
                </a>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
