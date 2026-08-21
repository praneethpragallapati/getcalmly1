/**
 * Expert (clinician) portal data access. Mirrors the DB-with-fallback discipline
 * used elsewhere, but with no demo fallback, there is no meaningful "preview"
 * of another person's clinical record, so every function here returns null/empty
 * when there is no signed-in, verified therapist.
 *
 * Read-only by design: the only clinician-authored input this module writes is
 * the existing Appointment.summary/preSessionNote channel (already the sole
 * expert-authored text the AI pipeline synthesizes, see lib/ai/synthesizer.ts).
 * Nothing here adds a new freeform field that feeds the AI directly.
 */
import { cache } from 'react'
import { getAuthSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { isPsychiatrist } from '@/lib/clinicianScope'
import { sessionMinMinutes, resolveDueAppointments, computePresence, ensureSessionPresenceSchema } from '@/lib/sessionLifecycle'
import { fmtIST, istParts, istWallClock } from '@/lib/tz'
import { frequencyChip, isDoneForPeriod, timesOfDayChip } from '@/lib/taskRecurrence'
import { trackLabelFor } from '@/lib/ai/tracks'
import { notifyCancellationRequest } from '@/lib/adminNotify'
import { parseCompensationFields, type CompensationField } from '@/lib/compensation'
import { callModel } from '@/lib/ai/clients'
import { SYNTH_MODEL } from '@/lib/ai/models'
import { hasLlm } from '@/lib/ai/config'
import {
  getEarningsConfig,
  effectiveEarningsConfig,
  isNightSession,
  sessionPay,
  baseFeeFor,
  numberBonusFor,
  SERVICE_LABEL,
  type EarningsConfigValues,
  type ServiceType,
} from '@/lib/earningsConfig'
import { STATUS_LABEL } from '@/lib/orders'

export type MoodTrend = 'improving' | 'stable' | 'declining' | 'insufficient'

export type RiskNotification = {
  id: string
  kind: 'crisis' | 'mood_decline'
  patientId: string
  patientName: string
  message: string
  detail: string
  createdAt: Date
  resolved: boolean
}

export type CaseloadPatient = {
  patientId: string
  name: string
  email: string
  trackLabel: string
  lastMood: number | null
  moodTrend: MoodTrend
  openCrisisCount: number
  sessionsDone: number
  sessionsTotal: number
  // Facets for filtering the caseload.
  sessionsCompleted: number // COMPLETED appointments with this clinician
  sessionsLeft: number // remaining sessions across active packages
  packageTypes: string[] // active subscription trackSlugs
  language: string | null
  state: string | null
  monthsHere: number // whole months since they joined
}

/**
 * The identity + contact block on a patient's record. The treating clinician
 * needs it to reach the patient (and their emergency contact) between sessions;
 * admin sees the same fields.
 */
export type PersonContact = {
  code: string | null // the stable GC-P-… identifier
  email: string | null
  phone: string | null
  dateOfBirth: string | null // yyyy-mm-dd
  gender: string | null
  preferredLanguage: string | null
  occupation: string | null
  maritalStatus: string | null
  country: string
  state: string | null
  city: string | null
  addressLine1: string | null
  addressLine2: string | null
  postalCode: string | null
  emergencyName: string | null
  emergencyPhone: string | null
  emergencyRelation: string | null
  joinedLabel: string | null
}

export type ExpertPatientProfile = {
  patientId: string
  name: string
  contact: PersonContact
  trackLabel: string
  diagnosis?: string
  therapyStatus?: string
  streakDays: number
  moodTrend: MoodTrend
  moodWeek: { date: string; mood: number }[]
  sessionNotes: { date: string; raw: string; synthesized?: string }[]
  /** The patient's sessions across all experts involved. `isOwn` sessions are
   *  editable by the viewer; others render read-only, labelled by author. */
  sessions: { id: string; dateLabel: string; status: string; isPast: boolean; payable: boolean; summary: string | null; author: string; isOwn: boolean }[]
  sessionsDone: number
  sessionsTotal: number
  sessionsRemaining: number
  taskCompletionPct: number
  tasks: { id: string; title: string; type: string; frequencyLabel?: string; timesLabel?: string; dueLabel?: string; done: boolean; expired: boolean }[]
  medicationCompliancePct: number
  medications: {
    id: string
    name: string
    dosage?: string
    frequency?: string
    durationDays?: number
    prescribedBy?: string
    active: boolean
    orderStatusLabel?: string
    orderAmount?: number
  }[]
  openCrisisCount: number
  highStakeChatCount: number
  // Count of journal entries the patient has written (content is private — only
  // the count is surfaced to the clinician).
  journalCount: number
}

export type EmploymentType = 'FULL_TIME' | 'PART_TIME'

export type TherapistContext = {
  userId: string
  therapistProfileId: string
  therapistName: string | null
  /** Platform registration number (GC-E-…), null until one is allocated. */
  registrationNo: string | null
  specializations: string[]
  /** Psychiatrists may prescribe/manage medication; derived from specializations. */
  isPsychiatrist: boolean
  /** Salaried (full-time) clinicians don't see per-session earnings. */
  employmentType: EmploymentType
  /** Public-facing title, e.g. "Consultant Psychiatrist" / "Clinical Psychologist". */
  designation: string
  /** Admin-defined fields shown to full-time clinicians on their Earnings tab. */
  compensationFields: CompensationField[]
}

/** Whether a specialization set marks a prescribing psychiatrist. */
function looksPsychiatric(specializations: string[]): boolean {
  return specializations.some((s) => /psychiat|medication|pharma/i.test(s))
}

/** A clinician's public designation, used on blog bylines and community answers. */
export function designationOf(specializations: string[]): string {
  return looksPsychiatric(specializations) ? 'Consultant Psychiatrist' : 'Clinical Psychologist'
}

/**
 * The signed-in therapist's verified TherapistProfile context, or null.
 * Request-memoised: the expert layout and every page/action call this, so
 * without caching it re-queries the profile several times per render.
 */
export const getTherapistContext = cache(async (): Promise<TherapistContext | null> => {
  try {
    const session = await getAuthSession()
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) return null
    // Narrow select (never a full-row lookup): the therapist portal must load
    // even on a deployment whose DB is missing a newer column, so we never pull
    // columns this function doesn't need. compensationFields is fetched
    // defensively below so a not-yet-migrated column can't lock a clinician out.
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId },
      select: { id: true, isActive: true, specializations: true, employmentType: true, user: { select: { name: true, registrationNo: true } } },
    })
    if (!profile || !profile.isActive) return null
    let compensationFields: CompensationField[] = []
    try {
      const comp = await prisma.therapistProfile.findUnique({ where: { userId }, select: { compensationFields: true } })
      compensationFields = parseCompensationFields(comp?.compensationFields)
    } catch { /* compensationFields column not migrated yet */ }
    return {
      userId,
      therapistProfileId: profile.id,
      therapistName: profile.user?.name ?? null,
      registrationNo: profile.user?.registrationNo ?? null,
      specializations: profile.specializations,
      isPsychiatrist: looksPsychiatric(profile.specializations),
      employmentType: (profile.employmentType as EmploymentType) ?? 'FULL_TIME',
      designation: designationOf(profile.specializations),
      compensationFields,
    }
  } catch {
    return null
  }
})

// ── Profile ─────────────────────────────────────────────────────────────────

export type TherapistProfileView = {
  name: string
  designation: string
  employmentType: EmploymentType
  bio: string
  qualifications: string[]
  languages: string[]
  specializations: string[]
  yearsExp: number
  rciNumber: string
  sessionFee: number
  rating: number
  totalReviews: number
  isVerified: boolean
  isPsychiatrist: boolean
  photoUrl: string | null
  gender: string | null
  /** Platform registration number (GC-E-…). */
  registrationNo: string | null
  // Contact + location. Shown to the clinician themselves and to admins; never
  // on the patient-facing expert card.
  email: string | null
  phone: string | null
  dateOfBirth: string | null // yyyy-mm-dd for the date input
  country: string
  state: string | null
  city: string | null
  addressLine1: string | null
  addressLine2: string | null
  postalCode: string | null
  emergencyName: string | null
  emergencyPhone: string | null
  emergencyRelation: string | null
}

/** The signed-in clinician's own profile, for the portal Profile page. */
export async function getTherapistProfile(therapistProfileId: string): Promise<TherapistProfileView | null> {
  // Narrow select over the pre-0038 columns only. A full-row read would SELECT
  // the contact columns too, and on a database that hasn't run 0038 that throws
  // and takes the whole profile page down.
  const p = await prisma.therapistProfile.findUnique({
    where: { id: therapistProfileId },
    select: {
      specializations: true, employmentType: true, bio: true, qualifications: true,
      languages: true, yearsExp: true, rciNumber: true, sessionFee: true,
      rating: true, totalReviews: true, isVerified: true, photoUrl: true, gender: true,
      user: { select: { name: true, email: true, phone: true, registrationNo: true } },
    },
  })
  if (!p) return null

  // The 0038 contact block, fetched separately and guarded: until the migration
  // runs these simply read as unset instead of failing the page.
  let contact = {
    dateOfBirth: null as string | null,
    country: 'IN',
    state: null as string | null,
    city: null as string | null,
    addressLine1: null as string | null,
    addressLine2: null as string | null,
    postalCode: null as string | null,
    emergencyName: null as string | null,
    emergencyPhone: null as string | null,
    emergencyRelation: null as string | null,
  }
  try {
    const c = await prisma.therapistProfile.findUnique({
      where: { id: therapistProfileId },
      select: {
        dateOfBirth: true, country: true, state: true, city: true,
        addressLine1: true, addressLine2: true, postalCode: true,
        emergencyName: true, emergencyPhone: true, emergencyRelation: true,
      },
    })
    if (c) {
      contact = {
        dateOfBirth: c.dateOfBirth ? c.dateOfBirth.toISOString().slice(0, 10) : null,
        country: c.country ?? 'IN',
        state: c.state ?? null,
        city: c.city ?? null,
        addressLine1: c.addressLine1 ?? null,
        addressLine2: c.addressLine2 ?? null,
        postalCode: c.postalCode ?? null,
        emergencyName: c.emergencyName ?? null,
        emergencyPhone: c.emergencyPhone ?? null,
        emergencyRelation: c.emergencyRelation ?? null,
      }
    }
  } catch { /* 0038 not applied yet */ }

  return {
    name: p.user?.name ?? 'Doctor',
    designation: designationOf(p.specializations),
    employmentType: (p.employmentType as EmploymentType) ?? 'FULL_TIME',
    bio: p.bio,
    qualifications: p.qualifications,
    languages: p.languages,
    specializations: p.specializations,
    yearsExp: p.yearsExp,
    rciNumber: p.rciNumber,
    sessionFee: p.sessionFee,
    rating: p.rating,
    totalReviews: p.totalReviews,
    isVerified: p.isVerified,
    isPsychiatrist: looksPsychiatric(p.specializations),
    photoUrl: p.photoUrl,
    gender: p.gender,
    registrationNo: p.user?.registrationNo ?? null,
    email: p.user?.email ?? null,
    phone: p.user?.phone ?? null,
    ...contact,
  }
}

/**
 * Whether this therapist is responsible for the given patient (ownership gate).
 * True when they have an appointment with them OR the admin has assigned them
 * (any care-type column) OR they're the expert attached to one of the patient's
 * active packages — so an admin assignment grants access immediately, without
 * waiting for the first appointment. Kept consistent with patientIdsFor (the
 * caseload roster), so what a therapist can see and can act on always match.
 */
export async function ownsPatient(therapistProfileId: string, patientId: string): Promise<boolean> {
  try {
  const [appt, assigned, sub] = await Promise.all([
    prisma.appointment.findFirst({ where: { therapistId: therapistProfileId, patientId }, select: { id: true } }),
    prisma.patientProfile.findFirst({
      where: {
        userId: patientId,
        OR: [
          { assignedTherapistId: therapistProfileId },
          { assignedTherapistIndividualId: therapistProfileId },
          { assignedTherapistCouplesId: therapistProfileId },
          { assignedTherapistPsychiatryId: therapistProfileId },
        ],
      },
      select: { id: true },
    }),
    prisma.subscription.findFirst({ where: { userId: patientId, therapistId: therapistProfileId, status: 'ACTIVE' }, select: { id: true } }),
  ])
  return Boolean(appt || assigned || sub)
  } catch (e) {
    console.error('[ownsPatient] check failed (migrations applied?)', e)
    return false
  }
}

/** Trend over the most recent check-ins: average of the older half vs the newer half. */
export function moodTrendOf(moods: { mood: number; createdAt: Date }[]): MoodTrend {
  if (moods.length < 4) return 'insufficient'
  const sorted = [...moods].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  const mid = Math.floor(sorted.length / 2)
  const avg = (rows: typeof sorted) => rows.reduce((a, m) => a + m.mood, 0) / rows.length
  const older = avg(sorted.slice(0, mid))
  const newer = avg(sorted.slice(mid))
  const delta = newer - older
  if (delta <= -1) return 'declining'
  if (delta >= 1) return 'improving'
  return 'stable'
}

async function patientIdsFor(therapistProfileId: string): Promise<string[]> {
  // A therapist's caseload = everyone they have an appointment with, PLUS anyone
  // the admin has assigned to them (any care-type column) or attached to via an
  // active package. So an admin assignment surfaces the patient on the
  // therapist's dashboard right away, not only after the first session is booked.
  // Each source is queried independently and defensively: one failing must never
  // 500 the whole therapist portal. In particular the per-care-type assignment
  // columns need migration 0016 — on a DB that hasn't applied it, that query
  // throws P2022; we swallow it and still return the appointment/package-based
  // caseload rather than crashing the page.
  const ids = new Set<string>()
  try {
    const appts = await prisma.appointment.findMany({ where: { therapistId: therapistProfileId }, select: { patientId: true }, distinct: ['patientId'] })
    appts.forEach((r) => ids.add(r.patientId))
  } catch (e) {
    console.error('[patientIdsFor] appointments query failed', e)
  }
  try {
    const assigned = await prisma.patientProfile.findMany({
      where: {
        OR: [
          { assignedTherapistId: therapistProfileId },
          { assignedTherapistIndividualId: therapistProfileId },
          { assignedTherapistCouplesId: therapistProfileId },
          { assignedTherapistPsychiatryId: therapistProfileId },
        ],
      },
      select: { userId: true },
    })
    assigned.forEach((r) => ids.add(r.userId))
  } catch (e) {
    console.error('[patientIdsFor] assignment-column query failed (migration 0016 applied?)', e)
  }
  try {
    const subs = await prisma.subscription.findMany({ where: { therapistId: therapistProfileId, status: 'ACTIVE' }, select: { userId: true } })
    subs.forEach((r) => ids.add(r.userId))
  } catch (e) {
    console.error('[patientIdsFor] subscription query failed', e)
  }
  return [...ids]
}

export async function getCaseload(therapistProfileId: string): Promise<CaseloadPatient[]> {
  const patientIds = await patientIdsFor(therapistProfileId)
  if (!patientIds.length) return []

  // Narrow, explicit selects: never `SELECT *` a whole row here. It keeps the
  // caseload query resilient to schema columns that may not yet exist in a
  // given deployment's database (otherwise Prisma throws P2022 and the whole
  // portal page 500s).
  const [users, moods, crisis, subs, completed] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, name: true, email: true, createdAt: true, patientProfile: { select: { track: true, trackLabel: true, preferredLanguage: true, state: true } } },
    }),
    prisma.moodEntry.findMany({
      where: { userId: { in: patientIds } },
      orderBy: { createdAt: 'desc' },
      take: 30 * patientIds.length,
      select: { userId: true, mood: true, createdAt: true },
    }),
    prisma.crisisAlert.findMany({
      where: { userId: { in: patientIds }, resolved: false },
      select: { userId: true },
    }),
    prisma.subscription.findMany({
      where: { userId: { in: patientIds }, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: { userId: true, sessionsUsed: true, sessionsTotal: true, trackSlug: true },
    }),
    // Sessions this clinician actually completed with each patient.
    prisma.appointment.groupBy({
      by: ['patientId'],
      where: { patientId: { in: patientIds }, therapistId: therapistProfileId, status: 'COMPLETED' },
      _count: { _all: true },
    }),
  ])

  const doneByPatient = new Map(completed.map((c) => [c.patientId, c._count._all]))
  const tracksByUser = new Map<string, Set<string>>()
  for (const s of subs) {
    const set = tracksByUser.get(s.userId) ?? new Set<string>()
    set.add(s.trackSlug); tracksByUser.set(s.userId, set)
  }

  return users.map((u) => {
    const userMoods = moods.filter((m) => m.userId === u.id).slice(0, 14)
    const sub = subs.find((s) => s.userId === u.id)
    const tracks = tracksByUser.get(u.id)
    return {
      patientId: u.id,
      name: u.name ?? 'Patient',
      email: u.email ?? '',
      trackLabel: trackLabelFor(u.patientProfile?.track?.[0], u.patientProfile?.trackLabel),
      lastMood: userMoods[0]?.mood ?? null,
      moodTrend: moodTrendOf(userMoods),
      openCrisisCount: crisis.filter((c) => c.userId === u.id).length,
      sessionsDone: sub?.sessionsUsed ?? 0,
      sessionsTotal: sub?.sessionsTotal ?? 0,
      sessionsCompleted: doneByPatient.get(u.id) ?? 0,
      sessionsLeft: subs.filter((s) => s.userId === u.id).reduce((n, s) => n + Math.max(0, s.sessionsTotal - s.sessionsUsed), 0),
      packageTypes: tracks ? [...tracks] : [],
      language: u.patientProfile?.preferredLanguage ?? null,
      state: u.patientProfile?.state ?? null,
      monthsHere: Math.max(0, Math.floor((Date.now() - u.createdAt.getTime()) / (30.44 * 86400000))),
    }
  })
}

// ── Tasks assigned to this therapist (by an admin) ───────────────────────────

export type MyTask = {
  id: string
  title: string
  detail?: string
  frequencyLabel?: string
  timesLabel?: string
  dueLabel?: string
  assignedBy?: string
  done: boolean
  expired: boolean
}

/** Tasks an admin assigned to the signed-in clinician, newest first. */
export async function getMyAssignedTasks(therapistUserId: string): Promise<MyTask[]> {
  try {
    const rows = await prisma.task.findMany({
      where: { userId: therapistUserId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, title: true, description: true, frequency: true, timesOfDay: true, dueDate: true, completedAt: true, assignedBy: true },
    })
    const now = Date.now()
    return rows.map((t) => ({
      id: t.id,
      title: t.title,
      detail: t.description ?? undefined,
      frequencyLabel: frequencyChip(t.frequency),
      timesLabel: timesOfDayChip(t.timesOfDay),
      dueLabel: t.dueDate ? fmtIST(t.dueDate, { day: 'numeric', month: 'short' }) : undefined,
      assignedBy: t.assignedBy ?? undefined,
      done: isDoneForPeriod(t.completedAt, t.frequency),
      expired: Boolean(t.dueDate && !t.completedAt && t.dueDate.getTime() < now),
    }))
  } catch {
    return []
  }
}

// ── The clinician's task board ───────────────────────────────────────────────
// Two things land on a clinician's plate: session notes they owe for sessions
// they delivered, and tasks an admin sent them. Both surface here so there's one
// place to check rather than two half-lists on the dashboard.

export type NoteDueRow = {
  appointmentId: string
  patientId: string
  patientName: string
  dateLabel: string
  /** Whole days since the session ended — drives the "overdue" emphasis. */
  daysAgo: number
}

/**
 * Sessions this clinician owes a note for: delivered and paid, but unwritten.
 * Cancelled and voided sessions never appear — there's no session to write up,
 * and no pay riding on it. Oldest first, so the longest-overdue is at the top.
 */
export async function getSessionsNeedingNote(therapistProfileId: string): Promise<NoteDueRow[]> {
  try {
    // Settle anything that has just elapsed, so a session that ended minutes ago
    // is already COMPLETED (or voided) by the time we filter on status.
    await resolveDueAppointments({ therapistId: therapistProfileId })
    const rows = await prisma.appointment.findMany({
      where: { therapistId: therapistProfileId, status: 'COMPLETED', summary: null },
      orderBy: { scheduledAt: 'asc' },
      take: 50,
      select: { id: true, patientId: true, scheduledAt: true, patient: { select: { name: true } } },
    })
    const now = Date.now()
    return rows.map((r) => ({
      appointmentId: r.id,
      patientId: r.patientId,
      patientName: r.patient?.name ?? 'Patient',
      dateLabel: fmtIST(r.scheduledAt, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
      daysAgo: Math.max(0, Math.floor((now - r.scheduledAt.getTime()) / 86_400_000)),
    }))
  } catch {
    return []
  }
}

export type ExpertTaskCounts = { notesDue: number; adminOpen: number; total: number }

/**
 * What's open on the clinician's task board, for the sidebar badge. Kept to two
 * narrow counts so it can run on every page load in the layout.
 */
export async function getExpertTaskCounts(
  therapistProfileId: string,
  therapistUserId: string,
): Promise<ExpertTaskCounts> {
  try {
    const [notesDue, adminTasks] = await Promise.all([
      prisma.appointment.count({ where: { therapistId: therapistProfileId, status: 'COMPLETED', summary: null } }),
      getMyAssignedTasks(therapistUserId),
    ])
    const adminOpen = adminTasks.filter((t) => !t.done).length
    return { notesDue, adminOpen, total: notesDue + adminOpen }
  } catch {
    return { notesDue: 0, adminOpen: 0, total: 0 }
  }
}

/** Mark one of the therapist's own (admin-assigned) tasks done/undone. */
export async function toggleMyTask(therapistUserId: string, taskId: string, done: boolean): Promise<boolean> {
  try {
    const res = await prisma.task.updateMany({
      where: { id: taskId, userId: therapistUserId }, // ownership gate
      data: { completedAt: done ? new Date() : null },
    })
    return res.count > 0
  } catch {
    return false
  }
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function computeStreak(dates: Date[]): number {
  const days = new Set(dates.map(startOfDay))
  let streak = 0
  const cursor = new Date()
  if (!days.has(startOfDay(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(startOfDay(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Full profile for one patient, scoped to a patient actually assigned to this therapist. */
export async function getExpertPatientProfile(
  therapistProfileId: string,
  patientId: string
): Promise<ExpertPatientProfile | null> {
  // Ownership must match the caseload (patientIdsFor): a clinician owns a patient
  // if they have an appointment together, OR the admin assigned them (any
  // care-type column), OR they're attached via an active package. Otherwise a
  // patient who was assigned but hasn't booked yet 404s when the clinician opens
  // them, even though they show in the caseload list.
  let owns = false
  try {
    owns = !!(await prisma.appointment.findFirst({ where: { therapistId: therapistProfileId, patientId }, select: { id: true } }))
  } catch { /* ignore */ }
  if (!owns) {
    try {
      owns = !!(await prisma.patientProfile.findFirst({
        where: {
          userId: patientId,
          OR: [
            { assignedTherapistId: therapistProfileId },
            { assignedTherapistIndividualId: therapistProfileId },
            { assignedTherapistCouplesId: therapistProfileId },
            { assignedTherapistPsychiatryId: therapistProfileId },
          ],
        },
        select: { id: true },
      }))
    } catch { /* 0016 not applied */ }
  }
  if (!owns) {
    try {
      owns = !!(await prisma.subscription.findFirst({ where: { userId: patientId, therapistId: therapistProfileId, status: 'ACTIVE' }, select: { id: true } }))
    } catch { /* 0015 not applied */ }
  }
  if (!owns) return null

  // Every query is narrow-selected (only the columns actually used below) and
  // fail-soft (.catch → empty). On prod, a Prisma schema column not yet migrated
  // into the DB would otherwise make the generated SELECT throw and take the
  // whole page to the error boundary. Degrading a single query to empty keeps
  // the patient record rendering.
  const [user, profile, addr, moods, appts, tasks, meds, allAppts, sub, crisisCount, highStakeCount, journalCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: patientId }, select: { name: true, email: true, phone: true, createdAt: true, registrationNo: true } }).catch(() => null),
    prisma.patientProfile.findUnique({
      where: { userId: patientId },
      select: {
        track: true, trackLabel: true, diagnosis: true, therapyStatus: true,
        patientId: true, dateOfBirth: true, gender: true, preferredLanguage: true,
      },
    }).catch(() => null),
    // The 0038 contact columns, in their own query: bundling them above would
    // make an un-migrated DB lose the clinical fields too.
    prisma.patientProfile.findUnique({
      where: { userId: patientId },
      select: {
        occupation: true, maritalStatus: true, country: true, state: true, city: true,
        addressLine1: true, addressLine2: true, postalCode: true,
        emergencyName: true, emergencyPhone: true, emergencyRelation: true,
      },
    }).catch(() => null),
    prisma.moodEntry.findMany({ where: { userId: patientId }, orderBy: { createdAt: 'desc' }, take: 30, select: { userId: true, mood: true, createdAt: true } }).catch(() => []),
    prisma.appointment.findMany({
      where: { patientId, therapistId: therapistProfileId, OR: [{ summary: { not: null } }, { preSessionNote: { not: null } }] },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
      select: { id: true, scheduledAt: true, summary: true, preSessionNote: true },
    }).catch(() => []),
    prisma.task.findMany({
      where: { userId: patientId },
      select: { id: true, title: true, type: true, frequency: true, timesOfDay: true, dueDate: true, completedAt: true, createdAt: true },
    }).catch(() => []),
    prisma.medication.findMany({
      where: { userId: patientId },
      select: { id: true, name: true, dosage: true, frequency: true, durationDays: true, prescribedBy: true, active: true },
    }).catch(() => []),
    // All of the patient's sessions across every expert involved — so a
    // clinician sees the full history, not only their own (#notes). Ownership of
    // the patient is already gated above; notes from other experts render
    // read-only, the viewer only edits their own.
    prisma.appointment.findMany({
      where: { patientId },
      orderBy: { scheduledAt: 'desc' },
      take: 40,
      select: {
        id: true, scheduledAt: true, status: true, summary: true, therapistId: true,
        therapist: { select: { user: { select: { name: true } } } },
      },
    }).catch(() => []),
    // ALL active packages — session totals must aggregate across care types
    // (a patient may hold therapy + psychiatry), not just the most recent one.
    prisma.subscription.findMany({ where: { userId: patientId, status: 'ACTIVE' }, select: { sessionsUsed: true, sessionsTotal: true } }).catch(() => []),
    prisma.crisisAlert.count({ where: { userId: patientId, resolved: false } }).catch(() => 0),
    prisma.calmAiMessage.count({ where: { userId: patientId, highStake: true } }).catch(() => 0),
    prisma.journalEntry.count({ where: { userId: patientId } }).catch(() => 0),
  ])
  if (!user) return null

  const orders = await prisma.medicationOrder.findMany({
    where: { userId: patientId },
    orderBy: { createdAt: 'desc' },
    select: { medicationId: true, status: true, amount: true },
  }).catch(() => [] as { medicationId: string | null; status: string; amount: number }[])
  const latestOrderByMed = new Map<string, (typeof orders)[number]>()
  for (const o of orders) {
    if (o.medicationId && !latestOrderByMed.has(o.medicationId)) latestOrderByMed.set(o.medicationId, o)
  }

  const isoDate = (d: Date) => d.toISOString().slice(0, 10)
  const now = Date.now()
  const taskCompletionPct = tasks.length ? Math.round((tasks.filter((t) => t.completedAt).length / tasks.length) * 100) : 0
  // Proxy: no daily dose log exists yet, so compliance is approximated from active vs total prescriptions.
  const medicationCompliancePct = meds.length ? Math.round((meds.filter((m) => m.active).length / meds.length) * 100) : 0

  return {
    patientId,
    name: user.name ?? 'Patient',
    contact: {
      code: user.registrationNo ?? null,
      email: user.email ?? null,
      phone: user.phone ?? null,
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : null,
      gender: profile?.gender ?? null,
      preferredLanguage: profile?.preferredLanguage ?? null,
      occupation: addr?.occupation ?? null,
      maritalStatus: addr?.maritalStatus ?? null,
      country: addr?.country ?? 'IN',
      state: addr?.state ?? null,
      city: addr?.city ?? null,
      addressLine1: addr?.addressLine1 ?? null,
      addressLine2: addr?.addressLine2 ?? null,
      postalCode: addr?.postalCode ?? null,
      emergencyName: addr?.emergencyName ?? null,
      emergencyPhone: addr?.emergencyPhone ?? null,
      emergencyRelation: addr?.emergencyRelation ?? null,
      joinedLabel: user.createdAt ? fmtIST(user.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) : null,
    },
    trackLabel: trackLabelFor(profile?.track?.[0], profile?.trackLabel),
    diagnosis: profile?.diagnosis ?? undefined,
    therapyStatus: profile?.therapyStatus ?? undefined,
    streakDays: computeStreak(moods.map((m) => m.createdAt)),
    moodTrend: moodTrendOf(moods.slice(0, 14)),
    moodWeek: moods.slice(0, 14).reverse().map((m) => ({ date: isoDate(m.createdAt), mood: m.mood })),
    sessionNotes: appts.map((a) => ({
      date: isoDate(a.scheduledAt),
      raw: a.summary ?? a.preSessionNote ?? '',
    })),
    sessions: allAppts.map((a) => ({
      id: a.id,
      dateLabel: fmtIST(a.scheduledAt, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }),
      status: a.status,
      isPast: a.scheduledAt.getTime() < now,
      payable: isPayableSession(a.status),
      summary: a.summary ?? null,
      author: a.therapist?.user?.name ?? 'Clinician',
      isOwn: a.therapistId === therapistProfileId,
    })),
    sessionsDone: sub.reduce((n, s) => n + s.sessionsUsed, 0),
    sessionsTotal: sub.reduce((n, s) => n + s.sessionsTotal, 0),
    sessionsRemaining: sub.reduce((n, s) => n + Math.max(0, s.sessionsTotal - s.sessionsUsed), 0),
    taskCompletionPct,
    tasks: tasks
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        frequencyLabel: frequencyChip(t.frequency),
        timesLabel: timesOfDayChip(t.timesOfDay),
        dueLabel: t.dueDate ? fmtIST(t.dueDate, { day: 'numeric', month: 'short' }) : undefined,
        done: isDoneForPeriod(t.completedAt, t.frequency),
        expired: Boolean(t.dueDate && !t.completedAt && t.dueDate.getTime() < now),
      })),
    medicationCompliancePct,
    medications: meds.map((m) => {
      const order = latestOrderByMed.get(m.id)
      return {
        id: m.id,
        name: m.name,
        dosage: m.dosage ?? undefined,
        frequency: m.frequency ?? undefined,
        durationDays: m.durationDays ?? undefined,
        prescribedBy: m.prescribedBy ?? undefined,
        active: m.active,
        orderStatusLabel: order ? STATUS_LABEL[order.status] ?? order.status : undefined,
        orderAmount: order?.amount,
      }
    }),
    openCrisisCount: crisisCount,
    highStakeChatCount: highStakeCount,
    journalCount,
  }
}

export async function getRiskNotifications(therapistProfileId: string): Promise<RiskNotification[]> {
  try {
    return await computeRiskNotifications(therapistProfileId)
  } catch {
    // This runs in the expert layout; a query failure must not take down the
    // whole portal. Degrade to "no alerts" and let the page render.
    return []
  }
}

async function computeRiskNotifications(therapistProfileId: string): Promise<RiskNotification[]> {
  const patientIds = await patientIdsFor(therapistProfileId)
  if (!patientIds.length) return []

  const [alerts, users, moods] = await Promise.all([
    prisma.crisisAlert.findMany({ where: { userId: { in: patientIds }, resolved: false }, orderBy: { createdAt: 'desc' } }),
    prisma.user.findMany({ where: { id: { in: patientIds } }, select: { id: true, name: true } }),
    prisma.moodEntry.findMany({ where: { userId: { in: patientIds } }, orderBy: { createdAt: 'desc' } }),
  ])
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? 'Patient'

  const crisisNotifs: RiskNotification[] = alerts.map((a) => ({
    id: a.id,
    kind: 'crisis',
    patientId: a.userId,
    patientName: a.patientName ?? nameOf(a.userId),
    message: a.label === 'CRISIS' ? 'Crisis-flagged chat message' : 'Distress-flagged chat message',
    detail: a.handoffNote,
    createdAt: a.createdAt,
    resolved: a.resolved,
  }))

  const declineNotifs: RiskNotification[] = patientIds
    .map((pid) => {
      const userMoods = moods.filter((m) => m.userId === pid).slice(0, 14)
      if (moodTrendOf(userMoods) !== 'declining') return null
      const latest = userMoods[0]
      const notif: RiskNotification = {
        id: `decline-${pid}`,
        kind: 'mood_decline',
        patientId: pid,
        patientName: nameOf(pid),
        message: 'Consistent mood decline detected',
        detail: `Mood trending down over the last ${userMoods.length} check-ins (latest: ${latest?.mood ?? 'n/a'}/10).`,
        createdAt: latest?.createdAt ?? new Date(),
        resolved: false,
      }
      return notif
    })
    .filter((n): n is RiskNotification => n !== null)

  return [...crisisNotifs, ...declineNotifs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function resolveCrisisAlert(therapistProfileId: string, alertId: string): Promise<boolean> {
  const alert = await prisma.crisisAlert.findUnique({ where: { id: alertId } })
  if (!alert) return false
  const owns = await prisma.appointment.findFirst({ where: { therapistId: therapistProfileId, patientId: alert.userId } })
  if (!owns) return false
  await prisma.crisisAlert.update({ where: { id: alertId }, data: { resolved: true } })
  return true
}

// ── Scheduling ────────────────────────────────────────────────────────────────

export type ScheduleAppointment = {
  id: string
  patientId: string
  patientName: string
  scheduledAt: Date
  durationMins: number
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
  fee: number
  roomId: string | null
  meetLink: string | null
  hasSummary: boolean
  isPast: boolean
  /** Whether this session counts towards the clinician's pay — see `payableStatus`. */
  payable: boolean
  /** A clinical note is owed: the session was delivered and paid, but unwritten. */
  needsNote: boolean
  // What the patient wrote before the session — shown by the Join button so the
  // clinician can read it before entering the room.
  preSessionNote: string | null
  // Clinician asked to cancel this session; it stays live until an admin approves.
  cancelRequested: boolean
  cancelReason: string | null
  // Whether the clinician has already joined this room once (drives re-entry).
  joinedThisSide: boolean
  // At-a-glance patient signals for the pre-session brief near the Join button.
  tasksOpen: number
  tasksTotal: number
  medAdherencePct: number
  medActive: number
  medTotal: number
  journalCount: number
}

/**
 * Whether a session counts towards the clinician's pay. Settlement
 * (resolveDueAppointments) leaves every elapsed session either COMPLETED — both
 * sides attended, or the patient no-showed after the clinician waited out the
 * 15-minute window — or CANCELLED, which is every unpaid outcome: cancelled
 * ahead of time, voided and refunded, or nobody joined. The earnings ledger
 * pays on COMPLETED only, so that single status is the whole rule.
 */
export function isPayableSession(status: string): boolean {
  return status === 'COMPLETED'
}

/**
 * A session note is owed only where the clinician is being paid. There is
 * nothing to write up for a session that never happened, and asking for notes on
 * cancelled and voided sessions buried the ones that actually matter.
 */
export function sessionNeedsNote(a: { status: string; hasSummary: boolean }): boolean {
  return isPayableSession(a.status) && !a.hasSummary
}

/** Every appointment on this therapist's calendar, most recent first. */
export async function getTherapistSchedule(therapistProfileId: string): Promise<ScheduleAppointment[]> {
  // Settle any elapsed sessions (no-shows / auto-complete) before reading, so the
  // clinician's schedule and pay reflect the true outcome.
  await resolveDueAppointments({ therapistId: therapistProfileId })
  const rows = await prisma.appointment.findMany({
    where: { therapistId: therapistProfileId },
    orderBy: { scheduledAt: 'asc' },
    include: { patient: { select: { name: true } } },
  })

  // Per-patient signals (tasks left, medication adherence, journals written) in
  // three batched queries, keyed by patient — so each session row can show a
  // pre-session brief without an N+1 fan-out. All fail-soft.
  const patientIds = [...new Set(rows.map((r) => r.patientId))]
  const [tasks, meds, journals] = await Promise.all([
    patientIds.length
      ? prisma.task.findMany({ where: { userId: { in: patientIds } }, select: { userId: true, completedAt: true } }).catch(() => [])
      : [],
    patientIds.length
      ? prisma.medication.findMany({ where: { userId: { in: patientIds } }, select: { userId: true, active: true } }).catch(() => [])
      : [],
    patientIds.length
      ? prisma.journalEntry.groupBy({ by: ['userId'], where: { userId: { in: patientIds } }, _count: { _all: true } }).catch(() => [] as { userId: string; _count: { _all: number } }[])
      : [],
  ])
  const taskStat = new Map<string, { open: number; total: number }>()
  for (const t of tasks) {
    const s = taskStat.get(t.userId) ?? { open: 0, total: 0 }
    s.total += 1
    if (!t.completedAt) s.open += 1
    taskStat.set(t.userId, s)
  }
  const medStat = new Map<string, { active: number; total: number }>()
  for (const m of meds) {
    const s = medStat.get(m.userId) ?? { active: 0, total: 0 }
    s.total += 1
    if (m.active) s.active += 1
    medStat.set(m.userId, s)
  }
  const journalCountBy = new Map<string, number>(journals.map((j) => [j.userId, j._count._all]))

  const now = Date.now()
  return rows.map((r) => {
    const ts = taskStat.get(r.patientId) ?? { open: 0, total: 0 }
    const ms = medStat.get(r.patientId) ?? { active: 0, total: 0 }
    const hasSummary = Boolean(r.summary)
    return {
      id: r.id,
      patientId: r.patientId,
      patientName: r.patient.name ?? 'Patient',
      scheduledAt: r.scheduledAt,
      durationMins: r.durationMins,
      status: r.status,
      fee: r.fee,
      roomId: r.roomId,
      meetLink: r.meetLink,
      hasSummary,
      payable: isPayableSession(r.status),
      needsNote: sessionNeedsNote({ status: r.status, hasSummary }),
      // "Past" only once the whole session window has elapsed (or it's completed)
      // — NOT the instant the start time is reached. Otherwise a session flips to
      // "write notes" at its start and the clinician loses the Join button while
      // the session is meant to be live. Mirrors the patient side.
      isPast: r.status === 'COMPLETED' || r.scheduledAt.getTime() + r.durationMins * 60_000 < now,
      preSessionNote: r.preSessionNote ?? null,
      cancelRequested: r.cancelRequested ?? false,
      cancelReason: r.cancelReason ?? null,
      joinedThisSide: Boolean(r.therapistJoinedAt),
      tasksOpen: ts.open,
      tasksTotal: ts.total,
      medActive: ms.active,
      medTotal: ms.total,
      medAdherencePct: ms.total ? Math.round((ms.active / ms.total) * 100) : 0,
      journalCount: journalCountBy.get(r.patientId) ?? 0,
    }
  })
}

export type ExpertRoom = {
  roomId: string; patientName: string; therapistName: string; when: string
  scheduledISO: string; durationMins: number; status: string; joinedThisSide: boolean
}

/**
 * Resolve a session room for the clinician's OWN video route. The patient room
 * lives under the patient-only /app layout (which redirects clinicians away), so
 * the expert needs its own route — this scopes the lookup to the therapist and
 * returns the shared roomId both sides connect to.
 */
export async function getExpertRoom(therapistProfileId: string, appointmentId: string): Promise<ExpertRoom | null> {
  const appt = await prisma.appointment.findFirst({
    where: { OR: [{ id: appointmentId }, { roomId: appointmentId }], therapistId: therapistProfileId },
    select: {
      id: true, roomId: true, scheduledAt: true, durationMins: true, status: true, therapistJoinedAt: true,
      patient: { select: { name: true } },
      therapist: { select: { user: { select: { name: true } } } },
    },
  })
  if (!appt) return null
  return {
    roomId: appt.roomId ?? appt.id,
    patientName: appt.patient?.name ?? 'Patient',
    therapistName: appt.therapist?.user?.name ?? 'Clinician',
    when: fmtIST(appt.scheduledAt, { weekday: 'long', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
    scheduledISO: appt.scheduledAt.toISOString(),
    durationMins: appt.durationMins,
    status: appt.status,
    joinedThisSide: Boolean(appt.therapistJoinedAt),
  }
}

/**
 * Clinician asks to cancel a session. This does NOT cancel it — it flags the
 * appointment for admin approval and records the reason. The session stays live
 * (patient still sees it) until an admin approves or rejects the request. Only
 * upcoming, non-terminal appointments can be flagged.
 */
export async function requestAppointmentCancellation(
  therapistProfileId: string,
  appointmentId: string,
  reason: string
): Promise<boolean> {
  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, therapistId: therapistProfileId },
    select: {
      id: true, status: true, scheduledAt: true,
      patient: { select: { name: true } },
      therapist: { select: { user: { select: { name: true } } } },
    },
  })
  if (!appt) return false
  if (appt.status === 'CANCELLED' || appt.status === 'COMPLETED') return false
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { cancelRequested: true, cancelReason: reason.trim() || null, cancelRequestedAt: new Date() },
  })
  // The session stays on the patient's calendar until an admin decides, so the
  // request is useless unless somebody is told it exists.
  await notifyCancellationRequest(
    appt.therapist?.user?.name ?? 'A clinician',
    appt.patient?.name ?? 'Patient',
    fmtIST(appt.scheduledAt, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
  )
  return true
}

/** Whether the appointment belongs to this therapist (ownership gate for mutations). */
async function ownsAppointment(therapistProfileId: string, appointmentId: string) {
  return prisma.appointment.findFirst({ where: { id: appointmentId, therapistId: therapistProfileId } })
}

export async function setAppointmentStatus(
  therapistProfileId: string,
  appointmentId: string,
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
): Promise<boolean> {
  const appt = await ownsAppointment(therapistProfileId, appointmentId)
  if (!appt) return false
  await prisma.appointment.update({ where: { id: appointmentId }, data: { status } })
  return true
}


/** Minimum minutes both sides must have been in the room to count as completed
 *  (per care type — 30 for therapy/couples, 10 for psychiatry). */
export const MIN_SESSION_MINUTES = 30

export async function writeSessionSummary(
  therapistProfileId: string,
  appointmentId: string,
  summary: string
): Promise<boolean> {
  await ensureSessionPresenceSchema()
  const appt = await ownsAppointment(therapistProfileId, appointmentId)
  if (!appt) return false

  const prof = await prisma.therapistProfile.findUnique({ where: { id: therapistProfileId }, select: { clinicianType: true, specializations: true } })
  const psych = isPsychiatrist(prof?.clinicianType ?? null, prof?.specializations ?? [])

  // A session is COMPLETED (paid + counted) only when both sides joined AND were
  // actually together — by the room heartbeat — for at least the minimum billable
  // time. A 2-minute call therefore saves the note but stays un-completed. This
  // measures REAL presence, not the scheduled window or "now minus join".
  const p = computePresence(appt)
  const eligible = p.bothJoined && p.minutesTogether >= sessionMinMinutes(psych)

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      summary,
      status: eligible ? 'COMPLETED' : appt.status,
    },
  })
  return true
}

// ── Medication (psychiatrist) ────────────────────────────────────────────────

/** Confirm the caller is a prescribing psychiatrist who owns this patient. */
async function canPrescribe(therapistProfileId: string, patientId: string): Promise<boolean> {
  const profile = await prisma.therapistProfile.findUnique({
    where: { id: therapistProfileId },
    select: { specializations: true },
  })
  if (!profile || !looksPsychiatric(profile.specializations)) return false
  return ownsPatient(therapistProfileId, patientId)
}

export type PrescribeInput = {
  name: string
  dosage?: string
  frequency?: string
  times?: string[]
  durationDays?: number | null
  notes?: string
}

/** Prescribe a new medication for a patient. Psychiatrists only; ownership-gated.
 * Also drops an in-app notification so the patient sees the new prescription and
 * can order a home delivery. */
export async function prescribeMedication(
  therapistProfileId: string,
  prescriberName: string | null,
  patientId: string,
  input: PrescribeInput
): Promise<boolean> {
  const name = input.name.trim()
  if (!name) return false
  if (!(await canPrescribe(therapistProfileId, patientId))) return false
  const durationDays =
    input.durationDays != null && Number.isFinite(input.durationDays) && input.durationDays > 0
      ? Math.round(input.durationDays)
      : null
  const med = await prisma.medication.create({
    data: {
      userId: patientId,
      name,
      dosage: input.dosage?.trim() || null,
      frequency: input.frequency?.trim() || null,
      times: (input.times ?? []).map((t) => t.trim()).filter(Boolean),
      durationDays,
      notes: input.notes?.trim() || null,
      prescribedBy: prescriberName ?? null,
      startedAt: new Date(),
      active: true,
    },
  })
  await prisma.notification.create({
    data: {
      userId: patientId,
      type: 'prescription',
      title: `New prescription: ${name}${med.dosage ? ` ${med.dosage}` : ''}`,
      body: `${prescriberName ?? 'Your psychiatrist'} issued an e-prescription${
        durationDays ? ` for ${durationDays} days` : ''
      } (valid 1 week). Download it or order a home delivery from your Medications page.`,
      href: '/app/medications',
    },
  })
  return true
}

/** Discontinue or reactivate a prescription. Psychiatrists only; ownership-gated. */
export async function setMedicationActive(
  therapistProfileId: string,
  medicationId: string,
  active: boolean
): Promise<boolean> {
  const med = await prisma.medication.findUnique({ where: { id: medicationId }, select: { userId: true } })
  if (!med) return false
  if (!(await canPrescribe(therapistProfileId, med.userId))) return false
  await prisma.medication.update({
    where: { id: medicationId },
    data: { active, endedAt: active ? null : new Date() },
  })
  return true
}

// ── Earnings ──────────────────────────────────────────────────────────────────
// A practical, statement-style ledger. Every completed, note-written session is
// one line, priced from the pay structure. No "pending payout" abstraction: a
// session either counts (completed + note written) or it does not yet.

/** One paid session on the ledger. */
export type EarningLine = {
  id: string
  dateIso: string // YYYY-MM-DD, for grouping
  dayLabel: string // e.g. "Fri, 12 Jun 2026"
  timeLabel: string // e.g. "7:00 PM"
  monthKey: string // YYYY-MM
  monthLabel: string // e.g. "June 2026"
  year: number
  patientName: string
  service: ServiceType
  serviceLabel: string
  sessionNumber: number
  night: boolean
  base: number
  numberBonus: number
  nightBonus: number
  misc: number
  amount: number
}

export type Earnings = {
  totalEarned: number
  totalSessions: number
  thisMonthTotal: number
  thisMonthSessions: number
  config: EarningsConfigValues
  /** Every paid session, most recent first. The client groups these by day/month/year. */
  lines: EarningLine[]
}

/** The service type for a session, from the clinician's role and the patient's care mode. */
function serviceTypeOf(isPsychiatrist: boolean, careMode: string | null | undefined): ServiceType {
  if (isPsychiatrist) return 'psychiatry'
  if (careMode === 'COUPLE') return 'couples'
  return 'individual'
}

export async function getTherapistEarnings(therapistProfileId: string): Promise<Earnings> {
  const [profile, rows, globalConfig] = await Promise.all([
    prisma.therapistProfile.findUnique({
      where: { id: therapistProfileId },
      select: {
        specializations: true,
        baseFeeIndividual: true, baseFeeCouples: true, baseFeePsychiatry: true,
        secondSessionBonus: true, thirdOnwardsBonus: true, miscBonus: true, nightSessionBonus: true,
      },
    }),
    prisma.appointment.findMany({
      where: { therapistId: therapistProfileId, status: 'COMPLETED', summary: { not: null } },
      orderBy: { scheduledAt: 'asc' },
      include: { patient: { select: { name: true, patientProfile: { select: { careMode: true } } } } },
    }),
    getEarningsConfig(),
  ])
  const isPsych = looksPsychiatric(profile?.specializations ?? [])
  // Apply this clinician's per-therapist overrides on top of the platform config.
  const config = effectiveEarningsConfig(globalConfig, profile)

  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const seenPerPatient = new Map<string, number>()
  const lines: EarningLine[] = []

  // Chronological pass so the per-patient session ordinal (which drives the
  // 2nd / 3rd-onwards bonus) reflects real continuity with each patient.
  for (const r of rows) {
    const ordinal = (seenPerPatient.get(r.patientId) ?? 0) + 1
    seenPerPatient.set(r.patientId, ordinal)
    const service = serviceTypeOf(isPsych, r.patient.patientProfile?.careMode)
    const night = isNightSession(r.scheduledAt)
    const base = baseFeeFor(config, service)
    const numberBonus = numberBonusFor(config, ordinal)
    const nightBonus = night ? config.nightSessionBonus : 0
    const misc = config.miscBonus
    const d = r.scheduledAt

    lines.push({
      id: r.id,
      dateIso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayLabel: fmtIST(d, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      timeLabel: fmtIST(d, { hour: 'numeric', minute: '2-digit' }),
      monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      monthLabel: fmtIST(d, { month: 'long', year: 'numeric' }),
      year: d.getFullYear(),
      patientName: r.patient.name ?? 'Patient',
      service,
      serviceLabel: SERVICE_LABEL[service],
      sessionNumber: ordinal,
      night,
      base,
      numberBonus,
      nightBonus,
      misc,
      amount: sessionPay(config, service, ordinal, night),
    })
  }

  const totalEarned = lines.reduce((s, l) => s + l.amount, 0)
  const thisMonthLines = lines.filter((l) => l.monthKey === thisMonthKey)

  return {
    totalEarned,
    totalSessions: lines.length,
    thisMonthTotal: thisMonthLines.reduce((s, l) => s + l.amount, 0),
    thisMonthSessions: thisMonthLines.length,
    config,
    lines: lines.reverse(), // most recent first for display
  }
}

// ── AI co-pilot: pre-session briefs & note drafting ──────────────────────────

const BRIEF_PROMPT =
  'You are an AI co-pilot for a licensed therapist preparing for a session. Given the structured ' +
  'patient data below, write a concise pre-session brief (max 120 words) covering: mood trend, ' +
  "any homework/task follow-up needed, notable journal themes, and one suggested focus for today's " +
  'session. Plain prose, no headings, no markdown. Be specific, not generic.'

/** AI-drafted pre-session brief from this patient's recent signals. Returns null without an LLM key. */
export async function generatePreSessionBrief(
  therapistProfileId: string,
  patientId: string
): Promise<string | null> {
  if (!hasLlm()) return null
  const p = await getExpertPatientProfile(therapistProfileId, patientId)
  if (!p) return null

  const moodLine = p.moodWeek.length
    ? `Mood last ${p.moodWeek.length} check-ins: ${p.moodWeek.map((m) => m.mood).join(', ')} (trend: ${p.moodTrend}).`
    : 'No recent mood check-ins.'
  const taskLine = p.tasks.length
    ? `Tasks: ${p.tasks.map((t) => `${t.title} (${t.done ? 'done' : t.expired ? 'overdue' : 'open'})`).join('; ')}.`
    : 'No tasks assigned.'
  const lastNote = p.sessionNotes[0]?.raw
  const noteLine = lastNote ? `Last session note: ${lastNote}` : 'No prior session note on file.'
  const dx = p.diagnosis ? `Working diagnosis: ${p.diagnosis}.` : ''

  const input = [`Patient track: ${p.trackLabel}.`, dx, moodLine, taskLine, noteLine].filter(Boolean).join('\n')

  const res = await callModel(SYNTH_MODEL, BRIEF_PROMPT, [{ role: 'user', content: input }], {
    temperature: 0.4,
    maxTokens: 200,
  })
  return res.answer
}

const NOTE_PROMPT =
  'You are an AI co-pilot drafting a therapy session note for a licensed therapist to review and edit. ' +
  "Given the therapist's brief bullet points below, write a structured clinical session summary " +
  '(max 100 words) covering: what was discussed, technique/approach used, and homework assigned if any. ' +
  'Plain prose, third person about the patient, no headings, no markdown. The therapist will edit this ' +
  'before saving, write a solid draft, not a placeholder.'

/** AI-drafted session note from the therapist's quick bullet points. Returns null without an LLM key. */
export async function draftSessionNote(bullets: string): Promise<string | null> {
  if (!hasLlm() || !bullets.trim()) return null
  const res = await callModel(SYNTH_MODEL, NOTE_PROMPT, [{ role: 'user', content: bullets.trim() }], {
    temperature: 0.5,
    maxTokens: 180,
  })
  return res.answer
}

// ── Availability ──────────────────────────────────────────────────────────────

/** The four named shift bands. Each is a set of 1-hour slot start-hours (IST). */
// Contiguous and gap-free across the WHOLE day, so every hour belongs to exactly
// one shift. Each `hours` entry is a slot START hour, so the last usable
// band-hour is the one whose slot ends at the band's stated end time (e.g. the
// 11 AM slot runs 11 AM–12 PM). Keep these ranges touching — a missing hour here
// becomes an unbookable gap on the patient calendar.
//
// The night band is exactly the window that earns the night bonus
// (isNightSession: 11 PM–6 AM), so a clinician offering a "Night" hour is always
// paid the night rate for it. They used to disagree: the old band ran 9 PM–12 AM
// while the bonus started at 11 PM, so 9 and 10 PM slots were labelled "Night"
// and paid no night bonus, and midnight–6 AM couldn't be offered at all.
//
// Hours are wall-clock hours of the weekday they're ticked on, so the
// after-midnight part of a night shift belongs to that same calendar day — see
// NIGHT_SHIFT_NOTE, which says so in the UI.
export const SLOT_GROUPS = {
  morning: { label: 'Morning · 6 AM–12 PM', hours: [6, 7, 8, 9, 10, 11] },
  afternoon: { label: 'Afternoon · 12–5 PM', hours: [12, 13, 14, 15, 16] },
  evening: { label: 'Evening · 5–11 PM', hours: [17, 18, 19, 20, 21, 22] },
  night: { label: 'Night · 11 PM–6 AM', hours: [23, 0, 1, 2, 3, 4, 5] },
} as const

/** Shown under the night band so the after-midnight hours aren't ambiguous. */
export const NIGHT_SHIFT_NOTE =
  'Night hours earn the night bonus. Times after midnight are hours of the day you tick — 1 AM on Monday means Monday 1 AM.'
export type SlotGroup = keyof typeof SLOT_GROUPS
export const SLOT_GROUP_KEYS = Object.keys(SLOT_GROUPS) as SlotGroup[]

export const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export type DayAvailability = { dayOfWeek: number; hours: number[] }
export type AvailabilityExceptionView = {
  id: string
  date: Date
  dateLabel: string
  fullDayOff: boolean
  hoursOff: number[]
}

/** The therapist's weekly template as one row per weekday (missing days = closed). */
export async function getAvailability(therapistProfileId: string): Promise<DayAvailability[]> {
  const rows = await prisma.therapistAvailability.findMany({
    where: { therapistId: therapistProfileId },
    orderBy: { dayOfWeek: 'asc' },
  })
  const byDay = new Map(rows.map((r) => [r.dayOfWeek, [...r.hours].sort((a, b) => a - b)]))
  return Array.from({ length: 7 }, (_, d) => ({ dayOfWeek: d, hours: byDay.get(d) ?? [] }))
}

/** Set (replace) the enabled hours for one weekday. Empty array closes the day. */
export async function setDayAvailability(
  therapistProfileId: string,
  dayOfWeek: number,
  hours: number[]
): Promise<void> {
  if (dayOfWeek < 0 || dayOfWeek > 6) return
  const clean = [...new Set(hours.filter((h) => h >= 0 && h <= 23))].sort((a, b) => a - b)
  await prisma.therapistAvailability.upsert({
    where: { therapistId_dayOfWeek: { therapistId: therapistProfileId, dayOfWeek } },
    update: { hours: clean },
    create: { therapistId: therapistProfileId, dayOfWeek, hours: clean },
  })
}

/** Apply the same set of hours to every day of the week (the "map to all days" action). */
export async function setAllDaysAvailability(therapistProfileId: string, hours: number[]): Promise<void> {
  for (let d = 0; d < 7; d++) await setDayAvailability(therapistProfileId, d, hours)
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

// Minimum lead time before a slot can be booked (patient side).
export const MIN_BOOKING_LEAD_MS = 6 * 60 * 60 * 1000

/**
 * The therapist a patient is assigned to: the one on their appointments (most
 * recent wins), or the first active therapist for a patient with none yet. Both
 * the bookable calendar and the booking action use this, so what a patient sees
 * and what they book are always the same clinician.
 */
export async function getAssignedTherapistId(patientUserId: string): Promise<string | null> {
  // A GENUINE assignment only. We deliberately do NOT fall back to "the first
  // active therapist on the platform": that made the booking flow's
  // require-assessment gate unreachable (a patient with no assessment still
  // resolved to some arbitrary clinician) and attached a clinician who need not
  // match the patient's care type. Resolution order:
  //   1. admin-set global default
  //   2. any per-care-type assignment (what auto-match writes)
  //   3. a clinician attached to an active package
  //   4. someone the patient already has an appointment with
  // …and null when there is truly no assignment, so callers can require the
  // assessment / a purchase instead of silently picking a stranger.
  try {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: patientUserId },
      select: {
        assignedTherapistId: true,
        assignedTherapistIndividualId: true,
        assignedTherapistCouplesId: true,
        assignedTherapistPsychiatryId: true,
      },
    })
    const fromProfile =
      profile?.assignedTherapistId ??
      profile?.assignedTherapistIndividualId ??
      profile?.assignedTherapistCouplesId ??
      profile?.assignedTherapistPsychiatryId ??
      null
    if (fromProfile) return fromProfile
    const sub = await prisma.subscription.findFirst({
      where: { userId: patientUserId, status: 'ACTIVE', therapistId: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { therapistId: true },
    })
    if (sub?.therapistId) return sub.therapistId
    const appt = await prisma.appointment.findFirst({
      where: { patientId: patientUserId },
      orderBy: { scheduledAt: 'desc' },
      select: { therapistId: true },
    })
    return appt?.therapistId ?? null
  } catch (e) {
    // Never 500 a page over a resolution query — e.g. an un-migrated DB missing
    // the per-care-type assignment columns. Degrade to "no assignment".
    console.error('[getAssignedTherapistId] resolution failed (migrations applied?)', e)
    return null
  }
}

/**
 * Whether a patient is allowed to book with a specific clinician: their
 * admin-assigned expert, an expert attached to one of their active packages, or
 * someone they already have an appointment with. Guards the `?with=` booking
 * param so a patient can't book against an arbitrary clinician.
 */
export async function canPatientBookWith(patientUserId: string, therapistProfileId: string): Promise<boolean> {
  if (!therapistProfileId) return false
  try {
    const [profile, sub, appt] = await Promise.all([
      prisma.patientProfile.findUnique({
        where: { userId: patientUserId },
        select: { assignedTherapistId: true, assignedTherapistIndividualId: true, assignedTherapistCouplesId: true, assignedTherapistPsychiatryId: true },
      }),
      prisma.subscription.findFirst({ where: { userId: patientUserId, status: 'ACTIVE', therapistId: therapistProfileId }, select: { id: true } }),
      prisma.appointment.findFirst({ where: { patientId: patientUserId, therapistId: therapistProfileId }, select: { id: true } }),
    ])
    const assigned = [
      profile?.assignedTherapistId,
      profile?.assignedTherapistIndividualId,
      profile?.assignedTherapistCouplesId,
      profile?.assignedTherapistPsychiatryId,
    ]
    return assigned.includes(therapistProfileId) || Boolean(sub) || Boolean(appt)
  } catch (e) {
    // Never 500 the booking page over this (e.g. per-care-type columns missing on
    // an un-migrated DB). Fall back to package/appointment ownership only.
    console.error('[canPatientBookWith] failed (migration 0016 applied?)', e)
    try {
      const [sub, appt] = await Promise.all([
        prisma.subscription.findFirst({ where: { userId: patientUserId, status: 'ACTIVE', therapistId: therapistProfileId }, select: { id: true } }),
        prisma.appointment.findFirst({ where: { patientId: patientUserId, therapistId: therapistProfileId }, select: { id: true } }),
      ])
      return Boolean(sub) || Boolean(appt)
    } catch {
      return false
    }
  }
}

/** Upcoming date-specific exceptions, soonest first. */
export async function getAvailabilityExceptions(therapistProfileId: string): Promise<AvailabilityExceptionView[]> {
  const rows = await prisma.availabilityException.findMany({
    where: { therapistId: therapistProfileId, date: { gte: startOfUtcDay(new Date()) } },
    orderBy: { date: 'asc' },
  })
  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    dateLabel: fmtIST(r.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    fullDayOff: r.fullDayOff,
    hoursOff: [...r.hoursOff].sort((a, b) => a - b),
  }))
}

/** Add or replace an exception for a specific date. Empty hoursOff + fullDayOff blocks the whole day. */
export async function addAvailabilityException(
  therapistProfileId: string,
  date: Date,
  opts: { fullDayOff: boolean; hoursOff?: number[] }
): Promise<void> {
  if (Number.isNaN(date.getTime())) return
  const day = startOfUtcDay(date)
  const hoursOff = [...new Set((opts.hoursOff ?? []).filter((h) => h >= 0 && h <= 23))].sort((a, b) => a - b)
  await prisma.availabilityException.upsert({
    where: { therapistId_date: { therapistId: therapistProfileId, date: day } },
    update: { fullDayOff: opts.fullDayOff, hoursOff },
    create: { therapistId: therapistProfileId, date: day, fullDayOff: opts.fullDayOff, hoursOff },
  })
}

export async function removeAvailabilityException(therapistProfileId: string, exceptionId: string): Promise<void> {
  const ex = await prisma.availabilityException.findFirst({
    where: { id: exceptionId, therapistId: therapistProfileId },
  })
  if (ex) await prisma.availabilityException.delete({ where: { id: exceptionId } })
}

export type BookableSlot = { iso: string; dateLabel: string; time: string; taken: boolean }

/**
 * The therapist's real bookable slots over the next `daysAhead` days: the weekly
 * template, minus date exceptions, minus slots already booked, future only.
 * This is what the patient's booking calendar reads.
 */
export async function getBookableSlots(therapistProfileId: string, daysAhead = 21): Promise<BookableSlot[]> {
  const [template, exceptions, booked, prof] = await Promise.all([
    getAvailability(therapistProfileId),
    prisma.availabilityException.findMany({
      where: { therapistId: therapistProfileId, date: { gte: startOfUtcDay(new Date()) } },
    }),
    prisma.appointment.findMany({
      where: { therapistId: therapistProfileId, scheduledAt: { gte: new Date() }, status: { not: 'CANCELLED' } },
      select: { scheduledAt: true },
    }),
    prisma.therapistProfile.findUnique({ where: { id: therapistProfileId }, select: { clinicianType: true, specializations: true } }),
  ])
  // Psychiatrists run shorter sessions, so they offer two slots per available
  // hour (:00 and :30); therapists offer one per hour.
  const psych = isPsychiatrist(prof?.clinicianType ?? null, prof?.specializations ?? [])
  const minutesInHour = psych ? [0, 30] : [0]
  const hoursByDay = new Map(template.map((t) => [t.dayOfWeek, t.hours]))
  const exByDay = new Map(exceptions.map((e) => [startOfUtcDay(e.date).getTime(), e]))
  const takenMs = new Set(booked.map((b) => b.scheduledAt.getTime()))

  const slots: BookableSlot[] = []
  // Patients must book at least 6 hours out, so a slot is never "already over"
  // by the time an expert sees the request.
  const earliest = Date.now() + MIN_BOOKING_LEAD_MS
  // Build slots against the IST calendar so an hour of availability means that
  // hour in India (not the UTC server clock). Start from today's IST date.
  const today = istParts(new Date())
  for (let d = 0; d < daysAhead; d++) {
    // The IST calendar day, d days from today (UTC arithmetic keeps the date
    // rolling correctly across month boundaries).
    const dayUtc = new Date(Date.UTC(today.year, today.month, today.day + d))
    const dow = dayUtc.getUTCDay()
    const y = dayUtc.getUTCFullYear()
    const mo = dayUtc.getUTCMonth()
    const dd = dayUtc.getUTCDate()
    const hours = hoursByDay.get(dow) ?? []
    if (!hours.length) continue
    const ex = exByDay.get(dayUtc.getTime())
    if (ex?.fullDayOff) continue
    const offHours = new Set(ex?.hoursOff ?? [])
    for (const h of hours) {
      if (offHours.has(h)) continue
      for (const m of minutesInHour) {
        const slot = istWallClock(y, mo, dd, h, m)
        if (slot.getTime() < earliest) continue
        slots.push({
          iso: slot.toISOString(),
          dateLabel: fmtIST(slot, { weekday: 'short', day: 'numeric', month: 'short' }),
          time: fmtIST(slot, { hour: 'numeric', minute: '2-digit' }),
          taken: takenMs.has(slot.getTime()),
        })
      }
    }
  }
  return slots
}

// ── Supervision ───────────────────────────────────────────────────────────────

export type SupervisionNoteView = {
  id: string
  authorName: string
  patientName?: string
  content: string
  createdAt: Date
}
export type SupervisionRelationship = {
  linkId: string
  counterpartName: string
  notes: SupervisionNoteView[]
}
export type SupervisionView = {
  supervising: SupervisionRelationship[] // people this therapist supervises
  supervisedBy: SupervisionRelationship[] // this therapist's own supervisors
}

/** Star-by-star breakdown of a clinician's own patient ratings. */
export type RatingBreakdown = {
  average: number
  total: number
  /** Count per star, index 0 = 1 star … index 4 = 5 stars. */
  counts: [number, number, number, number, number]
  recentComments: { rating: number; comment: string; when: Date }[]
}

/**
 * A clinician's own rating, from the real SessionReview rows rather than the
 * denormalised average, so the breakdown always adds up to the headline number.
 */
export async function getRatingBreakdown(therapistProfileId: string): Promise<RatingBreakdown> {
  const empty: RatingBreakdown = { average: 0, total: 0, counts: [0, 0, 0, 0, 0], recentComments: [] }
  try {
    const rows = await prisma.sessionReview.findMany({
      where: { therapistId: therapistProfileId },
      select: { rating: true, comment: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    if (rows.length === 0) return empty
    const counts: [number, number, number, number, number] = [0, 0, 0, 0, 0]
    let sum = 0
    for (const r of rows) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)))
      counts[star - 1]++
      sum += star
    }
    return {
      average: sum / rows.length,
      total: rows.length,
      counts,
      recentComments: rows
        .filter((r) => (r.comment ?? '').trim())
        .slice(0, 5)
        .map((r) => ({ rating: r.rating, comment: (r.comment ?? '').trim(), when: r.createdAt })),
    }
  } catch {
    return empty
  }
}

export async function getSupervision(therapistProfileId: string): Promise<SupervisionView> {
  const links = await prisma.supervisionLink.findMany({
    where: { OR: [{ supervisorId: therapistProfileId }, { superviseeId: therapistProfileId }] },
    include: {
      supervisor: { select: { id: true, user: { select: { name: true } } } },
      supervisee: { select: { id: true, user: { select: { name: true } } } },
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })

  // Resolve author + patient names across all notes in one pass.
  const authorIds = new Set<string>()
  const patientIds = new Set<string>()
  for (const l of links)
    for (const n of l.notes) {
      authorIds.add(n.authorId)
      if (n.patientId) patientIds.add(n.patientId)
    }
  const [authors, patients] = await Promise.all([
    prisma.therapistProfile.findMany({ where: { id: { in: [...authorIds] } }, select: { id: true, user: { select: { name: true } } } }),
    prisma.user.findMany({ where: { id: { in: [...patientIds] } }, select: { id: true, name: true } }),
  ])
  const authorName = (id: string) => authors.find((a) => a.id === id)?.user?.name ?? 'Therapist'
  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? 'Patient'

  const toRel = (linkId: string, counterpartName: string, notes: typeof links[number]['notes']): SupervisionRelationship => ({
    linkId,
    counterpartName,
    notes: notes.map((n) => ({
      id: n.id,
      authorName: authorName(n.authorId),
      patientName: n.patientId ? patientName(n.patientId) : undefined,
      content: n.content,
      createdAt: n.createdAt,
    })),
  })

  return {
    supervising: links
      .filter((l) => l.supervisorId === therapistProfileId)
      .map((l) => toRel(l.id, l.supervisee.user?.name ?? 'Therapist', l.notes)),
    supervisedBy: links
      .filter((l) => l.superviseeId === therapistProfileId)
      .map((l) => toRel(l.id, l.supervisor.user?.name ?? 'Therapist', l.notes)),
  }
}

/** Create a supervision link where the caller supervises the therapist with `superviseeEmail`. */
export async function addSupervisee(supervisorId: string, superviseeEmail: string): Promise<{ ok: boolean; error?: string }> {
  const email = superviseeEmail.trim().toLowerCase()
  if (!email) return { ok: false, error: 'Enter an email.' }
  const user = await prisma.user.findUnique({ where: { email }, include: { therapistProfile: true } })
  if (!user?.therapistProfile) return { ok: false, error: 'No therapist found with that email.' }
  const superviseeId = user.therapistProfile.id
  if (superviseeId === supervisorId) return { ok: false, error: 'You cannot supervise yourself.' }
  await prisma.supervisionLink.upsert({
    where: { supervisorId_superviseeId: { supervisorId, superviseeId } },
    update: {},
    create: { supervisorId, superviseeId },
  })
  return { ok: true }
}

/** Add a note to a supervision link the caller is part of (#supervision). */
export async function addSupervisionNote(
  therapistProfileId: string,
  linkId: string,
  content: string,
  patientId?: string
): Promise<boolean> {
  const text = content.trim()
  if (!text) return false
  const link = await prisma.supervisionLink.findFirst({
    where: { id: linkId, OR: [{ supervisorId: therapistProfileId }, { superviseeId: therapistProfileId }] },
  })
  if (!link) return false
  // If a patient case is referenced, it must belong to the supervisee.
  let patientRef: string | null = null
  if (patientId) {
    if (await ownsPatient(link.superviseeId, patientId)) patientRef = patientId
  }
  await prisma.supervisionNote.create({
    data: { linkId, authorId: therapistProfileId, content: text, patientId: patientRef },
  })
  return true
}

// ── Supervisor access (assignments are managed by admins) ───────────────────

/** If `supervisorId` supervises a therapist who owns `patientId`, return that supervisee's profile id. */
export async function superviseeOwningPatient(supervisorId: string, patientId: string): Promise<string | null> {
  try {
    const links = await prisma.supervisionLink.findMany({ where: { supervisorId }, select: { superviseeId: true } })
    for (const l of links) {
      if (await ownsPatient(l.superviseeId, patientId)) return l.superviseeId
    }
  } catch { /* supervision links unavailable — treat as no supervisory access */ }
  return null
}

export type SuperviseeCaseload = { superviseeId: string; superviseeName: string; patients: CaseloadPatient[] }

/** Full caseloads of everyone this therapist supervises, supervisors can see all assignee patient info. */
export async function getSuperviseeCaseloads(supervisorId: string): Promise<SuperviseeCaseload[]> {
  const links = await prisma.supervisionLink.findMany({
    where: { supervisorId },
    select: { id: true, supervisorId: true, superviseeId: true, supervisee: { select: { id: true, user: { select: { name: true } } } } },
    orderBy: { createdAt: 'asc' },
  })
  return Promise.all(
    links.map(async (l) => ({
      superviseeId: l.superviseeId,
      superviseeName: l.supervisee.user?.name ?? 'Therapist',
      patients: await getCaseload(l.superviseeId),
    })),
  )
}

// ── Admin-managed supervision assignments ────────────────────────────────────
// Only admins may assign/de-assign a doctor to a supervising doctor; the
// expert portal just reads the resulting links. Callers MUST gate on ADMIN.

export type AdminTherapistOption = { profileId: string; name: string; email: string }
export type AdminSupervisionLink = { id: string; supervisorName: string; superviseeName: string; createdAt: Date }

export async function adminListTherapists(): Promise<AdminTherapistOption[]> {
  const rows = await prisma.therapistProfile.findMany({
    select: { id: true, specializations: true, employmentType: true, user: { select: { name: true, email: true } } },
  })
  return rows
    .map((r) => ({ profileId: r.id, name: r.user?.name ?? 'Therapist', email: r.user?.email ?? '' }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function adminListSupervisionLinks(): Promise<AdminSupervisionLink[]> {
  const links = await prisma.supervisionLink.findMany({
    include: {
      supervisor: { select: { id: true, user: { select: { name: true } } } },
      supervisee: { select: { id: true, user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return links.map((l) => ({
    id: l.id,
    supervisorName: l.supervisor.user?.name ?? 'Therapist',
    superviseeName: l.supervisee.user?.name ?? 'Therapist',
    createdAt: l.createdAt,
  }))
}

export async function adminAssignSupervision(
  supervisorProfileId: string,
  superviseeProfileId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!supervisorProfileId || !superviseeProfileId) return { ok: false, error: 'Pick both doctors.' }
  if (supervisorProfileId === superviseeProfileId)
    return { ok: false, error: 'A doctor cannot supervise themselves.' }
  await prisma.supervisionLink.upsert({
    where: { supervisorId_superviseeId: { supervisorId: supervisorProfileId, superviseeId: superviseeProfileId } },
    update: {},
    create: { supervisorId: supervisorProfileId, superviseeId: superviseeProfileId },
  })
  return { ok: true }
}

export async function adminRemoveSupervision(linkId: string): Promise<void> {
  await prisma.supervisionLink.delete({ where: { id: linkId } }).catch(() => undefined)
}

// The clinician's weekly view of a patient is NOT the patient's own AI insight
// relabelled — it is computed from session notes, mood check-ins and task
// adherence in lib/patientSummary.ts, so every figure traces to the record.

// ── Blogs (clinician-authored, published to the public /blog) ────────────────

export type BlogReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type ExpertBlogView = {
  slug: string
  title: string
  excerpt: string
  tags: string[]
  readTime: string
  published: boolean
  /** Where the post sits with the editorial team. */
  reviewStatus: BlogReviewStatus
  /** An admin's reason for sending it back, shown to the author. */
  reviewNote: string | null
  dateLabel: string
  paragraphs: number
  coverImage: string | null
}

/** A single owned post, in the shape the composer edits. */
export type ExpertBlogEdit = {
  slug: string
  title: string
  excerpt: string
  body: string // paragraphs joined by blank lines
  tags: string[]
  coverImage: string | null
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
  return `${base || 'post'}-${Math.random().toString(36).slice(2, 7)}`
}

function estimateReadTime(paragraphs: string[]): string {
  const words = paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

// Guard against oversized inline images bloating the row (≈1.4MB base64 ≈ 1MB file).
const MAX_COVER_CHARS = 1_500_000
function cleanCover(cover?: string | null): string | null {
  if (!cover) return null
  const c = cover.trim()
  if (!c) return null
  if (c.length > MAX_COVER_CHARS) return null
  if (!/^(https?:\/\/|data:image\/)/i.test(c)) return null
  return c
}

/**
 * Blog-review columns, created on demand so submission works on a database that
 * hasn't had 0037 applied by hand. Idempotent; a no-op once present.
 */
let blogReviewSchemaReady = false
export async function ensureBlogReviewSchema(): Promise<void> {
  if (blogReviewSchemaReady) return
  const stmts = [
    `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewStatus" TEXT NOT NULL DEFAULT 'APPROVED'`,
    `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewNote" TEXT`,
    `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3)`,
    `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3)`,
    `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewedByName" TEXT`,
    `CREATE INDEX IF NOT EXISTS "BlogPost_reviewStatus_idx" ON "BlogPost"("reviewStatus")`,
  ]
  for (const sql of stmts) await prisma.$executeRawUnsafe(sql)
  blogReviewSchemaReady = true
}

/** This clinician's own blog posts, newest first. Never throws (degrades to []). */
export async function getExpertBlogPosts(authorId: string): Promise<ExpertBlogView[]> {
  try {
    await ensureBlogReviewSchema()
    // Narrow select: a column missing on an un-migrated database would otherwise
    // throw and hide every post behind the [] fallback.
    const rows = await prisma.blogPost.findMany({
      where: { authorId },
      orderBy: { publishedAt: 'desc' },
      select: {
        slug: true, title: true, excerpt: true, tags: true, readTime: true, published: true,
        reviewStatus: true, reviewNote: true, publishedAt: true, content: true, coverImage: true,
      },
    })
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      tags: r.tags,
      readTime: r.readTime,
      published: r.published,
      reviewStatus: (r.reviewStatus ?? 'APPROVED') as BlogReviewStatus,
      reviewNote: r.reviewNote ?? null,
      dateLabel: fmtIST(r.publishedAt, { day: 'numeric', month: 'short', year: 'numeric' }),
      paragraphs: r.content.length,
      coverImage: r.coverImage ?? null,
    }))
  } catch {
    return []
  }
}

/** One of this clinician's own posts by slug, for editing. Ownership-gated. Never throws. */
export async function getExpertBlogPostForEdit(authorId: string, slug: string): Promise<ExpertBlogEdit | null> {
  let r: {
    slug: string; title: string; excerpt: string; content: string[]
    tags: string[]; coverImage: string | null; authorId: string | null
  } | null
  try {
    r = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        slug: true, title: true, excerpt: true, content: true, tags: true,
        coverImage: true, authorId: true,
      },
    })
  } catch {
    return null
  }
  if (!r || r.authorId !== authorId) return null
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.content.join('\n\n'),
    tags: r.tags,
    coverImage: r.coverImage ?? null,
  }
}

export type CreateBlogInput = { title: string; excerpt: string; body: string; tags: string[]; coverImage?: string | null }

function validateBlog(input: CreateBlogInput): { ok: false; error: string } | { ok: true; title: string; excerpt: string; paragraphs: string[]; tags: string[]; coverImage: string | null } {
  const title = input.title.trim()
  const excerpt = input.excerpt.trim()
  const paragraphs = input.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  if (!title) return { ok: false, error: 'Add a title.' }
  if (!excerpt) return { ok: false, error: 'Add a short excerpt.' }
  if (paragraphs.length === 0) return { ok: false, error: 'Write the post body.' }
  return {
    ok: true,
    title,
    excerpt,
    paragraphs,
    tags: input.tags.map((t) => t.trim()).filter(Boolean).slice(0, 6),
    coverImage: cleanCover(input.coverImage),
  }
}

/** Publish a blog post to the public /blog under this clinician's byline + designation. */
export async function createExpertBlogPost(
  ctx: TherapistContext,
  input: CreateBlogInput,
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  const v = validateBlog(input)
  if (!v.ok) return v
  try {
    await ensureBlogReviewSchema()
    // A clinician's post is SUBMITTED, not published: it goes to the admin
    // review queue and stays off the public blog until it's approved.
    const post = await prisma.blogPost.create({
      data: {
        slug: slugify(v.title),
        title: v.title,
        excerpt: v.excerpt,
        content: v.paragraphs,
        authorId: ctx.userId,
        authorName: ctx.therapistName ?? 'GetCalmly Clinician',
        authorRole: ctx.designation,
        tags: v.tags,
        coverImage: v.coverImage,
        readTime: estimateReadTime(v.paragraphs),
        published: false,
        reviewStatus: 'PENDING',
        submittedAt: new Date(),
      },
    })
    return { ok: true, slug: post.slug }
  } catch {
    return { ok: false, error: 'Could not submit the post.' }
  }
}

/** Edit one of this clinician's own posts. Slug is preserved so links keep working. */
export async function updateExpertBlogPost(
  ctx: TherapistContext,
  slug: string,
  input: CreateBlogInput,
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  await ensureBlogReviewSchema().catch(() => {})
  const existing = await prisma.blogPost.findUnique({
    where: { slug },
    select: { authorId: true, published: true },
  })
  if (!existing || existing.authorId !== ctx.userId) return { ok: false, error: 'Post not found.' }
  const v = validateBlog(input)
  if (!v.ok) return v
  try {
    // Any edit goes back through review. A post that is already live stays live
    // with the new text — pulling a published article off the site over a typo
    // fix would be worse than an admin seeing it a few hours later — but it
    // re-enters the queue so the change is always seen. A post still awaiting
    // approval simply stays pending.
    await prisma.blogPost.update({
      where: { slug },
      data: {
        title: v.title,
        excerpt: v.excerpt,
        content: v.paragraphs,
        tags: v.tags,
        coverImage: v.coverImage,
        readTime: estimateReadTime(v.paragraphs),
        reviewStatus: 'PENDING',
        reviewNote: null,
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedByName: null,
      },
    })
    return { ok: true, slug }
  } catch {
    return { ok: false, error: 'Could not save your changes.' }
  }
}

// ── Admin: employment type ───────────────────────────────────────────────────

export type AdminTherapistEmployment = {
  profileId: string
  name: string
  email: string
  designation: string
  employmentType: EmploymentType
}

export async function adminListTherapistEmployment(): Promise<AdminTherapistEmployment[]> {
  const rows = await prisma.therapistProfile.findMany({
    select: { id: true, specializations: true, employmentType: true, user: { select: { name: true, email: true } } },
  })
  return rows
    .map((r) => ({
      profileId: r.id,
      name: r.user?.name ?? 'Therapist',
      email: r.user?.email ?? '',
      designation: designationOf(r.specializations),
      employmentType: (r.employmentType as EmploymentType) ?? 'FULL_TIME',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function adminSetEmploymentType(
  profileId: string,
  employmentType: EmploymentType,
): Promise<{ ok: boolean; error?: string }> {
  if (!profileId) return { ok: false, error: 'Pick a clinician.' }
  try {
    await prisma.therapistProfile.update({ where: { id: profileId }, data: { employmentType } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update employment type.' }
  }
}
