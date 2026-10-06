import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { IST_TZ, isValidTz, normalizeTz } from '@/lib/tz'

/**
 * A patient's own time zone, kept on their account (User."timeZone", read and
 * written with raw SQL and added on the fly, so a database without the column
 * still works: it just reads as IST). Synced from the browser by TimeZoneSync.
 */
let columnReady = false
async function ensureColumn(): Promise<void> {
  if (columnReady) return
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timeZone" TEXT`)
    columnReady = true
  } catch (e) {
    console.error('[userTz] could not add the timeZone column', e)
  }
}

/** The user's time zone, or IST. Cached per request. */
export const userTz = cache(async (userId: string | null | undefined): Promise<string> => {
  if (!userId) return IST_TZ
  try {
    await ensureColumn()
    const rows = await prisma.$queryRaw<{ timeZone: string | null }[]>`SELECT "timeZone" FROM "User" WHERE "id" = ${userId}`
    const tz = rows[0]?.timeZone
    return normalizeTz(tz)
  } catch {
    return IST_TZ
  }
})

/** Save a user's time zone (ignored if unknown). */
export async function setUserTz(userId: string, tz: string): Promise<boolean> {
  if (!isValidTz(tz)) return false
  try {
    await ensureColumn()
    await prisma.$executeRaw`UPDATE "User" SET "timeZone" = ${normalizeTz(tz)} WHERE "id" = ${userId}`
    return true
  } catch {
    return false
  }
}
