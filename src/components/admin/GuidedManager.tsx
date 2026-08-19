'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Eye, EyeOff, Globe, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import type { GuidedTrackView } from '@/lib/guided'
import {
  adminCreateGuidedTrack, adminUpdateGuidedTrack, adminDeleteGuidedTrack,
  adminAddGuidedVideo, adminDeleteGuidedVideo,
} from '@/app/admin/media/actions'

const charcoal = '#1C2B3A'
const teal = '#2C7A6B'
const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 14, fontFamily: 'inherit', color: charcoal, background: '#fff', width: '100%', boxSizing: 'border-box' }
const linkBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }

export function GuidedManager({ tracks }: { tracks: GuidedTrackView[] }) {
  const router = useRouter()
  const toast = useToast()
  const [pending, start] = useTransition()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => { const r = await fn(); if (r.ok) { toast.success(ok); router.refresh() } else toast.error(r.error ?? 'Something went wrong.') })

  return (
    <div className="stack">
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Add a track</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Public tracks are visible to everyone. Non-public tracks show only to patients an expert assigns them to.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 720, alignItems: 'center' }}>
          <input style={{ ...field, flex: 2, minWidth: 160 }} value={title} maxLength={80} placeholder="Track title (e.g. 5-minute grounding)" onChange={(e) => setTitle(e.target.value)} />
          <input style={{ ...field, flex: 3, minWidth: 200 }} value={desc} maxLength={140} placeholder="Short description (optional)" onChange={(e) => setDesc(e.target.value)} />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: charcoal, whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Public
          </label>
          <button onClick={() => { if (!title.trim()) return toast.error('Enter a title.'); run(() => adminCreateGuidedTrack({ title, description: desc, isPublic }), 'Track added.'); setTitle(''); setDesc(''); setIsPublic(false) }} disabled={pending} className="btn btn-primary"><Plus size={14} /> Add</button>
        </div>
      </div>

      {tracks.map((t) => <TrackCard key={t.id} track={t} pending={pending} run={run} />)}
    </div>
  )
}

function TrackCard({ track: t, pending, run }: { track: GuidedTrackView; pending: boolean; run: (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) => void }) {
  const toast = useToast()
  const [vt, setVt] = useState('')
  const [vurl, setVurl] = useState('')
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: charcoal, display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {t.title}
            {t.comingSoon && <span style={{ fontSize: 10.5, fontWeight: 700, color: teal, background: 'rgba(44,122,107,.1)', padding: '2px 8px', borderRadius: 999 }}>Coming soon</span>}
            <span style={{ fontSize: 10.5, fontWeight: 700, color: t.isPublic ? '#2C7A57' : '#8595a4', background: 'rgba(28,43,58,.05)', padding: '2px 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{t.isPublic ? <><Globe size={11} /> Public</> : <><Lock size={11} /> Assigned only</>}</span>
            {!t.active && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#8595a4', background: 'rgba(28,43,58,.06)', padding: '2px 8px', borderRadius: 999 }}>Hidden</span>}
          </div>
          {t.description && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{t.description}</div>}
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => run(() => adminUpdateGuidedTrack(t.id, { isPublic: !t.isPublic }), 'Updated.')} disabled={pending} style={{ ...linkBtn, color: teal }}>{t.isPublic ? 'Make assigned-only' : 'Make public'}</button>
          <button onClick={() => run(() => adminUpdateGuidedTrack(t.id, { comingSoon: !t.comingSoon }), 'Updated.')} disabled={pending} style={{ ...linkBtn, color: '#C8553D' }}>{t.comingSoon ? 'Mark live' : 'Mark coming soon'}</button>
          <button onClick={() => run(() => adminUpdateGuidedTrack(t.id, { active: !t.active }), 'Updated.')} disabled={pending} style={{ ...linkBtn, color: '#5A6B7A' }}>{t.active ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}</button>
          <button onClick={() => { if (confirm(`Delete "${t.title}" and its videos?`)) run(() => adminDeleteGuidedTrack(t.id), 'Track deleted.') }} disabled={pending} style={{ ...linkBtn, color: '#C0504B' }}><Trash2 size={13} /> Delete</button>
        </div>
      </div>

      {t.videos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 12 }}>
          {t.videos.map((v) => (
            <div key={v.id} style={{ border: '1px solid rgba(28,43,58,.1)', borderRadius: 10, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.thumb} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
              <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: charcoal, lineHeight: 1.3 }}>{v.title}</div>
                <button onClick={() => run(() => adminDeleteGuidedVideo(v.id), 'Video removed.')} disabled={pending} style={{ ...linkBtn, color: '#C0504B' }}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...field, flex: 2, minWidth: 150 }} value={vt} maxLength={120} placeholder="Video title" onChange={(e) => setVt(e.target.value)} />
        <input style={{ ...field, flex: 3, minWidth: 200 }} value={vurl} placeholder="YouTube link or id" onChange={(e) => setVurl(e.target.value)} />
        <button onClick={() => { if (!vt.trim() || !vurl.trim()) return toast.error('Title and link required.'); run(() => adminAddGuidedVideo({ trackId: t.id, title: vt, url: vurl }), 'Video added.'); setVt(''); setVurl('') }} disabled={pending} className="btn" style={{ border: '1.5px solid #E2E8F0' }}><Plus size={14} /> Add video</button>
      </div>
    </div>
  )
}
