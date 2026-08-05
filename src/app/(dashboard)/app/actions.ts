'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/patient'
import { rebuildAiProfile, runChat } from '@/lib/ai'
import { buyPackageFor, buyFirstSessionFor, buyCalmPlusFor, hasPartnerOnRecord, savePartnerFor, type BuyableTrack } from '@/lib/billing'
import { autoSendIntakeForm, submitForm } from '@/lib/forms'
import { placeMedicationOrder, type DeliveryDetails } from '@/lib/orders'
import { markAllRead } from '@/lib/notifications'
import { submitReview } from '@/lib/reviews'
import { getAssignedTherapistId, canPatientBookWith, MIN_BOOKING_LEAD_MS } from '@/lib/expert'
import { communityIdentity } from '@/lib/community'
import { matchAndAssignForTrack, hasAssessment, type CareTrack } from '@/lib/matching'

// Concern slug → human label for the assessment (mirrors the register options).
const CONCERN_LABEL: Record<string, string> = {
  anxiety: 'Anxiety',
  depression: 'Low mood / depression',
  stress: 'Stress & burnout',
  relationships: 'Relationships',
  trauma: 'Trauma & grief',
  sleep: 'Sleep',
  'self-worth': 'Self-worth',
  anger: 'Anger',
  postpartum: 'Motherhood / postpartum',
  other: 'Something else',
}

/**
 * Save the patient's assessment (concerns + preferred language) and immediately
 * match a clinician for any package they already hold. This is the source of
 * truth for auto-matching; booking requires it to be completed first.
 */
export async function saveAssessment(input: {
  concerns: string[]
  primary?: string | null
  language?: string | null
}): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, persisted: false, error: 'Please sign in.' }

  const concerns = [...new Set(input.concerns.map((c) => c.trim().toLowerCase()).filter(Boolean))]
  if (concerns.length === 0) return { ok: false, persisted: false, error: 'Pick at least one thing you’d like support with.' }
  const primary = input.primary?.trim().toLowerCase() || concerns[0]
  const language = input.language?.trim() || null

  try {
    await prisma.patientProfile.upsert({
      where: { userId },
      update: {
        track: concerns,
        subTrack: primary,
        trackLabel: CONCERN_LABEL[primary] ?? null,
        ...(language ? { preferredLanguage: language } : {}),
      },
      create: {
        userId,
        patientId: `P-${Date.now().toString(36).toUpperCase()}`,
        careMode: 'INDIVIDUAL',
        track: concerns,
        subTrack: primary,
        trackLabel: CONCERN_LABEL[primary] ?? null,
        preferredLanguage: language,
        country: 'IN',
      },
    })

    // Match a clinician for every package type the patient already holds.
    const subs = await prisma.subscription.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { trackSlug: true },
    })
    const tracks = new Set(subs.map((s) => s.trackSlug).filter((t): t is CareTrack => t === 'therapy' || t === 'couples' || t === 'psychiatry'))
    for (const t of tracks) await matchAndAssignForTrack(userId, t)

    revalidatePath('/app')
    revalidatePath('/app/therapist')
    revalidatePath('/app/sessions')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not save your assessment. Please try again.' }
  }
}

export type ActionResult = { ok: boolean; persisted: boolean; error?: string }

export type UpvoteResult = { ok: boolean; count: number; voted: boolean; error?: string }

/**
 * Save today's mood check-in (#8). Persists the patient's own raw record at the
 * mood/energy/calm grain. Authorization: writes only to the signed-in user's
 * rows; with no session (public preview) it succeeds without persisting so the
 * UI stays usable. The AI pipeline is refreshed separately, behind privacy.
 */
export async function saveCheckin(scores: {
  mood: number
  energy: number
  calm: number
}): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  const clamp = (n: number) => Math.max(0, Math.min(10, Math.round(n)))
  const mood = clamp(scores.mood)
  const energy = clamp(scores.energy)
  const calm = clamp(scores.calm)
  try {
    // One check-in per day: re-saving today updates the same entry instead of
    // adding a second one, so editing today's mood actually changes the bar
    // (rather than averaging with an earlier value).
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const todayEntry = await prisma.moodEntry.findFirst({
      where: { userId, source: 'home-checkin', createdAt: { gte: startOfToday } },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
    if (todayEntry) {
      await prisma.moodEntry.update({ where: { id: todayEntry.id }, data: { mood, energy, calm } })
    } else {
      await prisma.moodEntry.create({
        data: { userId, mood, energy, calm, source: 'home-checkin' },
      })
    }
    await rebuildAiProfile(userId)
    revalidatePath('/app')
    revalidatePath('/app/progress')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not save your check-in.' }
  }
}

/**
 * Create a journal entry (#1). Persists the patient's own raw entry; AI
 * inclusion is decided downstream by PrivacySettings. Same auth posture as
 * saveCheckin.
 */
export async function createJournalEntry(input: {
  title?: string
  content: string
  moodTag?: string
  topicTags?: string[]
}): Promise<ActionResult> {
  const content = input.content?.trim()
  if (!content) return { ok: false, persisted: false, error: 'Write something first.' }

  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    await prisma.journalEntry.create({
      data: {
        userId,
        title: input.title?.trim() || null,
        content,
        moodTag: input.moodTag || null,
        topicTags: input.topicTags ?? [],
      },
    })
    await rebuildAiProfile(userId)
    revalidatePath('/app')
    revalidatePath('/app/journal')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not save your entry.' }
  }
}

/**
 * Save the note a patient prepares before a session, shared with the expert (#9).
 * Authorization: the update is scoped to an appointment the signed-in patient
 * owns, so a patient can only write to their own session. The note may feed the
 * AI pipeline later, gated by PrivacySettings.collectSessions, hence the AI
 * profile refresh.
 */
export async function savePreSessionNote(
  appointmentId: string,
  note: string
): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    const result = await prisma.appointment.updateMany({
      where: { id: appointmentId, patientId: userId }, // ownership gate
      data: { preSessionNote: note.trim() || null },
    })
    if (result.count === 0) return { ok: true, persisted: false }
    await rebuildAiProfile(userId)
    revalidatePath(`/app/sessions/${appointmentId}`)
    revalidatePath('/app/sessions')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not save your note.' }
  }
}

/**
 * Request a session at one of the expert's open slots (#9). Creates a PENDING
 * appointment the expert confirms later. Persists only for the signed-in patient
 * and only when an active expert exists; otherwise it succeeds without persisting
 * so the preview stays usable (same posture as the other actions).
 */
export async function requestSession(slotIso: string, therapistIdOverride?: string): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  const scheduledAt = new Date(slotIso)
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() + MIN_BOOKING_LEAD_MS) {
    return { ok: false, persisted: false, error: 'Please pick a slot at least 6 hours from now.' }
  }

  try {
    // Book with a specific care-team expert when one is passed and the patient
    // is allowed to book with them; otherwise fall back to their assigned
    // clinician. Either way the request matches the calendar they're viewing.
    let therapistId =
      therapistIdOverride && (await canPatientBookWith(userId, therapistIdOverride))
        ? therapistIdOverride
        : await getAssignedTherapistId(userId)

    // No expert yet: the patient must complete the assessment so we can match
    // them (chosen answer: require assessment first). If it's done, match now.
    if (!therapistId) {
      if (!(await hasAssessment(userId))) {
        return {
          ok: false,
          persisted: false,
          error: 'Complete your assessment so we can match you with the right expert, then book.',
        }
      }
      const subs = await prisma.subscription.findMany({
        where: { userId, status: 'ACTIVE' },
        select: { trackSlug: true },
      })
      const order: CareTrack[] = ['therapy', 'couples', 'psychiatry']
      for (const t of order) {
        if (subs.some((s) => s.trackSlug === t)) {
          const matched = await matchAndAssignForTrack(userId, t)
          if (matched) { therapistId = matched; break }
        }
      }
      if (!therapistId) {
        return { ok: false, persisted: false, error: 'We couldn’t match an expert yet. Buy a package or contact support.' }
      }
    }
    const therapist = await prisma.therapistProfile.findUnique({
      where: { id: therapistId },
      select: { id: true, sessionFee: true, clinicianType: true, specializations: true },
    })
    if (!therapist) return { ok: true, persisted: false }

    // Which package type this booking draws from, from the clinician's kind.
    const track = trackForClinician(therapist.clinicianType, therapist.specializations)

    // Wallet check: reserve a session from an active package of that type that
    // still has sessions left and whose validity covers the chosen date. The
    // session is deducted now (booking) and restored on a cancel > 24h out.
    const subs = await prisma.subscription.findMany({
      where: { userId, status: 'ACTIVE', trackSlug: track },
      orderBy: { createdAt: 'desc' },
      select: { id: true, sessionsTotal: true, sessionsUsed: true, expiresAt: true },
    })
    const reservable = subs.find(
      (s) => s.sessionsUsed < s.sessionsTotal && (!s.expiresAt || s.expiresAt.getTime() >= scheduledAt.getTime()),
    )
    if (!reservable) {
      const anyForTrack = subs.length > 0
      return {
        ok: false, persisted: false,
        error: anyForTrack
          ? 'This booking is outside your package validity or you have no sessions left. Add sessions or extend validity, then try again.'
          : `You don't have a ${TRACK_LABEL[track]} package. Buy one to book a session.`,
      }
    }

    // Count appointments BEFORE this booking so we can auto-send the intake form
    // only on the patient's very first session (#default forms by session number).
    const priorAppointments = await prisma.appointment.count({ where: { patientId: userId } })

    await prisma.$transaction([
      prisma.appointment.create({
        data: {
          patientId: userId,
          therapistId: therapist.id,
          scheduledAt,
          status: 'PENDING',
          fee: therapist.sessionFee,
          roomId: crypto.randomUUID(),
          consumedSubscriptionId: reservable.id,
        },
      }),
      prisma.subscription.update({ where: { id: reservable.id }, data: { sessionsUsed: reservable.sessionsUsed + 1 } }),
    ])

    // First-ever booking → queue the category-matched intake/information form.
    await autoSendIntakeForm(userId, priorAppointments)

    revalidatePath('/app/sessions')
    revalidatePath('/app/forms')
    revalidatePath('/app')
    revalidatePath('/app/therapist')
    revalidatePath('/app/billing')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not request this slot.' }
  }
}

/**
 * Record that the caller (patient or clinician) has joined the session room.
 * Sets the first-join timestamp for their side; the strict completion rule
 * (both joined + >= 30 min + a note) reads these. Safe to call repeatedly.
 */
export async function markSessionJoined(roomOrId: string): Promise<{ ok: boolean }> {
  const userId = await getSessionUserId()
  if (!userId || !roomOrId) return { ok: false }
  try {
    const appt = await prisma.appointment.findFirst({
      where: { OR: [{ id: roomOrId }, { roomId: roomOrId }] },
      select: { id: true, patientId: true, patientJoinedAt: true, therapistJoinedAt: true, therapist: { select: { userId: true } } },
    })
    if (!appt) return { ok: false }
    if (appt.patientId === userId) {
      if (!appt.patientJoinedAt) await prisma.appointment.update({ where: { id: appt.id }, data: { patientJoinedAt: new Date() } })
    } else if (appt.therapist.userId === userId) {
      if (!appt.therapistJoinedAt) await prisma.appointment.update({ where: { id: appt.id }, data: { therapistJoinedAt: new Date() } })
    } else {
      return { ok: false }
    }
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

const TRACK_LABEL: Record<string, string> = { therapy: 'individual therapy', couples: 'couples', psychiatry: 'psychiatry' }

/** Map a clinician to the package track a session with them draws from. */
function trackForClinician(clinicianType: string | null, specializations: string[]): 'therapy' | 'couples' | 'psychiatry' {
  const ct = (clinicianType ?? '').toLowerCase()
  const spec = specializations.join(' ').toLowerCase()
  if (ct.includes('psych') || spec.includes('psychiatr') || spec.includes('medication')) return 'psychiatry'
  if (ct.includes('couple') || spec.includes('couple')) return 'couples'
  return 'therapy'
}

const CANCEL_LEAD_MS = 24 * 60 * 60 * 1000

/** Patient cancels their own upcoming session. Allowed only ≥ 24h before the
 *  session; restores the reserved session to the package it was booked from. */
export async function cancelMyAppointment(appointmentId: string): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, persisted: false, error: 'Please sign in.' }
  try {
    const appt = await prisma.appointment.findFirst({
      where: { id: appointmentId, patientId: userId },
      select: { id: true, scheduledAt: true, status: true, consumedSubscriptionId: true },
    })
    if (!appt) return { ok: false, persisted: false, error: 'Session not found.' }
    if (appt.status === 'CANCELLED' || appt.status === 'COMPLETED') {
      return { ok: false, persisted: false, error: 'This session can no longer be cancelled.' }
    }
    if (appt.scheduledAt.getTime() - Date.now() < CANCEL_LEAD_MS) {
      return { ok: false, persisted: false, error: 'Sessions can only be cancelled at least 24 hours in advance.' }
    }
    // Restore the reserved session to its package, if it consumed one.
    const restoreSub = appt.consumedSubscriptionId
      ? await prisma.subscription.findUnique({ where: { id: appt.consumedSubscriptionId }, select: { id: true, sessionsUsed: true } })
      : null
    await prisma.$transaction([
      prisma.appointment.update({ where: { id: appt.id }, data: { status: 'CANCELLED', consumedSubscriptionId: null } }),
      ...(restoreSub ? [prisma.subscription.update({ where: { id: restoreSub.id }, data: { sessionsUsed: Math.max(0, restoreSub.sessionsUsed - 1) } })] : []),
    ])
    revalidatePath('/app/sessions'); revalidatePath('/app'); revalidatePath('/app/therapist'); revalidatePath('/app/billing')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not cancel this session.' }
  }
}

/** Patient reschedules their own session to a new slot. Allowed only ≥ 24h
 *  before the current time; keeps the reserved session. */
export async function rescheduleMyAppointment(appointmentId: string, newSlotIso: string): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, persisted: false, error: 'Please sign in.' }
  const newAt = new Date(newSlotIso)
  if (Number.isNaN(newAt.getTime()) || newAt.getTime() < Date.now() + MIN_BOOKING_LEAD_MS) {
    return { ok: false, persisted: false, error: 'Pick a new slot at least 6 hours from now.' }
  }
  try {
    const appt = await prisma.appointment.findFirst({
      where: { id: appointmentId, patientId: userId },
      select: { id: true, scheduledAt: true, status: true, consumedSubscriptionId: true },
    })
    if (!appt) return { ok: false, persisted: false, error: 'Session not found.' }
    if (appt.status === 'CANCELLED' || appt.status === 'COMPLETED') {
      return { ok: false, persisted: false, error: 'This session can no longer be changed.' }
    }
    if (appt.scheduledAt.getTime() - Date.now() < CANCEL_LEAD_MS) {
      return { ok: false, persisted: false, error: 'Sessions can only be rescheduled at least 24 hours in advance.' }
    }
    // Keep it inside the reserved package's validity.
    if (appt.consumedSubscriptionId) {
      const sub = await prisma.subscription.findUnique({ where: { id: appt.consumedSubscriptionId }, select: { expiresAt: true } })
      if (sub?.expiresAt && sub.expiresAt.getTime() < newAt.getTime()) {
        return { ok: false, persisted: false, error: 'That date is past your package validity. Pick an earlier slot or extend the package.' }
      }
    }
    await prisma.appointment.update({ where: { id: appt.id }, data: { scheduledAt: newAt, status: 'PENDING' } })
    revalidatePath('/app/sessions'); revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not reschedule this session.' }
  }
}

/**
 * Update the patient's per-category data-collection switches (#17). This is the
 * compliance control surface: turning a category off keeps the patient's own raw
 * record but excludes it from the AI pipeline, and feedToLlm is the master kill
 * switch. We persist the consent, then rebuild the abridged AiProfile so the
 * change takes effect immediately (it drops any now-disallowed context).
 */
export type PrivacyInput = {
  collectMood: boolean
  collectJournals: boolean
  collectSessions: boolean
  collectChats: boolean
  feedToLlm: boolean
}

export async function updatePrivacy(input: PrivacyInput): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    await prisma.privacySettings.upsert({
      where: { userId },
      create: { userId, ...input },
      update: { ...input },
    })
    await rebuildAiProfile(userId)
    revalidatePath('/app/settings')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not save your privacy settings.' }
  }
}

/**
 * Mark an expert-assigned task complete/incomplete (#16). Scoped to the signed-in
 * patient's own task rows. Completion is what feeds the weekly progress summary
 * both the patient and their expert see, so it must persist (not be local-only).
 */
export async function toggleTask(id: string, done: boolean): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    const result = await prisma.task.updateMany({
      where: { id, userId }, // ownership gate
      data: { completedAt: done ? new Date() : null },
    })
    if (result.count === 0) return { ok: true, persisted: false }
    revalidatePath('/app')
    revalidatePath('/app/progress')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not update this task.' }
  }
}

/** Add a medication to the patient's regimen (#14). Patient-owned record. */
export async function addMedication(input: {
  name: string
  dosage?: string
  frequency?: string
  times?: string[]
  prescribedBy?: string
}): Promise<ActionResult> {
  const name = input.name?.trim()
  if (!name) return { ok: false, persisted: false, error: 'Enter a medication name.' }

  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    await prisma.medication.create({
      data: {
        userId,
        name,
        dosage: input.dosage?.trim() || null,
        frequency: input.frequency?.trim() || null,
        times: input.times ?? [],
        prescribedBy: input.prescribedBy?.trim() || null,
        active: true,
      },
    })
    revalidatePath('/app/medications')
    revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not add this medication.' }
  }
}

/** Mark a medication active/stopped. Scoped to the signed-in patient's rows. */
export async function setMedicationActive(id: string, active: boolean): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    const result = await prisma.medication.updateMany({
      where: { id, userId }, // ownership gate
      data: { active, endedAt: active ? null : new Date() },
    })
    if (result.count === 0) return { ok: true, persisted: false }
    revalidatePath('/app/medications')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not update this medication.' }
  }
}

/**
 * Start a community discussion (#20). Posted under the patient's display name with
 * a Paid Member tenure badge derived from their subscription. Only a signed-in
 * patient can post; with no session the preview accepts it without persisting.
 */
export async function createCommunityPost(input: {
  title: string
  body: string
  tags?: string[]
}): Promise<ActionResult> {
  const title = input.title?.trim()
  const body = input.body?.trim()
  if (!title || !body) return { ok: false, persisted: false, error: 'Add a title and a message.' }

  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    const me = await communityIdentity(userId)
    await prisma.communityPost.create({
      data: {
        title,
        body,
        authorId: userId,
        authorName: me.name,
        authorRole: me.role,
        tenure: me.tenure,
        tags: input.tags ?? [],
      },
    })
    revalidatePath('/app/community')
    revalidatePath('/community')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not post your discussion.' }
  }
}

/**
 * Set the patient's display name. Used from Settings so accounts created by OTP
 * (which capture only an email/phone, no name) can add their real name instead
 * of being greeted by the demo fallback.
 */
export async function saveDisplayName(name: string): Promise<ActionResult> {
  const clean = name.trim().replace(/\s+/g, ' ').slice(0, 80)
  if (!clean) return { ok: false, persisted: false, error: 'Enter your name.' }

  const userId = await getSessionUserId()
  if (!userId) return { ok: false, persisted: false, error: 'Please sign in first.' }

  try {
    await prisma.user.update({ where: { id: userId }, data: { name: clean } })
    revalidatePath('/app')
    revalidatePath('/app/settings')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not save your name.' }
  }
}

/**
 * Reply to a community discussion. Signed-in members only; the comment is posted
 * under the same "First L." identity and Paid Member badge as their discussions.
 */
export async function addCommunityComment(input: {
  postId: string
  body: string
}): Promise<ActionResult> {
  const body = input.body?.trim()
  if (!input.postId || !body) return { ok: false, persisted: false, error: 'Write a reply first.' }

  const userId = await getSessionUserId()
  if (!userId) return { ok: false, persisted: false, error: 'Sign in to reply.' }

  try {
    const me = await communityIdentity(userId)
    await prisma.communityComment.create({
      data: {
        postId: input.postId,
        body,
        authorId: userId,
        authorName: me.name,
        authorRole: me.role,
      },
    })
    revalidatePath(`/community/${input.postId}`)
    revalidatePath('/community')
    revalidatePath('/app/community')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not post your reply.' }
  }
}

/**
 * Toggle a member's upvote on a post or a comment. One vote per member per
 * target: a second click removes it. The vote row and the denormalised counter
 * on the target move together in a single transaction so they never drift.
 */
export async function toggleCommunityUpvote(input: {
  postId?: string
  commentId?: string
}): Promise<UpvoteResult> {
  const { postId, commentId } = input
  if ((!postId && !commentId) || (postId && commentId)) {
    return { ok: false, count: 0, voted: false, error: 'Nothing to vote on.' }
  }

  const userId = await getSessionUserId()
  if (!userId) return { ok: false, count: 0, voted: false, error: 'Sign in to vote.' }

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.communityUpvote.findFirst({
        where: { userId, postId: postId ?? null, commentId: commentId ?? null },
        select: { id: true },
      })

      const step = existing ? -1 : 1
      if (existing) {
        await tx.communityUpvote.delete({ where: { id: existing.id } })
      } else {
        await tx.communityUpvote.create({ data: { userId, postId, commentId } })
      }

      const target = commentId
        ? await tx.communityComment.update({
            where: { id: commentId },
            data: { upvotes: { increment: step } },
            select: { upvotes: true },
          })
        : await tx.communityPost.update({
            where: { id: postId! },
            data: { upvotes: { increment: step } },
            select: { upvotes: true },
          })

      return { ok: true, count: Math.max(0, target.upvotes), voted: !existing }
    })
  } catch {
    return { ok: false, count: 0, voted: false, error: 'Could not register your vote.' }
  }
}

/**
 * Buy a session package (#packages). Additive by design, sessions are added to
 * any existing balance and validity is extended, never reset to zero (lib/billing).
 * An expired plan is renewed by topping up the same record.
 */
export async function buyPackage(
  track: BuyableTrack,
  packIndex: number,
  partner?: { name: string; phone: string; email: string }
): Promise<ActionResult & { partnerRequired?: boolean }> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    // Couples packs need the partner on record. Patients who onboarded for
    // individual therapy won't have one, so the buy flow collects it here.
    if (track === 'couples') {
      const onRecord = await hasPartnerOnRecord(userId)
      if (!onRecord) {
        if (!partner || !partner.name.trim()) {
          return { ok: false, persisted: false, partnerRequired: true, error: 'Please add your partner’s details to continue.' }
        }
        await savePartnerFor(userId, partner)
      }
    }

    const result = await buyPackageFor(userId, track, packIndex)
    if (!result.ok) return { ok: false, persisted: false, error: result.error ?? 'Could not complete purchase.' }
    // Auto-match a clinician for this package now, if the assessment is done.
    if (await hasAssessment(userId)) await matchAndAssignForTrack(userId, track as CareTrack)
    revalidatePath('/app/settings')
    revalidatePath('/app/billing')
    revalidatePath('/app')
    revalidatePath('/app/therapist')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not complete purchase.' }
  }
}

/** Buy a Calm+ app plan (extends validity for session-plan holders). */
export async function buyCalmPlus(packIndex: number): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    const result = await buyCalmPlusFor(userId, packIndex)
    if (!result.ok) return { ok: false, persisted: false, error: result.error ?? 'Could not complete purchase.' }
    revalidatePath('/app/settings')
    revalidatePath('/app/billing')
    revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not complete purchase.' }
  }
}

/**
 * Buy the fixed-price first session (799 therapy / 999 psychiatry / 1499
 * couples). Only valid while the patient has no session history; couples
 * first sessions also collect the partner if missing.
 */
export async function buyFirstSession(
  track: BuyableTrack,
  partner?: { name: string; phone: string; email: string }
): Promise<ActionResult & { partnerRequired?: boolean }> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    if (track === 'couples') {
      const onRecord = await hasPartnerOnRecord(userId)
      if (!onRecord) {
        if (!partner || !partner.name.trim()) {
          return { ok: false, persisted: false, partnerRequired: true, error: 'Please add your partner’s details to continue.' }
        }
        await savePartnerFor(userId, partner)
      }
    }

    const result = await buyFirstSessionFor(userId, track)
    if (!result.ok) return { ok: false, persisted: false, error: result.error ?? 'Could not complete purchase.' }
    if (await hasAssessment(userId)) await matchAndAssignForTrack(userId, track as CareTrack)
    revalidatePath('/app/settings')
    revalidatePath('/app/billing')
    revalidatePath('/app')
    revalidatePath('/app/therapist')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not complete purchase.' }
  }
}

/**
 * Rate a completed session (#ratings). Scoped to the patient's own appointment;
 * recomputes the clinician's real rating average. Re-rating updates the score.
 */
export async function submitSessionReview(
  appointmentId: string,
  rating: number,
  comment?: string,
): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    const res = await submitReview(userId, appointmentId, rating, comment)
    if (!res.ok) return { ok: false, persisted: false, error: res.error }
    revalidatePath('/app/sessions')
    revalidatePath(`/app/sessions/${appointmentId}`)
    revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not save your rating.' }
  }
}

/** Submit answers to an assigned form (#forms). Scoped to the patient's own assignment. */
export async function submitAssignedForm(
  assignmentId: string,
  responses: Record<string, string | boolean>
): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    const ok = await submitForm(userId, assignmentId, responses)
    if (!ok) return { ok: false, persisted: false, error: 'This form is no longer available.' }
    revalidatePath('/app/forms')
    revalidatePath(`/app/forms/${assignmentId}`)
    revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not submit this form.' }
  }
}

/**
 * Order a home delivery for a prescribed medication (#delivery). Mock payment for
 * now, the order is marked paid and queued; pharmacy fulfilment is wired later.
 */
export async function orderMedicationDelivery(
  medicationId: string,
  details: DeliveryDetails
): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  try {
    const res = await placeMedicationOrder(userId, medicationId, details)
    if (!res.ok) return { ok: false, persisted: false, error: res.error ?? 'Could not place order.' }
    revalidatePath('/app/medications')
    revalidatePath('/app/notifications')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not place order.' }
  }
}

/** Mark all the patient's notifications read (clears the bell). */
export async function markNotificationsRead(): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }
  try {
    await markAllRead(userId)
    revalidatePath('/app/notifications')
    revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not update notifications.' }
  }
}

// A gentle, rule-based stand-in for the deferred Calm AI model. It reflects,
// validates, and nudges toward a concrete coping step, and surfaces a safety
// message when the text suggests crisis. Deliberately simple and transparent.
function calmAiStandInReply(text: string): string {
  const t = text.toLowerCase()
  const crisis = ['suicid', 'kill myself', 'end my life', 'self harm', 'self-harm', 'hurt myself']
  if (crisis.some((k) => t.includes(k))) {
    return "I'm really glad you told me, what you're feeling matters, and you don't have to carry it alone. I'm not able to help in an emergency, so please reach out right now to your expert or a helpline (in India, iCall: 9152987821, or Tele-MANAS: 14416). If you're in immediate danger, please call your local emergency number."
  }
  const opener = ['anxious', 'anxiety', 'panic', 'worried'].some((k) => t.includes(k))
    ? "It sounds like anxiety is sitting heavy with you right now. That's exhausting, and it makes sense that you'd want some relief."
    : ['sad', 'depress', 'empty', 'low', 'hopeless'].some((k) => t.includes(k))
      ? 'Thank you for naming that, low, heavy days are hard, and reaching out takes real strength.'
      : ['sleep', 'tired', 'insomnia', 'awake'].some((k) => t.includes(k))
        ? 'Rest that won’t come is its own kind of tiring. Your mind and body are asking for some care.'
        : ['work', 'job', 'boss', 'deadline'].some((k) => t.includes(k))
          ? 'Work pressure has a way of following us home. It’s okay to want a boundary around it.'
          : 'I hear you, and I’m glad you’re putting words to it here.'
  return `${opener}\n\nWould it help to try one small thing right now, a slow 4-7-8 breath, or jotting the loudest thought in your journal so it’s out of your head? And it might be worth bringing this to your next session; I can help you note it down.\n\n(I’m a supportive companion, not a substitute for your expert or for care in an emergency.)`
}

/**
 * Send a message to Calm AI (#11). For a signed-in patient this runs the real
 * classified-routing pipeline (lib/ai/chat.ts) when a model is configured, it
 * classifies the turn, routes to the right model, persists both turns with
 * metadata, and writes a crisis hand-off when needed. With no model configured
 * (or no session) it falls back to the transparent rule-based stand-in. All AI
 * context use stays gated by PrivacySettings inside the pipeline.
 */
export async function sendCalmAiMessage(
  text: string
): Promise<{ ok: boolean; reply?: string; error?: string }> {
  const content = text?.trim()
  if (!content) return { ok: false, error: 'Type a message first.' }

  const userId = await getSessionUserId()
  if (!userId) return { ok: true, reply: calmAiStandInReply(content) } // preview: no persistence

  try {
    // Real pipeline (persists both turns + any crisis alert) when an LLM is set up.
    const result = await runChat(userId, content)
    if (result) {
      await rebuildAiProfile(userId)
      revalidatePath('/app/calm-ai')
      return { ok: true, reply: result.reply }
    }

    // Fallback: rule-based stand-in, persisted the same way.
    const reply = calmAiStandInReply(content)
    await prisma.calmAiMessage.create({ data: { userId, role: 'USER', content } })
    await prisma.calmAiMessage.create({ data: { userId, role: 'ASSISTANT', content: reply } })
    await rebuildAiProfile(userId)
    revalidatePath('/app/calm-ai')
    return { ok: true, reply }
  } catch {
    return { ok: false, error: 'Could not send your message.' }
  }
}
