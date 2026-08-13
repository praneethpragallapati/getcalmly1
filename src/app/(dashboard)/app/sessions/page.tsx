import Link from 'next/link'
import { Video, FileText, Calendar, CheckCircle2, Clock } from 'lucide-react'
import { getSessionsView, getExpertCalendar } from '@/lib/sessions'
import { getMyCareTeam } from '@/lib/therapist'
import { PatientCalendar } from '@/components/dashboard/PatientCalendar'
import { BookSession } from '@/components/dashboard/BookSession'
import { RateSession } from '@/components/dashboard/RateSession'
import { SessionActions } from '@/components/dashboard/SessionActions'
import { LocalTime } from '@/components/dashboard/LocalTime'
import { getSessionUserId } from '@/lib/patient'
import { canPatientBookWith } from '@/lib/expert'
import { istParts } from '@/lib/tz'
import type { DashSession } from '@/data/dashboardDemo'

// Always render fresh: this page settles elapsed sessions (no-shows / auto-
// complete) on load, so it must not be served from the router/full-route cache.
export const dynamic = 'force-dynamic'

function SessionRow({ s }: { s: DashSession }) {
  const past = s.status === 'COMPLETED'
  return (
    <div style={{ borderBottom: '1px solid var(--c-line)' }}>
      <div className="sess-row" style={{ borderBottom: 'none' }}>
        <span className="doc-avatar" style={{ width: 46, height: 46, fontSize: 22 }}>
          👩‍⚕️
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="doc-name" style={{ fontSize: 15 }}>
            {s.expert}
          </div>
          <div className="doc-sub"><LocalTime iso={s.scheduledISO} fallback={s.when} /></div>
          {s.tags && s.tags.length > 0 && (
            <div className="tag-row">
              {s.tags.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="sess-actions">
          {past ? (
            <>
              <span className="sess-status done">
                <CheckCircle2 size={14} /> Completed
              </span>
              <Link href={`/app/sessions/${s.id}`} className="btn btn-outline btn-sm">
                <FileText size={14} /> {s.hasSummary ? 'View summary' : 'View'}
              </Link>
            </>
          ) : (
            <>
              <Link href={`/app/sessions/${s.id}/room`} className="btn btn-primary btn-sm">
                <Video size={14} /> Join
              </Link>
              <Link href={`/app/sessions/${s.id}`} className="btn btn-outline btn-sm">
                <FileText size={14} /> Notes
              </Link>
            </>
          )}
        </div>
      </div>
      {!past && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 4px 12px' }}>
          <SessionActions id={s.id} scheduledISO={s.scheduledISO} />
        </div>
      )}
      {past && s.reviewable && (
        <div style={{ padding: '0 4px 14px 62px' }}>
          <RateSession appointmentId={s.id} expert={s.expert} initialRating={s.myRating ?? null} compact />
        </div>
      )}
    </div>
  )
}

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ with?: string }> }) {
  const sp = await searchParams
  const withId = typeof sp.with === 'string' ? sp.with : undefined
  // Only honour ?with= when the patient may actually book with that clinician.
  const userId = withId ? await getSessionUserId() : null
  const scopedId = withId && userId && (await canPatientBookWith(userId, withId)) ? withId : undefined

  // A patient can have up to three clinicians (individual / couples / psychiatry).
  // Build the list from their care team so the booking panel can say WHOSE
  // calendar it is and let them pick which one to book with — instead of silently
  // booking a single "default" clinician.
  const team = await getMyCareTeam()
  const seen = new Set<string>()
  const clinicians = team.slots
    .filter((s) => s.expert)
    .map((s) => ({ profileId: s.expert!.profileId, name: s.expert!.name, typeLabel: s.label }))
    .filter((c) => (seen.has(c.profileId) ? false : (seen.add(c.profileId), true)))

  // Whose calendar to show: the ?with= clinician if valid, otherwise the first
  // care-team clinician. The slots shown and the booking always match this pick.
  const selectedId = scopedId ?? clinicians[0]?.profileId
  const [view, calendar] = await Promise.all([getSessionsView(), getExpertCalendar(selectedId)])
  const selectedName = clinicians.find((c) => c.profileId === selectedId)?.name ?? (selectedId ? calendar.expert : undefined)
  // Gate booking by the selected clinician's package validity: you can't book a
  // slot dated after the package expiry, and you can't book at all once it's
  // expired. The server enforces this too; this drives the UI so the patient
  // sees it up front instead of only on submit.
  const selectedSlot = team.slots.find((s) => s.expert?.profileId === selectedId)
  const bookUntilIso = selectedSlot?.validUntilIso ?? null
  const packExpired = Boolean(selectedSlot?.expired)

  // Days in the current month that have a session, for the patient calendar.
  // Read the date in IST so an evening-IST session lands on the right day.
  const nowIst = istParts(new Date())
  const markedDays = [...view.upcoming, ...view.past]
    .map((s) => (s.scheduledISO ? istParts(new Date(s.scheduledISO)) : null))
    .filter((p): p is ReturnType<typeof istParts> => !!p && p.month === nowIst.month && p.year === nowIst.year)
    .map((p) => p.day)

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Sessions</h1>
        <span className="page-meta">
          {view.upcoming.length} upcoming · {view.past.length} completed
        </span>
      </div>

      {view.today && (
        <div className="session-banner" style={{ marginBottom: 20 }}>
          <div>
            <div className="session-when">LIVE NOW · READY TO JOIN</div>
            <h3>Session with {view.today.expert}</h3>
            <div className="sub">
              <LocalTime iso={view.today.scheduledISO} fallback={view.today.when} /> · {view.today.durationMins} min
            </div>
          </div>
          <Link href={`/app/sessions/${view.today.id}/room`} className="btn btn-primary">
            <Video size={16} /> Join now
          </Link>
        </div>
      )}

      <div className="page-grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="stack">
          <div className="card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Clock size={17} /> Upcoming
            </div>
            {view.upcoming.length === 0 ? (
              <p className="muted" style={{ padding: '12px 0' }}>
                No upcoming sessions. Book one from your expert’s calendar →
              </p>
            ) : (
              view.upcoming.map((s) => <SessionRow key={s.id} s={s} />)
            )}
          </div>

          <div className="card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Calendar size={17} /> Past sessions
            </div>
            {view.past.length === 0 ? (
              <p className="muted" style={{ padding: '12px 0' }}>
                Your completed sessions will appear here.
              </p>
            ) : (
              view.past.map((s) => <SessionRow key={s.id} s={s} />)
            )}
          </div>
        </div>

        <div className="stack">
          <PatientCalendar markedDays={markedDays} />
          <BookSession
            slots={calendar.slots}
            therapistId={selectedId}
            expertName={selectedName}
            clinicians={clinicians}
            selectedId={selectedId}
            bookUntilIso={bookUntilIso}
            packExpired={packExpired}
          />
        </div>
      </div>
    </>
  )
}
