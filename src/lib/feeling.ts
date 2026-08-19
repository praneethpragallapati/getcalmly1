import { prisma } from '@/lib/prisma'
import { MAX_FEELING } from '@/data/feelings'

export { FEELING_PRESETS } from '@/data/feelings'

/**
 * "How I'm feeling" — a short self-reported status a member sets on their
 * profile. Shown next to them in the community and to their clinician/admin.
 * Members pick a preset or type their own; the stored value is the full label
 * (emoji + words) so it renders the same everywhere.
 */

let feelingSchemaReady = false
/** Add the feeling columns if an older DB predates them (self-heal on prod). */
export async function ensureFeelingSchema(): Promise<void> {
  if (feelingSchemaReady) return
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "feeling" TEXT`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "feelingAt" TIMESTAMP(3)`)
    feelingSchemaReady = true
  } catch {
    // If the ALTER can't run (permissions/transient), reads still fall back safely.
  }
}

/** Normalise a chosen/typed feeling to a stored value ('' / null clears it). */
export function cleanFeeling(v: string | null | undefined): string | null | undefined {
  if (v === undefined) return undefined
  const t = (v ?? '').trim().replace(/\s+/g, ' ')
  return t ? t.slice(0, MAX_FEELING) : null
}

/**
 * Feeling for many users at once, keyed by userId. Only members who have set one
 * appear in the map. Safe on un-migrated DBs (returns an empty map).
 */
export async function feelingsFor(userIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (userIds.length === 0) return map
  await ensureFeelingSchema()
  try {
    const rows = await prisma.patientProfile.findMany({
      where: { userId: { in: userIds }, NOT: { feeling: null } },
      select: { userId: true, feeling: true },
    })
    for (const r of rows) if (r.feeling) map.set(r.userId, r.feeling)
  } catch {
    // ignore — feeling is a nice-to-have, never block the page
  }
  return map
}
