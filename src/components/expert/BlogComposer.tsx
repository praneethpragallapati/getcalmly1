'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PenLine, ExternalLink, ImagePlus, X } from 'lucide-react'
import { publishBlog, updateBlog } from '@/app/(dashboard)/expert/actions'
import type { ExpertBlogEdit } from '@/lib/expert'

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '11px 13px',
  fontSize: 14, fontFamily: 'inherit', color: '#1C2B3A',
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6B7A', marginBottom: 6 }

const MAX_BYTES = 1_000_000 // ~1MB upload cap

export function BlogComposer({ designation, initial }: { designation: string; initial?: ExpertBlogEdit }) {
  const router = useRouter()
  const editing = Boolean(initial)
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '))
  const [cover, setCover] = useState<string | null>(initial?.coverImage ?? null)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string; slug?: string } | null>(null)

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMsg({ ok: false, text: 'Please choose an image file.' })
      return
    }
    if (file.size > MAX_BYTES) {
      setMsg({ ok: false, text: 'Image is too large — please keep it under 1 MB.' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => setCover(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  function submit() {
    setMsg(null)
    const input = {
      title,
      excerpt,
      body,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      coverImage: cover,
    }
    startTransition(async () => {
      const res = editing ? await updateBlog(initial!.slug, input) : await publishBlog(input)
      if (res.ok) {
        if (!editing) { setTitle(''); setExcerpt(''); setBody(''); setTags(''); setCover(null) }
        setMsg({ ok: true, text: editing ? 'Changes saved.' : 'Published to the public blog.', slug: res.slug ?? initial?.slug })
        router.refresh()
      } else {
        setMsg({ ok: false, text: res.error ?? 'Could not save.' })
      }
    })
  }

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>{editing ? 'Edit post' : 'Write a new blog'}</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 16 }}>
        {editing ? 'Update your post — the link stays the same.' : 'Published to the public blog under your name as'} {!editing && <b>{designation}</b>}{!editing && '.'} Separate paragraphs with a blank line.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Cover photo */}
        <div>
          <label style={labelStyle}>Cover photo <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(optional · max 1 MB)</span></label>
          {cover ? (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="Cover preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
              <button
                type="button"
                onClick={() => { setCover(null); if (fileRef.current) fileRef.current.value = '' }}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(28,43,58,.85)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <X size={13} /> Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '20px', border: '1.5px dashed #CBD5E0', borderRadius: 12, background: '#FBFBFC', color: '#6B7D8E', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <ImagePlus size={17} /> Upload a cover photo
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
        </div>

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
            <PenLine size={14} /> {pending ? 'Saving…' : editing ? 'Save changes' : 'Publish post'}
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
