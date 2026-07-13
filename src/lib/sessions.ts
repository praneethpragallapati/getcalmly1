import { demoDashboard, type DashSession } from '@/data/dashboardDemo'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/patient'
import { getBookableSlots, getAssignedTherapistId, MIN_BOOKING_LEAD_MS } from '@/lib/expert'

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
  /** True a short while before the start time through the end of the session. */
  joinable: boolean
}

export type SessionsView = {
  today: DashSession | null
  upcoming: DashSession[]
  past: DashSession[]
}

/** A bookable slot on the expert's calendar, shown to the patient (#9). */
export type ExpertSlot = { iso: string; label: string; time: string; taken: boolean }
export type ExpertCalendar = { expert: string; expertRole: string; slots: ExpertSlot[] }

const JOIN_WINDOW_MS = 10 * 60 * 1000 // can join 10 min early

function fmtWhen(d: Date): string {
  return d.toLocaleString('en-IN', {
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
  const demo: SessionsView = {
    today: demoDashboard.todaySession,
    upcoming: demoDashboard.upcoming,
    past: demoDashboard.past,
  }
  if (!userId) return demo

  try {
    const rows = await prisma.appointment.findMany({
      where: { patientId: userId },
      orderBy: { scheduledAt: 'asc' },
      include: { therapist: { include: { user: { select: { name: true } } } } },
    })
    if (rows.length === 0) return demo

    const now = Date.now()
    const upcoming: DashSession[] = []
    const past: DashSession[] = []
    let n = 0
    for (const r of rows) {
      n++
      const ds: DashSession = {
        id: r.id,
        expert: r.therapist.user.name ?? 'Your expert',
        expertRole: 'Clinical Psychologist',
        when: fmtWhen(r.scheduledAt),
        scheduledISO: r.scheduledAt.toISOString(),
        durationMins: r.durationMins,
        status:
          r.status === 'COMPLETED'
            ? 'COMPLETED'
            : r.scheduledAt.getTime() <= now
              ? 'COMPLETED'
              : 'UPCOMING',
        sessionNo: n,
        hasSummary: Boolean(r.summary),
      }
      if (r.status === 'COMPLETED' || r.scheduledAt.getTime() < now) past.push(ds)
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
    return demo
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
  }
}

/** A single session's detail, scoped to the signed-in patient. */
export async function getSessionDetail(id: string): Promise<SessionDetail | null> {
  const userId = await getSessionUserId()
  if (!userId) return demoDetail(id)

  try {
    const r = await prisma.appointment.findFirst({
      where: { id, patientId: userId }, // ownership enforced in the query
      include: { therapist: { include: { user: { select: { name: true } } } } },
    })
    if (!r) return demoDetail(id)
    const isPast = r.status === 'COMPLETED' || r.scheduledAt.getTime() < Date.now()
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
 * The calendar a patient books from (#9). Shows ONLY their assigned clinician's
 * real availability, and it is the exact same clinician the booking action uses
 * (getAssignedTherapistId), so what they see and what they book stay in sync.
 * Slots respect the 6-hour minimum lead and are marked taken when already booked.
 */
export async function getExpertCalendar(): Promise<ExpertCalendar> {
  const userId = await getSessionUserId()
  if (!userId) return demoCalendar()

  try {
    const therapistId = await getAssignedTherapistId(userId)
    if (!therapistId) return demoCalendar()

    const [therapist, real] = await Promise.all([
      prisma.therapistProfile.findUnique({
        where: { id: therapistId },
        include: { user: { select: { name: true } } },
      }),
      getBookableSlots(therapistId),
    ])

    return {
      expert: therapist?.user.name ?? 'Your expert',
      expertRole: 'Clinical Psychologist',
      slots: real.map((s) => ({ iso: s.iso, label: s.dateLabel, time: s.time, taken: s.taken })),
    }
  } catch {
    return demoCalendar()
  }
}
