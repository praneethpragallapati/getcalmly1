-- Employment type for clinicians (gates the earnings ledger).
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME');

ALTER TABLE "TherapistProfile"
  ADD COLUMN "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME';

-- Three per-service base fees on the earnings config.
ALTER TABLE "EarningsConfig"
  ADD COLUMN "baseFeeIndividual" INTEGER NOT NULL DEFAULT 600,
  ADD COLUMN "baseFeeCouples" INTEGER NOT NULL DEFAULT 900,
  ADD COLUMN "baseFeePsychiatry" INTEGER NOT NULL DEFAULT 800;
