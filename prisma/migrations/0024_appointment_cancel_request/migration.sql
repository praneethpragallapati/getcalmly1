-- Clinician-initiated cancellation requires admin approval. These fields flag an
-- appointment the clinician wants cancelled; an admin then approves (real cancel
-- + wallet restore) or rejects (flag cleared). Patient cancellation is unchanged.
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelRequestedAt" TIMESTAMP(3);
