'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import {
  getTherapistContext,
  resolveCrisisAlert,
  ownsPatient,
  requestAppointmentCancellation,
  writeSessionSummary,
  setDayAvailability,
  setAllDaysAvailability,
  addAvailabilityException,
  removeAvailabilityException,
  addSupervisionNote,
  prescribeMedication,
  setMedicationActive,
  createExpertBlogPost,
  updateExpertBlogPost,
  toggleMyTask,
  type CreateBlogInput,
} from '@/lib/expert'
import {
  sendForm, createFormRule, deleteFormRule, setFormRuleActive, createFormTemplate, deleteFormTemplate,
  type FormRecurrence, type CustomFormInput,
} from '@/lib/forms'
import { notify, markAllRead } from '@/lib/notifications'
import { normalizeFrequency, normalizeTimesOfDay } from '@/lib/taskRecurrence'
import { normalizeTags } from '@/data/tags'

export type ExpertActionResult = { ok: boolean; error?: string; slug?: string }

/** Publish a blog post to the public /blog under this clinician's byline. */
export async function publishBlog(input: CreateBlogInput): Promise<ExpertActionResult> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Please sign in.' }
  const res = await createExpertBlogPost(ctx, { ...input, tags: normalizeTags(input.tags ?? []) })
  if (res.ok) {
    revalidatePath('/expert/blogs')
    revalidatePath('/blog')
  }
  return res
}

/** Edit one of this clinician's own blog posts. */
export async function updateBlog(slug: string, input: CreateBlogInput): Promise<ExpertActionResult> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Please sign in.' }
  const res = await updateExpertBlogPost(ctx, slug, { ...input, tags: normalizeTags(input.tags ?? []) })
  if (res.ok) {
    revalidatePath('/expert/blogs')
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
  }
  return res
}


export async function resolveAlert(formData: FormData): Promise<void> {
  const alertId = String(formData.get('alertId') ?? '')
  if (!alertId) return
  const ctx = await getTherapistContext()
  if (!ctx) return
  await resolveCrisisAlert(ctx.therapistProfileId, alertId)
  revalidatePath('/expert/risk')
  revalidatePath('/expert')
  const patientId = String(formData.get('patientId') ?? '')
  if (patientId) revalidatePath(`/expert/patients/${patientId}`)
}

/** Mark an admin-assigned task complete/incomplete from the clinician's portal. */
export async function toggleMyAssignedTask(id: string, done: boolean): Promise<{ ok: boolean }> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false }
  const ok = await toggleMyTask(ctx.userId, id, done)
  if (ok) { revalidatePath('/expert'); revalidatePath('/expert/tasks') }
  return { ok }
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
  const frequency = normalizeFrequency(String(formData.get('frequency') ?? ''))
  const timesOfDay = normalizeTimesOfDay(formData.getAll('timesOfDay').map(String))

  await prisma.task.create({
    data: {
      userId: patientId,
      type,
      title,
      description: description || null,
      frequency: frequency === 'ONE_TIME' ? null : frequency,
      timesOfDay,
      dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
      assignedBy: ctx.therapistName ?? null,
      assignedById: ctx.userId,
    },
  })

  await notify(patientId, { type: 'task', title: 'New task assigned', body: title, href: '/app' })

  revalidatePath(`/expert/patients/${patientId}`)
  revalidatePath('/app')
}

/**
 * Clinician requests cancellation of a confirmed session. Does NOT cancel it —
 * flags it for admin approval with a reason. The session stays on the patient's
 * calendar until an admin approves (real cancel) or rejects the request.
 */
export async function requestCancellation(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const id = String(formData.get('appointmentId') ?? '')
  const reason = String(formData.get('reason') ?? '')
  if (!id) return
  await requestAppointmentCancellation(ctx.therapistProfileId, id, reason)
  revalidatePath('/expert/schedule')
  revalidatePath('/expert')
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
  revalidatePath('/expert/tasks')
  revalidatePath('/expert')
  if (patientId) revalidatePath(`/expert/patients/${patientId}`)
}


// ── Availability ──────────────────────────────────────────────────────────────

function parseHours(formData: FormData): number[] {
  // Checkbox group named "hours", each checked box contributes its start-hour.
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

/** Block a specific date, the whole day, or just the selected hours. */
export async function blockDate(formData: FormData): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  const dateRaw = String(formData.get('date') ?? '')
  if (!dateRaw) return
  const hoursOff = formData
    .getAll('hoursOff')
    .map((h) => Number(h))
    .filter((h) => Number.isInteger(h) && h >= 0 && h <= 23)
  await addAvailabilityException(
    ctx.therapistProfileId,
    new Date(dateRaw),
    hoursOff.length ? { fullDayOff: false, hoursOff } : { fullDayOff: true },
  )
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

// ── Automatic form rules (this clinician's own patients) ─────────────────────

export async function createMyFormRule(input: {
  templateId: string; trackSlug: string; recurrence: FormRecurrence; sessionNumber?: number | null; patientId?: string | null
}): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Sign in again.' }
  // A patient-scoped rule must target a patient this clinician actually owns.
  if (input.patientId && !(await ownsPatient(ctx.therapistProfileId, input.patientId))) {
    return { ok: false, error: 'That patient is not on your caseload.' }
  }
  const res = await createFormRule({ ...input, therapistId: ctx.therapistProfileId, patientId: input.patientId ?? null })
  if (res.ok) revalidatePath('/expert/forms')
  return res
}

export async function deleteMyFormRule(id: string): Promise<{ ok: boolean }> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false }
  const ok = await deleteFormRule(id, ctx.therapistProfileId)
  if (ok) revalidatePath('/expert/forms')
  return { ok }
}

export async function toggleMyFormRule(id: string, active: boolean): Promise<{ ok: boolean }> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false }
  const ok = await setFormRuleActive(id, active, ctx.therapistProfileId)
  if (ok) revalidatePath('/expert/forms')
  return { ok }
}

// ── Custom forms built by this clinician ─────────────────────────────────────

/** Build a new form. It joins the library, so it can be sent or used in a rule. */
export async function createMyForm(input: CustomFormInput): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Please sign in.' }
  const res = await createFormTemplate(input, { id: ctx.userId, name: ctx.therapistName })
  if (res.ok) revalidatePath('/expert/forms')
  return res
}

/** Retire a form this clinician built (their own only). */
export async function removeMyForm(id: string): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Please sign in.' }
  const res = await deleteFormTemplate(id, ctx.userId)
  if (res.ok) revalidatePath('/expert/forms')
  return res
}

// ── Notifications ────────────────────────────────────────────────────────────

/** Clear the clinician's notification badge (opening the bell marks all read). */
export async function markExpertNotificationsRead(): Promise<void> {
  const ctx = await getTherapistContext()
  if (!ctx) return
  try {
    await markAllRead(ctx.userId)
    revalidatePath('/expert/notifications')
    revalidatePath('/expert')
  } catch {
    /* the badge is cosmetic — never surface a failure here */
  }
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

const MAX_PHOTO_BYTES = 2_000_000
function validPhoto(dataUrl: string | null | undefined): string | null | undefined {
  if (dataUrl === undefined) return undefined
  if (dataUrl === null || dataUrl === '') return null
  if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(dataUrl)) return undefined
  if (dataUrl.length > MAX_PHOTO_BYTES) return undefined
  return dataUrl
}
// Split a comma / newline separated list into clean, de-duplicated items.
function toList(raw: string, max = 24): string[] {
  return [...new Set(raw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean))].slice(0, max)
}

export type TherapistProfileInput = {
  name?: string
  bio?: string
  gender?: string | null
  qualifications?: string // comma-separated
  languages?: string // comma-separated
  specializations?: string // comma-separated
  photo?: string | null // data URL, '' / null to remove, omit to leave unchanged
}

/**
 * A clinician editing their own public-facing profile: name, photo, bio,
 * qualifications, languages and specializations. Admin-managed fields
 * (verification, employment, RCI number, fees) are intentionally NOT editable
 * here, and the email/login identity never changes.
 */
export async function updateTherapistProfile(input: TherapistProfileInput): Promise<ExpertActionResult> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Please sign in.' }

  const name = input.name !== undefined ? input.name.trim().replace(/\s+/g, ' ').slice(0, 80) : undefined
  if (input.name !== undefined && !name) return { ok: false, error: 'Enter your name.' }

  const photo = validPhoto(input.photo)
  if (input.photo !== undefined && input.photo && photo === undefined) {
    return { ok: false, error: 'Use a JPG/PNG/WebP image under 2 MB.' }
  }

  try {
    if (name !== undefined) {
      await prisma.user.update({ where: { id: ctx.userId }, data: { name } })
    }

    const data: Record<string, unknown> = {}
    if (input.bio !== undefined) data.bio = input.bio.trim().slice(0, 2000)
    if (input.gender !== undefined) data.gender = input.gender?.trim() ? input.gender.trim().slice(0, 30) : null
    if (input.qualifications !== undefined) data.qualifications = toList(input.qualifications)
    if (input.languages !== undefined) data.languages = toList(input.languages)
    if (input.specializations !== undefined) data.specializations = toList(input.specializations)
    if (photo !== undefined) data.photoUrl = photo
    if (Object.keys(data).length) {
      await prisma.therapistProfile.update({ where: { id: ctx.therapistProfileId }, data })
    }

    revalidatePath('/expert/profile')
    revalidatePath('/expert')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save your profile.' }
  }
}
