-- AlterTable: capture check-ins at mood/energy/calm grain; make sleep optional.
ALTER TABLE "MoodEntry" ADD COLUMN "calm" INTEGER,
ADD COLUMN "source" TEXT,
ALTER COLUMN "sleep" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "MoodEntry_userId_createdAt_idx" ON "MoodEntry"("userId", "createdAt");

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN "title" TEXT;

-- CreateIndex
CREATE INDEX "JournalEntry_userId_createdAt_idx" ON "JournalEntry"("userId", "createdAt");
