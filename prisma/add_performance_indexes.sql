-- ─────────────────────────────────────────────────────────────────────────────
-- getCalmly · Performance indexes (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
-- Composite indexes matching the app's hot-path query shapes, so common reads
-- use an index instead of scanning all of a person's rows. Safe to run multiple
-- times (IF NOT EXISTS). Run once on each database:
--
--   psql "$DATABASE_URL" -f prisma/add_performance_indexes.sql
--
-- CONCURRENTLY avoids locking the table during creation; note it cannot run
-- inside a transaction block (psql -f runs statements individually, so this is
-- fine). If your host disallows CONCURRENTLY, drop that keyword.
-- ─────────────────────────────────────────────────────────────────────────────

-- Session settlement + "next session" + schedule: filter by person, status, time.
CREATE INDEX IF NOT EXISTS "Appointment_patientId_status_scheduledAt_idx"
  ON "Appointment" ("patientId", "status", "scheduledAt");
CREATE INDEX IF NOT EXISTS "Appointment_therapistId_status_scheduledAt_idx"
  ON "Appointment" ("therapistId", "status", "scheduledAt");

-- Active-package lookup (dashboard / sidebar / billing): userId + status.
CREATE INDEX IF NOT EXISTS "Subscription_userId_status_idx"
  ON "Subscription" ("userId", "status");
