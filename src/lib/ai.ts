import { prisma } from '@/lib/prisma'
import { getPrivacy, mayFeedToAi } from '@/lib/patient'

/**
 * Rebuild the patient's "abridged AI version" (#13) — the compact, de-identified
 * summary stored in AiProfile and used as context for Calm AI and insights.
 *
 * Compliance is enforced HERE, at the boundary between raw data and the AI
 * pipeline: only categories the patient allows (PrivacySettings + feedToLlm) are
 * ever read into the abridged profile. Raw records are untouched.
 *
 * The actual summarisation model is deferred ("Will send the AI code later"), so
 * for now this only records which categories are permitted and stamps the build
 * time — leaving a correct, privacy-respecting seam for the model to drop into.
 */
export async function rebuildAiProfile(userId: string): Promise<void> {
  try {
    const privacy = await getPrivacy(userId)

    const allowed = {
      mood: mayFeedToAi(privacy, 'collectMood'),
      journals: mayFeedToAi(privacy, 'collectJournals'),
      sessions: mayFeedToAi(privacy, 'collectSessions'),
      chats: mayFeedToAi(privacy, 'collectChats'),
    }

    // If the patient has opted everything out, clear any existing abridged data
    // rather than leaving stale context behind.
    const nothingAllowed = !Object.values(allowed).some(Boolean)

    await prisma.aiProfile.upsert({
      where: { userId },
      create: {
        userId,
        summary: null,
        signals: { allowed },
        lastBuiltAt: new Date(),
      },
      update: {
        signals: { allowed },
        summary: nothingAllowed ? null : undefined,
        lastBuiltAt: new Date(),
      },
    })

    // TODO(ai-integration): read the allowed raw categories, summarise + extract
    // signals with the provided model, and write `summary`/`signals` here.
  } catch {
    // Non-fatal: the AI profile is a derived convenience, never a source of truth.
  }
}
