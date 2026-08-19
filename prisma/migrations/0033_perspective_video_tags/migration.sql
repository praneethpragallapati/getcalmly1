-- Shared tag vocabulary on Perspectives videos (same slugs as blogs/community).
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
