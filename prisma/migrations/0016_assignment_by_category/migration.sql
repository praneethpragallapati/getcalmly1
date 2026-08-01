-- 0016 · Per-care-type clinician assignment.
-- A patient can have a different expert for individual therapy, couples and
-- psychiatry. Plain nullable columns (no FK, matching assignedTherapistId).
-- Idempotent.

ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistIndividualId" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistCouplesId" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistPsychiatryId" TEXT;
