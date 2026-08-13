'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { requestCancellation } from '@/app/(dashboard)/expert/actions'

/**
 * Clinician-side "Request cancellation" control. Cancelling a confirmed session
 * is not immediate — it submits a request an admin must approve. The button
 * expands to a reason field so the admin has context for the decision.
 */
export function RequestCancel({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline btn-sm">
        <X size={13} /> Request cancellation
      </button>
    )
  }

  return (
    <form action={requestCancellation} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <textarea
        name="reason"
        required
        rows={2}
        placeholder="Reason for cancelling (shared with admin for approval)…"
        className="entry-input"
        style={{ resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-sm" style={{ background: '#C0504B', color: '#fff', border: 'none' }}>
          Submit request
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-sm">
          Keep session
        </button>
      </div>
      <span style={{ fontSize: 11.5, color: '#8E9EAE' }}>
        The session stays on the calendar until an admin approves this request.
      </span>
    </form>
  )
}
