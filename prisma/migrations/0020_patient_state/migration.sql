-- Capture the patient's Indian state / UT, so admins and clinicians can filter
-- and report regionally. Free text (e.g. "Karnataka"). Idempotent.
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "state" TEXT;
