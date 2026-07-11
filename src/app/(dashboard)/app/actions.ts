'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/patient'
import { rebuildAiProfile, runChat } from '@/lib/ai'
import { buyPackageFor, buyFirstSessionFor, hasPartnerOnRecord, savePartnerFor, type BuyableTrack } from '@/lib/billing'
import { autoSendIntakeForm, submitForm } from '@/lib/forms'
import { placeMedicationOrder, type DeliveryDetails } from '@/lib/orders'
import { markAllRead } from '@/lib/notifications'

export type ActionResult = { ok: boolean; persisted: boolean; error?: string }

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
  try {
    await prisma.moodEntry.create({
      data: {
        userId,
        mood: clamp(scores.mood),
        energy: clamp(scores.energy),
        calm: clamp(scores.calm),
        source: 'home-checkin',
      },
    })
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
export async function requestSession(slotIso: string): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  const scheduledAt = new Date(slotIso)
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
    return { ok: false, persisted: false, error: 'Please pick a valid upcoming slot.' }
  }

  try {
    const therapist = await prisma.therapistProfile.findFirst({
      where: { isActive: true },
      select: { id: true, sessionFee: true },
    })
    if (!therapist) return { ok: true, persisted: false }

    // Count appointments BEFORE this booking so we can auto-send the intake form
    // only on the patient's very first session (#default forms by session number).
    const priorAppointments = await prisma.appointment.count({ where: { patientId: userId } })

    await prisma.appointment.create({
      data: {
        patientId: userId,
        therapistId: therapist.id,
        scheduledAt,
        status: 'PENDING',
        fee: therapist.sessionFee,
        roomId: crypto.randomUUID(),
      },
    })

    // First-ever booking → queue the category-matched intake/information form.
    await autoSendIntakeForm(userId, priorAppointments)

    revalidatePath('/app/sessions')
    revalidatePath('/app/forms')
    revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not request this slot.' }
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
    const [user, sub] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        select: { paidMonths: true },
      }),
    ])
    const parts = (user?.name ?? 'Member').split(' ')
    const displayName =
      parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.` : parts[0]

    await prisma.communityPost.create({
      data: {
        title,
        body,
        authorId: userId,
        authorName: displayName,
        authorRole: sub ? 'PAID_MEMBER' : 'MEMBER',
        tenure: sub ? `${sub.paidMonths} months` : null,
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
    revalidatePath('/app/settings')
    revalidatePath('/app/billing')
    revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not complete purchase.' }
  }
}

/**
 * Buy the fixed-price first session (999 therapy / 1199 psychiatry / 1499
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
    revalidatePath('/app/settings')
    revalidatePath('/app/billing')
    revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not complete purchase.' }
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
