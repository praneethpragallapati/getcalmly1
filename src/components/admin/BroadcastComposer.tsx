'use client'

import { useState, useTransition } from 'react'
import { Megaphone, Check } from 'lucide-react'
import { broadcastAnnouncement } from '@/app/admin/actions'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'
const field: React.CSSProperties = { width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', color: charcoal, boxSizing: 'border-box' }
const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#5A6B7A', marginBottom: 5 }

/**
 * Compose and send a broadcast announcement — drops an in-app notification into
 * every recipient's bell. Reused on the admin dashboard and the Configuration
 * page.
 */
export function BroadcastComposer() {
  const [pending, startTransition] = useTransition()
  const [audience, setAudience] = useState<'ALL' | 'PATIENT' | 'THERAPIST'>('ALL')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function send() {
    setMsg(null)
    startTransition(async () => {
      const res = await broadcastAnnouncement({ audience, title, body })
      if (res.ok) { setTitle(''); setBody(''); setMsg({ ok: true, text: 'Announcement sent.' }) }
      else setMsg({ ok: false, text: res.error ?? 'Failed.' })
    })
  }

  return (
    <div className="card">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><Megaphone size={16} /> Broadcast an announcement</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>Drops an in-app notification into every recipient&apos;s bell.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
        <div>
          <label style={label}>Audience</label>
          <select value={audience} onChange={(e) => setAudience(e.target.value as 'ALL' | 'PATIENT' | 'THERAPIST')} style={{ ...field, background: '#fff' }}>
            <option value="ALL">Everyone</option>
            <option value="PATIENT">Patients</option>
            <option value="THERAPIST">Clinicians</option>
          </select>
        </div>
        <div><label style={label}>Title</label><input style={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Scheduled maintenance this Sunday" /></div>
        <div><label style={label}>Message <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(optional)</span></label><textarea rows={3} style={{ ...field, resize: 'vertical' }} value={body} onChange={(e) => setBody(e.target.value)} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={send} disabled={pending || !title.trim()} className="btn btn-primary" style={{ opacity: pending || !title.trim() ? 0.6 : 1 }}>Send announcement</button>
          {msg && <span style={{ fontSize: 13.5, color: msg.ok ? '#2C7A57' : coral, display: 'inline-flex', alignItems: 'center', gap: 5 }}>{msg.ok && <Check size={14} />}{msg.text}</span>}
        </div>
      </div>
    </div>
  )
}
