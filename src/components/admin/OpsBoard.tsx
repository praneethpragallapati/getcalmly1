'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarClock, FileWarning, CalendarX } from 'lucide-react'
import { reassignAppointment, setAppointmentStatusAdmin, approveCancellation, rejectCancellation } from '@/app/admin/actions'
import type { OpsBoard as OpsData, ApptRow, CancelRequestRow } from '@/lib/admin'

const charcoal = '#1C2B3A'
const STATUS_COLOR: Record<string, string> = { PENDING: '#C9973A', CONFIRMED: '#3E6E9C', COMPLETED: '#2C7A57', CANCELLED: '#C0504B', RESCHEDULED: '#7C5CBF' }

export function OpsBoard({ data }: { data: OpsData }) {
  const [tab, setTab] = useState<'upcoming' | 'notes' | 'cancellations'>(
    data.cancelRequests.length > 0 ? 'cancellations' : 'upcoming',
  )

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Operations</div>
        <div className="page-meta">
          {data.upcoming.length} upcoming · {data.needsNote.length} awaiting a note
          {data.cancelRequests.length > 0 ? ` · ${data.cancelRequests.length} cancellation request${data.cancelRequests.length === 1 ? '' : 's'}` : ''}
        </div>
      </div>

      <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(28,43,58,.05)', padding: 4, borderRadius: 10, alignSelf: 'flex-start', flexWrap: 'wrap' }}>
        {([
          ['upcoming', 'Upcoming', <CalendarClock key="u" size={15} />],
          ['notes', `Needs note (${data.needsNote.length})`, <FileWarning key="n" size={15} />],
          ['cancellations', `Cancellations (${data.cancelRequests.length})`, <CalendarX key="c" size={15} />],
        ] as const).map(([k, lbl, icon]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            border: 'none', cursor: 'pointer', padding: '9px 16px', borderRadius: 7, fontSize: 13.5, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
            background: tab === k ? '#fff' : 'transparent',
            color: tab === k ? (k === 'cancellations' ? '#C0504B' : '#6D5BD0') : '#8E9EAE',
            boxShadow: tab === k ? '0 1px 5px rgba(28,43,58,.12)' : 'none',
          }}>{icon}{lbl}</button>
        ))}
      </div>

      {tab === 'cancellations' ? (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px 4px' }}>
            <p className="muted" style={{ fontSize: 12.5 }}>
              A clinician asked to cancel these sessions. Approving cancels the session and restores the patient&apos;s
              reserved session to their package. The patient still sees the session until you approve.
            </p>
          </div>
          {data.cancelRequests.map((c) => <CancelItem key={c.id} c={c} />)}
          {data.cancelRequests.length === 0 && (
            <p className="muted" style={{ padding: 20 }}>No pending cancellation requests.</p>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {(tab === 'upcoming' ? data.upcoming : data.needsNote).map((a) => (
            <ApptItem key={a.id} a={a} therapists={data.therapists} reassignable={tab === 'upcoming'} />
          ))}
          {(tab === 'upcoming' ? data.upcoming : data.needsNote).length === 0 && (
            <p className="muted" style={{ padding: 20 }}>{tab === 'upcoming' ? 'No upcoming sessions.' : 'Every past session has a note. Nice.'}</p>
          )}
        </div>
      )}
    </div>
  )
}

function CancelItem({ c }: { c: CancelRequestRow }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const approve = () => startTransition(async () => { await approveCancellation({ appointmentId: c.id }); router.refresh() })
  const reject = () => startTransition(async () => { await rejectCancellation({ appointmentId: c.id }); router.refresh() })

  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,43,58,.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: charcoal }}>
            <Link href={`/admin/patients/${c.patientId}`} style={{ color: charcoal, textDecoration: 'none' }}>{c.patientName}</Link>
            <span className="muted" style={{ fontWeight: 400 }}> with {c.therapistName}</span>
          </div>
          <div className="muted" style={{ fontSize: 12.5 }}>{c.scheduledAt} · ₹{c.fee.toLocaleString('en-IN')} · requested {c.requestedAt}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={reject} disabled={pending} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7D8E' }}>Reject</button>
          <button onClick={approve} disabled={pending} className="btn btn-sm" style={{ background: '#C0504B', color: '#fff', border: 'none' }}>Approve cancellation</button>
        </div>
      </div>
      {c.reason && (
        <div style={{ marginTop: 8, padding: '9px 12px', background: 'rgba(192,80,75,.05)', borderRadius: 10, border: '1px solid rgba(192,80,75,.15)', fontSize: 13, color: '#3A4A5A' }}>
          <span style={{ fontWeight: 700 }}>Reason:</span> {c.reason}
        </div>
      )}
    </div>
  )
}

function ApptItem({ a, therapists, reassignable }: { a: ApptRow; therapists: { profileId: string; name: string }[]; reassignable: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [reassign, setReassign] = useState('')

  const doReassign = (tid: string) => { if (!tid) return; startTransition(async () => { await reassignAppointment({ id: a.id, therapistProfileId: tid }); setReassign(''); router.refresh() }) }
  const setStatus = (status: string) => startTransition(async () => { await setAppointmentStatusAdmin({ id: a.id, status }); router.refresh() })

  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,43,58,.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: charcoal }}>
            <Link href={`/admin/patients/${a.patientId}`} style={{ color: charcoal, textDecoration: 'none' }}>{a.patientName}</Link>
            <span className="muted" style={{ fontWeight: 400 }}> with {a.therapistName}</span>
          </div>
          <div className="muted" style={{ fontSize: 12.5 }}>{a.scheduledAt} · ₹{a.fee.toLocaleString('en-IN')}{a.needsNote ? ' · note pending' : ''}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[a.status] ?? '#6B7D8E', background: `${STATUS_COLOR[a.status] ?? '#6B7D8E'}1a`, padding: '3px 9px', borderRadius: 20 }}>{a.status.toLowerCase()}</span>
      </div>
      {reassignable && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
          <select value={reassign} onChange={(e) => { setReassign(e.target.value); doReassign(e.target.value) }} disabled={pending}
            style={{ border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 9px', fontSize: 13, background: '#fff', color: charcoal }}>
            <option value="">Reassign clinician…</option>
            {therapists.filter((t) => t.profileId !== a.therapistId).map((t) => <option key={t.profileId} value={t.profileId}>{t.name}</option>)}
          </select>
          {a.status !== 'CANCELLED' && <button onClick={() => setStatus('CANCELLED')} disabled={pending} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0504B' }}>Cancel</button>}
          {a.status === 'PENDING' && <button onClick={() => setStatus('CONFIRMED')} disabled={pending} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Confirm</button>}
        </div>
      )}
    </div>
  )
}
