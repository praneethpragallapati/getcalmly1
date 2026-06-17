'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/patient'
import { rebuildAiProfile } from '@/lib/ai'

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
 * AI pipeline later, gated by PrivacySettings.collectSessions — hence the AI
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
    revalidatePath('/app/sessions')
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
 * Switch the patient's care category — Individual / Couple / Kids (#19). Updates
 * the live active subscription. Clinical reassignment (CareMode, partner/child
 * linking) is handled by the care team; this records the product-side switch.
 */
export async function switchCategory(
  category: 'Individual' | 'Couple' | 'Kids'
): Promise<ActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: true, persisted: false }

  const enumValue = { Individual: 'INDIVIDUAL', Couple: 'COUPLE', Kids: 'KIDS' }[category] as
    | 'INDIVIDUAL'
    | 'COUPLE'
    | 'KIDS'
  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
    if (!sub) return { ok: true, persisted: false }
    await prisma.subscription.update({ where: { id: sub.id }, data: { category: enumValue } })
    revalidatePath('/app/settings')
    revalidatePath('/app')
    return { ok: true, persisted: true }
  } catch {
    return { ok: false, persisted: false, error: 'Could not switch your care category.' }
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
