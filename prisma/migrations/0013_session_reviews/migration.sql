-- 0013 · Patient session ratings (real, drives therapist rating aggregate)
-- Idempotent.

CREATE TABLE IF NOT EXISTS "SessionReview" (
  "id"            TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "patientId"     TEXT NOT NULL,
  "therapistId"   TEXT NOT NULL,
  "rating"        INTEGER NOT NULL,
  "comment"       TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SessionReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SessionReview_appointmentId_key" ON "SessionReview"("appointmentId");
CREATE INDEX IF NOT EXISTS "SessionReview_therapistId_idx" ON "SessionReview"("therapistId");

DO $$ BEGIN
  ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_therapistId_fkey"
    FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
