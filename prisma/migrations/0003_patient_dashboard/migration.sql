-- CreateEnum
CREATE TYPE "CareCategory" AS ENUM ('INDIVIDUAL', 'COUPLE', 'KIDS');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('STARTER', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('EXERCISE', 'VIDEO', 'READING', 'REFLECTION', 'BREATHING');

-- CreateEnum
CREATE TYPE "InsightKind" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "roomId" TEXT,
ADD COLUMN "preSessionNote" TEXT,
ADD COLUMN "summary" TEXT;

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "CareCategory" NOT NULL DEFAULT 'INDIVIDUAL',
    "trackSlug" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL DEFAULT 'STARTER',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "paidMonths" INTEGER NOT NULL DEFAULT 0,
    "sessionsTotal" INTEGER NOT NULL DEFAULT 0,
    "sessionsUsed" INTEGER NOT NULL DEFAULT 0,
    "minutesTotal" INTEGER,
    "minutesUsed" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TaskType" NOT NULL DEFAULT 'REFLECTION',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceUrl" TEXT,
    "assignedBy" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "times" TEXT[],
    "prescribedBy" TEXT,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Medication_userId_idx" ON "Medication"("userId");

-- CreateTable
CREATE TABLE "PrivacySettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectSessions" BOOLEAN NOT NULL DEFAULT true,
    "collectChats" BOOLEAN NOT NULL DEFAULT true,
    "collectMood" BOOLEAN NOT NULL DEFAULT true,
    "collectJournals" BOOLEAN NOT NULL DEFAULT true,
    "feedToLlm" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrivacySettings_userId_key" ON "PrivacySettings"("userId");

-- CreateTable
CREATE TABLE "AiProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "summary" TEXT,
    "signals" JSONB,
    "lastBuiltAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiProfile_userId_key" ON "AiProfile"("userId");

-- CreateTable
CREATE TABLE "AiInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "InsightKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "forDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiInsight_userId_kind_idx" ON "AiInsight"("userId", "kind");

-- CreateTable
CREATE TABLE "CalmAiMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalmAiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalmAiMessage_userId_createdAt_idx" ON "CalmAiMessage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivacySettings" ADD CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProfile" ADD CONSTRAINT "AiProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalmAiMessage" ADD CONSTRAINT "CalmAiMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
