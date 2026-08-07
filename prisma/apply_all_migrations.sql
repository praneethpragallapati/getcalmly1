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

-- 0018 · One ACTIVE package per (userId, trackSlug). Merge any existing
-- duplicate ACTIVE rows first (fold sessions into the newest, cancel the rest),
-- then add a PARTIAL unique index that only constrains ACTIVE rows.
WITH grp AS (
  SELECT "userId", "trackSlug", SUM("sessionsTotal") AS total_sum, SUM("sessionsUsed") AS used_sum
  FROM "Subscription" WHERE status = 'ACTIVE'
  GROUP BY "userId", "trackSlug" HAVING COUNT(*) > 1
),
keep AS (
  SELECT DISTINCT ON (s."userId", s."trackSlug") s.id, s."userId", s."trackSlug"
  FROM "Subscription" s JOIN grp g ON g."userId" = s."userId" AND g."trackSlug" = s."trackSlug"
  WHERE s.status = 'ACTIVE'
  ORDER BY s."userId", s."trackSlug", s."createdAt" DESC
)
UPDATE "Subscription" s SET "sessionsTotal" = g.total_sum, "sessionsUsed" = g.used_sum
FROM keep k JOIN grp g ON g."userId" = k."userId" AND g."trackSlug" = k."trackSlug"
WHERE s.id = k.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId", "trackSlug" ORDER BY "createdAt" DESC) AS rn
  FROM "Subscription" WHERE status = 'ACTIVE'
)
UPDATE "Subscription" s SET status = 'CANCELLED'
FROM ranked r WHERE s.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_trackSlug_active_key"
  ON "Subscription" ("userId", "trackSlug") WHERE status = 'ACTIVE';

-- 0019 · Session default duration 50 → 45 min. New bookings set duration
-- explicitly per care type (45 therapy/couples, 30 psychiatry); this only
-- changes the column default for any row created without one.
ALTER TABLE "Appointment" ALTER COLUMN "durationMins" SET DEFAULT 45;

-- ─────────────────────────────────────────────────────────────────────────────
-- OPTIONAL one-time cleanup: clear packages that were merged across types by the
-- old buy flow (e.g. a therapy pack that got rewritten to "5 psychiatry").
-- Uncomment and run ONLY if you want to wipe existing packages and start the
-- session balances fresh. Safe to skip; new purchases are already per-type.
--
-- DELETE FROM "Payment";
-- UPDATE "Appointment" SET "consumedSubscriptionId" = NULL;
-- DELETE FROM "Subscription";
