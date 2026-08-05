-- ─────────────────────────────────────────────────────────────────────────────
-- getCalmly · Consolidated schema catch-up (migrations 0014 → 0017)
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this ONCE against your database to add every column the current app code
-- expects. It is fully idempotent (ADD COLUMN IF NOT EXISTS / guarded
-- constraints), so re-running it is safe and does nothing the second time.
--
--   psql "$DATABASE_URL" -f prisma/apply_all_migrations.sql
--
-- Why you need this: without these columns, patient dashboard / care-team /
-- assignment queries throw at runtime and the app falls back to placeholder
-- states. Applying this unblocks:
--   • saving per-care-type clinician assignments (0016)
--   • the assigned expert showing up on the patient's Care Team (0015/0016)
--   • the patient home dashboard reading real data (0017)
-- ─────────────────────────────────────────────────────────────────────────────

-- 0014 · Task time-of-day + assigner id.
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "timesOfDay" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "assignedById" TEXT;

-- 0015 · Attach an expert to a package.
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "therapistId" TEXT;
DO $$ BEGIN
  ALTER TABLE "Subscription"
    ADD CONSTRAINT "Subscription_therapistId_fkey"
    FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "Subscription_therapistId_idx" ON "Subscription"("therapistId");

-- 0016 · Per-care-type clinician assignment.
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistIndividualId" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistCouplesId" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistPsychiatryId" TEXT;

-- 0017 · Real-time session lifecycle + clinician attributes.
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "patientJoinedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "therapistJoinedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "consumedSubscriptionId" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "clinicianType" TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- OPTIONAL one-time cleanup: clear packages that were merged across types by the
-- old buy flow (e.g. a therapy pack that got rewritten to "5 psychiatry").
-- Uncomment and run ONLY if you want to wipe existing packages and start the
-- session balances fresh. Safe to skip; new purchases are already per-type.
--
-- DELETE FROM "Payment";
-- UPDATE "Appointment" SET "consumedSubscriptionId" = NULL;
-- DELETE FROM "Subscription";
