/**
 * Self-healing schema for outcome measurement, same posture as
 * ensureSessionPresenceSchema / ensureBookingConstraints: the feature works even
 * if the migration has not been run by hand. Idempotent; a no-op once present.
 *
 * It extends AssessmentScore with provenance columns (source, sessionId, band,
 * riskTier, version) and creates the PulseAssignment table that holds each
 * patient's schedule of self-report measures.
 */
import { prisma } from '@/lib/prisma'

let ready = false

export async function ensureOutcomesSchema(): Promise<void> {
  if (ready) return
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "source" TEXT`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "sessionId" TEXT`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "band" TEXT`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "riskTier" TEXT`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "version" TEXT`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AssessmentScore_sessionId_idx" ON "AssessmentScore"("sessionId")`)
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "PulseAssignment" (
      "id" TEXT NOT NULL,
      "patientId" TEXT NOT NULL,
      "instrumentId" TEXT NOT NULL,
      "recurrence" TEXT NOT NULL DEFAULT 'EVERY',
      "sessionNumber" INTEGER,
      "weekday" INTEGER,
      "therapistId" TEXT,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PulseAssignment_pkey" PRIMARY KEY ("id"))`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "PulseAssignment" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3)`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PulseAssignment_patientId_idx" ON "PulseAssignment"("patientId")`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "PulseAssignment_patient_instrument_key" ON "PulseAssignment"("patientId", "instrumentId")`)
    ready = true
  } catch (e) {
    console.error('[ensureOutcomesSchema] failed', e)
  }
}
