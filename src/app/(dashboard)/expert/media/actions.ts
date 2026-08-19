'use server'

import { revalidatePath } from 'next/cache'
import { getTherapistContext } from '@/lib/expert'
import { addPerspectiveVideo } from '@/lib/perspectives'
import { assignGuidedTrack, unassignGuidedTrack } from '@/lib/guided'

type Res = { ok: boolean; error?: string }

/** A clinician submits a video to a Perspectives section for admin approval. */
export async function submitPerspectiveVideo(input: { sectionId: string; title: string; url: string; description?: string | null; tags?: string[] }): Promise<Res> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Sign in as a clinician first.' }
  const r = await addPerspectiveVideo(input, { status: 'PENDING', submittedById: ctx.userId, submittedByName: ctx.therapistName ?? 'Clinician' })
  if (r.ok) revalidatePath('/expert/perspectives')
  return r
}

/** An expert assigns a guided track to one of their patients, with optional validity. */
export async function expertAssignGuidedTrack(input: { trackId: string; patientId: string; validUntil?: string | null }): Promise<Res> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Sign in as a clinician first.' }
  const r = await assignGuidedTrack({ ...input, assignedById: ctx.userId })
  if (r.ok) { revalidatePath(`/expert/patients/${input.patientId}`); revalidatePath('/app/guided') }
  return r
}

export async function expertUnassignGuidedTrack(input: { assignmentId: string; patientId: string }): Promise<Res> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Sign in as a clinician first.' }
  const r = await unassignGuidedTrack(input.assignmentId)
  if (r.ok) { revalidatePath(`/expert/patients/${input.patientId}`); revalidatePath('/app/guided') }
  return r
}
