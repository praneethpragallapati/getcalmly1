/**
 * The 0038 contact columns, created on demand.
 *
 * Every other feature in this codebase self-heals its schema so it works before
 * the migration is applied by hand; the contact fields shipped without that, and
 * a Prisma schema declaring columns the database doesn't have breaks any query
 * that touches them. Reads are narrow-selected and guarded, but the writes need
 * the columns to actually exist — so the save paths call this first.
 *
 * Idempotent, and a no-op once the flag is set (one round trip per process).
 */
import { prisma } from '@/lib/prisma'

let contactSchemaReady = false

export async function ensureContactSchema(): Promise<void> {
  if (contactSchemaReady) return
  const stmts = [
    `ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "addressLine1" TEXT`,
    `ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "addressLine2" TEXT`,
    `ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "city" TEXT`,
    `ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "postalCode" TEXT`,
    `ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "occupation" TEXT`,
    `ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT`,
    // These three were declared in schema.prisma but created by NO migration and
    // covered by no self-heal — so every migrated database was missing them
    // while a db-push'd one had them. That asymmetry is exactly why saving an
    // emergency contact failed in production and passed locally.
    `ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyName" TEXT`,
    `ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT`,
    `ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyRelation" TEXT`,
    `ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3)`,
    `ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT 'IN'`,
    `ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "state" TEXT`,
    `ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "city" TEXT`,
    `ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "addressLine1" TEXT`,
    `ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "addressLine2" TEXT`,
    `ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "postalCode" TEXT`,
    `ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "emergencyName" TEXT`,
    `ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT`,
    `ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "emergencyRelation" TEXT`,
  ]
  for (const sql of stmts) await prisma.$executeRawUnsafe(sql)
  contactSchemaReady = true
}
