-- Scope an auto-send form rule to a specific patient (null = all patients).
ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "patientId" TEXT;
