/**
 * The 0041 `User.adminType` column, created on demand.
 *
 * This column is read on the sign-in path. Selecting a column the database does
 * not have throws, and an unguarded throw there locks EVERY user out — which is
 * exactly what happened when admin sub-roles shipped ahead of their migration.
 *
 * The auth path is now resilient on its own (it falls back to reading the role
 * alone), so this is the repair rather than the guard: it runs where a failure
 * is survivable, never inside sign-in itself.
 *
 * Idempotent, and a no-op once the flag is set (one round trip per process).
 */
import { prisma } from '@/lib/prisma'

let ready = false

export async function ensureAdminTypeSchema(): Promise<void> {
  if (ready) return
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "adminType" TEXT`)
  ready = true
}
