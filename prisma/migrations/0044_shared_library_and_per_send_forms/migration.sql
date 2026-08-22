-- Who owns a form, and how one gets adjusted before it is sent.
--
-- Two rules, one column each:
--
-- 1. "shared" — only an admin creates forms everyone can see. The forms that
--    ship with the product are shared (no creator), an admin's forms are shared,
--    and a clinician's forms are their own to send. Before this, every custom
--    form landed in one library, so a form one clinician built for their own use
--    appeared in every colleague's picker.
--
--    Backfilled, because the column arrives after the rows: without it every
--    existing form would read as private and the library would look empty.
--
-- 2. "FormAssignment"."fields" — the questions as actually sent, when a
--    clinician adjusted them in the send preview. The earlier answer to "I need
--    this consent form worded differently for this patient" was to duplicate the
--    form, which left a near-identical copy in the picker every time. Now the
--    edit rides on the one assignment: that patient sees the adjusted questions,
--    the library form is untouched, and nothing is left behind.
--    NULL means "whatever the template says", which is the ordinary case.
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "shared" BOOLEAN NOT NULL DEFAULT false;

UPDATE "FormTemplate" SET "shared" = true
  WHERE "createdById" IS NULL AND "shared" = false;

UPDATE "FormTemplate" t SET "shared" = true
  FROM "User" u
  WHERE u.id = t."createdById" AND u.role = 'ADMIN' AND t."shared" = false;

ALTER TABLE "FormAssignment" ADD COLUMN IF NOT EXISTS "fields" JSONB;
