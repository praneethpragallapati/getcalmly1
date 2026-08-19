import { redirect } from 'next/navigation'
import { CalendarOff, Check } from 'lucide-react'
import {
  getTherapistContext,
  getAvailability,
  getAvailabilityExceptions,
  SLOT_GROUPS,
  SLOT_GROUP_KEYS,
  DAY_LABELS,
} from '@/lib/expert'
import { saveAvailability, blockDate, unblockDate } from '../actions'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { EXPERT_SCHEDULE_TABS } from '@/data/sectionTabs'

function hourLabel(h: number): string {
  const ampm = h < 12 ? 'AM' : 'PM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display} ${ampm}`
}

/** The 1-hour slot checkboxes, grouped under the four named bands, pre-checked. */
function HoursPicker({ selected }: { selected: number[] }) {
  const set = new Set(selected)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
      {SLOT_GROUP_KEYS.map((key) => (
        <div key={key} style={{ minWidth: 150 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{SLOT_GROUPS[key].label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SLOT_GROUPS[key].hours.map((h) => (
              <label
                key={h}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}
              >
                <input type="checkbox" name="hours" value={h} defaultChecked={set.has(h)} />
                {hourLabel(h)}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

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
          Pick the 1-hour slots you usually work. Saving applies them to every day of the week, fine-tune
          individual days below.
        </p>
        <form action={saveAvailability} className="stack" style={{ gap: 14 }}>
          <input type="hidden" name="applyAll" value="true" />
          <HoursPicker selected={[]} />
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
                {day.hours.length ? `${day.hours.length} slot${day.hours.length > 1 ? 's' : ''}` : 'Closed'}
              </span>
            </div>
            <form action={saveAvailability} className="stack" style={{ gap: 12 }}>
              <input type="hidden" name="dayOfWeek" value={day.dayOfWeek} />
              <HoursPicker selected={day.hours} />
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
          Block a specific date (holiday, leave) without changing your weekly pattern. Tick specific hours
          to block only part of the day, leave them all unticked to block the whole day.
        </p>
        <form action={blockDate} className="stack" style={{ gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="entry-input" type="date" name="date" required style={{ maxWidth: 200 }} />
            <button type="submit" className="btn btn-primary btn-sm">
              <CalendarOff size={14} /> Block
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {SLOT_GROUP_KEYS.map((key) => (
              <div key={key} style={{ minWidth: 150 }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>{SLOT_GROUPS[key].label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SLOT_GROUPS[key].hours.map((h) => (
                    <label key={h} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" name="hoursOff" value={h} />
                      {hourLabel(h)}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </form>

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
