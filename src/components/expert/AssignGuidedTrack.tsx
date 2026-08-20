'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { expertAssignGuidedTrack, expertUnassignGuidedTrack } from '@/app/(dashboard)/expert/media/actions'
import { fmtIST } from '@/lib/tz'

const charcoal = '#1C2B3A'
const teal = '#2C7A6B'
const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 14, fontFamily: 'inherit', color: charcoal, background: '#fff', boxSizing: 'border-box' }

type Assignment = { id: string; trackId: string; trackTitle: string; validUntil: string | null }

/**
 * Assign a Guided calm track to this patient, with an optional validity — the
 * same shape as assigning a task. Assigned tracks appear under Care → Guided calm.
 */
export function AssignGuidedTrack({
  patientId, tracks, assignments,
}: {
  patientId: string
  tracks: { id: string; title: string }[]
  assignments: Assignment[]
}) {
  const router = useRouter()
  const toast = useToast()
  const [pending, start] = useTransition()
  const [trackId, setTrackId] = useState(tracks[0]?.id ?? '')
  const [validUntil, setValidUntil] = useState('')

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => { const r = await fn(); if (r.ok) { toast.success(ok); router.refresh() } else toast.error(r.error ?? 'Something went wrong.') })

  const fmt = (iso: string | null) => iso ? fmtIST(new Date(iso), { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry'

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Guided calm tracks</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
        Assign a guided track to this patient. Leave the date empty for no expiry.
      </p>

      {assignments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {assignments.map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, border: '1px solid rgba(28,43,58,.1)', borderRadius: 10, padding: '10px 12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: charcoal }}>{a.trackTitle}</div>
                <div className="muted" style={{ fontSize: 12 }}>Valid until: {fmt(a.validUntil)}</div>
              </div>
              <button onClick={() => run(() => expertUnassignGuidedTrack({ assignmentId: a.id, patientId }), 'Assignment removed.')} disabled={pending} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0504B', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Trash2 size={13} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {tracks.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>No guided tracks exist yet — an admin creates them under Admin → Guided calm.</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select style={{ ...field, minWidth: 200 }} value={trackId} onChange={(e) => setTrackId(e.target.value)}>
            {tracks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <input type="date" style={field} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} title="Valid until (optional)" />
          <button onClick={() => { if (!trackId) return toast.error('Pick a track.'); run(() => expertAssignGuidedTrack({ trackId, patientId, validUntil: validUntil || null }), 'Track assigned.') }} disabled={pending} className="btn btn-primary" style={{ background: teal, borderColor: teal }}>
            <Plus size={14} /> Assign
          </button>
        </div>
      )}
    </div>
  )
}
