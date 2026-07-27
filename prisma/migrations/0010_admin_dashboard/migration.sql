-- Temp-password flow for admin-created accounts.
ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- Per-therapist base-fee overrides (null → use global EarningsConfig).
ALTER TABLE "TherapistProfile"
  ADD COLUMN "baseFeeIndividual" INTEGER,
  ADD COLUMN "baseFeeCouples" INTEGER,
  ADD COLUMN "baseFeePsychiatry" INTEGER;

-- Admin-set clinician assignment override for a patient.
ALTER TABLE "PatientProfile" ADD COLUMN "assignedTherapistId" TEXT;

-- Contact-us submissions.
CREATE TABLE "ContactMessage" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "message" TEXT NOT NULL,
  "handled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ContactMessage_handled_createdAt_idx" ON "ContactMessage"("handled", "createdAt");

-- Enterprise interest leads.
CREATE TABLE "EnterpriseLead" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "organisation" TEXT,
  "sector" TEXT,
  "teamSize" TEXT,
  "phone" TEXT,
  "message" TEXT,
  "handled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EnterpriseLead_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EnterpriseLead_handled_createdAt_idx" ON "EnterpriseLead"("handled", "createdAt");
