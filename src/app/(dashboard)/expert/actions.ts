'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import {
  getTherapistContext,
  resolveCrisisAlert,
  ownsPatient,
  setAppointmentStatus,
  rescheduleAppointment,
  writeSessionSummary,
  draftSessionNote,
} from '@/lib/expert'

export async function resolveAlert(formData: FormData): Promise<void> {
  const alertId = String(formData.get('alertId') ?? '')
  if (!alertId) return
  const ctx = await getTherapistContext()
  if (!ctx) return
  await resolveCrisisAlert(ctx.therapistProfileId, alertId)
  revalidatePath('/expert/risk')
}

const TASK_TYPES = ['EXERCISE', 'VIDEO', 'READING', 'REFLECTION', 'BREATHING'] as const
type TaskTypeValue = (typeof TASK_TYPES)[number]

/**
 * Assign a task to one of the therapist's own patients (#16). The task surfaces on
 * the patient's dashboard with its expiry; the patient's completion feeds the
 * weekly progress summary both sides see. Scoped to a patient the therapist
 * actually has appointments with.
 */
export async function assignTask(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return

  const patientId = String(formData.get('patientId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  if (!patientId || !title) return
  if (!(await ownsPatient(ctx.therapistProfileId, patientId))) return

  const typeRaw = String(formData.get('type') ?? 'REFLECTION')
  const type: TaskTypeValue = (TASK_TYPES as readonly string[]).includes(typeRaw)
    ? (typeRaw as TaskTypeValue)
    : 'REFLECTION'
  const description = String(formData.get('description') ?? '').trim()
  const dueRaw = String(formData.get('dueDate') ?? '').trim()
  const dueDate = dueRaw ? new Date(dueRaw) : null

  await prisma.task.create({
    data: {
      userId: patientId,
      type,
      title,
      description: description || null,
      dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
      assignedBy: ctx.therapistName ?? null,
    },
  })

  revalidatePath(`/expert/patients/${patientId}`)
  revalidatePath('/app')
}

/** Confirm a pending booking request. */
export async function confirmAppointment(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const id = String(formData.get('appointmentId') ?? '')
  if (!id) return
  await setAppointmentStatus(ctx.therapistProfileId, id, 'CONFIRMED')
  revalidatePath('/expert/schedule')
}

/** Cancel a booking — the patient sees it removed from their upcoming list. */
export async function cancelAppointment(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const id = String(formData.get('appointmentId') ?? '')
  if (!id) return
  await setAppointmentStatus(ctx.therapistProfileId, id, 'CANCELLED')
  revalidatePath('/expert/schedule')
}

/** Move a booking to a new date/time the therapist proposes. */
export async function rescheduleAppointmentAction(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const id = String(formData.get('appointmentId') ?? '')
  const newDateRaw = String(formData.get('newDate') ?? '')
  if (!id || !newDateRaw) return
  await rescheduleAppointment(ctx.therapistProfileId, id, new Date(newDateRaw))
  revalidatePath('/expert/schedule')
}

/** Mark a session complete and save the therapist's written summary. */
export async function completeSession(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const id = String(formData.get('appointmentId') ?? '')
  const patientId = String(formData.get('patientId') ?? '')
  const summary = String(formData.get('summary') ?? '').trim()
  if (!id || !summary) return
  await writeSessionSummary(ctx.therapistProfileId, id, summary)
  revalidatePath('/expert/schedule')
  if (patientId) revalidatePath(`/expert/patients/${patientId}`)
}

/**
 * AI co-pilot note drafting (#1 in the spec: "auto-drafted session notes,
 * reviewed by expert"). Called directly from a client component — not a form
 * action — so the draft can be previewed and edited before the therapist saves
 * anything. Returns null (caller shows a message) when no LLM is configured.
 */
export async function getNoteDraft(bullets: string): Promise<string | null> {
  const ctx = await getTherapistContext()
  if (!ctx) return null
  return draftSessionNote(bullets)
}
