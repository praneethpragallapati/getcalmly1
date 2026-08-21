import { CalendarCheck, CreditCard, UserPlus, Repeat } from 'lucide-react'
import type { TimelineEvent, TimelineKind } from '@/lib/patientTimeline'

/**
 * The member's history in one column, newest first — what happened and when,
 * instead of a sessions list on its own with purchases and handovers elsewhere.
 */

const TONE: Record<TimelineKind, { color: string; bg: string; icon: React.ReactNode }> = {
  joined: { color: '#3E6E9C', bg: 'rgba(62,110,156,.12)', icon: <UserPlus size={14} /> },
  session: { color: '#2C7A57', bg: 'rgba(61,158,114,.12)', icon: <CalendarCheck size={14} /> },
  package: { color: '#6D5BD0', bg: 'rgba(109,91,208,.12)', icon: <CreditCard size={14} /> },
  expert_change: { color: '#8A6300', bg: 'rgba(201,151,58,.16)', icon: <Repeat size={14} /> },
}

/** Cancelled and no-show sessions are muted so the real ones read first. */
function statusChip(status: string | null | undefined) {
  if (!status || status === 'COMPLETED' || status === 'CONFIRMED') return null
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
      color: '#8A3A36', background: 'rgba(192,80,75,.1)',
    }}>
      {status.toLowerCase()}
    </span>
  )
}

export function PatientTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Timeline</div>
      <p className="muted" style={{ fontSize: 12.5, margin: '0 0 14px' }}>
        Everything on this member&apos;s record, newest first — sessions, packages and changes of expert.
      </p>

      {events.length === 0 && <p className="muted" style={{ fontSize: 13.5 }}>Nothing on record yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {events.map((e, i) => {
          const tone = TONE[e.kind]
          const last = i === events.length - 1
          return (
            <div key={e.id} style={{ display: 'flex', gap: 12 }}>
              {/* Rail: the marker plus the line joining it to the next event. */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: tone.color, background: tone.bg,
                }}>
                  {tone.icon}
                </span>
                {!last && <span style={{ flex: 1, width: 1.5, background: 'rgba(28,43,58,.1)', minHeight: 14 }} />}
              </div>

              <div style={{ flex: 1, minWidth: 0, paddingBottom: last ? 0 : 16 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--c-charcoal)' }}>{e.title}</span>
                  {statusChip(e.status)}
                  {e.amount != null && (
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#6D5BD0' }}>
                      ₹{e.amount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {e.dateLabel}{e.detail ? ` · ${e.detail}` : ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
