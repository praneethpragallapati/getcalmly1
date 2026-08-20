-- Human-facing registration numbers: every account gets one, unique for life.
-- Format and allocation live in src/lib/registration.ts.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "registrationNo" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_registrationNo_key" ON "User"("registrationNo");

CREATE TABLE IF NOT EXISTS "RegistrationCounter" (
  "key" TEXT NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RegistrationCounter_pkey" PRIMARY KEY ("key")
);
