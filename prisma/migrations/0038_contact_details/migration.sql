-- Fuller contact records. Patients gain a postal address plus a little personal
-- context; clinicians gain the same contact block they never had, so admin has
-- one complete view of everyone on the platform.
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "addressLine1" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "addressLine2" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "occupation" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT;

ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT 'IN';
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "addressLine1" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "addressLine2" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "emergencyName" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "emergencyRelation" TEXT;
