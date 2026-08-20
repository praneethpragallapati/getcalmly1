-- "How I'm feeling" status removed from the product; drop its columns.
ALTER TABLE "PatientProfile" DROP COLUMN IF EXISTS "feeling";
ALTER TABLE "PatientProfile" DROP COLUMN IF EXISTS "feelingAt";
