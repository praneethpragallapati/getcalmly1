/**
 * Builds the per-patient context the AI pipelines consume from the database,
 * strictly behind PrivacySettings. This is the single compliance boundary: a data
 * category is read ONLY when mayFeedToAi() allows it (per-category switch AND the
 * master feedToLlm switch). The patient's raw records always exist; this decides
 * what the model is ever allowed to see, nothing here bypasses that gate.
 *
 * Field names mirror the notebooks' patients.json vocabulary so the ported chat /
 * synthesizer / insight logic maps over with minimal translation.
 */
import { prisma } from '@/lib/prisma'
import { getPrivacy, mayFeedToAi } from '@/lib/patient'
import { trackLabelFor } from './tracks'

export type MoodPoint = { date: string; score: number; note?: string }
export type JournalPoint = { date: string; entry: string }
export type SessionPoint = { date: string; durationMin?: number; note: string }
export type ChatPoint = {
  date: string
  role: 'user' | 'assistant'
  content: string
  highStake: boolean
  label?: string
}
export type ScorePoint = { date: string; scale: string; score: number; label?: string }

export type PatientContext = {
  userId: string
  name: string
  firstName: string
  membership: 'paid' | 'free'
  membershipExpiry?: string
  diagnosis?: string
  track?: string
  subTrack?: string
  trackLabel: string
  currentSituation?: string
  therapyStatus?: string
  therapistName?: string
  therapistEmail?: string
  // Raw, privacy-gated histories (empty when the category is disallowed).
  mood: MoodPoint[]
  journals: JournalPoint[]
  sessions: SessionPoint[]
  chat: ChatPoint[]
  // Expert-authored clinical context (gated under collectSessions).
  scores: ScorePoint[]
  scale?: string
  trend?: string
  whatHasHelped: string[]
  whatHasNotHelped: string[]
  recurringTriggers: string[]
  risk: {
    passiveSiHistory: boolean
    sleepDisturbance: boolean
    safetyPlanActive: boolean
    safetyPlanContact?: string
  }
  allowed: { mood: boolean; journals: boolean; sessions: boolean; chats: boolean }
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10)

export async function buildPatientContext(userId: string): Promise<PatientContext | null> {
  const privacy = await getPrivacy(userId)
  const allowed = {
    mood: mayFeedToAi(privacy, 'collectMood'),
    journals: mayFeedToAi(privacy, 'collectJournals'),
    sessions: mayFeedToAi(privacy, 'collectSessions'),
    chats: mayFeedToAi(privacy, 'collectChats'),
  }

  const [user, profile, sub, latestAppt] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.patientProfile.findUnique({
      where: { userId },
      // Narrow select: a full row would pull columns a not-yet-migrated DB lacks.
      select: {
        diagnosis: true, track: true, subTrack: true, trackLabel: true,
        currentSituation: true, therapyStatus: true,
      },
    }),
    prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: { expiresAt: true },
    }),
    prisma.appointment.findFirst({
      where: { patientId: userId },
      orderBy: { scheduledAt: 'desc' },
      select: { therapist: { select: { user: { select: { name: true, email: true } } } } },
    }),
  ])
  if (!user) return null

  // Privacy-gated raw histories.
  const [moodRows, journalRows, apptRows, chatRows, clinical, scoreRows] = await Promise.all([
    allowed.mood
      ? prisma.moodEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 60 })
      : Promise.resolve([]),
    allowed.journals
      ? prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 12 })
      : Promise.resolve([]),
    allowed.sessions
      ? prisma.appointment.findMany({
          where: { patientId: userId, OR: [{ summary: { not: null } }, { preSessionNote: { not: null } }] },
          orderBy: { scheduledAt: 'desc' },
          take: 6,
        })
      : Promise.resolve([]),
    allowed.chats
      ? prisma.calmAiMessage.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 40 })
      : Promise.resolve([]),
    allowed.sessions
      ? prisma.clinicalContext.findUnique({ where: { userId } })
      : Promise.resolve(null),
    allowed.sessions
      ? prisma.assessmentScore.findMany({ where: { userId }, orderBy: { recordedAt: 'asc' }, take: 24 })
      : Promise.resolve([]),
  ])

  const name = user.name ?? 'there'
  const therapist = latestAppt?.therapist?.user

  return {
    userId,
    name,
    firstName: name.split(' ')[0],
    membership: sub ? 'paid' : 'free',
    membershipExpiry: sub?.expiresAt ? isoDate(sub.expiresAt) : undefined,
    diagnosis: profile?.diagnosis ?? undefined,
    track: profile?.track?.[0],
    subTrack: profile?.subTrack ?? undefined,
    trackLabel: trackLabelFor(profile?.track?.[0], profile?.trackLabel),
    currentSituation: profile?.currentSituation ?? undefined,
    therapyStatus: profile?.therapyStatus ?? undefined,
    therapistName: therapist?.name ?? undefined,
    therapistEmail: therapist?.email ?? undefined,
    mood: moodRows.map((m) => ({ date: isoDate(m.createdAt), score: m.mood, note: m.note ?? undefined })),
    journals: journalRows.map((j) => ({ date: isoDate(j.createdAt), entry: j.content })),
    sessions: apptRows.map((a) => ({
      date: isoDate(a.scheduledAt),
      durationMin: a.durationMins,
      note: a.summary ?? a.preSessionNote ?? '',
    })),
    chat: chatRows
      .reverse()
      .map((c) => ({
        date: isoDate(c.createdAt),
        role: c.role === 'ASSISTANT' ? 'assistant' : 'user',
        content: c.content,
        highStake: c.highStake,
        label: c.label ?? undefined,
      })),
    scores: scoreRows.map((s) => ({
      date: isoDate(s.recordedAt),
      scale: s.scale,
      score: s.score,
      label: s.label ?? undefined,
    })),
    scale: clinical?.scale ?? undefined,
    trend: clinical?.trend ?? undefined,
    whatHasHelped: clinical?.whatHasHelped ?? [],
    whatHasNotHelped: clinical?.whatHasNotHelped ?? [],
    recurringTriggers: clinical?.recurringTriggers ?? [],
    risk: {
      passiveSiHistory: clinical?.passiveSiHistory ?? false,
      sleepDisturbance: clinical?.sleepDisturbance ?? false,
      safetyPlanActive: clinical?.safetyPlanActive ?? false,
      safetyPlanContact: clinical?.safetyPlanContact ?? undefined,
    },
    allowed,
  }
}
