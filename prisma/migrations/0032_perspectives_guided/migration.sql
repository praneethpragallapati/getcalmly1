-- Perspectives (Calm Club)
CREATE TABLE IF NOT EXISTS "PerspectiveSection" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "comingSoon" BOOLEAN NOT NULL DEFAULT true,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PerspectiveSection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PerspectiveSection_slug_key" ON "PerspectiveSection"("slug");
CREATE INDEX IF NOT EXISTS "PerspectiveSection_sortOrder_idx" ON "PerspectiveSection"("sortOrder");

CREATE TABLE IF NOT EXISTS "PerspectiveVideo" (
  "id" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "youtubeId" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "submittedById" TEXT,
  "submittedByName" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PerspectiveVideo_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PerspectiveVideo_sectionId_idx" ON "PerspectiveVideo"("sectionId");
CREATE INDEX IF NOT EXISTS "PerspectiveVideo_status_idx" ON "PerspectiveVideo"("status");

-- Guided calm (Care)
CREATE TABLE IF NOT EXISTS "GuidedTrack" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "comingSoon" BOOLEAN NOT NULL DEFAULT true,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GuidedTrack_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GuidedTrack_slug_key" ON "GuidedTrack"("slug");
CREATE INDEX IF NOT EXISTS "GuidedTrack_sortOrder_idx" ON "GuidedTrack"("sortOrder");

CREATE TABLE IF NOT EXISTS "GuidedVideo" (
  "id" TEXT NOT NULL,
  "trackId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "youtubeId" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GuidedVideo_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GuidedVideo_trackId_idx" ON "GuidedVideo"("trackId");

CREATE TABLE IF NOT EXISTS "GuidedAssignment" (
  "id" TEXT NOT NULL,
  "trackId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "assignedById" TEXT,
  "validUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GuidedAssignment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GuidedAssignment_patientId_idx" ON "GuidedAssignment"("patientId");
CREATE INDEX IF NOT EXISTS "GuidedAssignment_trackId_idx" ON "GuidedAssignment"("trackId");
