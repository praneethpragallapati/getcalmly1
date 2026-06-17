/**
 * Public AI surface. `rebuildAiProfile` is the compliance seam called after every
 * write that could change AI context (mood, journal, session note, chat, privacy
 * toggle). It (re)computes which categories are allowed and, when an LLM is
 * configured, refreshes the abridged AiProfile (#13) via the synthesizer. It is
 * always non-fatal: the AI profile is a derived convenience, never a source of truth.
 */
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getPrivacy, mayFeedToAi } from '@/lib/patient'
import { hasLlm } from './config'
import { buildPatientContext } from './context'
import { synthesizeProfile } from './synthesizer'

export { runChat } from './chat'
export type { ChatResult } from './chat'

export async function rebuildAiProfile(userId: string): Promise<void> {
  try {
    const privacy = await getPrivacy(userId)
    const allowed = {
      mood: mayFeedToAi(privacy, 'collectMood'),
      journals: mayFeedToAi(privacy, 'collectJournals'),
      sessions: mayFeedToAi(privacy, 'collectSessions'),
      chats: mayFeedToAi(privacy, 'collectChats'),
    }
    const nothingAllowed = !Object.values(allowed).some(Boolean)

    // Real summarisation when a provider is configured and something is allowed.
    let summary: string | null = null
    let signals: Record<string, unknown> = { allowed }
    if (hasLlm() && !nothingAllowed) {
      const ctx = await buildPatientContext(userId)
      if (ctx) {
        const synth = await synthesizeProfile(ctx)
        summary = synth.summary
        signals = {
          allowed,
          sessionSummary: synth.sessionSummary,
          journalDigest: synth.journalDigest,
          whatHasHelped: ctx.whatHasHelped,
          recurringTriggers: ctx.recurringTriggers,
        }
      }
    }

    const signalsJson = signals as Prisma.InputJsonValue
    await prisma.aiProfile.upsert({
      where: { userId },
      create: { userId, summary, signals: signalsJson, lastBuiltAt: new Date() },
      update: { summary: nothingAllowed ? null : summary, signals: signalsJson, lastBuiltAt: new Date() },
    })
  } catch {
    // Non-fatal: the AI profile is a derived convenience, never a source of truth.
  }
}
