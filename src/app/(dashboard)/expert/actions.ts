'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getTherapistContext, resolveCrisisAlert, ownsPatient } from '@/lib/expert'

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
