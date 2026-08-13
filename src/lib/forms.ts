/**
 * Clinical forms: the in-code library (src/data/forms.ts) upserted into the DB
 * on demand, plus send / fill / read helpers. Two sides:
 *  - Expert sends a library form to a patient they own (on demand), and the
 *    booking flow auto-sends the category-matched INTAKE form on a first booking.
 *  - Patient sees assigned forms on their dashboard and submits responses.
 */
import { prisma } from '@/lib/prisma'
import { ownsPatient } from '@/lib/expert'
import { FORM_TEMPLATES, intakeSlugForCategory, type FormField } from '@/data/forms'

export type { FormField } from '@/data/forms'

/**
 * Ensure the in-code library exists in the DB (idempotent upsert by slug). Cheap
 * to call before any form operation so the library is always available without a
 * separate seed run.
 */
export async function ensureFormTemplates(): Promise<void> {
  for (const t of FORM_TEMPLATES) {
    await prisma.formTemplate.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        description: t.description,
        kind: t.kind,
        category: t.category ?? null,
        autoSend: t.autoSend ?? false,
        fields: t.fields,
        active: true,
      },
      create: {
        slug: t.slug,
        title: t.title,
        description: t.description,
        kind: t.kind,
        category: t.category ?? null,
        autoSend: t.autoSend ?? false,
        fields: t.fields,
      },
    })
  }
}

export type LibraryForm = {
  id: string
  slug: string
  title: string
  description: string | null
  kind: string
}

/** The forms a clinician can pick from when sending. INTAKE forms are excluded
 * from the on-demand picker (they're auto-sent), leaving consent/info/feedback. */
export async function getFormLibrary(): Promise<LibraryForm[]> {
  try {
    await ensureFormTemplates()
    const rows = await prisma.formTemplate.findMany({
      where: { active: true, kind: { not: 'INTAKE' } },
      orderBy: [{ kind: 'asc' }, { title: 'asc' }],
      select: { id: true, slug: true, title: true, description: true, kind: true },
    })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      kind: r.kind,
    }))
  } catch {
    return []
  }
}

export type PatientFormRow = {
  id: string
  title: string
  kind: string
  status: 'PENDING' | 'COMPLETED'
  assignedBy: string | null
  sentLabel: string
  completedLabel: string | null
}

function fmt(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Forms sent to a patient (clinician's view on the patient profile). */
export async function getPatientFormsForExpert(
  therapistProfileId: string,
  patientId: string
): Promise<PatientFormRow[]> {
  const owns = await prisma.appointment.findFirst({
    where: { therapistId: therapistProfileId, patientId },
    select: { id: true },
  }).catch(() => null)
  if (!owns) return []
  return listAssignments(patientId)
}

/** Forms assigned to the signed-in patient (their own dashboard). */
export async function getMyForms(patientId: string): Promise<PatientFormRow[]> {
  return listAssignments(patientId)
}

async function listAssignments(patientId: string): Promise<PatientFormRow[]> {
  try {
    const rows = await prisma.formAssignment.findMany({
      where: { patientId },
      orderBy: [{ status: 'asc' }, { sentAt: 'desc' }],
      select: {
        id: true, status: true, assignedBy: true, sentAt: true, completedAt: true,
        template: { select: { title: true, kind: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      title: r.template.title,
      kind: r.template.kind,
      status: r.status,
      assignedBy: r.assignedBy,
      sentLabel: fmt(r.sentAt),
      completedLabel: r.completedAt ? fmt(r.completedAt) : null,
    }))
  } catch {
    return []
  }
}

export type FormToFill = {
  id: string
  title: string
  description: string | null
  kind: string
  status: 'PENDING' | 'COMPLETED'
  fields: FormField[]
  responses: Record<string, string | boolean> | null
}

/** Load one assigned form for the patient to fill (or review once completed). */
export async function getFormToFill(patientId: string, assignmentId: string): Promise<FormToFill | null> {
  const a = await prisma.formAssignment.findFirst({
    where: { id: assignmentId, patientId },
    include: { template: true },
  })
  if (!a) return null
  return {
    id: a.id,
    title: a.template.title,
    description: a.template.description,
    kind: a.template.kind,
    status: a.status,
    fields: (a.template.fields as unknown as FormField[]) ?? [],
    responses: (a.responses as Record<string, string | boolean> | null) ?? null,
  }
}

/** Patient submits answers to an assigned form. Ownership-gated; once only. */
export async function submitForm(
  patientId: string,
  assignmentId: string,
  responses: Record<string, string | boolean>
): Promise<boolean> {
  const a = await prisma.formAssignment.findFirst({
    where: { id: assignmentId, patientId, status: 'PENDING' },
    select: { id: true },
  })
  if (!a) return false
  await prisma.formAssignment.update({
    where: { id: assignmentId },
    data: { responses, status: 'COMPLETED', completedAt: new Date() },
  })
  return true
}

/** Clinician sends a library form to a patient they own. Returns false if not. */
export async function sendForm(
  therapistProfileId: string,
  therapistName: string | null,
  patientId: string,
  templateId: string
): Promise<boolean> {
  // Consistent with tasks and prescriptions: a therapist responsible for the
  // patient (by appointment OR admin assignment OR an attached package) can send
  // a form, not only one who already has an appointment with them.
  if (!(await ownsPatient(therapistProfileId, patientId))) return false
  const template = await prisma.formTemplate.findUnique({ where: { id: templateId }, select: { id: true } })
  if (!template) return false
  await prisma.formAssignment.create({
    data: { templateId, patientId, assignedBy: therapistName ?? 'Your care team' },
  })
  return true
}

/**
 * Auto-send the category-matched INTAKE form the moment a patient books their
 * first session. No-op (idempotent) if the patient already has appointments
 * other than this first one, or already has that intake form. `priorAppointments`
 * is the count of appointments the patient had BEFORE this booking.
 */
export async function autoSendIntakeForm(patientId: string, priorAppointments: number): Promise<void> {
  if (priorAppointments > 0) return // not their first session
  await ensureFormTemplates()

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: patientId },
    select: { careMode: true },
  })
  const sub = await prisma.subscription.findFirst({
    where: { userId: patientId },
    orderBy: { createdAt: 'desc' },
    select: { category: true },
  })
  const category = sub?.category ?? (profile?.careMode === 'COUPLE' ? 'COUPLE' : 'INDIVIDUAL')
  const slug = intakeSlugForCategory(category)

  const template = await prisma.formTemplate.findUnique({ where: { slug }, select: { id: true } })
  if (!template) return

  const already = await prisma.formAssignment.findFirst({
    where: { patientId, templateId: template.id },
    select: { id: true },
  })
  if (already) return

  await prisma.formAssignment.create({
    data: { templateId: template.id, patientId, assignedBy: 'Auto' },
  })
}
