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
  setDayAvailability,
  setAllDaysAvailability,
  addAvailabilityException,
  removeAvailabilityException,
  addSupervisee,
  addSupervisionNote,
  prescribeMedication,
  setMedicationActive,
} from '@/lib/expert'
import { sendForm } from '@/lib/forms'

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

// ── Availability ──────────────────────────────────────────────────────────────

function parseHours(formData: FormData): number[] {
  // Checkbox group named "hours" — each checked box contributes its start-hour.
  return formData
    .getAll('hours')
    .map((v) => parseInt(String(v), 10))
    .filter((n) => !Number.isNaN(n))
}

/** Save the weekly template: either one weekday, or all days when applyAll is set. */
export async function saveAvailability(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const hours = parseHours(formData)
  if (String(formData.get('applyAll') ?? '') === 'true') {
    await setAllDaysAvailability(ctx.therapistProfileId, hours)
  } else {
    const day = parseInt(String(formData.get('dayOfWeek') ?? ''), 10)
    if (Number.isNaN(day)) return
    await setDayAvailability(ctx.therapistProfileId, day, hours)
  }
  revalidatePath('/expert/availability')
}

/** Block a specific date (whole day) — a date-specific unavailability override. */
export async function blockDate(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const dateRaw = String(formData.get('date') ?? '')
  if (!dateRaw) return
  await addAvailabilityException(ctx.therapistProfileId, new Date(dateRaw), { fullDayOff: true })
  revalidatePath('/expert/availability')
}

export async function unblockDate(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const id = String(formData.get('exceptionId') ?? '')
  if (!id) return
  await removeAvailabilityException(ctx.therapistProfileId, id)
  revalidatePath('/expert/availability')
}

// ── Supervision ───────────────────────────────────────────────────────────────

export async function linkSupervisee(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const email = String(formData.get('email') ?? '')
  if (!email) return
  await addSupervisee(ctx.therapistProfileId, email)
  revalidatePath('/expert/supervision')
}

export async function postSupervisionNote(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const linkId = String(formData.get('linkId') ?? '')
  const content = String(formData.get('content') ?? '')
  const patientId = String(formData.get('patientId') ?? '') || undefined
  if (!linkId || !content.trim()) return
  await addSupervisionNote(ctx.therapistProfileId, linkId, content, patientId)
  revalidatePath('/expert/supervision')
}

// ── Medication (psychiatrist) ────────────────────────────────────────────────

export async function prescribe(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const patientId = String(formData.get('patientId') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  if (!patientId || !name) return
  const times = String(formData.get('times') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  const durationRaw = parseInt(String(formData.get('durationDays') ?? ''), 10)
  await prescribeMedication(ctx.therapistProfileId, ctx.therapistName, patientId, {
    name,
    dosage: String(formData.get('dosage') ?? ''),
    frequency: String(formData.get('frequency') ?? ''),
    times,
    durationDays: Number.isNaN(durationRaw) ? null : durationRaw,
    notes: String(formData.get('notes') ?? ''),
  })
  revalidatePath(`/expert/patients/${patientId}`)
  revalidatePath('/app/medications')
}

// ── Forms ─────────────────────────────────────────────────────────────────────

/** Send a library form (consent / info / feedback) to one of the therapist's patients. */
export async function sendFormToPatient(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const patientId = String(formData.get('patientId') ?? '')
  const templateId = String(formData.get('templateId') ?? '')
  if (!patientId || !templateId) return
  await sendForm(ctx.therapistProfileId, ctx.therapistName, patientId, templateId)
  revalidatePath(`/expert/patients/${patientId}`)
}

export async function toggleMedication(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const medicationId = String(formData.get('medicationId') ?? '')
  const patientId = String(formData.get('patientId') ?? '')
  const active = String(formData.get('active') ?? '') === 'true'
  if (!medicationId) return
  await setMedicationActive(ctx.therapistProfileId, medicationId, active)
  if (patientId) revalidatePath(`/expert/patients/${patientId}`)
  revalidatePath('/app/medications')
}
