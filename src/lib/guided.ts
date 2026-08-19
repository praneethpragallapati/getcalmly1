import { prisma } from '@/lib/prisma'
import { parseYouTubeId, youTubeThumb, youTubeEmbed, youTubeWatch } from '@/lib/youtube'

/**
 * "Guided calm" — admin-authored guided video tracks under Care. A track is
 * either public (everyone) or assigned to a patient by an expert with an optional
 * validity, mirroring how tasks are assigned. Self-healing + fail-soft.
 */
export type GuidedVideoView = {
  id: string
  title: string
  youtubeId: string
  thumb: string
  embed: string
  watch: string
  description: string | null
}
export type GuidedTrackView = {
  id: string
  title: string
  slug: string
  description: string | null
  isPublic: boolean
  comingSoon: boolean
  active: boolean
  videos: GuidedVideoView[]
  // Per-patient assignment context (only on patient reads)
  assigned?: boolean
  validUntil?: string | null
}

let guidedSchemaReady = false
export async function ensureGuidedSchema(): Promise<void> {
  if (guidedSchemaReady) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "GuidedTrack" (
      "id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0, "isPublic" BOOLEAN NOT NULL DEFAULT false,
      "comingSoon" BOOLEAN NOT NULL DEFAULT true, "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "GuidedTrack_pkey" PRIMARY KEY ("id"))`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "GuidedTrack_slug_key" ON "GuidedTrack"("slug")`)
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "GuidedVideo" (
      "id" TEXT NOT NULL, "trackId" TEXT NOT NULL, "title" TEXT NOT NULL, "youtubeId" TEXT NOT NULL,
      "description" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "GuidedVideo_pkey" PRIMARY KEY ("id"))`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GuidedVideo_trackId_idx" ON "GuidedVideo"("trackId")`)
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "GuidedAssignment" (
      "id" TEXT NOT NULL, "trackId" TEXT NOT NULL, "patientId" TEXT NOT NULL, "assignedById" TEXT,
      "validUntil" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "GuidedAssignment_pkey" PRIMARY KEY ("id"))`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GuidedAssignment_patientId_idx" ON "GuidedAssignment"("patientId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GuidedAssignment_trackId_idx" ON "GuidedAssignment"("trackId")`)
    guidedSchemaReady = true
  } catch {
    // reads fall back to empty
  }
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'track'

const toVideoView = (v: { id: string; title: string; youtubeId: string; description: string | null }): GuidedVideoView => ({
  id: v.id, title: v.title, youtubeId: v.youtubeId, thumb: youTubeThumb(v.youtubeId), embed: youTubeEmbed(v.youtubeId), watch: youTubeWatch(v.youtubeId), description: v.description,
})

async function videosByTrack(trackIds: string[]): Promise<Map<string, GuidedVideoView[]>> {
  const map = new Map<string, GuidedVideoView[]>()
  if (trackIds.length === 0) return map
  const vids = await prisma.guidedVideo.findMany({ where: { trackId: { in: trackIds } }, orderBy: { sortOrder: 'asc' } })
  for (const v of vids) {
    const arr = map.get(v.trackId) ?? []
    arr.push(toVideoView(v))
    map.set(v.trackId, arr)
  }
  return map
}

/** Tracks a patient may see: public ones + those assigned to them and still valid. */
export async function getGuidedTracksForPatient(userId: string | null): Promise<GuidedTrackView[]> {
  await ensureGuidedSchema()
  try {
    const now = new Date()
    const assignments = userId
      ? await prisma.guidedAssignment.findMany({ where: { patientId: userId, OR: [{ validUntil: null }, { validUntil: { gt: now } }] }, select: { trackId: true, validUntil: true } })
      : []
    const assignedIds = new Set(assignments.map((a) => a.trackId))
    const validUntilOf = new Map(assignments.map((a) => [a.trackId, a.validUntil]))
    const tracks = await prisma.guidedTrack.findMany({
      where: { active: true, OR: [{ isPublic: true }, { id: { in: Array.from(assignedIds) } }] },
      orderBy: { sortOrder: 'asc' },
    })
    const vmap = await videosByTrack(tracks.map((t) => t.id))
    return tracks.map((t) => ({
      id: t.id, title: t.title, slug: t.slug, description: t.description, isPublic: t.isPublic, comingSoon: t.comingSoon, active: t.active,
      videos: vmap.get(t.id) ?? [],
      assigned: assignedIds.has(t.id),
      validUntil: validUntilOf.get(t.id)?.toISOString() ?? null,
    }))
  } catch {
    return []
  }
}

/** Admin view: every track with all videos. */
export async function getGuidedTracksAdmin(): Promise<GuidedTrackView[]> {
  await ensureGuidedSchema()
  try {
    const tracks = await prisma.guidedTrack.findMany({ orderBy: { sortOrder: 'asc' } })
    const vmap = await videosByTrack(tracks.map((t) => t.id))
    return tracks.map((t) => ({
      id: t.id, title: t.title, slug: t.slug, description: t.description, isPublic: t.isPublic, comingSoon: t.comingSoon, active: t.active,
      videos: vmap.get(t.id) ?? [],
    }))
  } catch {
    return []
  }
}

/** Lightweight track list for the expert's assign picker. */
export async function getGuidedTrackOptions(): Promise<{ id: string; title: string }[]> {
  await ensureGuidedSchema()
  try {
    const tracks = await prisma.guidedTrack.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' }, select: { id: true, title: true } })
    return tracks
  } catch {
    return []
  }
}

/** A patient's current guided-track assignments (for the expert patient page). */
export async function getGuidedAssignmentsFor(patientId: string): Promise<{ id: string; trackId: string; trackTitle: string; validUntil: string | null }[]> {
  await ensureGuidedSchema()
  try {
    const rows = await prisma.guidedAssignment.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } })
    if (rows.length === 0) return []
    const tracks = await prisma.guidedTrack.findMany({ where: { id: { in: rows.map((r) => r.trackId) } }, select: { id: true, title: true } })
    const titleOf = new Map(tracks.map((t) => [t.id, t.title]))
    return rows.map((r) => ({ id: r.id, trackId: r.trackId, trackTitle: titleOf.get(r.trackId) ?? 'Track', validUntil: r.validUntil?.toISOString() ?? null }))
  } catch {
    return []
  }
}

// ── Mutations. Admin CRUD + expert assignment. Callers gate on role. ──────────

export async function createGuidedTrack(input: { title: string; description?: string | null; isPublic?: boolean }): Promise<{ ok: boolean; error?: string }> {
  await ensureGuidedSchema()
  const title = input.title.trim()
  if (!title) return { ok: false, error: 'Enter a track title.' }
  try {
    const max = await prisma.guidedTrack.aggregate({ _max: { sortOrder: true } })
    let slug = slugify(title)
    if (await prisma.guidedTrack.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`
    await prisma.guidedTrack.create({ data: { title, slug, description: input.description?.trim() || null, isPublic: input.isPublic ?? false, sortOrder: (max._max.sortOrder ?? 0) + 1 } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not create the track.' }
  }
}

export async function updateGuidedTrack(id: string, patch: { title?: string; description?: string | null; isPublic?: boolean; comingSoon?: boolean; active?: boolean }): Promise<{ ok: boolean; error?: string }> {
  await ensureGuidedSchema()
  try {
    const data: Record<string, unknown> = {}
    if (patch.title !== undefined) { const t = patch.title.trim(); if (!t) return { ok: false, error: 'Title cannot be empty.' }; data.title = t }
    if (patch.description !== undefined) data.description = patch.description?.trim() || null
    if (patch.isPublic !== undefined) data.isPublic = patch.isPublic
    if (patch.comingSoon !== undefined) data.comingSoon = patch.comingSoon
    if (patch.active !== undefined) data.active = patch.active
    await prisma.guidedTrack.update({ where: { id }, data })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the track.' }
  }
}

export async function deleteGuidedTrack(id: string): Promise<{ ok: boolean; error?: string }> {
  await ensureGuidedSchema()
  try {
    await prisma.guidedVideo.deleteMany({ where: { trackId: id } })
    await prisma.guidedAssignment.deleteMany({ where: { trackId: id } })
    await prisma.guidedTrack.delete({ where: { id } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not delete the track.' }
  }
}

export async function addGuidedVideo(input: { trackId: string; title: string; url: string; description?: string | null }): Promise<{ ok: boolean; error?: string }> {
  await ensureGuidedSchema()
  const title = input.title.trim()
  const youtubeId = parseYouTubeId(input.url)
  if (!title) return { ok: false, error: 'Enter a video title.' }
  if (!youtubeId) return { ok: false, error: 'Enter a valid YouTube link or video id.' }
  try {
    const max = await prisma.guidedVideo.aggregate({ where: { trackId: input.trackId }, _max: { sortOrder: true } })
    await prisma.guidedVideo.create({ data: { trackId: input.trackId, title, youtubeId, description: input.description?.trim() || null, sortOrder: (max._max.sortOrder ?? 0) + 1 } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not add the video.' }
  }
}

export async function deleteGuidedVideo(id: string): Promise<{ ok: boolean; error?: string }> {
  await ensureGuidedSchema()
  try {
    await prisma.guidedVideo.delete({ where: { id } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not delete the video.' }
  }
}

/** Expert assigns a track to a patient with an optional validity (ISO date). */
export async function assignGuidedTrack(input: { trackId: string; patientId: string; assignedById?: string | null; validUntil?: string | null }): Promise<{ ok: boolean; error?: string }> {
  await ensureGuidedSchema()
  try {
    let validUntil: Date | null = null
    if (input.validUntil) {
      const d = new Date(input.validUntil)
      if (!Number.isNaN(d.getTime())) validUntil = d
    }
    // Replace any existing assignment of the same track to the same patient.
    await prisma.guidedAssignment.deleteMany({ where: { trackId: input.trackId, patientId: input.patientId } })
    await prisma.guidedAssignment.create({ data: { trackId: input.trackId, patientId: input.patientId, assignedById: input.assignedById ?? null, validUntil } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not assign the track.' }
  }
}

export async function unassignGuidedTrack(assignmentId: string): Promise<{ ok: boolean; error?: string }> {
  await ensureGuidedSchema()
  try {
    await prisma.guidedAssignment.delete({ where: { id: assignmentId } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not remove the assignment.' }
  }
}
