-- Custom forms: templates built in the admin / expert UI rather than seeded from
-- src/data/forms.ts. createdById records who built it, so an admin can manage
-- every custom form while a clinician manages only their own. Null on all
-- code-seeded rows.
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "createdByName" TEXT;
CREATE INDEX IF NOT EXISTS "FormTemplate_createdById_idx" ON "FormTemplate"("createdById");
