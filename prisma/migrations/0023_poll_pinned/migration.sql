-- Pin a poll to the top of the Polls tab. Idempotent.
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false;
