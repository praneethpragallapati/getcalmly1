-- PatientProfile's emergency-contact columns.
--
-- These were added to schema.prisma without a migration, so a database built by
-- `prisma migrate deploy` never had them while one built by `prisma db push`
-- did. Writing an emergency contact therefore failed on production and passed
-- locally. This makes the migrated path match the schema.
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyName" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyRelation" TEXT;
