-- The clinician availability tables.
--
-- TherapistAvailability (weekly hours) and AvailabilityException (time off on
-- specific dates) were declared in schema.prisma but created by no migration,
-- only by the hand-run sync_schema.sql. Databases that never ran that script
-- were missing both, so the clinician Availability page failed to load and no
-- hours could be saved. Idempotent: safe where the tables already exist.
CREATE TABLE IF NOT EXISTS "TherapistAvailability" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hours" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TherapistAvailability_pkey" PRIMARY KEY ("id")
  );
CREATE UNIQUE INDEX IF NOT EXISTS "TherapistAvailability_therapistId_dayOfWeek_key" ON "TherapistAvailability" ("therapistId", "dayOfWeek");
DO $$ BEGIN
    ALTER TABLE "TherapistAvailability" ADD CONSTRAINT "TherapistAvailability_therapistId_fkey"
      FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE TABLE IF NOT EXISTS "AvailabilityException" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fullDayOff" BOOLEAN NOT NULL DEFAULT true,
    "hoursOff" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvailabilityException_pkey" PRIMARY KEY ("id")
  );
CREATE UNIQUE INDEX IF NOT EXISTS "AvailabilityException_therapistId_date_key" ON "AvailabilityException" ("therapistId", "date");
DO $$ BEGIN
    ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_therapistId_fkey"
      FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
