-- Community anonymous posting: let members publish a discussion or reply without
-- their name/role showing to peers. The author link (authorId) is preserved for
-- their own "My posts" filter and platform moderation; only the displayed
-- authorName/role is neutralised at write time. Idempotent so it is safe to run
-- against a database that already has the columns.
ALTER TABLE "CommunityPost"    ADD COLUMN IF NOT EXISTS "anonymous" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "anonymous" BOOLEAN NOT NULL DEFAULT false;
