'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CalendarDays, Ban } from 'lucide-react'
import { voidSession } from '@/app/admin/actions'
import type { ClinicianRoster as Roster, AdminSessionRow } from '@/lib/admin'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'
const green = '#2C7A57'
const red = '#C0504B'

const statusColor = (s: AdminSessionRow) =>
  s.voided ? red : s.status === 'COMPLETED' ? green : s.status === 'CONFIRMED' ? coral : '#8E9EAE'

function StatusPill({ s }: { s: AdminSessionRow }) {
  const label = s.voided ? 'Voided' : s.status.charAt(0) + s.status.slice(1).toLowerCase()
  const c = statusColor(s)
  return <span style={{ fontSize: 10.5, fontWeight: 800, color: c, background: `${c}1a`, padding: '2px 8px', borderRadius: 20 }}>{label}</span>
}

/** Inline void-and-refund control for one session. */
function VoidControl({ session }: { session: AdminSessionRow }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [credit, setCredit] = useState(true)
  const [pending, startTransition] = useTransition()

  if (session.voided) return null

  function confirm() {
    startTransition(async () => {
      await voidSession({ appointmentId: session.id, reason, creditPatient: credit })
      setOpen(false)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', color: red, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5 }}>
        <Ban size={12} /> Void / refund
      </button>
    )
  }
  return (
    <div style={{ background: 'rgba(192,80,75,.05)', border: '1px solid rgba(192,80,75,.25)', borderRadius: 10, padding: '10px 12px', marginTop: 8, width: '100%' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: charcoal, marginBottom: 6 }}>Void this session</div>
      <p className="muted" style={{ fontSize: 11.5, marginBottom: 8, lineHeight: 1.5 }}>
        Cancels it and removes it from the clinician&apos;s pay. Use when the clinician didn&apos;t join, or the session shouldn&apos;t be charged.
      </p>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g. clinician did not join)" style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 8 }} />
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: charcoal, cursor: 'pointer', marginBottom: 10 }}>
        <input type="checkbox" checked={credit} onChange={(e) => setCredit(e.target.checked)} style={{ accentColor: coral }} />
        Credit the patient a session back
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={confirm} disabled={pending} className="btn btn-primary" style={{ fontSize: 12.5, opacity: pending ? 0.6 : 1 }}>{pending ? 'Voiding…' : 'Confirm void'}</button>
        <button onClick={() => setOpen(false)} className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5 }}>Cancel</button>
      </div>
    </div>
  )
}

/** Who joined when, and how long both sides were actually in the room. */
function Presence({ s }: { s: AdminSessionRow }) {
  if (!s.isPast || s.voided) return null
  const none = !s.patientJoinedLabel && !s.therapistJoinedLabel
  if (none) {
    return <span style={{ fontSize: 11.5, color: '#8E9EAE', fontWeight: 600 }}>nobody joined</span>
  }
  const late = s.joinDelayMins !== null && s.joinDelayMins > 2
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 11.5, color: '#5A6A7A' }}>
      <span title="When the patient joined">
        P <b style={{ color: s.patientJoinedLabel ? charcoal : '#C0504B' }}>{s.patientJoinedLabel ?? 'no-show'}</b>
      </span>
      <span title="When the clinician joined">
        T <b style={{ color: s.therapistJoinedLabel ? charcoal : '#C0504B' }}>{s.therapistJoinedLabel ?? 'no-show'}</b>
        {s.joinDelayMins !== null && (
          <span style={{ color: late ? '#C0504B' : green, fontWeight: 700 }}>
            {' '}({s.joinDelayMins > 0 ? `+${s.joinDelayMins}` : s.joinDelayMins}m)
          </span>
        )}
      </span>
      {s.minutesTogether !== null && (
        <span title="Minutes both were in the room together, against the scheduled length">
          ⏱ <b style={{ color: charcoal }}>{s.minutesTogether}m</b>
          <span style={{ color: '#9AABB8' }}> / {s.scheduledMins}m</span>
        </span>
      )}
    </span>
  )
}

function SessionRow({ s }: { s: AdminSessionRow }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid rgba(28,43,58,.06)' }}>
      <span style={{ fontSize: 13, color: charcoal, minWidth: 190 }}>{s.dateLabel} · {s.timeLabel}</span>
      <StatusPill s={s} />
      <Presence s={s} />
      {s.isPast && !s.voided && !s.hasSummary && <span style={{ fontSize: 11, color: '#C9973A', fontWeight: 700 }}>no note</span>}
      <div style={{ marginLeft: 'auto' }}><VoidControl session={s} /></div>
    </div>
  )
}

/** Month calendar marking session days; click a day to see its sessions. */
function Calendar({ sessions }: { sessions: AdminSessionRow[] }) {
  const [view, setView] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [selected, setSelected] = useState<string | null>(null)

  const byDay = useMemo(() => {
    const m = new Map<string, AdminSessionRow[]>()
    for (const s of sessions) { const arr = m.get(s.dateIso) ?? []; arr.push(s); m.set(s.dateIso, arr) }
    return m
  }, [sessions])

  const year = view.getFullYear(), month = view.getMonth()
  const first = new Date(year, month, 1)
  const startPad = first.getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)

  const monthLabel = view.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const selectedSessions = selected ? (byDay.get(selected) ?? []) : []

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><CalendarDays size={16} /> Calendar</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => { setView(new Date(year, month - 1, 1)); setSelected(null) }} className="btn" style={{ border: '1.5px solid #E2E8F0', padding: '5px 8px' }}><ChevronLeft size={15} /></button>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: charcoal, minWidth: 130, textAlign: 'center' }}>{monthLabel}</span>
          <button onClick={() => { setView(new Date(year, month + 1, 1)); setSelected(null) }} className="btn" style={{ border: '1.5px solid #E2E8F0', padding: '5px 8px' }}><ChevronRight size={15} /></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#8E9EAE', padding: '4px 0' }}>{d}</div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />
          const day = Number(iso.slice(-2))
          const has = byDay.get(iso)
          const active = selected === iso
          return (
            <button key={i} onClick={() => setSelected(active ? null : iso)} style={{
              aspectRatio: '1', border: active ? `1.5px solid ${coral}` : '1px solid #EEF0F3', borderRadius: 8, background: active ? `${coral}0f` : '#fff',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: 2,
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: charcoal }}>{day}</span>
              {has && <span style={{ fontSize: 9.5, fontWeight: 800, color: coral }}>{has.length}</span>}
            </button>
          )
        })}
      </div>
      {selected && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: charcoal, marginBottom: 4 }}>{selectedSessions.length} session{selectedSessions.length === 1 ? '' : 's'} on {selected}</div>
          {selectedSessions.length === 0 && <p className="muted" style={{ fontSize: 12.5 }}>Nothing booked.</p>}
          {selectedSessions.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: charcoal }}>{s.timeLabel} · {s.patientName}</span>
              <StatusPill s={s} />
              <div style={{ marginLeft: 'auto' }}><VoidControl session={s} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ClinicianRoster({ roster }: { roster: Roster }) {
  const totalSessions = roster.sessions.length
  return (
    <div className="stack">
      <Calendar sessions={roster.sessions} />

      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Patients &amp; sessions ({roster.patients.length})</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
          {totalSessions} session{totalSessions === 1 ? '' : 's'} in total. Void a session to pull it out of {roster.name.split(' ')[0]}&apos;s pay and optionally refund the patient a session.
        </p>
        {roster.patients.length === 0 && <p className="muted">No patients or sessions yet.</p>}
        <div className="stack" style={{ gap: 14 }}>
          {roster.patients.map((p) => (
            <div key={p.userId} style={{ border: '1px solid rgba(28,43,58,.08)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <Link href={`/admin/patients/${p.userId}`} style={{ fontSize: 14.5, fontWeight: 700, color: charcoal, textDecoration: 'none' }}>{p.name}</Link>
                  <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>{p.email}</span>
                </div>
                <span className="muted" style={{ fontSize: 12 }}>{p.upcoming.length} upcoming · {p.past.length} past</span>
              </div>

              {p.upcoming.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: '#8E9EAE', marginTop: 4 }}>Upcoming</div>
                  {p.upcoming.map((s) => <SessionRow key={s.id} s={s} />)}
                </div>
              )}
              {p.past.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: '#8E9EAE' }}>Past</div>
                  {p.past.slice(0, 12).map((s) => <SessionRow key={s.id} s={s} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
