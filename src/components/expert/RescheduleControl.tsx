'use client'

import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { rescheduleAppointmentAction } from '@/app/(dashboard)/expert/actions'

/**
 * Clinician-side reschedule. The bare datetime input was easy to miss (an empty
 * submit silently no-ops), so this expands to a labelled required field. The
 * picked time is IST wall-clock — the server parses it as IST.
 */
export function RescheduleControl({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline btn-sm">
        <CalendarClock size={13} /> Reschedule
      </button>
    )
  }

  return (
    <form action={rescheduleAppointmentAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 340 }}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <label style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8E9EAE' }}>
        New date &amp; time (IST)
      </label>
      <input className="entry-input" type="datetime-local" name="newDate" required style={{ padding: '8px 10px' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary btn-sm">Confirm new time</button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-sm">Cancel</button>
      </div>
    </form>
  )
}
