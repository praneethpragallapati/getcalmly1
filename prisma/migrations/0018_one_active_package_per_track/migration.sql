-- #2 — Enforce "one ACTIVE package per (userId, trackSlug)".
-- The pre-fix buy flow was find-then-create with no constraint, so a
-- double-submit or two concurrent requests could create two ACTIVE packages of
-- the same type (double sessions + double revenue rows). This:
--   1. merges any existing duplicate ACTIVE rows (fold sessions into the newest,
--      cancel the rest) so the new index can be created, then
--   2. adds a PARTIAL unique index that only constrains ACTIVE rows — cancelled
--      / expired history may still coexist, which the app relies on.

-- 1a. Fold duplicate ACTIVE rows' session counts into the newest per group.
WITH grp AS (
  SELECT "userId", "trackSlug",
         SUM("sessionsTotal") AS total_sum,
         SUM("sessionsUsed")  AS used_sum,
         COUNT(*)             AS n
  FROM "Subscription"
  WHERE status = 'ACTIVE'
  GROUP BY "userId", "trackSlug"
  HAVING COUNT(*) > 1
),
keep AS (
  SELECT DISTINCT ON (s."userId", s."trackSlug") s.id, s."userId", s."trackSlug"
  FROM "Subscription" s
  JOIN grp g ON g."userId" = s."userId" AND g."trackSlug" = s."trackSlug"
  WHERE s.status = 'ACTIVE'
  ORDER BY s."userId", s."trackSlug", s."createdAt" DESC
)
UPDATE "Subscription" s
SET "sessionsTotal" = g.total_sum,
    "sessionsUsed"  = g.used_sum
FROM keep k
JOIN grp g ON g."userId" = k."userId" AND g."trackSlug" = k."trackSlug"
WHERE s.id = k.id;

-- 1b. Cancel the older duplicates so only the merged newest stays ACTIVE.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "userId", "trackSlug" ORDER BY "createdAt" DESC) AS rn
  FROM "Subscription"
  WHERE status = 'ACTIVE'
)
UPDATE "Subscription" s
SET status = 'CANCELLED'
FROM ranked r
WHERE s.id = r.id AND r.rn > 1;

-- 2. One ACTIVE package per (user, track). Partial so history can coexist.
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_trackSlug_active_key"
  ON "Subscription" ("userId", "trackSlug")
  WHERE status = 'ACTIVE';
