-- Referral program: per-user code + wallet credit / bonus sessions, a Referral
-- record per invited person, and singleton program settings.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredById" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "walletCreditRupees" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bonusSessions" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

CREATE TABLE IF NOT EXISTS "Referral" (
  "id"                  TEXT NOT NULL,
  "referrerId"          TEXT NOT NULL,
  "refereeId"           TEXT NOT NULL,
  "status"              TEXT NOT NULL DEFAULT 'PENDING',
  "qualifyingPaymentId" TEXT,
  "referrerRewardKind"  TEXT,
  "referrerRewardValue" INTEGER,
  "refereeDiscount"     INTEGER,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "qualifiedAt"         TIMESTAMP(3),
  CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Referral_refereeId_key" ON "Referral"("refereeId");
CREATE INDEX IF NOT EXISTS "Referral_referrerId_idx" ON "Referral"("referrerId");
CREATE INDEX IF NOT EXISTS "Referral_status_idx" ON "Referral"("status");
DO $$ BEGIN
  ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey"
    FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeId_fkey"
    FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ReferralConfig" (
  "id"                  TEXT NOT NULL DEFAULT 'default',
  "enabled"             BOOLEAN NOT NULL DEFAULT false,
  "referrerRewardKind"  TEXT NOT NULL DEFAULT 'WALLET_CREDIT',
  "referrerRewardValue" INTEGER NOT NULL DEFAULT 500,
  "refereeDiscount"     INTEGER NOT NULL DEFAULT 500,
  "clawback"            BOOLEAN NOT NULL DEFAULT true,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReferralConfig_pkey" PRIMARY KEY ("id")
);
