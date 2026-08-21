import { redirect } from 'next/navigation'
import { CalendarOff, Check } from 'lucide-react'
import {
  getTherapistContext,
  getAvailability,
  getAvailabilityExceptions,
  DAY_LABELS,
} from '@/lib/expert'
import { saveAvailability, blockDate, unblockDate } from '../actions'
import { TimeBlockPicker, toBlocks, hourLabel } from '@/components/expert/TimeBlockPicker'
import { BlockDateForm } from '@/components/expert/BlockDateForm'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { EXPERT_SCHEDULE_TABS } from '@/data/sectionTabs'

export default async function AvailabilityPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const [week, exceptions] = await Promise.all([
    getAvailability(ctx.therapistProfileId),
    getAvailabilityExceptions(ctx.therapistProfileId),
  ])

  const openDays = week.filter((d) => d.hours.length).length

  return (
    <div className="stack">
      <SectionTabs title="Schedule" tabs={EXPERT_SCHEDULE_TABS} active="/expert/availability" />
      <div className="page-head">
        <div className="page-title">Availability</div>
        <div className="page-meta">{openDays} of 7 days open · feeds the patient booking calendar</div>
      </div>

      {/* Set every day at once */}
      <div className="card" style={{ borderColor: 'var(--c-coral)', background: 'var(--c-coral-pale)' }}>
        <div className="section-title" style={{ marginBottom: 4 }}>Set a weekly default</div>
        <p className="muted" style={{ marginBottom: 12 }}>
          Add the blocks of time you usually work — say 9 AM to 1 PM. Saving applies them to every day of
          the week; fine-tune individual days below.
        </p>
        <form action={saveAvailability} className="stack" style={{ gap: 14 }}>
          <input type="hidden" name="applyAll" value="true" />
          <TimeBlockPicker name="hours" />
          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
            <Check size={14} /> Apply to all days
          </button>
        </form>
      </div>

      {/* Per-day editing */}
      <div className="stack">
        {week.map((day) => (
          <div className="card" key={day.dayOfWeek}>
            <div className="section-title" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span>{DAY_LABELS[day.dayOfWeek]}</span>
              <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>
                {day.hours.length
                  ? toBlocks(day.hours).map((b) => `${hourLabel(b.from)}–${hourLabel(b.to)}`).join(', ')
                  : 'Closed'}
              </span>
            </div>
            <form action={saveAvailability} className="stack" style={{ gap: 12 }}>
              <input type="hidden" name="dayOfWeek" value={day.dayOfWeek} />
              <TimeBlockPicker name="hours" initial={day.hours} />
              <button type="submit" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
                Save {DAY_LABELS[day.dayOfWeek]}
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Date-specific time off */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Time off for a specific date</div>
        <p className="muted" style={{ marginBottom: 12 }}>
          Take a date out without touching your weekly pattern — a whole day off, or just the hours you
          can&apos;t make.
        </p>
        <BlockDateForm action={blockDate} />

        {exceptions.length === 0 && <p className="muted">No upcoming days blocked.</p>}
        {exceptions.map((ex) => (
          <div key={ex.id} className="pattern">
            <span className="pattern-ic t-gold">
              <CalendarOff size={16} />
            </span>
            <div style={{ flex: 1 }}>
              <div className="pattern-title">{ex.dateLabel}</div>
              <div className="pattern-sub">
                {ex.fullDayOff ? 'Whole day blocked' : `Hours blocked: ${ex.hoursOff.map(hourLabel).join(', ')}`}
              </div>
            </div>
            <form action={unblockDate}>
              <input type="hidden" name="exceptionId" value={ex.id} />
              <button type="submit" className="btn btn-outline btn-sm">Remove</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
