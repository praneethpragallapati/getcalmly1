-- 0014 · Task time-of-day + assigner id.
-- Adds Morning/Afternoon/Evening scheduling to assigned tasks, and records the
-- id of whoever assigned the task (therapist or admin). Idempotent so it is
-- safe to re-run against an existing database.

ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "timesOfDay" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "assignedById" TEXT;
