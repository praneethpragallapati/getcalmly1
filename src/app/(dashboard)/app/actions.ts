'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSessionUserId, getSessionPatientId } from '@/lib/patient'
import { rebuildAiProfile, runChat } from '@/lib/ai'
import { buyPackageFor, buyFirstSessionFor, buyCalmPlusFor, hasPartnerOnRecord, savePartnerFor, type BuyableTrack, type BuyResult } from '@/lib/billing'
import { autoSendIntakeForm, submitForm, runBookingFormRules } from '@/lib/forms'
import { placeMedicationOrder, type DeliveryDetails } from '@/lib/orders'
import { markAllRead, notify } from '@/lib/notifications'
import { ensurePollSchema } from '@/lib/polls'
import { fmtIST } from '@/lib/tz'
import { submitReview } from '@/lib/reviews'
import { getAssignedTherapistId, canPatientBookWith, MIN_BOOKING_LEAD_MS } from '@/lib/expert'
import { communityIdentity } from '@/lib/community'
import { normalizeTags } from '@/data/tags'
import { matchAndAssignForTrack, hasAssessment, type CareTrack } from '@/lib/matching'
import { rateLimit } from '@/lib/rateLimit'
import { isPsychiatrist } from '@/lib/clinicianScope'
import { sessionDurationMins, ensureSessionPresenceSchema, recordPresenceBeat } from '@/lib/sessionLifecycle'
import { normalizeCountry } from '@/lib/countries'
import { ensureContactSchema } from '@/lib/contactSchema'
import { pickHelplines } from '@/config/site'

// Assessment concern tag → a short human label for the primary concern.
const TAG_LABEL: Record<string, string> = {
  anxiety: 'Anxiety', panic: 'Panic & anxiety', 'low-mood': 'Low mood', depression: 'Depression',
  'work-stress': 'Work stress', burnout: 'Burnout', career: 'Career stress',
  relationships: 'Relationships', couples: 'Relationship', communication: 'Communication',
  family: 'Family', conflict: 'Conflict', loneliness: 'Loneliness',
  'self-esteem': 'Self-worth', confidence: 'Confidence', sleep: 'Sleep',
  grief: 'Grief & loss', loss: 'Grief & loss', trauma: 'Trauma',
  'life-transitions': 'Life change', anger: 'Anger', medication: 'Medication review',
  psychiatry: 'Psychiatric care', ocd: 'OCD', bipolar: 'Mood', adhd: 'Focus & attention',
  child: 'Child wellbeing', adolescent: 'Teen wellbeing', 'exam-stress': 'Exam stress',
}

/**
 * Persist the result of the detailed assessment (the same questionnaire shown
 * on the marketing site) to the patient's profile, then match a clinician for
 * every package they already hold. This is the source of truth for
 * auto-matching; booking requires it to be completed first.
 */
export async function saveAssessmentResult(payload: {
  type: string
  tags: string[]
  language?: string | null
  genderPref?: string | null
  severity?: string
  riskFlag?: boolean
}): Promise<ActionResult> {
  const userId = await getSessionPatientId()
  if (!userId) return { ok: false, persisted: false, error: 'Please sign in.' }

  const tags = [...new Set((payload.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean))]
  if (tags.length === 0) return { ok: false, persisted: false, error: 'Please answer the assessment so we can match you.' }
  const primary = tags[0]
  const language = payload.language && payload.language !== 'Other' ? payload.language.trim() : null

  try {
    await prisma.patientProfile.upsert({
      where: { userId },
      update: {
        track: tags,
        subTrack: primary,
        trackLabel: TAG_LABEL[primary] ?? null,
        ...(language ? { preferredLanguage: language } : {}),
      },
      create: {
        userId,
        patientId: `P-${Date.now().toString(36).toUpperCase()}`,
        careMode: 'INDIVIDUAL',
        track: tags,
        subTrack: primary,
        trackLabel: TAG_LABEL[primary] ?? null,
        preferredLanguage: language,
        country: 'IN',
      },
    })

    // Assign a clinician ONLY for the care types the patient actually holds a
    // package for. We never attach an expert to a care type the patient hasn't
    // bought (e.g. don't put a therapist on Individual when they only bought
    // Psychiatry). Assessment answers only influence WHICH clinician is picked.
    //
    // Best-effort: the assessment is already saved above, so auto-assignment must
    // never fail the save. If matching throws (e.g. a deployment whose DB is
    // missing the clinicianType column from migration 0017), we still report the
    // save as successful — the patient can be assigned by an admin, and matching
    // resumes working once the migration is applied.
    try {
      const subs = await prisma.subscription.findMany({
        where: { userId, status: 'ACTIVE' },
        select: { trackSlug: true },
      })
      const tracks = new Set<CareTrack>()
      for (const s of subs) {
        if (s.trackSlug === 'therapy' || s.trackSlug === 'couples' || s.trackSlug === 'psychiatry') tracks.add(s.trackSlug)
      }
      for (const t of tracks) await matchAndAssignForTrack(userId, t)
    } catch (e) {
      console.error('[saveAssessmentResult] auto-assignment skipped (matching failed — migration 0016/0017 applied?)', e)
    }

    revalidatePath('/app')
    revalidatePath('/app/therapist')
    revalidatePath('/app/sessions')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not save your assessment. Please try again.' }
  }
}

export type ActionResult = { ok: boolean; persisted: boolean; error?: string }

/**
 * DPDP data portability: return everything we hold about the signed-in patient
 * as a JSON string the browser can download. Read-only; each section is fetched
 * defensively so one missing table can't fail the whole export.
 */
export async function exportMyData(): Promise<{ ok: boolean; json?: string; error?: string }> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, error: 'Please sign in again.' }
  const q = <T>(p: Promise<T>, fallback: T): Promise<T> => p.catch(() => fallback)
  try {
    const [user, moods, journals, tasks, appts, subs, payments, meds, orders, posts, comments, votes, reviews] = await Promise.all([
      q(prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, phone: true, createdAt: true, patientProfile: true } }), null),
      q(prisma.moodEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }), []),
      q(prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }), []),
      q(prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }), []),
      q(prisma.appointment.findMany({ where: { patientId: userId }, orderBy: { scheduledAt: 'desc' }, select: { scheduledAt: true, status: true, durationMins: true, fee: true, summary: true, preSessionNote: true, createdAt: true } }), []),
      q(prisma.subscription.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { planName: true, trackSlug: true, status: true, sessionsTotal: true, sessionsUsed: true, expiresAt: true, createdAt: true } }), []),
      q(prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { amount: true, kind: true, planName: true, trackSlug: true, createdAt: true } }), []),
      q(prisma.medication.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }), []),
      q(prisma.medicationOrder.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }), []),
      q(prisma.communityPost.findMany({ where: { authorId: userId }, orderBy: { createdAt: 'desc' }, select: { title: true, body: true, tags: true, anonymous: true, createdAt: true } }), []),
      q(prisma.communityComment.findMany({ where: { authorId: userId }, orderBy: { createdAt: 'desc' }, select: { body: true, anonymous: true, createdAt: true } }), []),
      q(prisma.pollVote.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { pollId: true, optionIndex: true, createdAt: true } }), []),
      q(prisma.sessionReview.findMany({ where: { patientId: userId }, orderBy: { createdAt: 'desc' }, select: { rating: true, comment: true, createdAt: true } }), []),
    ])
    const payload = {
      exportedAt: new Date().toISOString(),
      note: 'Your getCalmly data. Timestamps are in UTC (ISO 8601).',
      account: user,
      moodCheckIns: moods,
      journalEntries: journals,
      tasks,
      appointments: appts,
      subscriptions: subs,
      payments,
      medications: meds,
      medicationOrders: orders,
      communityPosts: posts,
      communityComments: comments,
      pollVotes: votes,
      sessionRatings: reviews,
    }
    return { ok: true, json: JSON.stringify(payload, null, 2) }
  } catch {
    return { ok: false, error: 'Could not prepare your data export.' }
  }
}

/**
 * DPDP right to erasure: permanently delete the signed-in patient's account and
 * all their data. Non-cascading child rows (mood, journal, appointments) are
 * removed explicitly first, in one transaction, then the user row cascades the
 * rest. Only PATIENT accounts may self-delete here.
 */
export async function deleteMyAccount(): Promise<{ ok: boolean; error?: string }> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, error: 'Please sign in again.' }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    if (!user) return { ok: false, error: 'Account not found.' }
    if (user.role !== 'PATIENT') return { ok: false, error: 'Only patient accounts can self-delete. Contact support.' }
    await prisma.$transaction([
      prisma.moodEntry.deleteMany({ where: { userId } }),
      prisma.journalEntry.deleteMany({ where: { userId } }),
      prisma.appointment.deleteMany({ where: { patientId: userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ])
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not delete your account. Please contact support.' }
  }
}

/**
 * Cast (or change) this member's vote on a Calm Club poll. One vote per member
 * per poll — re-voting updates the existing row. Rejected once the poll expires.
 */
export async function votePoll(input: { pollId: string; optionIndex: number }): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, persisted: false, error: 'Sign in to vote.' }
  try {
    await ensurePollSchema()
    const poll = await prisma.poll.findUnique({ where: { id: input.pollId }, select: { options: true, expiresAt: true, multiple: true } })
    if (!poll) return { ok: false, persisted: false, error: 'Poll not found.' }
    if (poll.expiresAt && poll.expiresAt.getTime() < Date.now()) return { ok: false, persisted: false, error: 'This poll has closed.' }
    const idx = Math.trunc(input.optionIndex)
    if (idx < 0 || idx >= poll.options.length) return { ok: false, persisted: false, error: 'Invalid option.' }

    if (poll.multiple) {
      // Toggle this option on/off, leaving the member's other choices intact.
      const existing = await prisma.pollVote.findFirst({ where: { pollId: input.pollId, userId, optionIndex: idx }, select: { id: true } })
      if (existing) await prisma.pollVote.delete({ where: { id: existing.id } })
      else await prisma.pollVote.create({ data: { pollId: input.pollId, userId, optionIndex: idx } })
    } else {
      // Single choice: replace any prior vote atomically.
      await prisma.$transaction([
        prisma.pollVote.deleteMany({ where: { pollId: input.pollId, userId } }),
        prisma.pollVote.create({ data: { pollId: input.pollId, userId, optionIndex: idx } }),
      ])
    }
    revalidatePath('/app/community'); revalidatePath('/community'); revalidatePath('/app/polls'); revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not record your vote.' }
  }
}

export type UpvoteResult = { ok: boolean; count: number; voted: boolean; error?: string }

/**
 * Save today's mood check-in (#8). Persists the patient's own raw record at the
 * mood/energy/calm grain. Authorization: writes only to the signed-in user's
 * rows; with no session it fails with a clear "sign in again" error rather than
 * reporting a phantom success. The AI pipeline is refreshed separately, behind privacy.
 */
export async function saveCheckin(scores: {
  mood: number
  energy: number
  calm: number
}): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

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
    // AI profile refresh is a nice-to-have; never let it fail a saved check-in.
    await rebuildAiProfile(userId).catch(() => {})
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
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

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
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

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
 * Book a session at one of the expert's open slots (#9). The booking is
 * CONFIRMED immediately — there is no expert confirm/decline step. If the expert
 * later needs to drop the session, that goes through an admin-approved
 * cancellation instead. Persists only for the signed-in patient and only when an
 * active expert exists; otherwise it succeeds without persisting so the preview
 * stays usable (same posture as the other actions).
 */
export async function requestSession(slotIso: string, therapistIdOverride?: string): Promise<ActionResult> {
  const userId = await getSessionPatientId()
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

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

    // Count appointments BEFORE this booking so we can auto-send the intake form
    // only on the patient's very first session (#default forms by session number).
    const priorAppointments = await prisma.appointment.count({ where: { patientId: userId } })

    // Candidate packages of this type (most recent first). The actual reserve is
    // an atomic guarded UPDATE per candidate, so concurrent bookings can never
    // oversell the last session: the `sessionsUsed < sessionsTotal` guard lives
    // in the UPDATE's WHERE and is re-checked under the row lock (any losing
    // concurrent write simply affects 0 rows and moves to the next candidate).
    const candidates = await prisma.subscription.findMany({
      where: { userId, status: 'ACTIVE', trackSlug: track },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })

    let claimedId: string | null = null
    for (const c of candidates) {
      const claimed = await prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<{ id: string }[]>`
          UPDATE "Subscription" SET "sessionsUsed" = "sessionsUsed" + 1
          WHERE id = ${c.id} AND status = 'ACTIVE'
            AND "sessionsUsed" < "sessionsTotal"
            AND ("expiresAt" IS NULL OR "expiresAt" >= ${scheduledAt})
          RETURNING id`
        if (rows.length === 0) return null
        await tx.appointment.create({
          data: {
            patientId: userId,
            therapistId: therapist.id,
            scheduledAt,
            durationMins: sessionDurationMins(isPsychiatrist(therapist.clinicianType, therapist.specializations)),
            status: 'CONFIRMED',
            fee: therapist.sessionFee,
            roomId: crypto.randomUUID(),
            consumedSubscriptionId: c.id,
          },
        })
        return c.id
      })
      if (claimed) { claimedId = claimed; break }
    }

    if (!claimedId) {
      return {
        ok: false, persisted: false,
        error: candidates.length > 0
          ? 'This booking is outside your package validity or you have no sessions left. Add sessions or extend validity, then try again.'
          : `You don't have a ${TRACK_LABEL[track]} package. Buy one to book a session.`,
      }
    }

    // First-ever booking → queue the category-matched intake/information form.
    await autoSendIntakeForm(userId, priorAppointments)

    // Default-form rules: send any forms configured (by admin or this clinician)
    // for this package type at this session number. sessionNumber is this
    // booking's position within the track — count appointments consuming this
    // track's packages (includes the one just created).
    try {
      const trackSubIds = (await prisma.subscription.findMany({
        where: { userId, trackSlug: track }, select: { id: true },
      })).map((s) => s.id)
      const sessionNumber = trackSubIds.length
        ? await prisma.appointment.count({ where: { patientId: userId, consumedSubscriptionId: { in: trackSubIds } } })
        : priorAppointments + 1
      await runBookingFormRules({ patientId: userId, trackSlug: track, therapistId: therapist.id, therapistName: null, sessionNumber })
    } catch { /* best-effort — never block a completed booking */ }

    // Tell the patient their booking is confirmed.
    await notify(userId, {
      type: 'booking',
      title: 'Session booked',
      body: `Your ${TRACK_LABEL[track] ?? 'therapy'} session is confirmed for ${fmtIST(scheduledAt, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}.`,
      href: '/app/sessions',
    })

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
 * Presence heartbeat: records that the caller (patient or clinician) is in the
 * session room right now. Sets the first-join timestamp once, and refreshes
 * their `lastSeenAt` on every call — the room pings this every ~20s while open,
 * so "time together" is measured from real presence (join → last seen), and a
 * call that ends early is measured by when the pings stopped, not the scheduled
 * window. Safe to call repeatedly; used by both the patient and clinician rooms.
 */
export async function markSessionJoined(roomOrId: string): Promise<{ ok: boolean }> {
  const userId = await getSessionUserId()
  if (!userId || !roomOrId) return { ok: false }
  try {
    await ensureSessionPresenceSchema()
    const appt = await prisma.appointment.findFirst({
      where: { OR: [{ id: roomOrId }, { roomId: roomOrId }] },
      select: { id: true, patientId: true, patientJoinedAt: true, therapistJoinedAt: true, therapist: { select: { userId: true } } },
    })
    if (!appt) return { ok: false }
    const now = new Date()
    // The Appointment columns stay the first-join / last-seen summary that
    // settlement and the existing views read; the span log additionally records
    // each separate stretch, so leaving and rejoining is visible.
    if (appt.patientId === userId) {
      await prisma.appointment.update({ where: { id: appt.id }, data: { patientJoinedAt: appt.patientJoinedAt ?? now, patientLastSeenAt: now } })
      await recordPresenceBeat(appt.id, 'PATIENT', userId, now)
    } else if (appt.therapist.userId === userId) {
      await prisma.appointment.update({ where: { id: appt.id }, data: { therapistJoinedAt: appt.therapistJoinedAt ?? now, therapistLastSeenAt: now } })
      await recordPresenceBeat(appt.id, 'THERAPIST', userId, now)
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
    // Restore the reserved session to its package, if it consumed one. Use an
    // atomic guarded decrement (not a read-then-absolute-set): a concurrent
    // booking incrementing sessionsUsed must never be clobbered, and the
    // `sessionsUsed > 0` guard keeps it from going negative.
    await prisma.$transaction([
      prisma.appointment.update({ where: { id: appt.id }, data: { status: 'CANCELLED', consumedSubscriptionId: null } }),
      ...(appt.consumedSubscriptionId
        ? [prisma.subscription.updateMany({
            where: { id: appt.consumedSubscriptionId, sessionsUsed: { gt: 0 } },
            data: { sessionsUsed: { decrement: 1 } },
          })]
        : []),
    ])
    await notify(userId, {
      type: 'cancellation',
      title: 'Session cancelled',
      body: `Your session on ${fmtIST(appt.scheduledAt, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} was cancelled and the session credited back.`,
      href: '/app/sessions',
    })
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
    // Moving the time invalidates any prior confirmation, so mark it RESCHEDULED
    // (the same state the expert-side reschedule uses) rather than silently
    // dropping a CONFIRMED booking to a fresh-looking PENDING. It stays visible
    // as upcoming and signals both sides that the new slot needs re-confirmation.
    await prisma.appointment.update({ where: { id: appt.id }, data: { scheduledAt: newAt, status: 'RESCHEDULED' } })
    await notify(userId, {
      type: 'reschedule',
      title: 'Session rescheduled',
      body: `Your session was moved to ${fmtIST(newAt, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}.`,
      href: '/app/sessions',
    })
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
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

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
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

  try {
    const result = await prisma.task.updateMany({
      where: { id, userId }, // ownership gate
      data: { completedAt: done ? new Date() : null },
    })
    if (result.count === 0) return { ok: true, persisted: false }
    revalidatePath('/app')
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
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

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
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

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
  anonymous?: boolean
}): Promise<ActionResult> {
  const title = input.title?.trim()
  const body = input.body?.trim()
  if (!title || !body) return { ok: false, persisted: false, error: 'Add a title and a message.' }

  const userId = await getSessionUserId()
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

  try {
    const me = await communityIdentity(userId)
    // Anonymous posts show as a neutral "Anonymous · Member" to peers; the real
    // name/role/tenure are never stored on the row. authorId is still linked so
    // the author's own "My posts" filter and moderation keep working.
    const anon = Boolean(input.anonymous)
    await prisma.communityPost.create({
      data: {
        title,
        body,
        authorId: userId,
        authorName: anon ? 'Anonymous' : me.name,
        authorRole: anon ? 'MEMBER' : me.role,
        tenure: anon ? null : me.tenure,
        anonymous: anon,
        tags: normalizeTags(input.tags ?? []),
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

/** An uploaded photo, stored inline as a data URL (same convention as blog covers). */
const MAX_PHOTO_BYTES = 2_000_000 // ~2 MB after base64; keeps the row small
function validPhoto(dataUrl: string | null | undefined): string | null | undefined {
  if (dataUrl === undefined) return undefined // caller isn't changing the photo
  if (dataUrl === null || dataUrl === '') return null // explicit removal
  if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(dataUrl)) return undefined
  if (dataUrl.length > MAX_PHOTO_BYTES) return undefined
  return dataUrl
}

export type PatientProfileInput = {
  name?: string
  phone?: string | null
  gender?: string | null
  dateOfBirth?: string | null // ISO date (yyyy-mm-dd) or null
  country?: string | null
  state?: string | null
  city?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  postalCode?: string | null
  preferredLanguage?: string | null
  occupation?: string | null
  maritalStatus?: string | null
  emergencyName?: string | null
  emergencyPhone?: string | null
  emergencyRelation?: string | null
  photo?: string | null // data URL, '' / null to remove, omit to leave unchanged
}

/**
 * Update the signed-in patient's own profile — everything except their email,
 * which is the login identity and stays fixed. Name/phone/photo live on the User
 * row; the personal & emergency-contact fields live on PatientProfile.
 */
export async function updatePatientProfile(input: PatientProfileInput): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, persisted: false, error: 'Please sign in first.' }

  const clean = (v: string | null | undefined, max: number): string | null | undefined => {
    if (v === undefined) return undefined
    const t = (v ?? '').trim()
    return t ? t.replace(/\s+/g, ' ').slice(0, max) : null
  }

  const name = input.name !== undefined ? input.name.trim().replace(/\s+/g, ' ').slice(0, 80) : undefined
  if (input.name !== undefined && !name) return { ok: false, persisted: false, error: 'Enter your name.' }

  const photo = validPhoto(input.photo)
  if (input.photo !== undefined && input.photo && photo === undefined) {
    return { ok: false, persisted: false, error: 'Use a JPG/PNG/WebP image under 2 MB.' }
  }

  let dob: Date | null | undefined = undefined
  if (input.dateOfBirth !== undefined) {
    if (!input.dateOfBirth) dob = null
    else {
      const d = new Date(input.dateOfBirth)
      if (Number.isNaN(d.getTime()) || d.getTime() > Date.now()) {
        return { ok: false, persisted: false, error: 'Enter a valid date of birth.' }
      }
      dob = d
    }
  }

  try {
    // The address/occupation columns must exist before we write them.
    await ensureContactSchema().catch(() => {})
    const userData: Record<string, unknown> = {}
    if (name !== undefined) userData.name = name
    const phone = clean(input.phone, 20)
    if (phone !== undefined) userData.phone = phone
    if (photo !== undefined) userData.image = photo
    if (Object.keys(userData).length) await prisma.user.update({ where: { id: userId }, data: userData })

    const profileData: Record<string, unknown> = {}
    const gender = clean(input.gender, 30)
    if (gender !== undefined) profileData.gender = gender
    if (dob !== undefined) profileData.dateOfBirth = dob
    if (input.country !== undefined) profileData.country = normalizeCountry(input.country)
    const state = clean(input.state, 60)
    if (state !== undefined) profileData.state = state
    const city = clean(input.city, 60)
    if (city !== undefined) profileData.city = city
    const addr1 = clean(input.addressLine1, 120)
    if (addr1 !== undefined) profileData.addressLine1 = addr1
    const addr2 = clean(input.addressLine2, 120)
    if (addr2 !== undefined) profileData.addressLine2 = addr2
    const pin = clean(input.postalCode, 16)
    if (pin !== undefined) profileData.postalCode = pin
    const lang = clean(input.preferredLanguage, 40)
    if (lang !== undefined) profileData.preferredLanguage = lang
    const occupation = clean(input.occupation, 80)
    if (occupation !== undefined) profileData.occupation = occupation
    const marital = clean(input.maritalStatus, 40)
    if (marital !== undefined) profileData.maritalStatus = marital
    const emN = clean(input.emergencyName, 80)
    if (emN !== undefined) profileData.emergencyName = emN
    const emP = clean(input.emergencyPhone, 20)
    if (emP !== undefined) profileData.emergencyPhone = emP
    const emR = clean(input.emergencyRelation, 40)
    if (emR !== undefined) profileData.emergencyRelation = emR
    if (Object.keys(profileData).length) {
      // The patient may not have a profile row yet — upsert so the first save works.
      await prisma.patientProfile.upsert({
        where: { userId },
        update: profileData,
        create: { userId, patientId: `GC-P-${userId.slice(-8)}`, ...profileData },
      })
    }

    revalidatePath('/app')
    revalidatePath('/app/settings')
    revalidatePath('/app/community')
    revalidatePath('/community')
    return { ok: true, persisted: true }
  } catch (e) {
    const msg = e instanceof Error && /Unique constraint/i.test(e.message)
      ? 'That phone number is already in use.'
      : 'Could not save your profile.'
    return { ok: false, persisted: false, error: msg }
  }
}

/**
 * Reply to a community discussion. Signed-in members only; the comment is posted
 * under the same "First L." identity and Paid Member badge as their discussions.
 */
export async function addCommunityComment(input: {
  postId: string
  body: string
  anonymous?: boolean
}): Promise<ActionResult> {
  const body = input.body?.trim()
  if (!input.postId || !body) return { ok: false, persisted: false, error: 'Write a reply first.' }

  const userId = await getSessionUserId()
  if (!userId) return { ok: false, persisted: false, error: 'Sign in to reply.' }

  try {
    const me = await communityIdentity(userId)
    const anon = Boolean(input.anonymous)
    await prisma.communityComment.create({
      data: {
        postId: input.postId,
        body,
        authorId: userId,
        authorName: anon ? 'Anonymous' : me.name,
        authorRole: anon ? 'MEMBER' : me.role,
        anonymous: anon,
      },
    })
    // Notify the post's author of a new reply (not for replying to yourself).
    const post = await prisma.communityPost.findUnique({ where: { id: input.postId }, select: { authorId: true, title: true } }).catch(() => null)
    if (post?.authorId && post.authorId !== userId) {
      await notify(post.authorId, { type: 'community', title: 'New reply to your post', body: post.title, href: `/app/community` })
    }
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

/** Notify the buyer their payment went through, with a link to the invoice PDF. */
async function notifyPurchase(userId: string, result: BuyResult): Promise<void> {
  if (!result.paymentId) return
  await notify(userId, {
    type: 'invoice',
    title: 'Payment successful — invoice ready',
    body: `₹${(result.amountPaid ?? 0).toLocaleString('en-IN')} paid for ${result.planName ?? 'your purchase'}. Tap to download your invoice.`,
    href: `/app/billing/invoice/${result.paymentId}`,
  })
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
  const userId = await getSessionPatientId()
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

  // Idempotency guard against double-submit (#2): checkout is instant and
  // purchases are additive, so without this a double-click would top up — and
  // "charge" — twice. One purchase of the same pack per few seconds; the button
  // is also disabled while pending. The partial-unique index is the hard backstop
  // against duplicate ACTIVE rows.
  if (!rateLimit(`buy:${userId}:${track}:${packIndex}`, 1, 4000).ok) {
    return { ok: false, persisted: false, error: 'That purchase just went through — check your balance before buying again.' }
  }

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
    await notifyPurchase(userId, result)
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
  const userId = await getSessionPatientId()
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }
  if (!rateLimit(`buycalm:${userId}:${packIndex}`, 1, 4000).ok) {
    return { ok: false, persisted: false, error: 'That purchase just went through — check your balance before buying again.' }
  }

  try {
    const result = await buyCalmPlusFor(userId, packIndex)
    if (!result.ok) return { ok: false, persisted: false, error: result.error ?? 'Could not complete purchase.' }
    await notifyPurchase(userId, result)
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
  const userId = await getSessionPatientId()
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }
  if (!rateLimit(`buyfirst:${userId}:${track}`, 1, 4000).ok) {
    return { ok: false, persisted: false, error: 'That purchase just went through — check your balance before buying again.' }
  }

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
    await notifyPurchase(userId, result)
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
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

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
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

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
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }

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
  if (!userId) return { ok: false, persisted: false, error: 'Your session has ended. Please sign in again.' }
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
    // Numbers come from the one helpline list, so this reply can never quote a
    // number that differs from the safety page or the dashboard helpline panel.
    const lines = pickHelplines('icall', 'telemanas').map((h) => `${h.name}: ${h.number}`).join(', or ')
    return `I'm really glad you told me, what you're feeling matters, and you don't have to carry it alone. I'm not able to help in an emergency, so please reach out right now to your expert or a helpline (in India, ${lines}). If you're in immediate danger, please call your local emergency number.`
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
