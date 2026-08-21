-- The money ledger, and admin sub-roles.
--
-- LedgerEntry records only what is NOT already derivable. Customer revenue comes
-- from Payment and therapist pay from completed sessions; duplicating either here
-- would let the two disagree. What has no home is founder investment coming in,
-- and every non-session cost going out.
CREATE TABLE IF NOT EXISTS "LedgerEntry" (
  "id"            TEXT PRIMARY KEY,
  "direction"     TEXT NOT NULL,
  "category"      TEXT NOT NULL,
  "amount"        INTEGER NOT NULL,
  "occurredAt"    TIMESTAMP(3) NOT NULL,
  "counterparty"  TEXT,
  "note"          TEXT,
  "billName"      TEXT,
  "billUrl"       TEXT,
  "createdById"   TEXT,
  "createdByName" TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "LedgerEntry_occurredAt_idx" ON "LedgerEntry"("occurredAt");
CREATE INDEX IF NOT EXISTS "LedgerEntry_direction_idx" ON "LedgerEntry"("direction");

-- Admin sub-role. NULL means full access, so every admin that already exists
-- keeps exactly the access they have today.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "adminType" TEXT;
