'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check } from 'lucide-react'
import { resolveCrisis } from '@/app/admin/actions'
import type { CrisisRow } from '@/lib/admin'

const charcoal = '#1C2B3A'
const red = '#C0504B'

export function SafetyConsole({ rows }: { rows: CrisisRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [showResolved, setShowResolved] = useState(false)

  const open = rows.filter((r) => !r.resolved)
  const shown = showResolved ? rows : open

  function resolve(id: string) {
    startTransition(async () => { await resolveCrisis({ id }); router.refresh() })
  }

  return (
    <div className="stack">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Safety console</div>
          <div className="page-meta">{open.length} open crisis alert{open.length === 1 ? '' : 's'} platform-wide · newest first</div>
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#5A6B7A', fontWeight: 600, cursor: 'pointer' }}>
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} style={{ accentColor: red }} /> Show resolved
        </label>
      </div>

      {shown.length === 0 && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} style={{ color: '#3D9E72' }} /> <span className="muted">No open crisis alerts. All clear.</span>
        </div>
      )}

      {shown.map((r) => {
        const sla = r.ageHours >= 24 ? red : r.ageHours >= 4 ? '#C9973A' : '#3D9E72'
        return (
          <div key={r.id} className="card" style={{ border: `1px solid ${r.resolved ? 'rgba(28,43,58,.1)' : 'rgba(192,80,75,.3)'}`, background: r.resolved ? '#fff' : 'rgba(192,80,75,.04)', opacity: r.resolved ? 0.65 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <AlertTriangle size={15} style={{ color: red }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: charcoal }}>{r.patientName}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: red, background: 'rgba(192,80,75,.12)', padding: '2px 8px', borderRadius: 20 }}>{r.label}</span>
                  {!r.resolved && <span style={{ fontSize: 11.5, fontWeight: 700, color: sla }}>{r.ageHours}h open</span>}
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                  {r.therapistName ? `Clinician: ${r.therapistName}` : 'No clinician on file'} · {r.createdAt}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Link href={`/admin/patients/${r.userId}`} className="link-action">Open patient</Link>
                {!r.resolved && (
                  <button onClick={() => resolve(r.id)} disabled={pending} className="btn btn-primary" style={{ opacity: pending ? 0.6 : 1 }}>Mark resolved</button>
                )}
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: '#3A4A5A', lineHeight: 1.6, marginTop: 10, background: '#fff', border: '1px solid rgba(28,43,58,.08)', borderRadius: 10, padding: '10px 12px' }}>
              <b>Handoff:</b> {r.handoffNote}
            </p>
          </div>
        )
      })}
    </div>
  )
}
