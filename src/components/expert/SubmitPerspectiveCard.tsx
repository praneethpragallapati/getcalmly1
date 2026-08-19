'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { submitPerspectiveVideo } from '@/app/(dashboard)/expert/media/actions'
import { TagPicker } from '@/components/ui/TagPicker'

const charcoal = '#1C2B3A'
const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 14, fontFamily: 'inherit', color: charcoal, background: '#fff', width: '100%', boxSizing: 'border-box' }

/** Clinicians propose a video for a Perspectives section; an admin approves it. */
export function SubmitPerspectiveCard({ sections }: { sections: { id: string; title: string }[] }) {
  const router = useRouter()
  const toast = useToast()
  const [pending, start] = useTransition()
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])

  function submit() {
    if (!sectionId) return toast.error('Pick a section.')
    if (!title.trim()) return toast.error('Enter a video title.')
    if (!url.trim()) return toast.error('Paste the YouTube link.')
    start(async () => {
      const res = await submitPerspectiveVideo({ sectionId, title, url, description, tags })
      if (res.ok) {
        toast.success('Sent for admin approval.')
        setTitle(''); setUrl(''); setDescription(''); setTags([])
        router.refresh()
      } else toast.error(res.error ?? 'Could not submit.')
    })
  }

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Submit a video</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
        Propose a talk for Perspectives. An admin reviews it before it goes live to members.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
        <select style={field} value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <input style={field} value={title} maxLength={120} placeholder="Video title" onChange={(e) => setTitle(e.target.value)} />
        <input style={field} value={url} placeholder="YouTube link or video id" onChange={(e) => setUrl(e.target.value)} />
        <textarea style={{ ...field, minHeight: 70, resize: 'vertical' }} value={description} maxLength={300} placeholder="Why this is worth watching (optional)" onChange={(e) => setDescription(e.target.value)} />
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#4A5F70', marginBottom: 6 }}>Tags</label>
          <TagPicker value={tags} onChange={setTags} compact />
        </div>
        <div>
          <button onClick={submit} disabled={pending} className="btn btn-primary" style={{ opacity: pending ? 0.6 : 1 }}>
            <Send size={14} /> {pending ? 'Submitting…' : 'Submit for approval'}
          </button>
        </div>
      </div>
    </div>
  )
}
