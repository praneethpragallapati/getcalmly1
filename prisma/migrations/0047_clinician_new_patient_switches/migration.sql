-- Per-clinician switches for starting NEW relationships.
--
-- matchingEligible: the clinician can be picked by auto-matching and shown in
-- pre-assessment results. directBookingEligible: the clinician is listed on the
-- website for direct booking. Turning either off never touches existing
-- patients, who keep their clinician. Both default to true, so nothing changes
-- until an admin unticks them.
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "matchingEligible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "directBookingEligible" BOOLEAN NOT NULL DEFAULT true;
