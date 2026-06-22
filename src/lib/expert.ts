/**
 * Expert (clinician) portal data access. Mirrors the DB-with-fallback discipline
 * used elsewhere, but with no demo fallback — there is no meaningful "preview"
 * of another person's clinical record, so every function here returns null/empty
 * when there is no signed-in, verified therapist.
 *
 * Read-only by design: the only clinician-authored input this module writes is
 * the existing Appointment.summary/preSessionNote channel (already the sole
 * expert-authored text the AI pipeline synthesizes — see lib/ai/synthesizer.ts).
 * Nothing here adds a new freeform field that feeds the AI directly.
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackLabelFor } from '@/lib/ai/tracks'
import { callModel } from '@/lib/ai/clients'
import { SYNTH_MODEL } from '@/lib/ai/models'
import { hasLlm } from '@/lib/ai/config'

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
  trackLabel: string
  lastMood: number | null
  moodTrend: MoodTrend
  openCrisisCount: number
  sessionsDone: number
  sessionsTotal: number
}

export type ExpertPatientProfile = {
  patientId: string
  name: string
  trackLabel: string
  diagnosis?: string
  therapyStatus?: string
  streakDays: number
  moodTrend: MoodTrend
  moodWeek: { date: string; mood: number }[]
  sessionNotes: { date: string; raw: string; synthesized?: string }[]
  sessionsDone: number
  sessionsTotal: number
  sessionsRemaining: number
  taskCompletionPct: number
  tasks: { id: string; title: string; type: string; dueLabel?: string; done: boolean; expired: boolean }[]
  medicationCompliancePct: number
  medications: { name: string; dosage?: string; active: boolean }[]
  openCrisisCount: number
  highStakeChatCount: number
}

/** The signed-in therapist's verified TherapistProfile id, or null. */
export async function getTherapistContext(): Promise<
  { userId: string; therapistProfileId: string; therapistName: string | null } | null
> {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) return null
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId },
      include: { user: { select: { name: true } } },
    })
    if (!profile || !profile.isActive) return null
    return { userId, therapistProfileId: profile.id, therapistName: profile.user?.name ?? null }
  } catch {
    return null
  }
}

/** Whether this therapist has any appointment with the given patient (ownership gate). */
export async function ownsPatient(therapistProfileId: string, patientId: string): Promise<boolean> {
  const owns = await prisma.appointment.findFirst({
    where: { therapistId: therapistProfileId, patientId },
    select: { id: true },
  })
  return Boolean(owns)
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
  const rows = await prisma.appointment.findMany({
    where: { therapistId: therapistProfileId },
    select: { patientId: true },
    distinct: ['patientId'],
  })
  return rows.map((r) => r.patientId)
}

export async function getCaseload(therapistProfileId: string): Promise<CaseloadPatient[]> {
  const patientIds = await patientIdsFor(therapistProfileId)
  if (!patientIds.length) return []

  const [users, moods, crisis, subs] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: patientIds } }, select: { id: true, name: true, patientProfile: true } }),
    prisma.moodEntry.findMany({ where: { userId: { in: patientIds } }, orderBy: { createdAt: 'desc' }, take: 30 * patientIds.length }),
    prisma.crisisAlert.findMany({ where: { userId: { in: patientIds }, resolved: false } }),
    prisma.subscription.findMany({ where: { userId: { in: patientIds }, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } }),
  ])

  return users.map((u) => {
    const userMoods = moods.filter((m) => m.userId === u.id).slice(0, 14)
    const sub = subs.find((s) => s.userId === u.id)
    return {
      patientId: u.id,
      name: u.name ?? 'Patient',
      trackLabel: trackLabelFor(u.patientProfile?.track?.[0], u.patientProfile?.trackLabel),
      lastMood: userMoods[0]?.mood ?? null,
      moodTrend: moodTrendOf(userMoods),
      openCrisisCount: crisis.filter((c) => c.userId === u.id).length,
      sessionsDone: sub?.sessionsUsed ?? 0,
      sessionsTotal: sub?.sessionsTotal ?? 0,
    }
  })
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
  const owns = await prisma.appointment.findFirst({ where: { therapistId: therapistProfileId, patientId } })
  if (!owns) return null

  const [user, profile, moods, appts, tasks, meds, sub, crisisCount, highStakeCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: patientId }, select: { name: true } }),
    prisma.patientProfile.findUnique({ where: { userId: patientId } }),
    prisma.moodEntry.findMany({ where: { userId: patientId }, orderBy: { createdAt: 'desc' }, take: 30 }),
    prisma.appointment.findMany({
      where: { patientId, therapistId: therapistProfileId, OR: [{ summary: { not: null } }, { preSessionNote: { not: null } }] },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
    }),
    prisma.task.findMany({ where: { userId: patientId } }),
    prisma.medication.findMany({ where: { userId: patientId } }),
    prisma.subscription.findFirst({ where: { userId: patientId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } }),
    prisma.crisisAlert.count({ where: { userId: patientId, resolved: false } }),
    prisma.calmAiMessage.count({ where: { userId: patientId, highStake: true } }),
  ])
  if (!user) return null

  const isoDate = (d: Date) => d.toISOString().slice(0, 10)
  const now = Date.now()
  const taskCompletionPct = tasks.length ? Math.round((tasks.filter((t) => t.completedAt).length / tasks.length) * 100) : 0
  // Proxy: no daily dose log exists yet, so compliance is approximated from active vs total prescriptions.
  const medicationCompliancePct = meds.length ? Math.round((meds.filter((m) => m.active).length / meds.length) * 100) : 0

  return {
    patientId,
    name: user.name ?? 'Patient',
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
    sessionsDone: sub?.sessionsUsed ?? 0,
    sessionsTotal: sub?.sessionsTotal ?? 0,
    sessionsRemaining: sub ? Math.max(0, sub.sessionsTotal - sub.sessionsUsed) : 0,
    taskCompletionPct,
    tasks: tasks
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        dueLabel: t.dueDate ? t.dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : undefined,
        done: Boolean(t.completedAt),
        expired: Boolean(t.dueDate && !t.completedAt && t.dueDate.getTime() < now),
      })),
    medicationCompliancePct,
    medications: meds.map((m) => ({ name: m.name, dosage: m.dosage ?? undefined, active: m.active })),
    openCrisisCount: crisisCount,
    highStakeChatCount: highStakeCount,
  }
}

export async function getRiskNotifications(therapistProfileId: string): Promise<RiskNotification[]> {
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
}

/** Every appointment on this therapist's calendar, most recent first. */
export async function getTherapistSchedule(therapistProfileId: string): Promise<ScheduleAppointment[]> {
  const rows = await prisma.appointment.findMany({
    where: { therapistId: therapistProfileId },
    orderBy: { scheduledAt: 'asc' },
    include: { patient: { select: { name: true } } },
  })
  const now = Date.now()
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: r.patient.name ?? 'Patient',
    scheduledAt: r.scheduledAt,
    durationMins: r.durationMins,
    status: r.status,
    fee: r.fee,
    roomId: r.roomId,
    meetLink: r.meetLink,
    hasSummary: Boolean(r.summary),
    isPast: r.scheduledAt.getTime() < now,
  }))
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

export async function rescheduleAppointment(
  therapistProfileId: string,
  appointmentId: string,
  newDate: Date
): Promise<boolean> {
  const appt = await ownsAppointment(therapistProfileId, appointmentId)
  if (!appt || Number.isNaN(newDate.getTime())) return false
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { scheduledAt: newDate, status: 'RESCHEDULED' },
  })
  return true
}

export async function writeSessionSummary(
  therapistProfileId: string,
  appointmentId: string,
  summary: string
): Promise<boolean> {
  const appt = await ownsAppointment(therapistProfileId, appointmentId)
  if (!appt) return false
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { summary, status: 'COMPLETED' },
  })
  return true
}

// ── Earnings ──────────────────────────────────────────────────────────────────

export type EarningsMonth = { label: string; total: number; sessions: number }
export type Earnings = {
  totalEarned: number
  totalSessions: number
  thisMonth: number
  thisMonthSessions: number
  pending: number // confirmed + upcoming, not yet completed/paid
  byMonth: EarningsMonth[]
}

export async function getTherapistEarnings(therapistProfileId: string): Promise<Earnings> {
  const rows = await prisma.appointment.findMany({
    where: { therapistId: therapistProfileId, status: { in: ['COMPLETED', 'CONFIRMED'] } },
    select: { fee: true, status: true, scheduledAt: true },
  })

  const completed = rows.filter((r) => r.status === 'COMPLETED')
  const pendingRows = rows.filter((r) => r.status === 'CONFIRMED')

  const now = new Date()
  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`
  const thisKey = monthKey(now)

  const byMonthMap = new Map<string, EarningsMonth>()
  for (const r of completed) {
    const key = monthKey(r.scheduledAt)
    const label = r.scheduledAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    const entry = byMonthMap.get(key) ?? { label, total: 0, sessions: 0 }
    entry.total += r.fee
    entry.sessions += 1
    byMonthMap.set(key, entry)
  }
  const byMonth = [...byMonthMap.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([, v]) => v)

  return {
    totalEarned: completed.reduce((sum, r) => sum + r.fee, 0),
    totalSessions: completed.length,
    thisMonth: byMonthMap.get(thisKey)?.total ?? 0,
    thisMonthSessions: byMonthMap.get(thisKey)?.sessions ?? 0,
    pending: pendingRows.reduce((sum, r) => sum + r.fee, 0),
    byMonth,
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
  'before saving — write a solid draft, not a placeholder.'

/** AI-drafted session note from the therapist's quick bullet points. Returns null without an LLM key. */
export async function draftSessionNote(bullets: string): Promise<string | null> {
  if (!hasLlm() || !bullets.trim()) return null
  const res = await callModel(SYNTH_MODEL, NOTE_PROMPT, [{ role: 'user', content: bullets.trim() }], {
    temperature: 0.5,
    maxTokens: 180,
  })
  return res.answer
}
