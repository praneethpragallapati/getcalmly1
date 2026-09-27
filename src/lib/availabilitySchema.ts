/**
 * The two availability tables, created on demand.
 *
 * TherapistAvailability (a clinician's weekly hours) and AvailabilityException
 * (time off on specific dates) are declared in schema.prisma but were created by
 * NO migration, only by the hand-run sync_schema.sql. A database that never had
 * that script run is missing both, and the first read throws P2021: the
 * clinician's Availability page failed with "This page couldn't load", and no
 * hours or time off could ever be saved. Migration 0048 adds them for new
 * deploys; this heals any database the migration has not reached yet.
 *
 * Idempotent, and a no-op once the flag is set (one round trip per process).
 */
import { prisma } from '@/lib/prisma'

export const AVAILABILITY_SCHEMA_SQL: string[] = [
  `CREATE TABLE IF NOT EXISTS "TherapistAvailability" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hours" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TherapistAvailability_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "TherapistAvailability_therapistId_dayOfWeek_key" ON "TherapistAvailability" ("therapistId", "dayOfWeek")`,
  `DO $$ BEGIN
    ALTER TABLE "TherapistAvailability" ADD CONSTRAINT "TherapistAvailability_therapistId_fkey"
      FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `CREATE TABLE IF NOT EXISTS "AvailabilityException" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fullDayOff" BOOLEAN NOT NULL DEFAULT true,
    "hoursOff" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvailabilityException_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AvailabilityException_therapistId_date_key" ON "AvailabilityException" ("therapistId", "date")`,
  `DO $$ BEGIN
    ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_therapistId_fkey"
      FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,
]

let availabilitySchemaReady = false

export async function ensureAvailabilitySchema(): Promise<void> {
  if (availabilitySchemaReady) return
  for (const sql of AVAILABILITY_SCHEMA_SQL) await prisma.$executeRawUnsafe(sql)
  availabilitySchemaReady = true
}
