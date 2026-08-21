'use client'

import { useState } from 'react'
import { CalendarOff } from 'lucide-react'
import { TimeBlockPicker } from './TimeBlockPicker'

/**
 * Take a date out of the calendar.
 *
 * The two cases are made explicit rather than implied: "the whole day" was
 * previously expressed by leaving every hour unticked, which reads as having
 * chosen nothing. Here it is the default, and picking specific hours is the
 * deliberate second option.
 */
export function BlockDateForm({ action }: { action: (formData: FormData) => void }) {
  const [wholeDay, setWholeDay] = useState(true)
  const [date, setDate] = useState('')

  return (
    <form action={action} className="stack" style={{ gap: 14, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="eyebrow">Date</span>
          <input
            className="entry-input"
            type="date"
            name="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ maxWidth: 200 }}
          />
        </label>
        <button type="submit" className="btn btn-primary btn-sm" disabled={!date}>
          <CalendarOff size={14} /> Block this date
        </button>
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, cursor: 'pointer' }}>
          <input type="radio" name="scope" checked={wholeDay} onChange={() => setWholeDay(true)} />
          Unavailable all day
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, cursor: 'pointer' }}>
          <input type="radio" name="scope" checked={!wholeDay} onChange={() => setWholeDay(false)} />
          Only certain hours
        </label>
      </div>

      {/* Unmounted when the whole day is off, so no hoursOff reach the action —
          which is exactly how it reads "block everything". */}
      {!wholeDay && (
        <div style={{ borderTop: '1px solid var(--c-line)', paddingTop: 12 }}>
          <TimeBlockPicker name="hoursOff" compact />
          <p className="muted" style={{ fontSize: 12, margin: '8px 0 0' }}>
            These hours are removed from that date only. Everything else in your weekly pattern still stands.
          </p>
        </div>
      )}
    </form>
  )
}
