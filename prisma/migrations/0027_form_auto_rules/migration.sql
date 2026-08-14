-- Automatic form-send rules: send a form after a booking based on package/session
-- type and the session number for that type, with recurrence (ONCE/EVERY/EVEN/ODD).
CREATE TABLE IF NOT EXISTS "FormAutoRule" (
  "id"            TEXT NOT NULL,
  "templateId"    TEXT NOT NULL,
  "trackSlug"     TEXT NOT NULL DEFAULT 'any',
  "recurrence"    TEXT NOT NULL DEFAULT 'ONCE',
  "sessionNumber" INTEGER,
  "therapistId"   TEXT,
  "active"        BOOLEAN NOT NULL DEFAULT true,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FormAutoRule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FormAutoRule_active_idx" ON "FormAutoRule"("active");
CREATE INDEX IF NOT EXISTS "FormAutoRule_therapistId_idx" ON "FormAutoRule"("therapistId");
DO $$ BEGIN
  ALTER TABLE "FormAutoRule" ADD CONSTRAINT "FormAutoRule_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
