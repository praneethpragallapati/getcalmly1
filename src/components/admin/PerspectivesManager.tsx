'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check, X, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { TagPicker } from '@/components/ui/TagPicker'
import type { PerspectiveSectionView, PerspectiveVideoView } from '@/lib/perspectives'
import {
  adminCreatePerspectiveSection, adminUpdatePerspectiveSection, adminDeletePerspectiveSection,
  adminAddPerspectiveVideo, adminSetPerspectiveVideoStatus, adminDeletePerspectiveVideo,
} from '@/app/admin/media/actions'

const charcoal = '#1C2B3A'
const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 14, fontFamily: 'inherit', color: charcoal, background: '#fff', width: '100%', boxSizing: 'border-box' }
const linkBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }

type Submission = PerspectiveVideoView & { sectionTitle: string }

export function PerspectivesManager({ sections, submissions }: { sections: PerspectiveSectionView[]; submissions: Submission[] }) {
  const router = useRouter()
  const toast = useToast()
  const [pending, start] = useTransition()
  const [newSection, setNewSection] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => { const r = await fn(); if (r.ok) { toast.success(ok); router.refresh() } else toast.error(r.error ?? 'Something went wrong.') })

  return (
    <div className="stack">
      {/* Pending submissions */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Therapist submissions {submissions.length > 0 && <span style={{ color: '#C8553D' }}>· {submissions.length} pending</span>}</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Videos submitted by clinicians. Approve to publish, or reject.</p>
        {submissions.length === 0 ? (
          <p className="muted" style={{ fontSize: 13.5 }}>No pending submissions.</p>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            {submissions.map((v) => (
              <div key={v.id} style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid rgba(28,43,58,.1)', borderRadius: 12, padding: 10, flexWrap: 'wrap' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.thumb} alt="" style={{ width: 96, height: 54, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: charcoal }}>{v.title}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{v.sectionTitle} · by {v.submittedByName ?? 'Clinician'}</div>
                </div>
                <button onClick={() => run(() => adminSetPerspectiveVideoStatus(v.id, 'APPROVED'), 'Approved & published.')} disabled={pending} className="btn btn-primary" style={{ fontSize: 12.5, padding: '7px 12px' }}><Check size={13} /> Approve</button>
                <button onClick={() => run(() => adminSetPerspectiveVideoStatus(v.id, 'REJECTED'), 'Rejected.')} disabled={pending} className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, padding: '7px 12px', color: '#C0504B' }}><X size={13} /> Reject</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New section */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Add a section</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 640 }}>
          <input style={{ ...field, flex: 2, minWidth: 180 }} value={newSection} maxLength={60} placeholder="Section title" onChange={(e) => setNewSection(e.target.value)} />
          <input style={{ ...field, flex: 3, minWidth: 200 }} value={newDesc} maxLength={140} placeholder="Short description (optional)" onChange={(e) => setNewDesc(e.target.value)} />
          <button
            onClick={() => { if (!newSection.trim()) return toast.error('Enter a title.'); run(() => adminCreatePerspectiveSection({ title: newSection, description: newDesc }), 'Section added.'); setNewSection(''); setNewDesc('') }}
            disabled={pending} className="btn btn-primary"><Plus size={14} /> Add</button>
        </div>
      </div>

      {/* Sections */}
      {sections.map((s) => (
        <SectionCard key={s.id} section={s} pending={pending} run={run} />
      ))}
    </div>
  )
}

function SectionCard({ section: s, pending, run }: { section: PerspectiveSectionView; pending: boolean; run: (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) => void }) {
  const toast = useToast()
  const [vt, setVt] = useState('')
  const [vurl, setVurl] = useState('')
  const [vtags, setVtags] = useState<string[]>([])

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: charcoal, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {s.title}
            {s.comingSoon && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#C8553D', background: 'rgba(200,85,61,.1)', padding: '2px 8px', borderRadius: 999 }}>Coming soon</span>}
            {!s.active && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#8595a4', background: 'rgba(28,43,58,.06)', padding: '2px 8px', borderRadius: 999 }}>Hidden</span>}
          </div>
          {s.description && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{s.description}</div>}
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => run(() => adminUpdatePerspectiveSection(s.id, { comingSoon: !s.comingSoon }), 'Updated.')} disabled={pending} style={{ ...linkBtn, color: '#C8553D' }}>{s.comingSoon ? 'Mark live' : 'Mark coming soon'}</button>
          <button onClick={() => run(() => adminUpdatePerspectiveSection(s.id, { active: !s.active }), 'Updated.')} disabled={pending} style={{ ...linkBtn, color: '#5A6B7A' }}>{s.active ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}</button>
          <button onClick={() => { if (confirm(`Delete "${s.title}" and its videos?`)) run(() => adminDeletePerspectiveSection(s.id), 'Section deleted.') }} disabled={pending} style={{ ...linkBtn, color: '#C0504B' }}><Trash2 size={13} /> Delete</button>
        </div>
      </div>

      {/* Videos */}
      {s.videos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 12 }}>
          {s.videos.map((v) => (
            <div key={v.id} style={{ border: '1px solid rgba(28,43,58,.1)', borderRadius: 10, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.thumb} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: charcoal, lineHeight: 1.3 }}>{v.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: v.status === 'APPROVED' ? '#2C7A57' : v.status === 'PENDING' ? '#9a6e12' : '#C0504B' }}>{v.status}</span>
                  <button onClick={() => run(() => adminDeletePerspectiveVideo(v.id), 'Video removed.')} disabled={pending} style={{ ...linkBtn, color: '#C0504B' }}><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add video */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input style={{ ...field, flex: 2, minWidth: 150 }} value={vt} maxLength={120} placeholder="Video title" onChange={(e) => setVt(e.target.value)} />
          <input style={{ ...field, flex: 3, minWidth: 200 }} value={vurl} placeholder="YouTube link or id" onChange={(e) => setVurl(e.target.value)} />
        </div>
        <TagPicker value={vtags} onChange={setVtags} compact />
        <div>
          <button onClick={() => { if (!vt.trim() || !vurl.trim()) return toast.error('Title and link required.'); run(() => adminAddPerspectiveVideo({ sectionId: s.id, title: vt, url: vurl, tags: vtags }), 'Video added.'); setVt(''); setVurl(''); setVtags([]) }} disabled={pending} className="btn" style={{ border: '1.5px solid #E2E8F0' }}><Plus size={14} /> Add video</button>
        </div>
      </div>
    </div>
  )
}
