import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/session'

/**
 * The signed-in patient's user id, or null when there is no session (e.g. the
 * public preview, which renders bundled demo data instead of patient data).
 * Every server action that touches patient data MUST call this and refuse to
 * write when it returns null, patients only ever read/write their own records.
 */
export async function getSessionUserId(): Promise<string | null> {
  try {
    const session = await getAuthSession()
    return (session?.user as { id?: string } | undefined)?.id ?? null
  } catch {
    return null
  }
}

/**
 * The signed-in user's id ONLY when they are a PATIENT — otherwise null. Patient
 * data-mutating actions (buy a package, take the assessment, book, check in) use
 * this so an ADMIN or THERAPIST account can never accumulate patient data on
 * itself. This is the data-layer half of "one account = one dashboard"; the
 * routing half lives in proxy.ts. Older sessions minted before roles were added
 * to the token have no role — treat those as PATIENT for backward compatibility.
 */
export async function getSessionPatientId(): Promise<string | null> {
  try {
    const session = await getAuthSession()
    const u = session?.user as { id?: string; role?: string } | undefined
    if (!u?.id) return null
    if (u.role && u.role !== 'PATIENT') return null
    return u.id
  } catch {
    return null
  }
}

export type Privacy = {
  collectSessions: boolean
  collectChats: boolean
  collectMood: boolean
  collectJournals: boolean
  collectForms: boolean
  collectPulse: boolean
  collectProfile: boolean
  feedToLlm: boolean
}

const PRIVACY_DEFAULT: Privacy = {
  collectSessions: true,
  collectChats: true,
  collectMood: true,
  collectJournals: true,
  collectForms: true,
  collectPulse: true,
  collectProfile: true,
  feedToLlm: true,
}

// The forms/pulse switches arrived after the base table; create them on demand so
// this works on a database that hasn't had the migration applied. One ALTER per
// process (flag-guarded), mirroring the other self-healing schema helpers.
let privacySchemaReady = false
export async function ensurePrivacySchema(): Promise<void> {
  if (privacySchemaReady) return
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "collectForms" BOOLEAN NOT NULL DEFAULT true`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "collectPulse" BOOLEAN NOT NULL DEFAULT true`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "collectProfile" BOOLEAN NOT NULL DEFAULT true`)
    privacySchemaReady = true
  } catch {
    /* best-effort; reads fall back to permissive defaults */
  }
}

/**
 * A patient's privacy switches (#17). These govern whether a data category is
 * gathered into the AI pipeline and fed to LLMs, they do NOT stop the patient's
 * own raw record (their journal, their mood tracker) from being saved. Defaults
 * are permissive only as a code fallback; real consent is captured at signup.
 */
export async function getPrivacy(userId: string): Promise<Privacy> {
  try {
    await ensurePrivacySchema()
    const row = await prisma.privacySettings.findUnique({ where: { userId } })
    if (row) {
      return {
        collectSessions: row.collectSessions,
        collectChats: row.collectChats,
        collectMood: row.collectMood,
        collectJournals: row.collectJournals,
        collectForms: row.collectForms,
        collectPulse: row.collectPulse,
        collectProfile: row.collectProfile,
        feedToLlm: row.feedToLlm,
      }
    }
  } catch {
    // fall through to default
  }
  return PRIVACY_DEFAULT
}

/** Whether a given category may be included in AI inputs for this patient. */
export function mayFeedToAi(privacy: Privacy, category: keyof Omit<Privacy, 'feedToLlm'>): boolean {
  return privacy.feedToLlm && privacy[category]
}
