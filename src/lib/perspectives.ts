import { prisma } from '@/lib/prisma'
import { parseYouTubeId, youTubeThumb, youTubeEmbed, youTubeWatch } from '@/lib/youtube'

/**
 * "Perspectives" — curated YouTube talks grouped into sections, shown in Calm
 * Club and on the public site. Admins manage sections and videos; therapists can
 * submit a video that an admin approves. Everything is self-healing and
 * fail-soft: an un-migrated DB simply shows the default sections with no videos.
 */
export type PerspectiveVideoView = {
  id: string
  title: string
  youtubeId: string
  thumb: string
  embed: string
  watch: string
  description: string | null
  status: string
  submittedByName: string | null
  createdAt: string
}
export type PerspectiveSectionView = {
  id: string
  title: string
  slug: string
  description: string | null
  comingSoon: boolean
  active: boolean
  videos: PerspectiveVideoView[]
}

const DEFAULT_SECTIONS: { title: string; description: string }[] = [
  { title: "Founder's Voice", description: 'Candid notes from the people building getCalmly.' },
  { title: 'Ask your expert', description: 'Clinicians answer the questions members ask most.' },
  { title: 'Real stories', description: 'Members and clinicians on what recovery actually looks like.' },
  { title: 'Mind matters', description: 'Short, science-backed explainers on how the mind works.' },
  { title: 'Inside getCalmly', description: 'A look behind the scenes at how we care for you.' },
]

let perspectiveSchemaReady = false
export async function ensurePerspectiveSchema(): Promise<void> {
  if (perspectiveSchemaReady) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "PerspectiveSection" (
      "id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0, "comingSoon" BOOLEAN NOT NULL DEFAULT true,
      "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PerspectiveSection_pkey" PRIMARY KEY ("id"))`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "PerspectiveSection_slug_key" ON "PerspectiveSection"("slug")`)
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "PerspectiveVideo" (
      "id" TEXT NOT NULL, "sectionId" TEXT NOT NULL, "title" TEXT NOT NULL, "youtubeId" TEXT NOT NULL,
      "description" TEXT, "status" TEXT NOT NULL DEFAULT 'APPROVED', "submittedById" TEXT, "submittedByName" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PerspectiveVideo_pkey" PRIMARY KEY ("id"))`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PerspectiveVideo_sectionId_idx" ON "PerspectiveVideo"("sectionId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PerspectiveVideo_status_idx" ON "PerspectiveVideo"("status")`)
    perspectiveSchemaReady = true
  } catch {
    // reads fall back to defaults
  }
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section'

/** Insert the five default sections the first time (idempotent by slug). */
export async function seedPerspectiveDefaults(): Promise<void> {
  await ensurePerspectiveSchema()
  try {
    const count = await prisma.perspectiveSection.count()
    if (count > 0) return
    let i = 0
    for (const s of DEFAULT_SECTIONS) {
      await prisma.perspectiveSection.create({
        data: { title: s.title, slug: slugify(s.title), description: s.description, sortOrder: i++, comingSoon: true, active: true },
      }).catch(() => null)
    }
  } catch {
    // ignore
  }
}

const toVideoView = (v: { id: string; title: string; youtubeId: string; description: string | null; status: string; submittedByName: string | null; createdAt: Date }): PerspectiveVideoView => ({
  id: v.id, title: v.title, youtubeId: v.youtubeId, thumb: youTubeThumb(v.youtubeId), embed: youTubeEmbed(v.youtubeId), watch: youTubeWatch(v.youtubeId),
  description: v.description, status: v.status, submittedByName: v.submittedByName,
  createdAt: v.createdAt.toISOString(),
})

/** Public view: active sections, approved videos only. Seeds defaults on first read. */
export async function getPerspectivesPublic(): Promise<PerspectiveSectionView[]> {
  await seedPerspectiveDefaults()
  try {
    const sections = await prisma.perspectiveSection.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } })
    const vids = await prisma.perspectiveVideo.findMany({ where: { status: 'APPROVED', sectionId: { in: sections.map((s) => s.id) } }, orderBy: { sortOrder: 'asc' } })
    return sections.map((s) => ({
      id: s.id, title: s.title, slug: s.slug, description: s.description, comingSoon: s.comingSoon, active: s.active,
      videos: vids.filter((v) => v.sectionId === s.id).map(toVideoView),
    }))
  } catch {
    return DEFAULT_SECTIONS.map((s, i) => ({ id: `d-${i}`, title: s.title, slug: slugify(s.title), description: s.description, comingSoon: true, active: true, videos: [] }))
  }
}

/** Admin view: every section (active or not) with all videos incl. pending. */
export async function getPerspectivesAdmin(): Promise<PerspectiveSectionView[]> {
  await seedPerspectiveDefaults()
  const sections = await prisma.perspectiveSection.findMany({ orderBy: { sortOrder: 'asc' } })
  const vids = await prisma.perspectiveVideo.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
  return sections.map((s) => ({
    id: s.id, title: s.title, slug: s.slug, description: s.description, comingSoon: s.comingSoon, active: s.active,
    videos: vids.filter((v) => v.sectionId === s.id).map(toVideoView),
  }))
}

/** Pending therapist submissions awaiting admin approval. */
export async function getPerspectiveSubmissions(): Promise<(PerspectiveVideoView & { sectionTitle: string })[]> {
  await ensurePerspectiveSchema()
  try {
    const vids = await prisma.perspectiveVideo.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } })
    if (vids.length === 0) return []
    const sections = await prisma.perspectiveSection.findMany({ where: { id: { in: vids.map((v) => v.sectionId) } }, select: { id: true, title: true } })
    const titleOf = new Map(sections.map((s) => [s.id, s.title]))
    return vids.map((v) => ({ ...toVideoView(v), sectionTitle: titleOf.get(v.sectionId) ?? 'Section' }))
  } catch {
    return []
  }
}

// ── Mutations (admin unless noted). Callers gate on role. ─────────────────────

export async function createPerspectiveSection(input: { title: string; description?: string | null }): Promise<{ ok: boolean; error?: string }> {
  await ensurePerspectiveSchema()
  const title = input.title.trim()
  if (!title) return { ok: false, error: 'Enter a section title.' }
  try {
    const max = await prisma.perspectiveSection.aggregate({ _max: { sortOrder: true } })
    let slug = slugify(title)
    if (await prisma.perspectiveSection.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`
    await prisma.perspectiveSection.create({ data: { title, slug, description: input.description?.trim() || null, sortOrder: (max._max.sortOrder ?? 0) + 1 } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not create the section.' }
  }
}

export async function updatePerspectiveSection(id: string, patch: { title?: string; description?: string | null; comingSoon?: boolean; active?: boolean }): Promise<{ ok: boolean; error?: string }> {
  await ensurePerspectiveSchema()
  try {
    const data: Record<string, unknown> = {}
    if (patch.title !== undefined) { const t = patch.title.trim(); if (!t) return { ok: false, error: 'Title cannot be empty.' }; data.title = t }
    if (patch.description !== undefined) data.description = patch.description?.trim() || null
    if (patch.comingSoon !== undefined) data.comingSoon = patch.comingSoon
    if (patch.active !== undefined) data.active = patch.active
    await prisma.perspectiveSection.update({ where: { id }, data })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the section.' }
  }
}

export async function deletePerspectiveSection(id: string): Promise<{ ok: boolean; error?: string }> {
  await ensurePerspectiveSchema()
  try {
    await prisma.perspectiveVideo.deleteMany({ where: { sectionId: id } })
    await prisma.perspectiveSection.delete({ where: { id } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not delete the section.' }
  }
}

/** Add a video. Admin adds are APPROVED; therapist submissions are PENDING. */
export async function addPerspectiveVideo(
  input: { sectionId: string; title: string; url: string; description?: string | null },
  by: { status: 'APPROVED' | 'PENDING'; submittedById?: string | null; submittedByName?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  await ensurePerspectiveSchema()
  const title = input.title.trim()
  const youtubeId = parseYouTubeId(input.url)
  if (!title) return { ok: false, error: 'Enter a video title.' }
  if (!youtubeId) return { ok: false, error: 'Enter a valid YouTube link or video id.' }
  try {
    const max = await prisma.perspectiveVideo.aggregate({ where: { sectionId: input.sectionId }, _max: { sortOrder: true } })
    await prisma.perspectiveVideo.create({
      data: {
        sectionId: input.sectionId, title, youtubeId, description: input.description?.trim() || null,
        status: by.status, submittedById: by.submittedById ?? null, submittedByName: by.submittedByName ?? null,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not add the video.' }
  }
}

export async function setPerspectiveVideoStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<{ ok: boolean; error?: string }> {
  await ensurePerspectiveSchema()
  try {
    await prisma.perspectiveVideo.update({ where: { id }, data: { status } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the submission.' }
  }
}

export async function deletePerspectiveVideo(id: string): Promise<{ ok: boolean; error?: string }> {
  await ensurePerspectiveSchema()
  try {
    await prisma.perspectiveVideo.delete({ where: { id } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not delete the video.' }
  }
}
