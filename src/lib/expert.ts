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
import {
  getEarningsConfig,
  isNightSession,
  sessionPay,
  type EarningsConfigValues,
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
}

export type TherapistContext = {
  userId: string
  therapistProfileId: string
  therapistName: string | null
  specializations: string[]
  /** Psychiatrists may prescribe/manage medication; derived from specializations. */
  isPsychiatrist: boolean
}

/** Whether a specialization set marks a prescribing psychiatrist. */
function looksPsychiatric(specializations: string[]): boolean {
  return specializations.some((s) => /psychiat|medication|pharma/i.test(s))
}

/** The signed-in therapist's verified TherapistProfile id, or null. */
export async function getTherapistContext(): Promise<TherapistContext | null> {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) return null
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId },
      include: { user: { select: { name: true } } },
    })
    if (!profile || !profile.isActive) return null
    return {
      userId,
      therapistProfileId: profile.id,
      therapistName: profile.user?.name ?? null,
      specializations: profile.specializations,
      isPsychiatrist: looksPsychiatric(profile.specializations),
    }
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

  const orders = await prisma.medicationOrder.findMany({
    where: { userId: patientId },
    orderBy: { createdAt: 'desc' },
  })
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
      body: `${prescriberName ?? 'Your psychiatrist'} prescribed a new medication${
        durationDays ? ` for ${durationDays} days` : ''
      }. You can order a home delivery from your Medications page.`,
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

export type EarningsMonth = { label: string; total: number; sessions: number }
export type EarningsBreakdown = {
  base: number // sum of base fees across completed sessions
  sessionBonus: number // sum of 2nd / 3rd-onwards session-number bonuses
  nightBonus: number // sum of night-session bonuses
  miscBonus: number // sum of misc bonuses
  nightSessions: number // count of completed night-slot sessions
}
export type Earnings = {
  totalEarned: number
  totalSessions: number
  thisMonth: number
  thisMonthSessions: number
  pending: number // confirmed + upcoming, not yet completed/paid
  byMonth: EarningsMonth[]
  config: EarningsConfigValues
  breakdown: EarningsBreakdown
}

export async function getTherapistEarnings(therapistProfileId: string): Promise<Earnings> {
  const [rows, config] = await Promise.all([
    prisma.appointment.findMany({
      where: { therapistId: therapistProfileId, status: { in: ['COMPLETED', 'CONFIRMED'] } },
      select: { patientId: true, status: true, scheduledAt: true },
    }),
    getEarningsConfig(),
  ])

  // Per-patient session ordinal is computed over that patient's completed
  // sessions in chronological order, so the 2nd / 3rd-onwards bonuses reflect
  // continuity with each patient.
  const completed = rows
    .filter((r) => r.status === 'COMPLETED')
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
  const pendingRows = rows.filter((r) => r.status === 'CONFIRMED')

  const now = new Date()
  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`
  const thisKey = monthKey(now)

  const byMonthMap = new Map<string, EarningsMonth>()
  const breakdown: EarningsBreakdown = { base: 0, sessionBonus: 0, nightBonus: 0, miscBonus: 0, nightSessions: 0 }
  const seenPerPatient = new Map<string, number>()
  let totalEarned = 0

  for (const r of completed) {
    const ordinal = (seenPerPatient.get(r.patientId) ?? 0) + 1
    seenPerPatient.set(r.patientId, ordinal)
    const night = isNightSession(r.scheduledAt)
    const pay = sessionPay(config, ordinal, night)

    breakdown.base += config.baseFee
    breakdown.sessionBonus += ordinal >= 3 ? config.thirdOnwardsBonus : ordinal === 2 ? config.secondSessionBonus : 0
    breakdown.miscBonus += config.miscBonus
    if (night) {
      breakdown.nightBonus += config.nightSessionBonus
      breakdown.nightSessions += 1
    }
    totalEarned += pay

    const key = monthKey(r.scheduledAt)
    const label = r.scheduledAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    const entry = byMonthMap.get(key) ?? { label, total: 0, sessions: 0 }
    entry.total += pay
    entry.sessions += 1
    byMonthMap.set(key, entry)
  }
  const byMonth = [...byMonthMap.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([, v]) => v)

  // Pending payout: estimate each confirmed session at base + misc (bonuses
  // depend on completion ordering, so we keep the estimate conservative).
  const pending = pendingRows.length * (config.baseFee + config.miscBonus)

  return {
    totalEarned,
    totalSessions: completed.length,
    thisMonth: byMonthMap.get(thisKey)?.total ?? 0,
    thisMonthSessions: byMonthMap.get(thisKey)?.sessions ?? 0,
    pending,
    byMonth,
    config,
    breakdown,
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

// ── Availability ──────────────────────────────────────────────────────────────

/** The four named slot bands. Each is a set of 1-hour slot start-hours. */
export const SLOT_GROUPS = {
  morning: { label: 'Morning · 7–11 AM', hours: [7, 8, 9, 10] },
  afternoon: { label: 'Afternoon · 12–4 PM', hours: [12, 13, 14, 15] },
  evening: { label: 'Evening · 5–9 PM', hours: [17, 18, 19, 20] },
  night: { label: 'Night · 9 PM–12 AM', hours: [21, 22, 23] },
} as const
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

/** Upcoming date-specific exceptions, soonest first. */
export async function getAvailabilityExceptions(therapistProfileId: string): Promise<AvailabilityExceptionView[]> {
  const rows = await prisma.availabilityException.findMany({
    where: { therapistId: therapistProfileId, date: { gte: startOfUtcDay(new Date()) } },
    orderBy: { date: 'asc' },
  })
  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    dateLabel: r.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
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
  const [template, exceptions, booked] = await Promise.all([
    getAvailability(therapistProfileId),
    prisma.availabilityException.findMany({
      where: { therapistId: therapistProfileId, date: { gte: startOfUtcDay(new Date()) } },
    }),
    prisma.appointment.findMany({
      where: { therapistId: therapistProfileId, scheduledAt: { gte: new Date() }, status: { not: 'CANCELLED' } },
      select: { scheduledAt: true },
    }),
  ])
  const hoursByDay = new Map(template.map((t) => [t.dayOfWeek, t.hours]))
  const exByDay = new Map(exceptions.map((e) => [startOfUtcDay(e.date).getTime(), e]))
  const takenMs = new Set(booked.map((b) => b.scheduledAt.getTime()))

  const slots: BookableSlot[] = []
  const now = Date.now()
  for (let d = 0; d < daysAhead; d++) {
    const day = new Date()
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() + d)
    const hours = hoursByDay.get(day.getDay()) ?? []
    if (!hours.length) continue
    const ex = exByDay.get(startOfUtcDay(day).getTime())
    if (ex?.fullDayOff) continue
    const offHours = new Set(ex?.hoursOff ?? [])
    for (const h of hours) {
      if (offHours.has(h)) continue
      const slot = new Date(day)
      slot.setHours(h, 0, 0, 0)
      if (slot.getTime() <= now) continue
      slots.push({
        iso: slot.toISOString(),
        dateLabel: slot.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: slot.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
        taken: takenMs.has(slot.getTime()),
      })
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

export async function getSupervision(therapistProfileId: string): Promise<SupervisionView> {
  const links = await prisma.supervisionLink.findMany({
    where: { OR: [{ supervisorId: therapistProfileId }, { superviseeId: therapistProfileId }] },
    include: {
      supervisor: { include: { user: { select: { name: true } } } },
      supervisee: { include: { user: { select: { name: true } } } },
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
    prisma.therapistProfile.findMany({ where: { id: { in: [...authorIds] } }, include: { user: { select: { name: true } } } }),
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
