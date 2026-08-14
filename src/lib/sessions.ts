import { demoDashboard, type DashSession } from '@/data/dashboardDemo'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/patient'
import { getBookableSlots, getAssignedTherapistId, MIN_BOOKING_LEAD_MS, designationOf } from '@/lib/expert'
import { resolveDueAppointments } from '@/lib/sessionLifecycle'
import { fmtIST } from '@/lib/tz'

/**
 * Sessions data layer (#3, #9). Reads the signed-in patient's real appointments
 * and overlays them on bundled demo data, same DB-with-fallback pattern as the
 * rest of the dashboard. A patient only ever sees their own appointments.
 */

export type SessionDetail = {
  id: string
  expert: string
  expertRole: string
  when: string
  scheduledISO: string | null
  durationMins: number
  status: DashSession['status']
  sessionNo?: number
  tags: string[]
  roomId: string
  preSessionNote: string
  summary: string | null
  isPast: boolean
  /** True during the join window [start, start+duration]. */
  joinable: boolean
  /** Whether this patient has already joined the room once (drives re-entry). */
  joinedThisSide: boolean
  /** The patient's own rating (1–5), or null if not yet rated. */
  myRating: number | null
  myReviewComment: string | null
  /** Whether the patient can rate this session (past, not cancelled). */
  reviewable: boolean
}

export type SessionsView = {
  today: DashSession | null
  upcoming: DashSession[]
  past: DashSession[]
}

/** A bookable slot on the expert's calendar, shown to the patient (#9). */
export type ExpertSlot = { iso: string; label: string; time: string; taken: boolean }
export type ExpertCalendar = { expert: string; expertRole: string; slots: ExpertSlot[] }

// No pre-join: the room opens exactly at the scheduled start, not before.
const JOIN_WINDOW_MS = 0

function fmtWhen(d: Date): string {
  return fmtIST(d, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function joinableNow(scheduledAt: Date, durationMins: number): boolean {
  const now = Date.now()
  const start = scheduledAt.getTime()
  const end = start + durationMins * 60 * 1000
  return now >= start - JOIN_WINDOW_MS && now <= end
}

/** Upcoming + past sessions for the dashboard list. Demo when no session/DB. */
export async function getSessionsView(): Promise<SessionsView> {
  const userId = await getSessionUserId()
  // Demo data is only ever shown to logged-out visitors (marketing preview). A
  // signed-in patient always sees their real sessions — empty if they have none.
  const demo: SessionsView = {
    today: demoDashboard.todaySession,
    upcoming: demoDashboard.upcoming,
    past: demoDashboard.past,
  }
  const empty: SessionsView = { today: null, upcoming: [], past: [] }
  if (!userId) return demo

  try {
    // Settle any sessions whose window has fully elapsed (no-shows, auto-complete)
    // before reading, so a passed session drops out of "upcoming" and its wallet /
    // pay outcome is applied.
    await resolveDueAppointments({ patientId: userId })
    const rows = await prisma.appointment.findMany({
      where: { patientId: userId },
      orderBy: { scheduledAt: 'asc' },
      include: {
        therapist: { include: { user: { select: { name: true } } } },
        review: { select: { rating: true } },
      },
    })
    if (rows.length === 0) return empty

    const now = Date.now()
    const upcoming: DashSession[] = []
    const past: DashSession[] = []
    let n = 0
    for (const r of rows) {
      // A cancelled booking is not erased — it belongs in Past, clearly marked
      // "Cancelled", so both the patient and the expert keep a record of it. It
      // doesn't consume a session number and can't be joined or rated.
      const cancelled = r.status === 'CANCELLED'
      if (!cancelled) n++
      // Past once the whole session window has elapsed (or it was cancelled). It
      // stays joinable during the session, then drops off after it ends.
      const isPast = cancelled || r.status === 'COMPLETED' || r.scheduledAt.getTime() + r.durationMins * 60_000 < now
      const ds: DashSession = {
        id: r.id,
        expert: r.therapist.user.name ?? 'Your expert',
        expertRole: 'Clinical Psychologist',
        when: fmtWhen(r.scheduledAt),
        scheduledISO: r.scheduledAt.toISOString(),
        durationMins: r.durationMins,
        status: cancelled ? 'CANCELLED' : isPast ? 'COMPLETED' : 'UPCOMING',
        sessionNo: cancelled ? undefined : n,
        hasSummary: Boolean(r.summary),
        myRating: r.review?.rating ?? null,
        // Rateable once it has actually happened — never for a cancelled session.
        reviewable: isPast && !cancelled,
        joinedThisSide: Boolean(r.patientJoinedAt),
      }
      if (isPast) past.push(ds)
      else upcoming.push(ds)
    }
    past.reverse()
    const today =
      upcoming.find((s) => {
        const row = rows.find((r) => r.id === s.id)
        return row ? joinableNow(row.scheduledAt, row.durationMins) : false
      }) ?? null
    return { today, upcoming, past }
  } catch {
    return empty
  }
}

function demoDetail(id: string): SessionDetail | null {
  const all = [
    ...(demoDashboard.todaySession ? [demoDashboard.todaySession] : []),
    ...demoDashboard.upcoming,
    ...demoDashboard.past,
  ]
  const s = all.find((x) => x.id === id)
  if (!s) return null
  return {
    id: s.id,
    expert: s.expert,
    expertRole: s.expertRole,
    when: s.when,
    scheduledISO: null,
    durationMins: s.durationMins,
    status: s.status,
    sessionNo: s.sessionNo,
    tags: s.tags ?? [],
    roomId: s.id,
    preSessionNote: '',
    summary:
      s.status === 'COMPLETED'
        ? 'You explored the Sunday-night work spiral and practised reframing it. Homework: notice one catastrophic thought and write the kinder version next to it.'
        : null,
    isPast: s.status === 'COMPLETED',
    joinable: s.status !== 'COMPLETED',
    joinedThisSide: false,
    myRating: null,
    myReviewComment: null,
    reviewable: false, // demo/preview sessions aren't real, so not rateable
  }
}

/** A single session's detail, scoped to the signed-in patient. */
export async function getSessionDetail(id: string): Promise<SessionDetail | null> {
  const userId = await getSessionUserId()
  if (!userId) return demoDetail(id)

  try {
    const r = await prisma.appointment.findFirst({
      where: { id, patientId: userId }, // ownership enforced in the query
      include: {
        therapist: { include: { user: { select: { name: true } } } },
        review: { select: { rating: true, comment: true } },
      },
    })
    if (!r) return demoDetail(id)
    const isPast = r.status === 'COMPLETED' || r.scheduledAt.getTime() + r.durationMins * 60_000 < Date.now()
    return {
      id: r.id,
      expert: r.therapist.user.name ?? 'Your expert',
      expertRole: 'Clinical Psychologist',
      when: fmtWhen(r.scheduledAt),
      scheduledISO: r.scheduledAt.toISOString(),
      durationMins: r.durationMins,
      status: isPast ? 'COMPLETED' : 'UPCOMING',
      tags: [],
      roomId: r.roomId ?? r.id,
      preSessionNote: r.preSessionNote ?? '',
      summary: r.summary,
      isPast,
      joinable: !isPast && joinableNow(r.scheduledAt, r.durationMins),
      joinedThisSide: Boolean(r.patientJoinedAt),
      myRating: r.review?.rating ?? null,
      myReviewComment: r.review?.comment ?? null,
      reviewable: isPast && r.status !== 'CANCELLED',
    }
  } catch {
    return demoDetail(id)
  }
}

/**
 * Whether a user may join a video room. Real rooms map to an Appointment and only
 * its patient or therapist may join. Demo rooms (no matching appointment) are
 * allowed through, the roomId is an unguessable id and nothing is persisted.
 */
export async function canAccessRoom(roomId: string, userId: string | null): Promise<boolean> {
  try {
    const appt = await prisma.appointment.findFirst({
      where: { OR: [{ roomId }, { id: roomId }] },
      include: { therapist: { select: { userId: true } } },
    })
    if (!appt) return true // demo / not-yet-persisted room
    if (!userId) return false
    return appt.patientId === userId || appt.therapist.userId === userId
  } catch {
    return true
  }
}

/** Bundled demo calendar, used only in signed-out preview. */
function demoCalendar(): ExpertCalendar {
  const earliest = Date.now() + MIN_BOOKING_LEAD_MS
  const slots: ExpertSlot[] = []
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  let added = 0
  for (let d = 1; d <= 21 && added < 12; d++) {
    const day = new Date(cursor)
    day.setDate(day.getDate() + d)
    const dow = day.getDay()
    if (dow === 0 || dow === 6) continue // weekdays only
    for (const hour of [11, 15]) {
      if (added >= 12) break
      const slot = new Date(day)
      slot.setHours(hour, 0, 0, 0)
      if (slot.getTime() < earliest) continue
      slots.push({
        iso: slot.toISOString(),
        label: slot.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: slot.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
        taken: false,
      })
      added++
    }
  }
  return {
    expert: demoDashboard.todaySession?.expert ?? 'Dr. Ananya Sharma',
    expertRole: 'Clinical Psychologist',
    slots,
  }
}

/**
 * The calendar a patient books from (#9). Shows a clinician's real availability.
 * By default it's the patient's assigned clinician; pass `therapistIdOverride`
 * (validated by the caller via canPatientBookWith) to book with a specific
 * expert on the care team. What's shown and the booking action stay in sync.
 * Slots respect the 6-hour minimum lead and are marked taken when already booked.
 */
export async function getExpertCalendar(therapistIdOverride?: string): Promise<ExpertCalendar> {
  const userId = await getSessionUserId()
  // Empty (real) calendar for a signed-in patient with no expert yet; demo only
  // for the logged-out marketing preview.
  const emptyCal: ExpertCalendar = { expert: '', expertRole: '', slots: [] }
  if (!userId) return demoCalendar()

  try {
    const therapistId = therapistIdOverride ?? (await getAssignedTherapistId(userId))
    if (!therapistId) return emptyCal

    const [therapist, real] = await Promise.all([
      prisma.therapistProfile.findUnique({
        where: { id: therapistId },
        include: { user: { select: { name: true } } },
      }),
      getBookableSlots(therapistId),
    ])

    return {
      expert: therapist?.user.name ?? 'Your expert',
      expertRole: therapist ? designationOf(therapist.specializations) : 'Clinical Psychologist',
      slots: real.map((s) => ({ iso: s.iso, label: s.dateLabel, time: s.time, taken: s.taken })),
    }
  } catch {
    return demoCalendar()
  }
}
