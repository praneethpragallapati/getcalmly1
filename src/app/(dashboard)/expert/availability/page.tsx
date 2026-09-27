import { redirect } from 'next/navigation'
import { CalendarOff, Check } from 'lucide-react'
import {
  getTherapistContext,
  getAvailability,
  getAvailabilityExceptions,
  DAY_LABELS,
} from '@/lib/expert'
import { saveAvailability, blockDate, unblockDate } from '../actions'
import { TimeBlockPicker } from '@/components/expert/TimeBlockPicker'
import { toBlocks, hourLabel } from '@/lib/timeBlocks'
import { BlockDateForm } from '@/components/expert/BlockDateForm'

export default async function AvailabilityPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const [week, exceptions] = await Promise.all([
    getAvailability(ctx.therapistProfileId),
    getAvailabilityExceptions(ctx.therapistProfileId),
  ])

  const openDays = week.filter((d) => d.hours.length).length
  const ranges = groupRuns(exceptions)

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Availability</div>
        <div className="page-meta">{openDays} of 7 days open · feeds the patient booking calendar</div>
      </div>

      {/* Set every day at once */}
      <div className="card" style={{ borderColor: 'var(--c-coral)', background: 'var(--c-coral-pale)' }}>
        <div className="section-title" style={{ marginBottom: 4 }}>Set a weekly default</div>
        <p className="muted" style={{ marginBottom: 12 }}>
          Add the blocks of time you usually work, say 9 AM to 1 PM. Saving applies them to every day of
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
        <div className="section-title" style={{ marginBottom: 4 }}>Time off</div>
        <p className="muted" style={{ marginBottom: 12 }}>
          Take days out without touching your weekly pattern: click a date, or press and drag across
          several for a trip or a week off. Block whole days, or just the hours you can&apos;t make.
        </p>
        <BlockDateForm action={blockDate} blocked={exceptions.map((ex) => dayKey(ex.date))} />

        {ranges.length === 0 && <p className="muted">No upcoming days blocked.</p>}
        {ranges.map((r) => (
          <div key={r.ids[0]} className="pattern">
            <span className="pattern-ic t-gold">
              <CalendarOff size={16} />
            </span>
            <div style={{ flex: 1 }}>
              <div className="pattern-title">
                {r.ids.length === 1 ? r.first : `${r.first} to ${r.last}`}
                {r.ids.length > 1 && <span className="muted" style={{ fontWeight: 400 }}> · {r.ids.length} days</span>}
              </div>
              <div className="pattern-sub">
                {r.fullDayOff ? 'Whole day blocked' : `Hours blocked: ${r.hoursOff.map(hourLabel).join(', ')}`}
              </div>
            </div>
            <form action={unblockDate}>
              {r.ids.map((id) => <input key={id} type="hidden" name="exceptionId" value={id} />)}
              <button type="submit" className="btn btn-outline btn-sm">Remove</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}

/** YYYY-MM-DD of a stored exception (dates are kept at UTC midnight). */
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

type Exception = Awaited<ReturnType<typeof getAvailabilityExceptions>>[number]

/**
 * Consecutive days blocked the same way collapse into one row ("Mon 3 Nov to
 * Fri 7 Nov · 5 days") with a single Remove, so a week off isn't five rows.
 */
function groupRuns(list: Exception[]) {
  const runs: { ids: string[]; first: string; last: string; lastDate: Date; fullDayOff: boolean; hoursOff: number[] }[] = []
  for (const ex of list) {
    const prev = runs[runs.length - 1]
    const sameKind = prev && prev.fullDayOff === ex.fullDayOff && prev.hoursOff.join() === ex.hoursOff.join()
    if (prev && sameKind && ex.date.getTime() - prev.lastDate.getTime() === 86_400_000) {
      prev.ids.push(ex.id)
      prev.last = ex.dateLabel
      prev.lastDate = ex.date
    } else {
      runs.push({ ids: [ex.id], first: ex.dateLabel, last: ex.dateLabel, lastDate: ex.date, fullDayOff: ex.fullDayOff, hoursOff: ex.hoursOff })
    }
  }
  return runs
}
