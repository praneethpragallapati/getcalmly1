-- 0012 · Per-therapist bonus overrides + onboarding attachments
-- Idempotent.

ALTER TABLE "TherapistProfile"
  ADD COLUMN IF NOT EXISTS "secondSessionBonus" INTEGER,
  ADD COLUMN IF NOT EXISTS "thirdOnwardsBonus"  INTEGER,
  ADD COLUMN IF NOT EXISTS "miscBonus"          INTEGER,
  ADD COLUMN IF NOT EXISTS "nightSessionBonus"  INTEGER,
  ADD COLUMN IF NOT EXISTS "documentUrls"       TEXT[] NOT NULL DEFAULT '{}';
