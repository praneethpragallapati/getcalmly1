-- 0017 · Real-time session lifecycle + clinician attributes. Idempotent.

-- Appointment: presence + duration for the strict completion rule, and the
-- package a booking reserved a session against (for wallet restore on cancel).
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "patientJoinedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "therapistJoinedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "consumedSubscriptionId" TEXT;

-- TherapistProfile: gender + clinician type captured at onboarding.
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "clinicianType" TEXT;
