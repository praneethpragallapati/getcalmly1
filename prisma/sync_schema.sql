-- ─────────────────────────────────────────────────────────────────────────────
-- getCalmly · Make this database match the app
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor (works from a phone browser):
--   Supabase → your project → SQL Editor → New query → paste → Run
--
-- WHY THIS EXISTS
-- ---------------
-- apply_all_migrations.sql only covers migrations 0014 onward, because that is
-- where the gap was when it was written. It was never a complete picture: Task's
-- `frequency` column comes from 0006, so a database missing that one was not
-- repaired by it, and assigning a task kept failing with "the tasks table is
-- missing a column" even after the catch-up had run.
--
-- This script does not track migrations at all. It declares every enum, table,
-- column, key, index and foreign key the app expects, each one guarded, and adds
-- whatever is absent. Whatever state a database is in — complete, part-migrated,
-- or empty — running this brings it up to what the code needs.
--
-- SAFETY
-- ------
-- Purely additive. Every statement is IF NOT EXISTS or exception-guarded, so it
-- creates only what is missing and never drops, truncates, alters or rewrites
-- anything that already exists. No row is read or changed. Safe to run twice, or
-- on a database that is already complete — it then does nothing at all.
--
-- Generated from prisma/schema.prisma.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── Enum types ───────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "AssessmentType" AS ENUM ('ADULT', 'CHILD', 'COUPLE', 'PSYCHIATRY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "CareCategory" AS ENUM ('INDIVIDUAL', 'COUPLE', 'KIDS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "CareMode" AS ENUM ('INDIVIDUAL', 'COUPLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "CommunityRole" AS ENUM ('PAID_MEMBER', 'MEMBER', 'THERAPIST', 'PSYCHIATRIST', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "FormKind" AS ENUM ('INTAKE', 'CONSENT', 'INFO', 'FEEDBACK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "FormStatus" AS ENUM ('PENDING', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "InsightKind" AS ENUM ('DAILY', 'WEEKLY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "MedicationOrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'DISPATCHED', 'DELIVERED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "PlanTier" AS ENUM ('STARTER', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "RelationType" AS ENUM ('PARTNER', 'CHILD', 'DEPENDENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('PATIENT', 'THERAPIST', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "SeverityLevel" AS ENUM ('MINIMAL', 'MILD', 'MODERATE', 'SEVERE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PAUSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "TaskType" AS ENUM ('EXERCISE', 'VIDEO', 'READING', 'REFLECTION', 'BREATHING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "TherapistApplicationStatus" AS ENUM ('APPLIED', 'INTERVIEW_SCHEDULED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tables and columns ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Account" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "providerAccountId" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text
);
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "type" text NOT NULL;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "provider" text NOT NULL;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "providerAccountId" text NOT NULL;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refresh_token" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "access_token" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "expires_at" integer;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "token_type" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "scope" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "id_token" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "session_state" text;

CREATE TABLE IF NOT EXISTS "AiInsight" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "kind" "InsightKind" NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "meta" jsonb,
  "forDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "AiInsight" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "AiInsight" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "AiInsight" ADD COLUMN IF NOT EXISTS "kind" "InsightKind" NOT NULL;
ALTER TABLE "AiInsight" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "AiInsight" ADD COLUMN IF NOT EXISTS "body" text NOT NULL;
ALTER TABLE "AiInsight" ADD COLUMN IF NOT EXISTS "meta" jsonb;
ALTER TABLE "AiInsight" ADD COLUMN IF NOT EXISTS "forDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "AiInsight" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "AiProfile" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "summary" text,
  "signals" jsonb,
  "lastBuiltAt" timestamp(3) without time zone,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "AiProfile" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "AiProfile" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "AiProfile" ADD COLUMN IF NOT EXISTS "summary" text;
ALTER TABLE "AiProfile" ADD COLUMN IF NOT EXISTS "signals" jsonb;
ALTER TABLE "AiProfile" ADD COLUMN IF NOT EXISTS "lastBuiltAt" timestamp(3) without time zone;
ALTER TABLE "AiProfile" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "Appointment" (
  "id" text NOT NULL,
  "patientId" text NOT NULL,
  "therapistId" text NOT NULL,
  "scheduledAt" timestamp(3) without time zone NOT NULL,
  "durationMins" integer DEFAULT 45 NOT NULL,
  "status" "AppointmentStatus" DEFAULT 'PENDING'::"AppointmentStatus" NOT NULL,
  "roomId" text,
  "meetLink" text,
  "fee" integer NOT NULL,
  "notes" text,
  "preSessionNote" text,
  "summaryDraft" text,
  "summaryDraftAt" timestamp(3) without time zone,
  "memberRating" integer,
  "memberRatingNote" text,
  "summary" text,
  "patientJoinedAt" timestamp(3) without time zone,
  "therapistJoinedAt" timestamp(3) without time zone,
  "endedAt" timestamp(3) without time zone,
  "patientLastSeenAt" timestamp(3) without time zone,
  "therapistLastSeenAt" timestamp(3) without time zone,
  "consumedSubscriptionId" text,
  "cancelRequested" boolean DEFAULT false NOT NULL,
  "cancelReason" text,
  "cancelRequestedAt" timestamp(3) without time zone,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "patientId" text NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "therapistId" text NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "scheduledAt" timestamp(3) without time zone NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "durationMins" integer DEFAULT 45 NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "status" "AppointmentStatus" DEFAULT 'PENDING'::"AppointmentStatus" NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "roomId" text;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "meetLink" text;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "fee" integer NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "preSessionNote" text;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "summaryDraft" text;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "summaryDraftAt" timestamp(3) without time zone;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "memberRating" integer;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "memberRatingNote" text;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "summary" text;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "patientJoinedAt" timestamp(3) without time zone;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "therapistJoinedAt" timestamp(3) without time zone;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "endedAt" timestamp(3) without time zone;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "patientLastSeenAt" timestamp(3) without time zone;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "therapistLastSeenAt" timestamp(3) without time zone;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "consumedSubscriptionId" text;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelRequested" boolean DEFAULT false NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelReason" text;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelRequestedAt" timestamp(3) without time zone;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "Assessment" (
  "id" text NOT NULL,
  "userId" text,
  "type" "AssessmentType" NOT NULL,
  "responses" jsonb NOT NULL,
  "severityLevel" "SeverityLevel" NOT NULL,
  "areasOfConcern" text[],
  "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "userId" text;
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "type" "AssessmentType" NOT NULL;
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "responses" jsonb NOT NULL;
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "severityLevel" "SeverityLevel" NOT NULL;
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "areasOfConcern" text[];
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "AssessmentScore" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "scale" text NOT NULL,
  "score" integer NOT NULL,
  "label" text,
  "recordedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "scale" text NOT NULL;
ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "score" integer NOT NULL;
ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "label" text;
ALTER TABLE "AssessmentScore" ADD COLUMN IF NOT EXISTS "recordedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "AvailabilityException" (
  "id" text NOT NULL,
  "therapistId" text NOT NULL,
  "date" timestamp(3) without time zone NOT NULL,
  "fullDayOff" boolean DEFAULT true NOT NULL,
  "hoursOff" integer[],
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "AvailabilityException" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "AvailabilityException" ADD COLUMN IF NOT EXISTS "therapistId" text NOT NULL;
ALTER TABLE "AvailabilityException" ADD COLUMN IF NOT EXISTS "date" timestamp(3) without time zone NOT NULL;
ALTER TABLE "AvailabilityException" ADD COLUMN IF NOT EXISTS "fullDayOff" boolean DEFAULT true NOT NULL;
ALTER TABLE "AvailabilityException" ADD COLUMN IF NOT EXISTS "hoursOff" integer[];
ALTER TABLE "AvailabilityException" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "BlogPost" (
  "id" text NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "excerpt" text NOT NULL,
  "content" text[],
  "authorName" text NOT NULL,
  "authorRole" text NOT NULL,
  "authorId" text,
  "tags" text[],
  "readTime" text NOT NULL,
  "coverImage" text,
  "published" boolean DEFAULT true NOT NULL,
  "reviewStatus" text DEFAULT 'APPROVED'::text NOT NULL,
  "reviewNote" text,
  "submittedAt" timestamp(3) without time zone,
  "reviewedAt" timestamp(3) without time zone,
  "reviewedByName" text,
  "publishedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "slug" text NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "excerpt" text NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "content" text[];
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "authorName" text NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "authorRole" text NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "authorId" text;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "tags" text[];
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "readTime" text NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "coverImage" text;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "published" boolean DEFAULT true NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewStatus" text DEFAULT 'APPROVED'::text NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewNote" text;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "submittedAt" timestamp(3) without time zone;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewedAt" timestamp(3) without time zone;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "reviewedByName" text;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "publishedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "CalmAiMessage" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "role" "ChatRole" NOT NULL,
  "content" text NOT NULL,
  "label" text,
  "intent" text,
  "intensity" text,
  "highStake" boolean DEFAULT false NOT NULL,
  "model" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "CalmAiMessage" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "CalmAiMessage" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "CalmAiMessage" ADD COLUMN IF NOT EXISTS "role" "ChatRole" NOT NULL;
ALTER TABLE "CalmAiMessage" ADD COLUMN IF NOT EXISTS "content" text NOT NULL;
ALTER TABLE "CalmAiMessage" ADD COLUMN IF NOT EXISTS "label" text;
ALTER TABLE "CalmAiMessage" ADD COLUMN IF NOT EXISTS "intent" text;
ALTER TABLE "CalmAiMessage" ADD COLUMN IF NOT EXISTS "intensity" text;
ALTER TABLE "CalmAiMessage" ADD COLUMN IF NOT EXISTS "highStake" boolean DEFAULT false NOT NULL;
ALTER TABLE "CalmAiMessage" ADD COLUMN IF NOT EXISTS "model" text;
ALTER TABLE "CalmAiMessage" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "ClinicalContext" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "scale" text,
  "trend" text,
  "whatHasHelped" text[],
  "whatHasNotHelped" text[],
  "recurringTriggers" text[],
  "passiveSiHistory" boolean DEFAULT false NOT NULL,
  "sleepDisturbance" boolean DEFAULT false NOT NULL,
  "safetyPlanActive" boolean DEFAULT false NOT NULL,
  "safetyPlanContact" text,
  "updatedBy" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "scale" text;
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "trend" text;
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "whatHasHelped" text[];
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "whatHasNotHelped" text[];
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "recurringTriggers" text[];
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "passiveSiHistory" boolean DEFAULT false NOT NULL;
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "sleepDisturbance" boolean DEFAULT false NOT NULL;
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "safetyPlanActive" boolean DEFAULT false NOT NULL;
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "safetyPlanContact" text;
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "updatedBy" text;
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "ClinicalContext" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "CommunityComment" (
  "id" text NOT NULL,
  "postId" text NOT NULL,
  "authorName" text NOT NULL,
  "authorRole" "CommunityRole" DEFAULT 'MEMBER'::"CommunityRole" NOT NULL,
  "anonymous" boolean DEFAULT false NOT NULL,
  "authorId" text,
  "body" text NOT NULL,
  "upvotes" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "postId" text NOT NULL;
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "authorName" text NOT NULL;
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "authorRole" "CommunityRole" DEFAULT 'MEMBER'::"CommunityRole" NOT NULL;
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "anonymous" boolean DEFAULT false NOT NULL;
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "authorId" text;
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "body" text NOT NULL;
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "upvotes" integer DEFAULT 0 NOT NULL;
ALTER TABLE "CommunityComment" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "CommunityPost" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "authorName" text NOT NULL,
  "authorRole" "CommunityRole" DEFAULT 'MEMBER'::"CommunityRole" NOT NULL,
  "tenure" text,
  "anonymous" boolean DEFAULT false NOT NULL,
  "authorId" text,
  "tags" text[],
  "upvotes" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "body" text NOT NULL;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "authorName" text NOT NULL;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "authorRole" "CommunityRole" DEFAULT 'MEMBER'::"CommunityRole" NOT NULL;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "tenure" text;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "anonymous" boolean DEFAULT false NOT NULL;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "authorId" text;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "tags" text[];
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "upvotes" integer DEFAULT 0 NOT NULL;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "CommunityUpvote" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "postId" text,
  "commentId" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "CommunityUpvote" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "CommunityUpvote" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "CommunityUpvote" ADD COLUMN IF NOT EXISTS "postId" text;
ALTER TABLE "CommunityUpvote" ADD COLUMN IF NOT EXISTS "commentId" text;
ALTER TABLE "CommunityUpvote" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "ContactMessage" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "message" text NOT NULL,
  "handled" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "name" text NOT NULL;
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "email" text NOT NULL;
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "message" text NOT NULL;
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "handled" boolean DEFAULT false NOT NULL;
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "CrisisAlert" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "patientName" text,
  "therapistName" text,
  "therapistEmail" text,
  "label" text NOT NULL,
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "handoffNote" text NOT NULL,
  "resolved" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "patientName" text;
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "therapistName" text;
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "therapistEmail" text;
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "label" text NOT NULL;
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "question" text NOT NULL;
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "answer" text NOT NULL;
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "handoffNote" text NOT NULL;
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "resolved" boolean DEFAULT false NOT NULL;
ALTER TABLE "CrisisAlert" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "EarningsConfig" (
  "id" text DEFAULT 'default'::text NOT NULL,
  "baseFee" integer DEFAULT 600 NOT NULL,
  "baseFeeIndividual" integer DEFAULT 600 NOT NULL,
  "baseFeeCouples" integer DEFAULT 900 NOT NULL,
  "baseFeePsychiatry" integer DEFAULT 800 NOT NULL,
  "secondSessionBonus" integer DEFAULT 50 NOT NULL,
  "thirdOnwardsBonus" integer DEFAULT 100 NOT NULL,
  "miscBonus" integer DEFAULT 0 NOT NULL,
  "nightSessionBonus" integer DEFAULT 200 NOT NULL,
  "updatedBy" text,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "id" text DEFAULT 'default'::text NOT NULL;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "baseFee" integer DEFAULT 600 NOT NULL;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "baseFeeIndividual" integer DEFAULT 600 NOT NULL;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "baseFeeCouples" integer DEFAULT 900 NOT NULL;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "baseFeePsychiatry" integer DEFAULT 800 NOT NULL;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "secondSessionBonus" integer DEFAULT 50 NOT NULL;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "thirdOnwardsBonus" integer DEFAULT 100 NOT NULL;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "miscBonus" integer DEFAULT 0 NOT NULL;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "nightSessionBonus" integer DEFAULT 200 NOT NULL;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "updatedBy" text;
ALTER TABLE "EarningsConfig" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "EnterpriseLead" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "organisation" text,
  "sector" text,
  "teamSize" text,
  "phone" text,
  "message" text,
  "handled" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "EnterpriseLead" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "EnterpriseLead" ADD COLUMN IF NOT EXISTS "name" text NOT NULL;
ALTER TABLE "EnterpriseLead" ADD COLUMN IF NOT EXISTS "email" text NOT NULL;
ALTER TABLE "EnterpriseLead" ADD COLUMN IF NOT EXISTS "organisation" text;
ALTER TABLE "EnterpriseLead" ADD COLUMN IF NOT EXISTS "sector" text;
ALTER TABLE "EnterpriseLead" ADD COLUMN IF NOT EXISTS "teamSize" text;
ALTER TABLE "EnterpriseLead" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "EnterpriseLead" ADD COLUMN IF NOT EXISTS "message" text;
ALTER TABLE "EnterpriseLead" ADD COLUMN IF NOT EXISTS "handled" boolean DEFAULT false NOT NULL;
ALTER TABLE "EnterpriseLead" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "FormAssignment" (
  "id" text NOT NULL,
  "templateId" text NOT NULL,
  "patientId" text NOT NULL,
  "assignedBy" text,
  "status" "FormStatus" DEFAULT 'PENDING'::"FormStatus" NOT NULL,
  "responses" jsonb,
  "note" text,
  "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "completedAt" timestamp(3) without time zone
);
ALTER TABLE "FormAssignment" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "FormAssignment" ADD COLUMN IF NOT EXISTS "templateId" text NOT NULL;
ALTER TABLE "FormAssignment" ADD COLUMN IF NOT EXISTS "patientId" text NOT NULL;
ALTER TABLE "FormAssignment" ADD COLUMN IF NOT EXISTS "assignedBy" text;
ALTER TABLE "FormAssignment" ADD COLUMN IF NOT EXISTS "status" "FormStatus" DEFAULT 'PENDING'::"FormStatus" NOT NULL;
ALTER TABLE "FormAssignment" ADD COLUMN IF NOT EXISTS "responses" jsonb;
ALTER TABLE "FormAssignment" ADD COLUMN IF NOT EXISTS "note" text;
ALTER TABLE "FormAssignment" ADD COLUMN IF NOT EXISTS "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "FormAssignment" ADD COLUMN IF NOT EXISTS "completedAt" timestamp(3) without time zone;

CREATE TABLE IF NOT EXISTS "FormAutoRule" (
  "id" text NOT NULL,
  "templateId" text NOT NULL,
  "trackSlug" text DEFAULT 'any'::text NOT NULL,
  "recurrence" text DEFAULT 'ONCE'::text NOT NULL,
  "sessionNumber" integer,
  "therapistId" text,
  "patientId" text,
  "active" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "templateId" text NOT NULL;
ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "trackSlug" text DEFAULT 'any'::text NOT NULL;
ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "recurrence" text DEFAULT 'ONCE'::text NOT NULL;
ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "sessionNumber" integer;
ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "therapistId" text;
ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "patientId" text;
ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;
ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "FormTemplate" (
  "id" text NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "kind" "FormKind" DEFAULT 'INFO'::"FormKind" NOT NULL,
  "category" "CareCategory",
  "autoSend" boolean DEFAULT false NOT NULL,
  "fields" jsonb NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "createdById" text,
  "createdByName" text,
  "customisedAt" timestamp(3) without time zone,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "slug" text NOT NULL;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "kind" "FormKind" DEFAULT 'INFO'::"FormKind" NOT NULL;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "category" "CareCategory";
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "autoSend" boolean DEFAULT false NOT NULL;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "fields" jsonb NOT NULL;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "createdById" text;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "createdByName" text;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "customisedAt" timestamp(3) without time zone;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "GuidedAssignment" (
  "id" text NOT NULL,
  "trackId" text NOT NULL,
  "patientId" text NOT NULL,
  "assignedById" text,
  "validUntil" timestamp(3) without time zone,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "GuidedAssignment" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "GuidedAssignment" ADD COLUMN IF NOT EXISTS "trackId" text NOT NULL;
ALTER TABLE "GuidedAssignment" ADD COLUMN IF NOT EXISTS "patientId" text NOT NULL;
ALTER TABLE "GuidedAssignment" ADD COLUMN IF NOT EXISTS "assignedById" text;
ALTER TABLE "GuidedAssignment" ADD COLUMN IF NOT EXISTS "validUntil" timestamp(3) without time zone;
ALTER TABLE "GuidedAssignment" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "GuidedTrack" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "isPublic" boolean DEFAULT false NOT NULL,
  "comingSoon" boolean DEFAULT true NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "GuidedTrack" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "GuidedTrack" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "GuidedTrack" ADD COLUMN IF NOT EXISTS "slug" text NOT NULL;
ALTER TABLE "GuidedTrack" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "GuidedTrack" ADD COLUMN IF NOT EXISTS "sortOrder" integer DEFAULT 0 NOT NULL;
ALTER TABLE "GuidedTrack" ADD COLUMN IF NOT EXISTS "isPublic" boolean DEFAULT false NOT NULL;
ALTER TABLE "GuidedTrack" ADD COLUMN IF NOT EXISTS "comingSoon" boolean DEFAULT true NOT NULL;
ALTER TABLE "GuidedTrack" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;
ALTER TABLE "GuidedTrack" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "GuidedVideo" (
  "id" text NOT NULL,
  "trackId" text NOT NULL,
  "title" text NOT NULL,
  "youtubeId" text NOT NULL,
  "description" text,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "GuidedVideo" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "GuidedVideo" ADD COLUMN IF NOT EXISTS "trackId" text NOT NULL;
ALTER TABLE "GuidedVideo" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "GuidedVideo" ADD COLUMN IF NOT EXISTS "youtubeId" text NOT NULL;
ALTER TABLE "GuidedVideo" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "GuidedVideo" ADD COLUMN IF NOT EXISTS "sortOrder" integer DEFAULT 0 NOT NULL;
ALTER TABLE "GuidedVideo" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "JournalEntry" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "title" text,
  "content" text NOT NULL,
  "moodTag" text,
  "topicTags" text[],
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "title" text;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "content" text NOT NULL;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "moodTag" text;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "topicTags" text[];
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "LedgerEntry" (
  "id" text NOT NULL,
  "direction" text NOT NULL,
  "category" text NOT NULL,
  "amount" integer NOT NULL,
  "occurredAt" timestamp(3) without time zone NOT NULL,
  "counterparty" text,
  "note" text,
  "billName" text,
  "billUrl" text,
  "createdById" text,
  "createdByName" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "direction" text NOT NULL;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "category" text NOT NULL;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "amount" integer NOT NULL;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "occurredAt" timestamp(3) without time zone NOT NULL;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "counterparty" text;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "note" text;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "billName" text;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "billUrl" text;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "createdById" text;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "createdByName" text;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "Medication" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "name" text NOT NULL,
  "dosage" text,
  "frequency" text,
  "times" text[],
  "prescribedBy" text,
  "notes" text,
  "durationDays" integer,
  "startedAt" timestamp(3) without time zone,
  "endedAt" timestamp(3) without time zone,
  "active" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "name" text NOT NULL;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "dosage" text;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "frequency" text;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "times" text[];
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "prescribedBy" text;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "durationDays" integer;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "startedAt" timestamp(3) without time zone;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "endedAt" timestamp(3) without time zone;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "MedicationOrder" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "medicationId" text,
  "item" jsonb NOT NULL,
  "status" "MedicationOrderStatus" DEFAULT 'PENDING_PAYMENT'::"MedicationOrderStatus" NOT NULL,
  "contactName" text NOT NULL,
  "phone" text NOT NULL,
  "addressLine" text NOT NULL,
  "city" text NOT NULL,
  "pincode" text NOT NULL,
  "amount" integer NOT NULL,
  "provider" text,
  "providerOrderId" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "paidAt" timestamp(3) without time zone
);
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "medicationId" text;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "item" jsonb NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "status" "MedicationOrderStatus" DEFAULT 'PENDING_PAYMENT'::"MedicationOrderStatus" NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "contactName" text NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "phone" text NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "addressLine" text NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "city" text NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "pincode" text NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "amount" integer NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "provider" text;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "providerOrderId" text;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "MedicationOrder" ADD COLUMN IF NOT EXISTS "paidAt" timestamp(3) without time zone;

CREATE TABLE IF NOT EXISTS "MoodEntry" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "mood" integer NOT NULL,
  "energy" integer NOT NULL,
  "calm" integer,
  "sleep" integer,
  "note" text,
  "source" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "MoodEntry" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "MoodEntry" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "MoodEntry" ADD COLUMN IF NOT EXISTS "mood" integer NOT NULL;
ALTER TABLE "MoodEntry" ADD COLUMN IF NOT EXISTS "energy" integer NOT NULL;
ALTER TABLE "MoodEntry" ADD COLUMN IF NOT EXISTS "calm" integer;
ALTER TABLE "MoodEntry" ADD COLUMN IF NOT EXISTS "sleep" integer;
ALTER TABLE "MoodEntry" ADD COLUMN IF NOT EXISTS "note" text;
ALTER TABLE "MoodEntry" ADD COLUMN IF NOT EXISTS "source" text;
ALTER TABLE "MoodEntry" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "body" text,
  "href" text,
  "read" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "type" text NOT NULL;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "body" text;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "href" text;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "read" boolean DEFAULT false NOT NULL;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "PatientProfile" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "patientId" text NOT NULL,
  "coupleId" text,
  "careMode" "CareMode" DEFAULT 'INDIVIDUAL'::"CareMode" NOT NULL,
  "assignedTherapistId" text,
  "assignedTherapistIndividualId" text,
  "assignedTherapistCouplesId" text,
  "assignedTherapistPsychiatryId" text,
  "track" text[],
  "trackLabel" text,
  "subTrack" text,
  "diagnosis" text,
  "currentSituation" text,
  "therapyStatus" text,
  "dateOfBirth" timestamp(3) without time zone,
  "gender" text,
  "country" text DEFAULT 'IN'::text NOT NULL,
  "state" text,
  "addressLine1" text,
  "addressLine2" text,
  "city" text,
  "postalCode" text,
  "preferredLanguage" text,
  "occupation" text,
  "maritalStatus" text,
  "emergencyName" text,
  "emergencyPhone" text,
  "emergencyRelation" text,
  "dataRetentionConsent" boolean DEFAULT false NOT NULL,
  "llmDataSharingConsent" boolean DEFAULT false NOT NULL,
  "aiDisclaimerAck" boolean DEFAULT false NOT NULL,
  "liabilityAck" boolean DEFAULT false NOT NULL,
  "termsAcceptedAt" timestamp(3) without time zone,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "patientId" text NOT NULL;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "coupleId" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "careMode" "CareMode" DEFAULT 'INDIVIDUAL'::"CareMode" NOT NULL;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistId" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistIndividualId" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistCouplesId" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "assignedTherapistPsychiatryId" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "track" text[];
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "trackLabel" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "subTrack" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "diagnosis" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "currentSituation" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "therapyStatus" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "dateOfBirth" timestamp(3) without time zone;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "gender" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "country" text DEFAULT 'IN'::text NOT NULL;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "state" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "addressLine1" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "addressLine2" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "postalCode" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "preferredLanguage" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "occupation" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "maritalStatus" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyName" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyPhone" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyRelation" text;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "dataRetentionConsent" boolean DEFAULT false NOT NULL;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "llmDataSharingConsent" boolean DEFAULT false NOT NULL;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "aiDisclaimerAck" boolean DEFAULT false NOT NULL;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "liabilityAck" boolean DEFAULT false NOT NULL;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" timestamp(3) without time zone;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "subscriptionId" text,
  "amount" integer NOT NULL,
  "kind" text NOT NULL,
  "trackSlug" text,
  "planName" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "subscriptionId" text;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "amount" integer NOT NULL;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "kind" text NOT NULL;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "trackSlug" text;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "planName" text;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "PerspectiveSection" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "comingSoon" boolean DEFAULT true NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "PerspectiveSection" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "PerspectiveSection" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "PerspectiveSection" ADD COLUMN IF NOT EXISTS "slug" text NOT NULL;
ALTER TABLE "PerspectiveSection" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "PerspectiveSection" ADD COLUMN IF NOT EXISTS "sortOrder" integer DEFAULT 0 NOT NULL;
ALTER TABLE "PerspectiveSection" ADD COLUMN IF NOT EXISTS "comingSoon" boolean DEFAULT true NOT NULL;
ALTER TABLE "PerspectiveSection" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;
ALTER TABLE "PerspectiveSection" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "PerspectiveVideo" (
  "id" text NOT NULL,
  "sectionId" text NOT NULL,
  "title" text NOT NULL,
  "youtubeId" text NOT NULL,
  "description" text,
  "tags" text[],
  "status" text DEFAULT 'APPROVED'::text NOT NULL,
  "submittedById" text,
  "submittedByName" text,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "sectionId" text NOT NULL;
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "youtubeId" text NOT NULL;
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "tags" text[];
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'APPROVED'::text NOT NULL;
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "submittedById" text;
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "submittedByName" text;
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "sortOrder" integer DEFAULT 0 NOT NULL;
ALTER TABLE "PerspectiveVideo" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "Poll" (
  "id" text NOT NULL,
  "question" text NOT NULL,
  "options" text[],
  "expiresAt" timestamp(3) without time zone,
  "pinned" boolean DEFAULT false NOT NULL,
  "multiple" boolean DEFAULT false NOT NULL,
  "createdBy" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "question" text NOT NULL;
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "options" text[];
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "expiresAt" timestamp(3) without time zone;
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "pinned" boolean DEFAULT false NOT NULL;
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "multiple" boolean DEFAULT false NOT NULL;
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "createdBy" text;
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "PollVote" (
  "id" text NOT NULL,
  "pollId" text NOT NULL,
  "userId" text NOT NULL,
  "optionIndex" integer NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "PollVote" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "PollVote" ADD COLUMN IF NOT EXISTS "pollId" text NOT NULL;
ALTER TABLE "PollVote" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "PollVote" ADD COLUMN IF NOT EXISTS "optionIndex" integer NOT NULL;
ALTER TABLE "PollVote" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "PricingConfig" (
  "id" text DEFAULT 'default'::text NOT NULL,
  "firstSession" jsonb NOT NULL,
  "therapyPacks" jsonb NOT NULL,
  "psychiatryPacks" jsonb NOT NULL,
  "couplesPacks" jsonb NOT NULL,
  "calmPlusPacks" jsonb NOT NULL,
  "therapyBase" integer DEFAULT 1999 NOT NULL,
  "psychiatryBase" integer DEFAULT 1999 NOT NULL,
  "couplesBase" integer DEFAULT 3999 NOT NULL,
  "calmPlusBase" integer DEFAULT 499 NOT NULL,
  "updatedBy" text,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "id" text DEFAULT 'default'::text NOT NULL;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "firstSession" jsonb NOT NULL;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "therapyPacks" jsonb NOT NULL;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "psychiatryPacks" jsonb NOT NULL;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "couplesPacks" jsonb NOT NULL;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "calmPlusPacks" jsonb NOT NULL;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "therapyBase" integer DEFAULT 1999 NOT NULL;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "psychiatryBase" integer DEFAULT 1999 NOT NULL;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "couplesBase" integer DEFAULT 3999 NOT NULL;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "calmPlusBase" integer DEFAULT 499 NOT NULL;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "updatedBy" text;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "PrivacySettings" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "collectSessions" boolean DEFAULT true NOT NULL,
  "collectChats" boolean DEFAULT true NOT NULL,
  "collectMood" boolean DEFAULT true NOT NULL,
  "collectJournals" boolean DEFAULT true NOT NULL,
  "feedToLlm" boolean DEFAULT true NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "collectSessions" boolean DEFAULT true NOT NULL;
ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "collectChats" boolean DEFAULT true NOT NULL;
ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "collectMood" boolean DEFAULT true NOT NULL;
ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "collectJournals" boolean DEFAULT true NOT NULL;
ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "feedToLlm" boolean DEFAULT true NOT NULL;
ALTER TABLE "PrivacySettings" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "Referral" (
  "id" text NOT NULL,
  "referrerId" text NOT NULL,
  "refereeId" text NOT NULL,
  "status" text DEFAULT 'PENDING'::text NOT NULL,
  "qualifyingPaymentId" text,
  "referrerRewardKind" text,
  "referrerRewardValue" integer,
  "refereeDiscount" integer,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "qualifiedAt" timestamp(3) without time zone
);
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "referrerId" text NOT NULL;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "refereeId" text NOT NULL;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'PENDING'::text NOT NULL;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "qualifyingPaymentId" text;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "referrerRewardKind" text;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "referrerRewardValue" integer;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "refereeDiscount" integer;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "qualifiedAt" timestamp(3) without time zone;

CREATE TABLE IF NOT EXISTS "ReferralConfig" (
  "id" text DEFAULT 'default'::text NOT NULL,
  "enabled" boolean DEFAULT false NOT NULL,
  "referrerRewardKind" text DEFAULT 'WALLET_CREDIT'::text NOT NULL,
  "referrerRewardValue" integer DEFAULT 500 NOT NULL,
  "refereeDiscount" integer DEFAULT 500 NOT NULL,
  "clawback" boolean DEFAULT true NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "ReferralConfig" ADD COLUMN IF NOT EXISTS "id" text DEFAULT 'default'::text NOT NULL;
ALTER TABLE "ReferralConfig" ADD COLUMN IF NOT EXISTS "enabled" boolean DEFAULT false NOT NULL;
ALTER TABLE "ReferralConfig" ADD COLUMN IF NOT EXISTS "referrerRewardKind" text DEFAULT 'WALLET_CREDIT'::text NOT NULL;
ALTER TABLE "ReferralConfig" ADD COLUMN IF NOT EXISTS "referrerRewardValue" integer DEFAULT 500 NOT NULL;
ALTER TABLE "ReferralConfig" ADD COLUMN IF NOT EXISTS "refereeDiscount" integer DEFAULT 500 NOT NULL;
ALTER TABLE "ReferralConfig" ADD COLUMN IF NOT EXISTS "clawback" boolean DEFAULT true NOT NULL;
ALTER TABLE "ReferralConfig" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "RegistrationCounter" (
  "key" text NOT NULL,
  "value" integer DEFAULT 0 NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "RegistrationCounter" ADD COLUMN IF NOT EXISTS "key" text NOT NULL;
ALTER TABLE "RegistrationCounter" ADD COLUMN IF NOT EXISTS "value" integer DEFAULT 0 NOT NULL;
ALTER TABLE "RegistrationCounter" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "RelatedPerson" (
  "id" text NOT NULL,
  "profileId" text NOT NULL,
  "relation" "RelationType" NOT NULL,
  "name" text NOT NULL,
  "dateOfBirth" timestamp(3) without time zone,
  "gender" text,
  "phone" text,
  "email" text,
  "notes" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "RelatedPerson" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "RelatedPerson" ADD COLUMN IF NOT EXISTS "profileId" text NOT NULL;
ALTER TABLE "RelatedPerson" ADD COLUMN IF NOT EXISTS "relation" "RelationType" NOT NULL;
ALTER TABLE "RelatedPerson" ADD COLUMN IF NOT EXISTS "name" text NOT NULL;
ALTER TABLE "RelatedPerson" ADD COLUMN IF NOT EXISTS "dateOfBirth" timestamp(3) without time zone;
ALTER TABLE "RelatedPerson" ADD COLUMN IF NOT EXISTS "gender" text;
ALTER TABLE "RelatedPerson" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "RelatedPerson" ADD COLUMN IF NOT EXISTS "email" text;
ALTER TABLE "RelatedPerson" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "RelatedPerson" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "Session" (
  "id" text NOT NULL,
  "sessionToken" text NOT NULL,
  "userId" text NOT NULL,
  "expires" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "sessionToken" text NOT NULL;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "expires" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "SessionPresenceSpan" (
  "id" text NOT NULL,
  "appointmentId" text NOT NULL,
  "role" text NOT NULL,
  "userId" text NOT NULL,
  "joinedAt" timestamp(3) without time zone NOT NULL,
  "lastSeenAt" timestamp(3) without time zone NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "SessionPresenceSpan" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "SessionPresenceSpan" ADD COLUMN IF NOT EXISTS "appointmentId" text NOT NULL;
ALTER TABLE "SessionPresenceSpan" ADD COLUMN IF NOT EXISTS "role" text NOT NULL;
ALTER TABLE "SessionPresenceSpan" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "SessionPresenceSpan" ADD COLUMN IF NOT EXISTS "joinedAt" timestamp(3) without time zone NOT NULL;
ALTER TABLE "SessionPresenceSpan" ADD COLUMN IF NOT EXISTS "lastSeenAt" timestamp(3) without time zone NOT NULL;
ALTER TABLE "SessionPresenceSpan" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "SessionReview" (
  "id" text NOT NULL,
  "appointmentId" text NOT NULL,
  "patientId" text NOT NULL,
  "therapistId" text NOT NULL,
  "rating" integer NOT NULL,
  "comment" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "SessionReview" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "SessionReview" ADD COLUMN IF NOT EXISTS "appointmentId" text NOT NULL;
ALTER TABLE "SessionReview" ADD COLUMN IF NOT EXISTS "patientId" text NOT NULL;
ALTER TABLE "SessionReview" ADD COLUMN IF NOT EXISTS "therapistId" text NOT NULL;
ALTER TABLE "SessionReview" ADD COLUMN IF NOT EXISTS "rating" integer NOT NULL;
ALTER TABLE "SessionReview" ADD COLUMN IF NOT EXISTS "comment" text;
ALTER TABLE "SessionReview" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "SessionReview" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "category" "CareCategory" DEFAULT 'INDIVIDUAL'::"CareCategory" NOT NULL,
  "trackSlug" text NOT NULL,
  "therapistId" text,
  "planName" text NOT NULL,
  "tier" "PlanTier" DEFAULT 'STARTER'::"PlanTier" NOT NULL,
  "status" "SubscriptionStatus" DEFAULT 'ACTIVE'::"SubscriptionStatus" NOT NULL,
  "paidMonths" integer DEFAULT 0 NOT NULL,
  "sessionsTotal" integer DEFAULT 0 NOT NULL,
  "sessionsUsed" integer DEFAULT 0 NOT NULL,
  "minutesTotal" integer,
  "minutesUsed" integer,
  "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "renewsAt" timestamp(3) without time zone,
  "expiresAt" timestamp(3) without time zone,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "category" "CareCategory" DEFAULT 'INDIVIDUAL'::"CareCategory" NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "trackSlug" text NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "therapistId" text;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "planName" text NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "tier" "PlanTier" DEFAULT 'STARTER'::"PlanTier" NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "status" "SubscriptionStatus" DEFAULT 'ACTIVE'::"SubscriptionStatus" NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "paidMonths" integer DEFAULT 0 NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "sessionsTotal" integer DEFAULT 0 NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "sessionsUsed" integer DEFAULT 0 NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "minutesTotal" integer;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "minutesUsed" integer;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "renewsAt" timestamp(3) without time zone;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "expiresAt" timestamp(3) without time zone;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "SupervisionLink" (
  "id" text NOT NULL,
  "supervisorId" text NOT NULL,
  "superviseeId" text NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "SupervisionLink" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "SupervisionLink" ADD COLUMN IF NOT EXISTS "supervisorId" text NOT NULL;
ALTER TABLE "SupervisionLink" ADD COLUMN IF NOT EXISTS "superviseeId" text NOT NULL;
ALTER TABLE "SupervisionLink" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "SupervisionNote" (
  "id" text NOT NULL,
  "linkId" text NOT NULL,
  "authorId" text NOT NULL,
  "patientId" text,
  "content" text NOT NULL,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "SupervisionNote" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "SupervisionNote" ADD COLUMN IF NOT EXISTS "linkId" text NOT NULL;
ALTER TABLE "SupervisionNote" ADD COLUMN IF NOT EXISTS "authorId" text NOT NULL;
ALTER TABLE "SupervisionNote" ADD COLUMN IF NOT EXISTS "patientId" text;
ALTER TABLE "SupervisionNote" ADD COLUMN IF NOT EXISTS "content" text NOT NULL;
ALTER TABLE "SupervisionNote" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "Task" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "type" "TaskType" DEFAULT 'REFLECTION'::"TaskType" NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "resourceUrl" text,
  "assignedBy" text,
  "assignedById" text,
  "frequency" text,
  "timesOfDay" text[] DEFAULT ARRAY[]::text[],
  "dueDate" timestamp(3) without time zone,
  "completedAt" timestamp(3) without time zone,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "type" "TaskType" DEFAULT 'REFLECTION'::"TaskType" NOT NULL;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "resourceUrl" text;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "assignedBy" text;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "assignedById" text;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "frequency" text;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "timesOfDay" text[] DEFAULT ARRAY[]::text[];
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "dueDate" timestamp(3) without time zone;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "completedAt" timestamp(3) without time zone;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "TherapistApplication" (
  "id" text NOT NULL,
  "fullName" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "council" text NOT NULL,
  "registrationNo" text NOT NULL,
  "yearsExp" integer NOT NULL,
  "qualifications" text[],
  "specializations" text[],
  "languages" text[],
  "bio" text,
  "documentUrls" text[],
  "preferredInterviewAt" timestamp(3) without time zone,
  "status" "TherapistApplicationStatus" DEFAULT 'APPLIED'::"TherapistApplicationStatus" NOT NULL,
  "reviewerNotes" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "fullName" text NOT NULL;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "email" text NOT NULL;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "phone" text NOT NULL;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "council" text NOT NULL;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "registrationNo" text NOT NULL;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "yearsExp" integer NOT NULL;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "qualifications" text[];
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "specializations" text[];
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "languages" text[];
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "bio" text;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "documentUrls" text[];
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "preferredInterviewAt" timestamp(3) without time zone;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "status" "TherapistApplicationStatus" DEFAULT 'APPLIED'::"TherapistApplicationStatus" NOT NULL;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "reviewerNotes" text;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "TherapistApplication" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "TherapistAvailability" (
  "id" text NOT NULL,
  "therapistId" text NOT NULL,
  "dayOfWeek" integer NOT NULL,
  "hours" integer[],
  "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "TherapistAvailability" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "TherapistAvailability" ADD COLUMN IF NOT EXISTS "therapistId" text NOT NULL;
ALTER TABLE "TherapistAvailability" ADD COLUMN IF NOT EXISTS "dayOfWeek" integer NOT NULL;
ALTER TABLE "TherapistAvailability" ADD COLUMN IF NOT EXISTS "hours" integer[];
ALTER TABLE "TherapistAvailability" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "TherapistProfile" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "bio" text NOT NULL,
  "qualifications" text[],
  "yearsExp" integer NOT NULL,
  "languages" text[],
  "specializations" text[],
  "rciNumber" text NOT NULL,
  "sessionFee" integer NOT NULL,
  "gender" text,
  "clinicianType" text,
  "rating" double precision DEFAULT 0 NOT NULL,
  "totalReviews" integer DEFAULT 0 NOT NULL,
  "isVerified" boolean DEFAULT false NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "employmentType" "EmploymentType" DEFAULT 'FULL_TIME'::"EmploymentType" NOT NULL,
  "baseFeeIndividual" integer,
  "baseFeeCouples" integer,
  "baseFeePsychiatry" integer,
  "secondSessionBonus" integer,
  "thirdOnwardsBonus" integer,
  "miscBonus" integer,
  "nightSessionBonus" integer,
  "compensationFields" jsonb,
  "documentUrls" text[],
  "photoUrl" text,
  "dateOfBirth" timestamp(3) without time zone,
  "country" text DEFAULT 'IN'::text NOT NULL,
  "state" text,
  "city" text,
  "addressLine1" text,
  "addressLine2" text,
  "postalCode" text,
  "emergencyName" text,
  "emergencyPhone" text,
  "emergencyRelation" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "userId" text NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "bio" text NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "qualifications" text[];
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "yearsExp" integer NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "languages" text[];
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "specializations" text[];
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "rciNumber" text NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "sessionFee" integer NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "gender" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "clinicianType" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "rating" double precision DEFAULT 0 NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "totalReviews" integer DEFAULT 0 NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "isVerified" boolean DEFAULT false NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "employmentType" "EmploymentType" DEFAULT 'FULL_TIME'::"EmploymentType" NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "baseFeeIndividual" integer;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "baseFeeCouples" integer;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "baseFeePsychiatry" integer;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "secondSessionBonus" integer;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "thirdOnwardsBonus" integer;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "miscBonus" integer;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "nightSessionBonus" integer;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "compensationFields" jsonb;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "documentUrls" text[];
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "photoUrl" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "dateOfBirth" timestamp(3) without time zone;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "country" text DEFAULT 'IN'::text NOT NULL;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "state" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "addressLine1" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "addressLine2" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "postalCode" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "emergencyName" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "emergencyPhone" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "emergencyRelation" text;
ALTER TABLE "TherapistProfile" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS "User" (
  "id" text NOT NULL,
  "name" text,
  "email" text,
  "emailVerified" timestamp(3) without time zone,
  "phone" text,
  "image" text,
  "passwordHash" text,
  "adminType" text,
  "role" "Role" DEFAULT 'PATIENT'::"Role" NOT NULL,
  "mustChangePassword" boolean DEFAULT false NOT NULL,
  "registrationNo" text,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) without time zone NOT NULL,
  "referralCode" text,
  "referredById" text,
  "walletCreditRupees" integer DEFAULT 0 NOT NULL,
  "bonusSessions" integer DEFAULT 0 NOT NULL
);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "id" text NOT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" timestamp(3) without time zone;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "adminType" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "Role" DEFAULT 'PATIENT'::"Role" NOT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mustChangePassword" boolean DEFAULT false NOT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "registrationNo" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) without time zone NOT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredById" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "walletCreditRupees" integer DEFAULT 0 NOT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bonusSessions" integer DEFAULT 0 NOT NULL;

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp(3) without time zone NOT NULL
);
ALTER TABLE "VerificationToken" ADD COLUMN IF NOT EXISTS "identifier" text NOT NULL;
ALTER TABLE "VerificationToken" ADD COLUMN IF NOT EXISTS "token" text NOT NULL;
ALTER TABLE "VerificationToken" ADD COLUMN IF NOT EXISTS "expires" timestamp(3) without time zone NOT NULL;

CREATE TABLE IF NOT EXISTS "WebrtcSignal" (
  "seq" SERIAL,
  "roomId" text NOT NULL,
  "peerId" text NOT NULL,
  "kind" text NOT NULL,
  "data" jsonb,
  "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE SEQUENCE IF NOT EXISTS "WebrtcSignal_seq_seq";
ALTER TABLE "WebrtcSignal" ADD COLUMN IF NOT EXISTS "seq" INTEGER NOT NULL DEFAULT nextval('"WebrtcSignal_seq_seq"');
ALTER SEQUENCE "WebrtcSignal_seq_seq" OWNED BY "WebrtcSignal"."seq";
ALTER TABLE "WebrtcSignal" ADD COLUMN IF NOT EXISTS "roomId" text NOT NULL;
ALTER TABLE "WebrtcSignal" ADD COLUMN IF NOT EXISTS "peerId" text NOT NULL;
ALTER TABLE "WebrtcSignal" ADD COLUMN IF NOT EXISTS "kind" text NOT NULL;
ALTER TABLE "WebrtcSignal" ADD COLUMN IF NOT EXISTS "data" jsonb;
ALTER TABLE "WebrtcSignal" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- ── Primary keys and unique constraints ──────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE "Account" ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "AiProfile" ADD CONSTRAINT "AiProfile_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CalmAiMessage" ADD CONSTRAINT "CalmAiMessage_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ClinicalContext" ADD CONSTRAINT "ClinicalContext_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CommunityUpvote" ADD CONSTRAINT "CommunityUpvote_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CrisisAlert" ADD CONSTRAINT "CrisisAlert_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "EarningsConfig" ADD CONSTRAINT "EarningsConfig_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "EnterpriseLead" ADD CONSTRAINT "EnterpriseLead_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "FormAssignment" ADD CONSTRAINT "FormAssignment_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "FormAutoRule" ADD CONSTRAINT "FormAutoRule_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "GuidedAssignment" ADD CONSTRAINT "GuidedAssignment_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "GuidedTrack" ADD CONSTRAINT "GuidedTrack_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "GuidedVideo" ADD CONSTRAINT "GuidedVideo_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "MedicationOrder" ADD CONSTRAINT "MedicationOrder_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Medication" ADD CONSTRAINT "Medication_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PerspectiveSection" ADD CONSTRAINT "PerspectiveSection_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PerspectiveVideo" ADD CONSTRAINT "PerspectiveVideo_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Poll" ADD CONSTRAINT "Poll_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PricingConfig" ADD CONSTRAINT "PricingConfig_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PrivacySettings" ADD CONSTRAINT "PrivacySettings_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ReferralConfig" ADD CONSTRAINT "ReferralConfig_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Referral" ADD CONSTRAINT "Referral_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "RegistrationCounter" ADD CONSTRAINT "RegistrationCounter_pkey" PRIMARY KEY (key);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "RelatedPerson" ADD CONSTRAINT "RelatedPerson_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SessionPresenceSpan" ADD CONSTRAINT "SessionPresenceSpan_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Session" ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SupervisionLink" ADD CONSTRAINT "SupervisionLink_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SupervisionNote" ADD CONSTRAINT "SupervisionNote_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Task" ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "TherapistApplication" ADD CONSTRAINT "TherapistApplication_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "TherapistAvailability" ADD CONSTRAINT "TherapistAvailability_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "TherapistProfile" ADD CONSTRAINT "TherapistProfile_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "WebrtcSignal" ADD CONSTRAINT "WebrtcSignal_pkey" PRIMARY KEY (seq);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account" (provider, "providerAccountId");
CREATE INDEX IF NOT EXISTS "AiInsight_userId_kind_idx" ON "AiInsight" ("userId", kind);
CREATE UNIQUE INDEX IF NOT EXISTS "AiProfile_userId_key" ON "AiProfile" ("userId");
CREATE INDEX IF NOT EXISTS "Appointment_patientId_idx" ON "Appointment" ("patientId");
CREATE INDEX IF NOT EXISTS "Appointment_patientId_status_scheduledAt_idx" ON "Appointment" ("patientId", status, "scheduledAt");
CREATE INDEX IF NOT EXISTS "Appointment_therapistId_status_scheduledAt_idx" ON "Appointment" ("therapistId", status, "scheduledAt");
CREATE INDEX IF NOT EXISTS "AssessmentScore_userId_recordedAt_idx" ON "AssessmentScore" ("userId", "recordedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "AvailabilityException_therapistId_date_key" ON "AvailabilityException" ("therapistId", date);
CREATE INDEX IF NOT EXISTS "BlogPost_publishedAt_idx" ON "BlogPost" ("publishedAt");
CREATE INDEX IF NOT EXISTS "BlogPost_reviewStatus_idx" ON "BlogPost" ("reviewStatus");
CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx" ON "BlogPost" (slug);
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost" (slug);
CREATE INDEX IF NOT EXISTS "CalmAiMessage_userId_createdAt_idx" ON "CalmAiMessage" ("userId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "ClinicalContext_userId_key" ON "ClinicalContext" ("userId");
CREATE INDEX IF NOT EXISTS "CommunityComment_postId_idx" ON "CommunityComment" ("postId");
CREATE INDEX IF NOT EXISTS "CommunityPost_createdAt_idx" ON "CommunityPost" ("createdAt");
CREATE INDEX IF NOT EXISTS "CommunityUpvote_commentId_idx" ON "CommunityUpvote" ("commentId");
CREATE INDEX IF NOT EXISTS "CommunityUpvote_postId_idx" ON "CommunityUpvote" ("postId");
CREATE UNIQUE INDEX IF NOT EXISTS "CommunityUpvote_userId_commentId_key" ON "CommunityUpvote" ("userId", "commentId");
CREATE UNIQUE INDEX IF NOT EXISTS "CommunityUpvote_userId_postId_key" ON "CommunityUpvote" ("userId", "postId");
CREATE INDEX IF NOT EXISTS "ContactMessage_handled_createdAt_idx" ON "ContactMessage" (handled, "createdAt");
CREATE INDEX IF NOT EXISTS "CrisisAlert_userId_createdAt_idx" ON "CrisisAlert" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "EnterpriseLead_handled_createdAt_idx" ON "EnterpriseLead" (handled, "createdAt");
CREATE INDEX IF NOT EXISTS "FormAssignment_patientId_status_idx" ON "FormAssignment" ("patientId", status);
CREATE INDEX IF NOT EXISTS "FormAutoRule_active_idx" ON "FormAutoRule" (active);
CREATE INDEX IF NOT EXISTS "FormAutoRule_therapistId_idx" ON "FormAutoRule" ("therapistId");
CREATE INDEX IF NOT EXISTS "FormTemplate_createdById_idx" ON "FormTemplate" ("createdById");
CREATE INDEX IF NOT EXISTS "FormTemplate_kind_idx" ON "FormTemplate" (kind);
CREATE UNIQUE INDEX IF NOT EXISTS "FormTemplate_slug_key" ON "FormTemplate" (slug);
CREATE INDEX IF NOT EXISTS "GuidedAssignment_patientId_idx" ON "GuidedAssignment" ("patientId");
CREATE INDEX IF NOT EXISTS "GuidedAssignment_trackId_idx" ON "GuidedAssignment" ("trackId");
CREATE UNIQUE INDEX IF NOT EXISTS "GuidedTrack_slug_key" ON "GuidedTrack" (slug);
CREATE INDEX IF NOT EXISTS "GuidedTrack_sortOrder_idx" ON "GuidedTrack" ("sortOrder");
CREATE INDEX IF NOT EXISTS "GuidedVideo_trackId_idx" ON "GuidedVideo" ("trackId");
CREATE INDEX IF NOT EXISTS "JournalEntry_userId_createdAt_idx" ON "JournalEntry" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "LedgerEntry_direction_idx" ON "LedgerEntry" (direction);
CREATE INDEX IF NOT EXISTS "LedgerEntry_occurredAt_idx" ON "LedgerEntry" ("occurredAt");
CREATE INDEX IF NOT EXISTS "MedicationOrder_userId_status_idx" ON "MedicationOrder" ("userId", status);
CREATE INDEX IF NOT EXISTS "Medication_userId_idx" ON "Medication" ("userId");
CREATE INDEX IF NOT EXISTS "MoodEntry_userId_createdAt_idx" ON "MoodEntry" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification" ("userId", read);
CREATE INDEX IF NOT EXISTS "PatientProfile_coupleId_idx" ON "PatientProfile" ("coupleId");
CREATE UNIQUE INDEX IF NOT EXISTS "PatientProfile_patientId_key" ON "PatientProfile" ("patientId");
CREATE UNIQUE INDEX IF NOT EXISTS "PatientProfile_userId_key" ON "PatientProfile" ("userId");
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "Payment" ("createdAt");
CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment" ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "PerspectiveSection_slug_key" ON "PerspectiveSection" (slug);
CREATE INDEX IF NOT EXISTS "PerspectiveSection_sortOrder_idx" ON "PerspectiveSection" ("sortOrder");
CREATE INDEX IF NOT EXISTS "PerspectiveVideo_sectionId_idx" ON "PerspectiveVideo" ("sectionId");
CREATE INDEX IF NOT EXISTS "PerspectiveVideo_status_idx" ON "PerspectiveVideo" (status);
CREATE INDEX IF NOT EXISTS "PollVote_pollId_idx" ON "PollVote" ("pollId");
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_userId_optionIndex_key" ON "PollVote" ("pollId", "userId", "optionIndex");
CREATE INDEX IF NOT EXISTS "Poll_createdAt_idx" ON "Poll" ("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "PrivacySettings_userId_key" ON "PrivacySettings" ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Referral_refereeId_key" ON "Referral" ("refereeId");
CREATE INDEX IF NOT EXISTS "Referral_referrerId_idx" ON "Referral" ("referrerId");
CREATE INDEX IF NOT EXISTS "Referral_status_idx" ON "Referral" (status);
CREATE INDEX IF NOT EXISTS "RelatedPerson_profileId_idx" ON "RelatedPerson" ("profileId");
CREATE INDEX IF NOT EXISTS "SessionPresenceSpan_appointmentId_idx" ON "SessionPresenceSpan" ("appointmentId");
CREATE INDEX IF NOT EXISTS "SessionPresenceSpan_appointmentId_role_idx" ON "SessionPresenceSpan" ("appointmentId", role);
CREATE UNIQUE INDEX IF NOT EXISTS "SessionReview_appointmentId_key" ON "SessionReview" ("appointmentId");
CREATE INDEX IF NOT EXISTS "SessionReview_therapistId_idx" ON "SessionReview" ("therapistId");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session" ("sessionToken");
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription" ("userId");
CREATE INDEX IF NOT EXISTS "Subscription_userId_status_idx" ON "Subscription" ("userId", status);
CREATE UNIQUE INDEX IF NOT EXISTS "SupervisionLink_supervisorId_superviseeId_key" ON "SupervisionLink" ("supervisorId", "superviseeId");
CREATE INDEX IF NOT EXISTS "SupervisionNote_linkId_createdAt_idx" ON "SupervisionNote" ("linkId", "createdAt");
CREATE INDEX IF NOT EXISTS "Task_userId_idx" ON "Task" ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "TherapistAvailability_therapistId_dayOfWeek_key" ON "TherapistAvailability" ("therapistId", "dayOfWeek");
CREATE UNIQUE INDEX IF NOT EXISTS "TherapistProfile_rciNumber_key" ON "TherapistProfile" ("rciNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "TherapistProfile_userId_key" ON "TherapistProfile" ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" (email);
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User" (phone);
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User" ("referralCode");
CREATE UNIQUE INDEX IF NOT EXISTS "User_registrationNo_key" ON "User" ("registrationNo");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken" (identifier, token);
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken" (token);
CREATE INDEX IF NOT EXISTS "WebrtcSignal_createdAt_idx" ON "WebrtcSignal" ("createdAt");
CREATE INDEX IF NOT EXISTS "WebrtcSignal_roomId_seq_idx" ON "WebrtcSignal" ("roomId", seq);

-- ── Foreign keys ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "AiProfile" ADD CONSTRAINT "AiProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CalmAiMessage" ADD CONSTRAINT "CalmAiMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ClinicalContext" ADD CONSTRAINT "ClinicalContext_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CommunityUpvote" ADD CONSTRAINT "CommunityUpvote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "CommunityComment"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CommunityUpvote" ADD CONSTRAINT "CommunityUpvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CommunityUpvote" ADD CONSTRAINT "CommunityUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CrisisAlert" ADD CONSTRAINT "CrisisAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "FormAssignment" ADD CONSTRAINT "FormAssignment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "FormAssignment" ADD CONSTRAINT "FormAssignment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "FormAutoRule" ADD CONSTRAINT "FormAutoRule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "MedicationOrder" ADD CONSTRAINT "MedicationOrder_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "MedicationOrder" ADD CONSTRAINT "MedicationOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Medication" ADD CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PrivacySettings" ADD CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "RelatedPerson" ADD CONSTRAINT "RelatedPerson_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PatientProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SupervisionLink" ADD CONSTRAINT "SupervisionLink_superviseeId_fkey" FOREIGN KEY ("superviseeId") REFERENCES "TherapistProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SupervisionLink" ADD CONSTRAINT "SupervisionLink_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "TherapistProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SupervisionNote" ADD CONSTRAINT "SupervisionNote_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "SupervisionLink"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "TherapistAvailability" ADD CONSTRAINT "TherapistAvailability_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "TherapistProfile" ADD CONSTRAINT "TherapistProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
