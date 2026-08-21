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
  getFormTemplate, updateFormTemplate, type CustomFormDetail,
  type FormRecurrence, type CustomFormInput,
} from '@/lib/forms'
import { notify, markAllRead } from '@/lib/notifications'
import { notifyBlogSubmission, notifyAdmins } from '@/lib/adminNotify'
import { normalizeFrequency, normalizeTimesOfDay } from '@/lib/taskRecurrence'
import { normalizeTags } from '@/data/tags'
import { normalizeCountry } from '@/lib/countries'
import { ensureContactSchema } from '@/lib/contactSchema'

export type ExpertActionResult = { ok: boolean; error?: string; slug?: string }

/**
 * Submit a post for the public /blog under this clinician's byline. It is NOT
 * published on submission — an admin reviews it first.
 */
export async function publishBlog(input: CreateBlogInput): Promise<ExpertActionResult> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Please sign in.' }
  const res = await createExpertBlogPost(ctx, { ...input, tags: normalizeTags(input.tags ?? []) })
  if (res.ok) {
    await notifyBlogSubmission(ctx.therapistName, input.title)
    revalidatePath('/expert/blogs')
    revalidatePath('/admin/content')
  }
  return res
}

/** Edit one of this clinician's own blog posts. */
export async function updateBlog(slug: string, input: CreateBlogInput): Promise<ExpertActionResult> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Please sign in.' }
  const res = await updateExpertBlogPost(ctx, slug, { ...input, tags: normalizeTags(input.tags ?? []) })
  if (res.ok) {
    await notifyBlogSubmission(ctx.therapistName, input.title)
    revalidatePath('/expert/blogs')
    revalidatePath('/admin/content')
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

/** Read one form in full — its questions, for viewing or loading into the builder. */
export async function readMyForm(id: string): Promise<CustomFormDetail | null> {
  const ctx = await getTherapistContext()
  if (!ctx) return null
  return getFormTemplate(id, ctx.userId)
}

/** Edit a form this clinician built (their own only). */
export async function editMyForm(id: string, input: CustomFormInput): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Please sign in.' }
  const res = await updateFormTemplate(id, input, ctx.userId)
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
  /** Council registration (RCI/NMC). Changing a verified one re-opens review. */
  rciNumber?: string
  yearsExp?: number
  photo?: string | null // data URL, '' / null to remove, omit to leave unchanged
  // Contact + location. Visible to the admin team, not to patients.
  phone?: string | null
  dateOfBirth?: string | null // yyyy-mm-dd
  country?: string | null
  state?: string | null
  city?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  postalCode?: string | null
  emergencyName?: string | null
  emergencyPhone?: string | null
  emergencyRelation?: string | null
}

/**
 * A clinician editing their own public-facing profile: name, photo, bio,
 * qualifications, languages, specializations, council registration and years of
 * experience. Employment terms and fees stay admin-managed, and the email/login
 * identity never changes.
 *
 * Registration number is editable so a clinician can fill in or correct their
 * own credential — but it is the thing verification attests to, so CHANGING an
 * already-verified number clears the verified badge and tells the admin team to
 * check it again. Otherwise a verified badge could be carried over to a number
 * nobody has ever seen.
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

  // Trim to a single spaced line, or null when cleared. undefined = leave alone.
  const clean = (v: string | null | undefined, max: number): string | null | undefined => {
    if (v === undefined) return undefined
    const t = (v ?? '').trim()
    return t ? t.replace(/\s+/g, ' ').slice(0, max) : null
  }

  let dob: Date | null | undefined = undefined
  if (input.dateOfBirth !== undefined) {
    if (!input.dateOfBirth) dob = null
    else {
      const d = new Date(input.dateOfBirth)
      if (Number.isNaN(d.getTime()) || d.getTime() > Date.now()) {
        return { ok: false, error: 'Enter a valid date of birth.' }
      }
      dob = d
    }
  }

  try {
    // The contact columns must exist before we write them.
    await ensureContactSchema().catch(() => {})
    const userData: Record<string, unknown> = {}
    if (name !== undefined) userData.name = name
    const phone = clean(input.phone, 20)
    if (phone !== undefined) userData.phone = phone
    if (Object.keys(userData).length) {
      await prisma.user.update({ where: { id: ctx.userId }, data: userData })
    }

    const data: Record<string, unknown> = {}
    if (input.bio !== undefined) data.bio = input.bio.trim().slice(0, 2000)
    if (input.gender !== undefined) data.gender = input.gender?.trim() ? input.gender.trim().slice(0, 30) : null
    if (input.qualifications !== undefined) data.qualifications = toList(input.qualifications)
    if (input.languages !== undefined) data.languages = toList(input.languages)
    if (input.specializations !== undefined) data.specializations = toList(input.specializations)
    if (photo !== undefined) data.photoUrl = photo
    if (dob !== undefined) data.dateOfBirth = dob
    if (input.country !== undefined) data.country = normalizeCountry(input.country)
    const state = clean(input.state, 60); if (state !== undefined) data.state = state
    const city = clean(input.city, 60); if (city !== undefined) data.city = city
    const a1 = clean(input.addressLine1, 120); if (a1 !== undefined) data.addressLine1 = a1
    const a2 = clean(input.addressLine2, 120); if (a2 !== undefined) data.addressLine2 = a2
    const pin = clean(input.postalCode, 16); if (pin !== undefined) data.postalCode = pin
    const emN = clean(input.emergencyName, 80); if (emN !== undefined) data.emergencyName = emN
    const emP = clean(input.emergencyPhone, 20); if (emP !== undefined) data.emergencyPhone = emP
    const emR = clean(input.emergencyRelation, 40); if (emR !== undefined) data.emergencyRelation = emR

    if (input.yearsExp !== undefined) {
      const y = Math.trunc(input.yearsExp)
      if (!Number.isFinite(y) || y < 0 || y > 70) return { ok: false, error: 'Enter years of experience between 0 and 70.' }
      data.yearsExp = y
    }

    // Registration number: normalised, and re-verified if it actually changes.
    let reverify: { from: string; to: string } | null = null
    if (input.rciNumber !== undefined) {
      const reg = input.rciNumber.trim().replace(/\s+/g, ' ').toUpperCase().slice(0, 40)
      if (!reg) return { ok: false, error: 'Enter your council registration number.' }
      const current = await prisma.therapistProfile.findUnique({
        where: { id: ctx.therapistProfileId },
        select: { rciNumber: true, isVerified: true },
      })
      if (current && current.rciNumber !== reg) {
        data.rciNumber = reg
        if (current.isVerified) {
          data.isVerified = false
          reverify = { from: current.rciNumber, to: reg }
        }
      }
    }

    if (Object.keys(data).length) {
      await prisma.therapistProfile.update({ where: { id: ctx.therapistProfileId }, data })
    }
    if (reverify) {
      await notifyAdmins({
        type: 'announcement',
        title: 'Registration number changed — re-verify',
        body: `${ctx.therapistName ?? 'A clinician'} changed their registration from ${reverify.from} to ${reverify.to}. Their verified badge has been removed until you confirm it.`,
        href: '/admin/therapists',
      }).catch(() => {})
    }

    revalidatePath('/expert/profile')
    revalidatePath('/expert')
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error && /Unique constraint/i.test(e.message)
      ? 'That phone number or registration number is already in use.'
      : 'Could not save your profile.'
    return { ok: false, error: msg }
  }
}
