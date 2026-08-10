-- Admin-defined compensation fields shown to full-time (salaried) clinicians on
-- their Earnings tab. JSON array of { label, type: 'text'|'select', value,
-- options?: string[] }. Idempotent.
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "compensationFields" JSONB;
