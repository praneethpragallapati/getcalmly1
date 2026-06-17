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
