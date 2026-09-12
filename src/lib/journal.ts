/**
 * Journal limits and single-entry read.
 *
 * A journal is meant to be a quick reflection, not an essay. We cap an entry at
 * roughly a five-minute read: at an average ~200 words per minute that's about
 * 1,000 words, and at ~6 characters per word (including spaces) that's ~6,000
 * characters. The cap is enforced both in the composer (a live counter) and in
 * the server action, so it holds even if the client is bypassed.
 */
import { prisma } from '@/lib/prisma'
import { fmtIST } from '@/lib/tz'

export const JOURNAL_MAX_CHARS = 6000
/** A journal title is a heading, not a sentence — keep it short. */
export const JOURNAL_TITLE_MAX = 80
/** Shown next to the composer's character counter. */
export const JOURNAL_READ_LABEL = 'about a 5 minute read'

export type JournalDetail = {
  id: string
  title: string
  content: string
  moodTag: string | null
  topicTags: string[]
  dateLabel: string
}

/** One journal entry, scoped to its owner (returns null for anyone else's). */
export async function getJournalEntry(userId: string, id: string): Promise<JournalDetail | null> {
  try {
    const j = await prisma.journalEntry.findFirst({
      where: { id, userId },
      select: { id: true, title: true, content: true, moodTag: true, topicTags: true, createdAt: true },
    })
    if (!j) return null
    return {
      id: j.id,
      title: j.title ?? 'Untitled entry',
      content: j.content,
      moodTag: j.moodTag ?? null,
      topicTags: j.topicTags ?? [],
      dateLabel: fmtIST(j.createdAt, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
    }
  } catch {
    return null
  }
}
