-- ─────────────────────────────────────────────────────────────────────────────
-- getCalmly · Consolidated schema catch-up (migrations 0014 → 0017)
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this ONCE against your database to add every column the current app code
-- expects. It is fully idempotent (ADD COLUMN IF NOT EXISTS / guarded
-- constraints), so re-running it is safe and does nothing the second time.
--
--   psql "$DATABASE_URL" -f prisma/apply_all_migrations.sql
--
-- Why you need this: without these columns, patient dashboard / care-team /
-- assignment queries throw at runtime and the app falls back to placeholder
-- states. Applying this unblocks:
--   • saving per-care-type clinician assignments (0016)
--   • the assigned expert showing up on the patient's Care Team (0015/0016)
--   • the patient home dashboard reading real data (0017)
-- ─────────────────────────────────────────────────────────────────────────────

-- 0014 · Task time-of-day + assigner id.
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "timesOfDay" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "assignedById" TEXT;

-- 0015 · Attach an expert to a package.
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "therapistId" TEXT;
DO $$ BEGIN
  ALTER TABLE "Subscription"
    ADD CONSTRAINT "Subscription_therapistId_fkey"
    FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "Subscription_therapistId_idx" ON "Subscription"("therapistId");

-- 0016 · Per-care-type clinician assignment.
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistIndividualId" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistCouplesId" TEXT;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistPsychiatryId" TEXT;

-- 0017 · Real-time session lifecycle + clinician attributes.
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "patientJoinedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "therapistJoinedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "consumedSubscriptionId" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "clinicianType" TEXT;

-- 0018 · One ACTIVE package per (userId, trackSlug). Merge any existing
-- duplicate ACTIVE rows first (fold sessions into the newest, cancel the rest),
-- then add a PARTIAL unique index that only constrains ACTIVE rows.
WITH grp AS (
  SELECT "userId", "trackSlug", SUM("sessionsTotal") AS total_sum, SUM("sessionsUsed") AS used_sum
  FROM "Subscription" WHERE status = 'ACTIVE'
  GROUP BY "userId", "trackSlug" HAVING COUNT(*) > 1
),
keep AS (
  SELECT DISTINCT ON (s."userId", s."trackSlug") s.id, s."userId", s."trackSlug"
  FROM "Subscription" s JOIN grp g ON g."userId" = s."userId" AND g."trackSlug" = s."trackSlug"
  WHERE s.status = 'ACTIVE'
  ORDER BY s."userId", s."trackSlug", s."createdAt" DESC
)
UPDATE "Subscription" s SET "sessionsTotal" = g.total_sum, "sessionsUsed" = g.used_sum
FROM keep k JOIN grp g ON g."userId" = k."userId" AND g."trackSlug" = k."trackSlug"
WHERE s.id = k.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId", "trackSlug" ORDER BY "createdAt" DESC) AS rn
  FROM "Subscription" WHERE status = 'ACTIVE'
)
UPDATE "Subscription" s SET status = 'CANCELLED'
FROM ranked r WHERE s.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_trackSlug_active_key"
  ON "Subscription" ("userId", "trackSlug") WHERE status = 'ACTIVE';

-- 0019 · Session default duration 50 → 45 min. New bookings set duration
-- explicitly per care type (45 therapy/couples, 30 psychiatry); this only
-- changes the column default for any row created without one.
ALTER TABLE "Appointment" ALTER COLUMN "durationMins" SET DEFAULT 45;

-- ─────────────────────────────────────────────────────────────────────────────
-- OPTIONAL one-time cleanup: clear packages that were merged across types by the
-- old buy flow (e.g. a therapy pack that got rewritten to "5 psychiatry").
-- Uncomment and run ONLY if you want to wipe existing packages and start the
-- session balances fresh. Safe to skip; new purchases are already per-type.
--
-- DELETE FROM "Payment";
-- UPDATE "Appointment" SET "consumedSubscriptionId" = NULL;
-- DELETE FROM "Subscription";

-- 0019b · Community anonymous posting. Members can publish a discussion or reply
-- without their name/role showing to peers; authorId is still stored for their
-- own "My posts" filter and moderation. Idempotent.
ALTER TABLE "CommunityPost"    ADD COLUMN IF NOT EXISTS "anonymous" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "anonymous" BOOLEAN NOT NULL DEFAULT false;

-- 0020 · Patient state / UT (regional filtering + reporting). Idempotent.
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "state" TEXT;

-- 0021 · Full-time clinician compensation fields (admin-defined, shown on the
-- Earnings tab). Idempotent.
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "compensationFields" JSONB;

-- 0022 · Calm Club polls (admin create, members vote). Idempotent.
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

-- 0023 · Pin a poll to the top of the Polls tab. Idempotent.
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false;

-- 0024 · Clinician cancellation requests (admin-approved). Idempotent.
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelRequestedAt" TIMESTAMP(3);

-- 0025 · Durable WebRTC signaling relay (cross-instance). Idempotent.
CREATE TABLE IF NOT EXISTS "WebrtcSignal" (
  "seq"       SERIAL NOT NULL,
  "roomId"    TEXT NOT NULL,
  "peerId"    TEXT NOT NULL,
  "kind"      TEXT NOT NULL,
  "data"      JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebrtcSignal_pkey" PRIMARY KEY ("seq")
);
CREATE INDEX IF NOT EXISTS "WebrtcSignal_roomId_seq_idx" ON "WebrtcSignal"("roomId", "seq");
CREATE INDEX IF NOT EXISTS "WebrtcSignal_createdAt_idx" ON "WebrtcSignal"("createdAt");

-- 0026 · Referral program (codes, wallet credit, Referral + ReferralConfig). Idempotent.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredById" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "walletCreditRupees" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bonusSessions" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");
CREATE TABLE IF NOT EXISTS "Referral" (
  "id" TEXT NOT NULL, "referrerId" TEXT NOT NULL, "refereeId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING', "qualifyingPaymentId" TEXT,
  "referrerRewardKind" TEXT, "referrerRewardValue" INTEGER, "refereeDiscount" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "qualifiedAt" TIMESTAMP(3),
  CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Referral_refereeId_key" ON "Referral"("refereeId");
CREATE INDEX IF NOT EXISTS "Referral_referrerId_idx" ON "Referral"("referrerId");
CREATE INDEX IF NOT EXISTS "Referral_status_idx" ON "Referral"("status");
DO $$ BEGIN
  ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS "ReferralConfig" (
  "id" TEXT NOT NULL DEFAULT 'default', "enabled" BOOLEAN NOT NULL DEFAULT false,
  "referrerRewardKind" TEXT NOT NULL DEFAULT 'WALLET_CREDIT', "referrerRewardValue" INTEGER NOT NULL DEFAULT 500,
  "refereeDiscount" INTEGER NOT NULL DEFAULT 500, "clawback" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ReferralConfig_pkey" PRIMARY KEY ("id")
);

-- 0027_form_auto_rules
CREATE TABLE IF NOT EXISTS "FormAutoRule" (
  "id" TEXT NOT NULL, "templateId" TEXT NOT NULL, "trackSlug" TEXT NOT NULL DEFAULT 'any',
  "recurrence" TEXT NOT NULL DEFAULT 'ONCE', "sessionNumber" INTEGER, "therapistId" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FormAutoRule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FormAutoRule_active_idx" ON "FormAutoRule"("active");
CREATE INDEX IF NOT EXISTS "FormAutoRule_therapistId_idx" ON "FormAutoRule"("therapistId");
DO $$ BEGIN
  ALTER TABLE "FormAutoRule" ADD CONSTRAINT "FormAutoRule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 0028_session_presence
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "patientLastSeenAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "therapistLastSeenAt" TIMESTAMP(3);
