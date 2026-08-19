'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createPerspectiveSection, updatePerspectiveSection, deletePerspectiveSection,
  addPerspectiveVideo, setPerspectiveVideoStatus, deletePerspectiveVideo,
} from '@/lib/perspectives'
import {
  createGuidedTrack, updateGuidedTrack, deleteGuidedTrack,
  addGuidedVideo, deleteGuidedVideo,
} from '@/lib/guided'

type Res = { ok: boolean; error?: string }

async function requireAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { role?: string } | undefined
  return user?.role === 'ADMIN'
}

function bumpPerspectives() {
  revalidatePath('/admin/perspectives')
  revalidatePath('/app/perspectives')
  revalidatePath('/expert/perspectives')
  revalidatePath('/perspectives')
}
function bumpGuided() {
  revalidatePath('/admin/guided')
  revalidatePath('/app/guided')
}

// ── Perspectives (admin) ──────────────────────────────────────────────────────

export async function adminCreatePerspectiveSection(input: { title: string; description?: string | null }): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await createPerspectiveSection(input); if (r.ok) bumpPerspectives(); return r
}
export async function adminUpdatePerspectiveSection(id: string, patch: { title?: string; description?: string | null; comingSoon?: boolean; active?: boolean }): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await updatePerspectiveSection(id, patch); if (r.ok) bumpPerspectives(); return r
}
export async function adminDeletePerspectiveSection(id: string): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await deletePerspectiveSection(id); if (r.ok) bumpPerspectives(); return r
}
export async function adminAddPerspectiveVideo(input: { sectionId: string; title: string; url: string; description?: string | null }): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await addPerspectiveVideo(input, { status: 'APPROVED' }); if (r.ok) bumpPerspectives(); return r
}
export async function adminSetPerspectiveVideoStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await setPerspectiveVideoStatus(id, status); if (r.ok) bumpPerspectives(); return r
}
export async function adminDeletePerspectiveVideo(id: string): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await deletePerspectiveVideo(id); if (r.ok) bumpPerspectives(); return r
}

// ── Guided calm (admin) ───────────────────────────────────────────────────────

export async function adminCreateGuidedTrack(input: { title: string; description?: string | null; isPublic?: boolean }): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await createGuidedTrack(input); if (r.ok) bumpGuided(); return r
}
export async function adminUpdateGuidedTrack(id: string, patch: { title?: string; description?: string | null; isPublic?: boolean; comingSoon?: boolean; active?: boolean }): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await updateGuidedTrack(id, patch); if (r.ok) bumpGuided(); return r
}
export async function adminDeleteGuidedTrack(id: string): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await deleteGuidedTrack(id); if (r.ok) bumpGuided(); return r
}
export async function adminAddGuidedVideo(input: { trackId: string; title: string; url: string; description?: string | null }): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await addGuidedVideo(input); if (r.ok) bumpGuided(); return r
}
export async function adminDeleteGuidedVideo(id: string): Promise<Res> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const r = await deleteGuidedVideo(id); if (r.ok) bumpGuided(); return r
}
