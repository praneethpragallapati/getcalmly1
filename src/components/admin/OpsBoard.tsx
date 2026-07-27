'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarClock, FileWarning } from 'lucide-react'
import { reassignAppointment, setAppointmentStatusAdmin } from '@/app/admin/actions'
import type { OpsBoard as OpsData, ApptRow } from '@/lib/admin'

const charcoal = '#1C2B3A'
const STATUS_COLOR: Record<string, string> = { PENDING: '#C9973A', CONFIRMED: '#3E6E9C', COMPLETED: '#2C7A57', CANCELLED: '#C0504B', RESCHEDULED: '#7C5CBF' }

export function OpsBoard({ data }: { data: OpsData }) {
  const [tab, setTab] = useState<'upcoming' | 'notes'>('upcoming')

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Operations</div>
        <div className="page-meta">{data.upcoming.length} upcoming · {data.needsNote.length} session{data.needsNote.length === 1 ? '' : 's'} awaiting a clinical note</div>
      </div>

      <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(28,43,58,.05)', padding: 4, borderRadius: 10, alignSelf: 'flex-start' }}>
        {([['upcoming', 'Upcoming', <CalendarClock key="u" size={15} />], ['notes', `Needs note (${data.needsNote.length})`, <FileWarning key="n" size={15} />]] as const).map(([k, lbl, icon]) => (
          <button key={k} onClick={() => setTab(k as 'upcoming' | 'notes')} style={{
            border: 'none', cursor: 'pointer', padding: '9px 16px', borderRadius: 7, fontSize: 13.5, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
            background: tab === k ? '#fff' : 'transparent', color: tab === k ? '#C8553D' : '#8E9EAE',
            boxShadow: tab === k ? '0 1px 5px rgba(28,43,58,.12)' : 'none',
          }}>{icon}{lbl}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {(tab === 'upcoming' ? data.upcoming : data.needsNote).map((a) => (
          <ApptItem key={a.id} a={a} therapists={data.therapists} reassignable={tab === 'upcoming'} />
        ))}
        {(tab === 'upcoming' ? data.upcoming : data.needsNote).length === 0 && (
          <p className="muted" style={{ padding: 20 }}>{tab === 'upcoming' ? 'No upcoming sessions.' : 'Every past session has a note. Nice.'}</p>
        )}
      </div>
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
          <div className="muted" style={{ fontSize: 12.5 }}>{a.scheduledAt} · ₹{a.fee.toLocaleString('en-IN')}{a.isPast && !a.hasSummary ? ' · note pending' : ''}</div>
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
