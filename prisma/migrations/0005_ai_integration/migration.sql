-- AlterTable: clinical + display context the AI pipeline reads on PatientProfile.
ALTER TABLE "PatientProfile"
  ADD COLUMN "trackLabel" TEXT,
  ADD COLUMN "subTrack" TEXT,
  ADD COLUMN "diagnosis" TEXT,
  ADD COLUMN "currentSituation" TEXT,
  ADD COLUMN "therapyStatus" TEXT;

-- AlterTable: denormalise classifier metadata onto each Calm AI message.
ALTER TABLE "CalmAiMessage"
  ADD COLUMN "label" TEXT,
  ADD COLUMN "intent" TEXT,
  ADD COLUMN "intensity" TEXT,
  ADD COLUMN "highStake" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "model" TEXT;

-- AlterTable: generation metadata (suggSource, dataSufficient, model, cost, patterns).
ALTER TABLE "AiInsight" ADD COLUMN "meta" JSONB;

-- CreateTable: expert-authored clinical context (1:1 with user).
CREATE TABLE "ClinicalContext" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "scale" TEXT,
  "trend" TEXT,
  "whatHasHelped" TEXT[],
  "whatHasNotHelped" TEXT[],
  "recurringTriggers" TEXT[],
  "passiveSiHistory" BOOLEAN NOT NULL DEFAULT false,
  "sleepDisturbance" BOOLEAN NOT NULL DEFAULT false,
  "safetyPlanActive" BOOLEAN NOT NULL DEFAULT false,
  "safetyPlanContact" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicalContext_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClinicalContext_userId_key" ON "ClinicalContext"("userId");

-- CreateTable: clinical scale score time series.
CREATE TABLE "AssessmentScore" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "scale" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "label" TEXT,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssessmentScore_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AssessmentScore_userId_recordedAt_idx" ON "AssessmentScore"("userId", "recordedAt");

-- CreateTable: crisis hand-off record for the care team.
CREATE TABLE "CrisisAlert" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "patientName" TEXT,
  "therapistName" TEXT,
  "therapistEmail" TEXT,
  "label" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "handoffNote" TEXT NOT NULL,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CrisisAlert_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CrisisAlert_userId_createdAt_idx" ON "CrisisAlert"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ClinicalContext" ADD CONSTRAINT "ClinicalContext_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrisisAlert" ADD CONSTRAINT "CrisisAlert_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
