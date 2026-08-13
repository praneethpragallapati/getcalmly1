-- Calm Club polls: admin-authored question + options with optional expiry;
-- members cast one vote each. Idempotent.
CREATE TABLE IF NOT EXISTS "Poll" (
  "id"        TEXT NOT NULL,
  "question"  TEXT NOT NULL,
  "options"   TEXT[] NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Poll_createdAt_idx" ON "Poll"("createdAt");

CREATE TABLE IF NOT EXISTS "PollVote" (
  "id"          TEXT NOT NULL,
  "pollId"      TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "optionIndex" INTEGER NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_userId_key" ON "PollVote"("pollId", "userId");
CREATE INDEX IF NOT EXISTS "PollVote_pollId_idx" ON "PollVote"("pollId");

DO $$ BEGIN
  ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_pollId_fkey"
    FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
