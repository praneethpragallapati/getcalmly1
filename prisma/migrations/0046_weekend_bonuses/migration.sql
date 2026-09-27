-- Saturday and Sunday bonuses.
--
-- A completed session held on a Saturday or Sunday (IST) pays an extra bonus,
-- set platform-wide on EarningsConfig and overridable per clinician on
-- TherapistProfile (NULL = use the platform value). Both default to 0 so no
-- one's pay changes until an admin sets them.
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "saturdayBonus" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "sundayBonus" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "saturdayBonus" INTEGER;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "sundayBonus" INTEGER;
