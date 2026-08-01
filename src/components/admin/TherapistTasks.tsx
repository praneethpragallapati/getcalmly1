'use client'

import { Check, Flame, Trash2 } from 'lucide-react'
import { assignTherapistTask, deleteTherapistTask } from '@/app/admin/actions'
import { TASK_FREQUENCIES, FREQUENCY_LABEL, TASK_TIMES_OF_DAY } from '@/lib/taskRecurrence'
import type { TherapistTaskRow } from '@/lib/admin'

const charcoal = '#1C2B3A'
const purple = '#6D5BD0'

const field: React.CSSProperties = {
  width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px',
  fontSize: 14, fontFamily: 'inherit', color: charcoal, boxSizing: 'border-box',
}
const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#5A6B7A', marginBottom: 5 }

/**
 * Admin-side task assignment for a clinician: same shape a therapist uses for a
 * patient (frequency, time(s) of day, expiry). Lists what's already assigned,
 * with completion status the clinician drives from their own portal.
 */
export function TherapistTasks({
  therapistUserId,
  profileId,
  tasks,
}: {
  therapistUserId: string
  profileId: string
  tasks: TherapistTaskRow[]
}) {
  return (
    <div className="card">
      <div className="section-title" style={{ fontSize: 15, marginBottom: 2 }}>Tasks for this clinician</div>
      <p className="muted" style={{ fontSize: 12, marginBottom: 14 }}>
        Assign work with a frequency, time of day and expiry. The clinician sees it on their dashboard and marks it done.
      </p>

      <form action={assignTherapistTask} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="hidden" name="therapistUserId" value={therapistUserId} />
        <input type="hidden" name="profileId" value={profileId} />
        <div>
          <label style={label}>Task</label>
          <input style={field} name="title" required placeholder="e.g. Submit last week's session notes" />
        </div>
        <div>
          <label style={label}>Details <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(optional)</span></label>
          <input style={field} name="description" placeholder="Anything the clinician needs to know" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={label}>Frequency</label>
            <select style={{ ...field, background: '#fff' }} name="frequency" defaultValue="ONE_TIME">
              {TASK_FREQUENCIES.map((f) => (
                <option key={f} value={f}>{FREQUENCY_LABEL[f]}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Expiry</label>
            <input style={field} type="date" name="dueDate" />
          </div>
        </div>
        <div>
          <label style={label}>Time of day</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', color: purple }}>
            {TASK_TIMES_OF_DAY.map((t) => (
              <label key={t} className="chip-check">
                <input type="checkbox" name="timesOfDay" value={t} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Assign task</button>
      </form>

      {tasks.length > 0 && (
        <div style={{ marginTop: 20, borderTop: '1px solid rgba(28,43,58,.08)', paddingTop: 12 }}>
          {tasks.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: '1px solid rgba(28,43,58,.05)' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: t.done ? 'rgba(44,122,87,.12)' : t.expired ? 'rgba(192,80,75,.12)' : 'rgba(109,91,208,.1)',
                color: t.done ? '#2C7A57' : t.expired ? '#C0504B' : purple,
              }}>
                {t.done ? <Check size={14} /> : <Flame size={14} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: charcoal }}>{t.title}</div>
                {t.description && <div style={{ fontSize: 12.5, color: '#5A6B7A', marginTop: 1 }}>{t.description}</div>}
                <div style={{ fontSize: 11.5, color: '#8E9EAE', marginTop: 2 }}>
                  {[
                    t.frequencyLabel,
                    t.timesLabel,
                    t.done ? 'Done' : t.dueLabel ? (t.expired ? `Expired ${t.dueLabel}` : `Until ${t.dueLabel}`) : undefined,
                    t.assignedBy ? `by ${t.assignedBy}` : undefined,
                  ].filter(Boolean).join(' · ')}
                </div>
              </div>
              <form action={deleteTherapistTask}>
                <input type="hidden" name="taskId" value={t.id} />
                <input type="hidden" name="profileId" value={profileId} />
                <button type="submit" title="Remove task" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#B0B8C0', padding: 4 }}>
                  <Trash2 size={15} />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
