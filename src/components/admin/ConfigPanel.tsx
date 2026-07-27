'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Megaphone, FileText, Check } from 'lucide-react'
import { broadcastAnnouncement, setFormActive } from '@/app/admin/actions'
import type { FormRow } from '@/lib/admin'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'
const field: React.CSSProperties = { width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', color: charcoal, boxSizing: 'border-box' }
const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#5A6B7A', marginBottom: 5 }

export function ConfigPanel({ forms }: { forms: FormRow[] }) {
  const router = useRouter()
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
  function toggleForm(id: string, active: boolean) {
    startTransition(async () => { await setFormActive({ id, active }); router.refresh() })
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Configuration</div>
        <div className="page-meta">Announcements, the clinical forms library, and platform settings</div>
      </div>

      {/* Announcements */}
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

      {/* Forms library */}
      <div className="card">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><FileText size={16} /> Clinical forms library</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>Intake, consent and information forms clinicians can send. Toggle whether each is available.</p>
        {forms.length === 0 && <p className="muted">No forms in the library.</p>}
        <div>
          {forms.map((f) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid rgba(28,43,58,.06)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: charcoal }}>{f.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>{f.kind}{f.category ? ` · ${f.category}` : ''} · {f.fields} field{f.fields === 1 ? '' : 's'}{f.autoSend ? ' · auto-send' : ''}</div>
              </div>
              <button onClick={() => toggleForm(f.id, !f.active)} disabled={pending} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{f.active ? 'Disable' : 'Enable'}</button>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: f.active ? '#2C7A57' : '#8E9EAE', background: f.active ? 'rgba(61,158,114,.1)' : 'rgba(28,43,58,.06)', padding: '3px 9px', borderRadius: 20, minWidth: 62, textAlign: 'center' }}>{f.active ? 'Active' : 'Off'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Code-managed settings */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 8 }}>Other settings</div>
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
          <b>Customer pricing</b> — first-session fees, session packs and Calm+ plans — is on the{' '}
          <Link href="/admin/pricing" className="link-action">Pricing</Link> page.
          Each clinician&apos;s <b>pay structure</b> (base fees and bonuses) lives on their own profile under{' '}
          <Link href="/admin/therapists" className="link-action">Clinicians</Link>, so it matches exactly what they see in their earnings ledger.
          Feature flags (e.g. Enterprise availability) are still managed in code — tell the team if you need those made editable here.
        </p>
      </div>
    </div>
  )
}
