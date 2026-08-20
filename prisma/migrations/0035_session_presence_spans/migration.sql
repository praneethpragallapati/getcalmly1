-- Per-participant presence spans, so repeated joins/leaves are recorded rather
-- than collapsed into a single first-join / last-seen pair.
CREATE TABLE IF NOT EXISTS "SessionPresenceSpan" (
  "id" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL,
  "lastSeenAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SessionPresenceSpan_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SessionPresenceSpan_appointmentId_idx" ON "SessionPresenceSpan"("appointmentId");
CREATE INDEX IF NOT EXISTS "SessionPresenceSpan_appointmentId_role_idx" ON "SessionPresenceSpan"("appointmentId", "role");
