-- 0015 · Attach an expert to a package.
-- A patient can hold several packages (individual / couples / psychiatry), each
-- with its own clinician. Idempotent so it is safe to re-run.

ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "therapistId" TEXT;

DO $$ BEGIN
  ALTER TABLE "Subscription"
    ADD CONSTRAINT "Subscription_therapistId_fkey"
    FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "Subscription_therapistId_idx" ON "Subscription"("therapistId");
