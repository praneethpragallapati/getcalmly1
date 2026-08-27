-- No double-booking of a session slot.
--
-- Nothing stopped two members from booking the same clinician at the same
-- instant, or one member from being booked with two clinicians at once — the
-- "taken" greying was display-only, and there was no rule in the database. Two
-- partial unique indexes make it impossible: at most one LIVE (non-cancelled)
-- session per clinician per instant, and per member per instant. A slot freed
-- by a cancellation or a settled void is bookable again, because those rows are
-- CANCELLED and fall outside the filter.
--
-- Wrapped so that, if a database already holds duplicate live appointments, the
-- script reports it instead of aborting — dedupe those rows, then re-run.
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_therapist_slot_active_key"
    ON "Appointment" ("therapistId", "scheduledAt") WHERE "status" <> 'CANCELLED';
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'therapist slot-uniqueness not applied: existing duplicate live appointments — dedupe then re-run';
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_patient_slot_active_key"
    ON "Appointment" ("patientId", "scheduledAt") WHERE "status" <> 'CANCELLED';
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'member slot-uniqueness not applied: existing duplicate live appointments — dedupe then re-run';
END $$;
