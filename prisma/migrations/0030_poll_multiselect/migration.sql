-- Multi-select polls: allow multiple options per member.
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "multiple" BOOLEAN NOT NULL DEFAULT false;
DROP INDEX IF EXISTS "PollVote_pollId_userId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_userId_optionIndex_key" ON "PollVote"("pollId", "userId", "optionIndex");
