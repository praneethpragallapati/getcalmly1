-- Presence heartbeat: real "time together" for the min-duration completion rule.
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "patientLastSeenAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "therapistLastSeenAt" TIMESTAMP(3);
