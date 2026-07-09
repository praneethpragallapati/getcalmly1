import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/patient'

/**
 * Calm AI chat history (#11). Stored per patient (CalmAiMessage). The actual
 * model integration is deferred, assistant replies are produced by a gentle,
 * rule-based stand-in for now (see app/actions.ts → sendCalmAiMessage), leaving a
 * clean seam for the real model. Whether chats feed the wider AI pipeline is
 * gated separately by PrivacySettings.collectChats.
 */
export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string }

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi, I'm Calm AI, a gentle space to think out loud between sessions. Tell me what's on your mind, and we'll take it one step at a time. I'm not a crisis service; if you're ever in danger, please reach out to your expert or a helpline.",
}

export async function getCalmAiHistory(): Promise<ChatMessage[]> {
  const userId = await getSessionUserId()
  if (!userId) return [WELCOME]

  try {
    const rows = await prisma.calmAiMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })
    if (rows.length === 0) return [WELCOME]
    return rows.map((r) => ({
      id: r.id,
      role: r.role === 'ASSISTANT' ? 'assistant' : 'user',
      content: r.content,
    }))
  } catch {
    return [WELCOME]
  }
}
