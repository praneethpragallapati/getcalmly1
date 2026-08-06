'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { setFormActive } from '@/app/admin/actions'
import { BroadcastComposer } from '@/components/admin/BroadcastComposer'
import type { FormRow } from '@/lib/admin'

const charcoal = '#1C2B3A'

export function ConfigPanel({ forms }: { forms: FormRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

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
      <BroadcastComposer />

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
