-- ⚠️  DESTRUCTIVE — RUN ONCE, NEVER AGAIN AFTER YOU START TESTING  ⚠️
-- getCalmly · fresh user seed. `TRUNCATE ... CASCADE` DELETES ALL USERS AND
-- everything linked to them — packages/subscriptions, appointments, check-ins,
-- journals, assignments. Re-running this after you've bought packages or booked
-- sessions will WIPE them (the account is recreated empty with the same id), which
-- looks exactly like "my packages disappeared / admin shows nothing".
--
-- For a one-time clean slate: run this ONCE, then log out and back in, and DO NOT
-- run it again. To only add the missing schema columns without touching data, run
-- prisma/apply_all_migrations.sql instead (that one is safe and idempotent).
--
-- Creates 1 admin + 5 clinicians + 9 patients. No mappings/appointments/packages.
-- Blogs & community render from seed data, so they are unaffected.
--
-- DEVELOPMENT AND DEMO ONLY. Every account shares one password: DemoSeed@2026
--
-- The hash below is committed on purpose and leaks nothing: it is the hash of a
-- password printed in this very file, so knowing it tells you what the line
-- above already tells you. What must NEVER be committed here — and previously
-- was — is a hash of a real person's real password. Every address is under
-- example.com, which RFC 2606 reserves and no mail server will deliver to, so a
-- seeded account cannot receive an OTP or a notification meant for a real
-- person even if this runs somewhere it should not have.
BEGIN;
TRUNCATE TABLE "User" CASCADE;

-- Admin
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_f494a652b498e7f56601f6','admin@example.com','Demo Admin','ADMIN','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());

-- Clinicians (3 therapists + 1 couples + 1 psychiatrist; the first is part-time)
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_bc404a16d49dc48c68a335','arjun.desai@example.com','Dr. Arjun Desai','THERAPIST','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "TherapistProfile" ("id","userId","bio","qualifications","yearsExp","languages","specializations","rciNumber","sessionFee","gender","clinicianType","employmentType","isVerified","isActive","documentUrls","createdAt") VALUES ('thp_4f52878363395b09f60e43','usr_bc404a16d49dc48c68a335','Works with adults on anxiety, burnout and life transitions, blending CBT with practical between-session tools.','{"M.Phil Clinical Psychology (RCI)"}',9,'{"English","Hindi","Telugu"}','{"Anxiety","CBT","Work stress"}','A100001',1200,'Male','Therapist','PART_TIME',true,true,'{}',now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_b5756f807e0be4e9ddddde','ananya.sharma@example.com','Dr. Ananya Sharma','THERAPIST','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "TherapistProfile" ("id","userId","bio","qualifications","yearsExp","languages","specializations","rciNumber","sessionFee","gender","clinicianType","employmentType","isVerified","isActive","documentUrls","createdAt") VALUES ('thp_08d8678577502a20e3d6bf','usr_b5756f807e0be4e9ddddde','Trauma-informed clinical psychologist supporting adults through anxiety and difficult life change.','{"M.Phil Clinical Psychology (RCI)"}',8,'{"English","Hindi"}','{"Anxiety","Trauma","CBT"}','A100002',1200,'Female','Therapist','FULL_TIME',true,true,'{}',now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_c6aa555a444fdd4573041b','rohan.verma@example.com','Dr. Rohan Verma','THERAPIST','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "TherapistProfile" ("id","userId","bio","qualifications","yearsExp","languages","specializations","rciNumber","sessionFee","gender","clinicianType","employmentType","isVerified","isActive","documentUrls","createdAt") VALUES ('thp_e9ea5849742c3cf9cb578a','usr_c6aa555a444fdd4573041b','Helps people navigate depression, relationships and loss with warmth and structure.','{"M.A. Psychology","M.Phil (RCI)"}',11,'{"English","Hindi","Punjabi"}','{"Depression","Relationships","Grief"}','A100003',1300,'Male','Therapist','FULL_TIME',true,true,'{}',now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_0abb8c3d691a7c454d47e7','meera.iyer@example.com','Dr. Meera Iyer','THERAPIST','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "TherapistProfile" ("id","userId","bio","qualifications","yearsExp","languages","specializations","rciNumber","sessionFee","gender","clinicianType","employmentType","isVerified","isActive","documentUrls","createdAt") VALUES ('thp_d24bb9d3798dcc52c01f98','usr_0abb8c3d691a7c454d47e7','Couples specialist using Emotionally Focused Therapy to help partners reconnect.','{"M.Sc Counselling Psychology"}',7,'{"English","Tamil","Hindi"}','{"Couples","EFT","Communication"}','A100004',1500,'Female','Couples therapist','FULL_TIME',true,true,'{}',now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_c2d2f064740b92a6cdd33d','kabir.rao@example.com','Dr. Kabir Rao','THERAPIST','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "TherapistProfile" ("id","userId","bio","qualifications","yearsExp","languages","specializations","rciNumber","sessionFee","gender","clinicianType","employmentType","isVerified","isActive","documentUrls","createdAt") VALUES ('thp_22beae859f3f7383578085','usr_c2d2f064740b92a6cdd33d','Consultant psychiatrist for diagnosis and medication, working alongside your therapist.','{"MBBS","MD Psychiatry (NMC)"}',12,'{"English","Hindi","Kannada"}','{"Psychiatry","Medication management","Adult ADHD"}','N200001',1800,'Male','Psychiatrist','FULL_TIME',true,true,'{}',now());

-- Patients
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_ff999deff356d9bd6fb46a','rhea.kapoor@example.com','Rhea Kapoor','PATIENT','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "PatientProfile" ("id","userId","patientId","careMode","track","country","createdAt","updatedAt") VALUES ('pat_c069624d8f0046956a0950','usr_ff999deff356d9bd6fb46a','P-1000','INDIVIDUAL','{}','IN',now(),now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_25d60ef4fcab89af32e4d0','aarav.patel@example.com','Aarav Patel','PATIENT','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "PatientProfile" ("id","userId","patientId","careMode","track","country","createdAt","updatedAt") VALUES ('pat_f7ad03443d62e225a2f779','usr_25d60ef4fcab89af32e4d0','P-1001','INDIVIDUAL','{}','IN',now(),now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_14e59023428bd627cd23dc','diya.nair@example.com','Diya Nair','PATIENT','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "PatientProfile" ("id","userId","patientId","careMode","track","country","createdAt","updatedAt") VALUES ('pat_6f49799994f3b029ab35aa','usr_14e59023428bd627cd23dc','P-1002','INDIVIDUAL','{}','IN',now(),now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_315658afe7107f60ea6e1e','vikram.singh@example.com','Vikram Singh','PATIENT','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "PatientProfile" ("id","userId","patientId","careMode","track","country","createdAt","updatedAt") VALUES ('pat_126f7a126d2da85b21fd0a','usr_315658afe7107f60ea6e1e','P-1003','INDIVIDUAL','{}','IN',now(),now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_429ae1ff7f5efc493a17f4','sara.khan@example.com','Sara Khan','PATIENT','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "PatientProfile" ("id","userId","patientId","careMode","track","country","createdAt","updatedAt") VALUES ('pat_8aa98089f11d286d5ea4c1','usr_429ae1ff7f5efc493a17f4','P-1004','INDIVIDUAL','{}','IN',now(),now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_bed6cfb88aecbccad98b9d','aditya.rao@example.com','Aditya Rao','PATIENT','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "PatientProfile" ("id","userId","patientId","careMode","track","country","createdAt","updatedAt") VALUES ('pat_8cce4e57e4ed6e9314175d','usr_bed6cfb88aecbccad98b9d','P-1005','INDIVIDUAL','{}','IN',now(),now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_614acb6ede58ba033bd134','isha.gupta@example.com','Isha Gupta','PATIENT','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "PatientProfile" ("id","userId","patientId","careMode","track","country","createdAt","updatedAt") VALUES ('pat_389cada865e0a562ad668c','usr_614acb6ede58ba033bd134','P-1006','INDIVIDUAL','{}','IN',now(),now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_5f1f9d120bc5b07e3af4a9','karan.mehta@example.com','Karan Mehta','PATIENT','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "PatientProfile" ("id","userId","patientId","careMode","track","country","createdAt","updatedAt") VALUES ('pat_4454a1ab2fdd8aa1726fc0','usr_5f1f9d120bc5b07e3af4a9','P-1007','INDIVIDUAL','{}','IN',now(),now());
INSERT INTO "User" ("id","email","name","role","passwordHash","mustChangePassword","createdAt","updatedAt") VALUES ('usr_0007e3967a74dbcd0e13f4','ananya.reddy@example.com','Ananya Reddy','PATIENT','scrypt$157045ac509cac671f2d06e1873dd9d5$b722c9760d8733c70ed732fa6c17227f07eed0aed9f90205a8e90e99338dad37ffc82c330d2923edf980b5f7f9e80f9d7c00e5192b18d8c53291dcf82c832826',false,now(),now());
INSERT INTO "PatientProfile" ("id","userId","patientId","careMode","track","country","createdAt","updatedAt") VALUES ('pat_7cc15a4bd48a7e80369c7b','usr_0007e3967a74dbcd0e13f4','P-1008','INDIVIDUAL','{}','IN',now(),now());

COMMIT;
