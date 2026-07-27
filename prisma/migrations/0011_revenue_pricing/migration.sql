-- 0011 · Package revenue ledger + editable pricing config
-- Idempotent: safe to run against a schema-managed (non prisma-migrate) database.

-- Payment: one money-in event per purchase (package / first session / Calm+).
CREATE TABLE IF NOT EXISTS "Payment" (
  "id"             TEXT NOT NULL,
  "userId"         TEXT NOT NULL,
  "subscriptionId" TEXT,
  "amount"         INTEGER NOT NULL,
  "kind"           TEXT NOT NULL,
  "trackSlug"      TEXT,
  "planName"       TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "Payment"("createdAt");

-- PricingConfig: singleton (id = 'default') holding editable customer pricing.
CREATE TABLE IF NOT EXISTS "PricingConfig" (
  "id"              TEXT NOT NULL DEFAULT 'default',
  "firstSession"    JSONB NOT NULL,
  "therapyPacks"    JSONB NOT NULL,
  "psychiatryPacks" JSONB NOT NULL,
  "couplesPacks"    JSONB NOT NULL,
  "calmPlusPacks"   JSONB NOT NULL,
  "therapyBase"     INTEGER NOT NULL DEFAULT 1999,
  "psychiatryBase"  INTEGER NOT NULL DEFAULT 1999,
  "couplesBase"     INTEGER NOT NULL DEFAULT 3999,
  "calmPlusBase"    INTEGER NOT NULL DEFAULT 499,
  "updatedBy"       TEXT,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);
