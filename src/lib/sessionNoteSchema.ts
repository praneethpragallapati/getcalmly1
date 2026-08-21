/**
 * The 0040 columns — note drafts and the clinician's member rating — created on
 * demand, matching how every other recent feature here self-heals so it works
 * before the migration is applied by hand.
 *
 * Idempotent, and a no-op once the flag is set (one round trip per process).
 */
import { prisma } from '@/lib/prisma'

let ready = false

export async function ensureSessionNoteSchema(): Promise<void> {
  if (ready) return
  const stmts = [
    `ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "summaryDraft" TEXT`,
    `ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "summaryDraftAt" TIMESTAMP(3)`,
    `ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "memberRating" INTEGER`,
    `ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "memberRatingNote" TEXT`,
  ]
  for (const sql of stmts) await prisma.$executeRawUnsafe(sql)
  ready = true
}
