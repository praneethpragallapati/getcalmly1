-- Blog review: a clinician's post is submitted for admin approval rather than
-- going live immediately. Existing rows default to APPROVED so seeded and
-- admin-written posts are unaffected.
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewStatus" TEXT NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewNote" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewedByName" TEXT;
CREATE INDEX IF NOT EXISTS "BlogPost_reviewStatus_idx" ON "BlogPost"("reviewStatus");
