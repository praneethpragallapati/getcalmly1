-- Autosaved session-note drafts, and the clinician's own rating of a member.
--
-- summaryDraft is deliberately separate from summary: writing `summary` is what
-- marks a session written-up (it gates clinician pay and clears "note due"), so
-- an autosave must never land there.
--
-- memberRating is the clinician's read on the session, visible to clinicians and
-- admins only — never to the member it describes.
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "summaryDraft" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "summaryDraftAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "memberRating" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "memberRatingNote" TEXT;
