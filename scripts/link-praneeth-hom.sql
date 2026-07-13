-- ============================================================================
-- Link the test patient (praneethpragallapati@gmail.com) with the test
-- therapist Dr. Hom Pragallapati (pragallapati.hom@gmail.com).
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- It is idempotent: safe to run more than once. It only touches these two
-- accounts and the appointments between them; it never deletes the patient's
-- own mood/journal data.
--
-- Logins after running (both password sign-in):
--   Patient : praneethpragallapati@gmail.com  /  Merind07!demo
--   Doctor  : pragallapati.hom@gmail.com      /  Merind07!demo
-- ============================================================================

DO $$
DECLARE
  patient_id     text;
  doc_user_id    text;
  doc_profile_id text;
  d              int;
  -- A valid scrypt hash of "Merind07!demo" in the app's stored format
  -- ("scrypt$<salt>$<hash>"). The salt is embedded, so this verifies correctly.
  pw text := 'scrypt$8e0a409d388c3839e1b93a859ff5d99d$939223bb7799ef92e124780405cd13af2944bceda6bdeba923e9989e73bc8863e26c4699fbabba119177640c3b7b04a13e815861fd8f7aa4b14a30faab890324';
BEGIN
  -- 1) The patient must already exist (created when you first signed in).
  SELECT id INTO patient_id FROM "User" WHERE email = 'praneethpragallapati@gmail.com';
  IF patient_id IS NULL THEN
    RAISE EXCEPTION 'Patient praneethpragallapati@gmail.com not found. Sign in once with that email, then re-run.';
  END IF;

  -- Give the patient a name if it has none (so it stops showing the demo name).
  UPDATE "User"
     SET name = 'Praneeth Pragallapati', "updatedAt" = now()
   WHERE id = patient_id AND (name IS NULL OR name = '');

  -- Clinical profile so the therapist has context on the caseload.
  INSERT INTO "PatientProfile"
    (id, "userId", "patientId", track, "trackLabel", "subTrack", diagnosis,
     "currentSituation", "therapyStatus", country, "preferredLanguage",
     "dataRetentionConsent", "llmDataSharingConsent", "aiDisclaimerAck",
     "liabilityAck", "termsAcceptedAt", "updatedAt")
  VALUES
    (gen_random_uuid()::text, patient_id, 'GC-P-' || upper(right(patient_id, 6)),
     ARRAY['anxiety'], 'Anxiety and Overthinking', 'work-related',
     'Generalized Anxiety Disorder',
     'Living alone, demanding job with shifting deadlines; supportive but distant family.',
     'active', 'IN', 'English', true, true, true, true, now() - interval '140 days', now())
  ON CONFLICT ("userId") DO UPDATE SET
     "trackLabel"    = EXCLUDED."trackLabel",
     diagnosis       = EXCLUDED.diagnosis,
     "therapyStatus" = EXCLUDED."therapyStatus",
     "updatedAt"     = now();

  -- 2) The therapist user (created if missing, refreshed if present).
  INSERT INTO "User" (id, email, name, role, "passwordHash", "updatedAt")
  VALUES (gen_random_uuid()::text, 'pragallapati.hom@gmail.com',
          'Dr. Hom Pragallapati', 'THERAPIST', pw, now())
  ON CONFLICT (email) DO UPDATE SET
     name           = 'Dr. Hom Pragallapati',
     role           = 'THERAPIST',
     "passwordHash" = EXCLUDED."passwordHash",
     "updatedAt"    = now()
  RETURNING id INTO doc_user_id;

  -- Therapist profile.
  INSERT INTO "TherapistProfile"
    (id, "userId", bio, qualifications, "yearsExp", languages, specializations,
     "rciNumber", "sessionFee", rating, "totalReviews", "isVerified", "isActive")
  VALUES
    (gen_random_uuid()::text, doc_user_id,
     'Consultant psychiatrist specialising in anxiety, depression and psychopharmacology.',
     ARRAY['MBBS', 'MD Psychiatry', 'NMC Registered'], 10,
     ARRAY['English', 'Hindi', 'Telugu'],
     ARRAY['Psychiatry', 'Medication management', 'Anxiety', 'Depression'],
     'NMC-DEMO-0003', 1800, 4.8, 96, true, true)
  ON CONFLICT ("userId") DO UPDATE SET
     "isActive"      = true,
     "isVerified"    = true,
     specializations = EXCLUDED.specializations
  RETURNING id INTO doc_profile_id;

  -- 3) Weekly availability (Mon–Sat) so the patient can also book new slots.
  DELETE FROM "TherapistAvailability" WHERE "therapistId" = doc_profile_id;
  FOR d IN 1..6 LOOP
    INSERT INTO "TherapistAvailability" (id, "therapistId", "dayOfWeek", hours, "updatedAt")
    VALUES (gen_random_uuid()::text, doc_profile_id, d, ARRAY[9,10,11,12,14,15,17,18], now());
  END LOOP;

  -- 4) The link itself: appointments drive both the doctor's caseload and the
  --    patient's "My Therapist"/Sessions. Reset just this pair, then recreate.
  DELETE FROM "Appointment" WHERE "patientId" = patient_id AND "therapistId" = doc_profile_id;

  INSERT INTO "Appointment" (id, "patientId", "therapistId", "scheduledAt", "durationMins", status, fee, summary)
  VALUES (gen_random_uuid()::text, patient_id, doc_profile_id, now() - interval '6 days', 50, 'COMPLETED', 1800,
          'Co-managed anxiety case; reinforced reframing and breathing practice.');

  INSERT INTO "Appointment" (id, "patientId", "therapistId", "scheduledAt", "durationMins", status, fee)
  VALUES (gen_random_uuid()::text, patient_id, doc_profile_id, now() + interval '2 days', 50, 'CONFIRMED', 1800);

  INSERT INTO "Appointment" (id, "patientId", "therapistId", "scheduledAt", "durationMins", status, fee)
  VALUES (gen_random_uuid()::text, patient_id, doc_profile_id, now() + interval '5 days', 50, 'PENDING', 1800);

  RAISE NOTICE 'Linked Praneeth <-> Dr. Hom Pragallapati (1 completed, 1 confirmed, 1 pending).';
END $$;

-- Verify the link (should return 3 rows):
SELECT a.status, a."scheduledAt", pu.email AS patient, du.email AS doctor
FROM "Appointment" a
JOIN "User" pu ON pu.id = a."patientId"
JOIN "TherapistProfile" tp ON tp.id = a."therapistId"
JOIN "User" du ON du.id = tp."userId"
WHERE pu.email = 'praneethpragallapati@gmail.com'
  AND du.email = 'pragallapati.hom@gmail.com'
ORDER BY a."scheduledAt";
