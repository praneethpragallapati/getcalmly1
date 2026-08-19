-- Self-reported "how I'm feeling" status on the patient profile.
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "feeling" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "feelingAt" TIMESTAMP(3);
