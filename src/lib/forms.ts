/**
 * Clinical forms: the in-code library (src/data/forms.ts) upserted into the DB
 * on demand, plus send / fill / read helpers. Two sides:
 *  - Expert sends a library form to a patient they own (on demand), and the
 *    booking flow auto-sends the category-matched INTAKE form on a first booking.
 *  - Patient sees assigned forms on their dashboard and submits responses.
 */
import { prisma } from '@/lib/prisma'
import { ownsPatient } from '@/lib/expert'
import { notify } from '@/lib/notifications'
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

// ── Custom forms (built in the admin / expert UI) ────────────────────────────
// The in-code library covers the standard clinical set. Anything a clinician or
// an admin builds themselves lives only in the DB, tagged with who made it so
// each side can manage its own. Code-seeded slugs are never editable from the
// UI — ensureFormTemplates() would overwrite the change on the next call.

const CODE_SLUGS = new Set(FORM_TEMPLATES.map((t) => t.slug))

/** Custom-form columns, created on demand so this works before 0036 is applied. */
let customFormSchemaReady = false
export async function ensureCustomFormSchema(): Promise<void> {
  if (customFormSchemaReady) return
  const stmts = [
    `ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "createdById" TEXT`,
    `ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "createdByName" TEXT`,
    `CREATE INDEX IF NOT EXISTS "FormTemplate_createdById_idx" ON "FormTemplate"("createdById")`,
  ]
  for (const sql of stmts) await prisma.$executeRawUnsafe(sql)
  customFormSchemaReady = true
}

/** Kinds a person can build. INTAKE is excluded: those are the auto-sent,
 *  category-matched forms the booking flow owns, one per care category. */
export const CUSTOM_FORM_KINDS = ['INFO', 'CONSENT', 'FEEDBACK'] as const
export type CustomFormKind = (typeof CUSTOM_FORM_KINDS)[number]

const FIELD_TYPES: FormField['type'][] = ['text', 'textarea', 'select', 'checkbox', 'date', 'tel', 'email']

export type CustomFormInput = {
  title: string
  description?: string
  kind: string
  fields: { label: string; type: string; required?: boolean; options?: string[]; help?: string }[]
}

export type CustomFormRow = {
  id: string
  title: string
  kind: string
  fieldCount: number
  active: boolean
  createdByName: string | null
  mine: boolean
}

/** A stable, readable key for a field, derived from its label ("Full name" →
 *  "fullName"). Collisions inside one form get a numeric suffix. */
function fieldKey(label: string, taken: Set<string>): string {
  const words = label.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 6)
  let base = words.length
    ? words[0] + words.slice(1).map((w) => w[0].toUpperCase() + w.slice(1)).join('')
    : 'field'
  if (/^\d/.test(base)) base = `f${base}`
  let key = base
  for (let i = 2; taken.has(key); i++) key = `${base}${i}`
  taken.add(key)
  return key
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'form'
}

/**
 * Build a new form. `createdById` scopes ownership: an admin's forms are
 * platform-wide, a clinician's are their own to manage. Both end up in the same
 * library, so a custom form is sendable and rule-usable exactly like a built-in.
 */
export async function createFormTemplate(
  input: CustomFormInput,
  author: { id: string; name: string | null },
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const title = input.title.trim().replace(/\s+/g, ' ').slice(0, 120)
  if (!title) return { ok: false, error: 'Give the form a title.' }

  const kind = (CUSTOM_FORM_KINDS as readonly string[]).includes(input.kind)
    ? (input.kind as CustomFormKind)
    : 'INFO'

  const taken = new Set<string>()
  const fields: FormField[] = []
  for (const f of input.fields ?? []) {
    const label = String(f.label ?? '').trim().slice(0, 200)
    if (!label) continue // a blank row is just an unused slot in the builder
    const type = (FIELD_TYPES as string[]).includes(f.type) ? (f.type as FormField['type']) : 'text'
    const options = type === 'select'
      ? [...new Set((f.options ?? []).map((o) => String(o).trim()).filter(Boolean))].slice(0, 20)
      : undefined
    if (type === 'select' && (!options || options.length < 2)) {
      return { ok: false, error: `"${label}" is a dropdown, so it needs at least two choices.` }
    }
    fields.push({
      key: fieldKey(label, taken),
      label,
      type,
      ...(options ? { options } : {}),
      ...(f.required ? { required: true } : {}),
      ...(f.help?.trim() ? { help: f.help.trim().slice(0, 200) } : {}),
    })
    if (fields.length >= 40) break
  }
  if (fields.length === 0) return { ok: false, error: 'Add at least one question.' }

  try {
    await ensureCustomFormSchema()
    // Unique slug: the title, plus a counter only if that name is already taken.
    const base = slugify(title)
    let slug = base
    for (let i = 2; i < 50; i++) {
      const clash = await prisma.formTemplate.findUnique({ where: { slug }, select: { id: true } })
      if (!clash) break
      slug = `${base}-${i}`
    }
    const row = await prisma.formTemplate.create({
      data: {
        slug,
        title,
        description: input.description?.trim().slice(0, 500) || null,
        kind,
        fields: fields as unknown as object,
        createdById: author.id,
        createdByName: author.name ?? null,
      },
      select: { id: true },
    })
    return { ok: true, id: row.id }
  } catch {
    return { ok: false, error: 'Could not save the form.' }
  }
}

/**
 * Forms built in the UI. Admin (`ownerId` null) sees every custom form; a
 * clinician sees their own. Built-in library forms are never listed here —
 * they're managed in code.
 */
export async function listCustomForms(ownerId: string | null): Promise<CustomFormRow[]> {
  try {
    await ensureCustomFormSchema()
    const rows = await prisma.formTemplate.findMany({
      where: {
        slug: { notIn: [...CODE_SLUGS] },
        ...(ownerId ? { createdById: ownerId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, kind: true, fields: true, active: true, createdById: true, createdByName: true },
    })
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      kind: String(r.kind),
      fieldCount: Array.isArray(r.fields) ? (r.fields as unknown[]).length : 0,
      active: r.active,
      createdByName: r.createdByName ?? null,
      mine: ownerId ? r.createdById === ownerId : true,
    }))
  } catch {
    return []
  }
}

/**
 * Retire a custom form. Deleted outright when nothing has been sent yet;
 * otherwise deactivated, so completed responses stay readable on the patients
 * who filled it in. Built-in forms can't be removed. `ownerId` null = admin
 * (any custom form); a clinician may only remove one they created.
 */
export async function deleteFormTemplate(
  id: string,
  ownerId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await ensureCustomFormSchema()
    const row = await prisma.formTemplate.findUnique({
      where: { id },
      select: { slug: true, createdById: true, _count: { select: { assignments: true } } },
    })
    if (!row) return { ok: false, error: 'That form no longer exists.' }
    if (CODE_SLUGS.has(row.slug)) return { ok: false, error: 'Built-in forms cannot be removed.' }
    if (ownerId && row.createdById !== ownerId) return { ok: false, error: 'That form belongs to someone else.' }

    if (row._count.assignments > 0) {
      await prisma.formTemplate.update({ where: { id }, data: { active: false } })
      return { ok: true }
    }
    await prisma.formTemplate.delete({ where: { id } })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not remove the form.' }
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
  const template = await prisma.formTemplate.findUnique({ where: { id: templateId }, select: { id: true, title: true } })
  if (!template) return false
  await prisma.formAssignment.create({
    data: { templateId, patientId, assignedBy: therapistName ?? 'Your care team' },
  })
  await notify(patientId, { type: 'form', title: 'New form to fill', body: template.title, href: '/app/forms' })
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
  await notify(patientId, { type: 'form', title: 'New form to fill', body: 'Please complete your intake form before your session.', href: '/app/forms' })
}

// ── Automatic form-send rules ────────────────────────────────────────────────

export type FormRecurrence = 'ONCE' | 'EVERY' | 'EVEN' | 'ODD'

export type FormAutoRuleRow = {
  id: string
  templateId: string
  templateTitle: string
  trackSlug: string // 'therapy' | 'psychiatry' | 'couples' | 'any'
  recurrence: FormRecurrence
  sessionNumber: number | null
  active: boolean
  scope: 'PLATFORM' | 'MINE'
  patientId: string | null
  patientName: string | null // null when the rule applies to all patients
}

/**
 * Create the FormAutoRule table on demand, so the feature works on a database
 * that hasn't had the 0027 migration applied by hand. Idempotent; a no-op once
 * the table exists. Mirrors the referral schema-heal pattern.
 */
let formRuleSchemaReady = false
export async function ensureFormRuleSchema(): Promise<void> {
  if (formRuleSchemaReady) return
  const stmts = [
    `CREATE TABLE IF NOT EXISTS "FormAutoRule" (
      "id" TEXT NOT NULL,
      "templateId" TEXT NOT NULL,
      "trackSlug" TEXT NOT NULL DEFAULT 'any',
      "recurrence" TEXT NOT NULL DEFAULT 'ONCE',
      "sessionNumber" INTEGER,
      "therapistId" TEXT,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "FormAutoRule_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE INDEX IF NOT EXISTS "FormAutoRule_active_idx" ON "FormAutoRule"("active")`,
    `CREATE INDEX IF NOT EXISTS "FormAutoRule_therapistId_idx" ON "FormAutoRule"("therapistId")`,
    `DO $$ BEGIN
      ALTER TABLE "FormAutoRule" ADD CONSTRAINT "FormAutoRule_templateId_fkey"
        FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `ALTER TABLE "FormAutoRule" ADD COLUMN IF NOT EXISTS "patientId" TEXT`,
  ]
  for (const sql of stmts) await prisma.$executeRawUnsafe(sql)
  formRuleSchemaReady = true
}

const VALID_TRACKS = ['therapy', 'psychiatry', 'couples', 'any']
const VALID_RECURRENCE: FormRecurrence[] = ['ONCE', 'EVERY', 'EVEN', 'ODD']

/**
 * Create an auto-send rule. `therapistId` null makes it platform-wide (admin);
 * a value scopes it to that clinician's own patients (expert). Returns false on
 * bad input or a missing template.
 */
export async function createFormRule(input: {
  templateId: string
  trackSlug: string
  recurrence: FormRecurrence
  sessionNumber?: number | null
  therapistId: string | null
  patientId?: string | null
}): Promise<{ ok: boolean; error?: string }> {
  const track = VALID_TRACKS.includes(input.trackSlug) ? input.trackSlug : 'any'
  const recurrence = VALID_RECURRENCE.includes(input.recurrence) ? input.recurrence : 'ONCE'
  const sessionNumber = recurrence === 'ONCE' ? Math.max(1, Math.round(Number(input.sessionNumber) || 1)) : null
  try {
    await ensureFormRuleSchema()
    const template = await prisma.formTemplate.findUnique({ where: { id: input.templateId }, select: { id: true } })
    if (!template) return { ok: false, error: 'Pick a form.' }
    await prisma.formAutoRule.create({
      data: { templateId: input.templateId, trackSlug: track, recurrence, sessionNumber, therapistId: input.therapistId, patientId: input.patientId || null },
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save the rule.' }
  }
}

/** List rules for a scope: admin passes null (platform rules), an expert passes
 *  their profile id (their own rules). */
export async function listFormRules(therapistId: string | null): Promise<FormAutoRuleRow[]> {
  try {
    await ensureFormRuleSchema()
    const rows = await prisma.formAutoRule.findMany({
      where: { therapistId: therapistId ?? null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, templateId: true, trackSlug: true, recurrence: true, sessionNumber: true, active: true, therapistId: true, patientId: true,
        template: { select: { title: true } },
      },
    })
    // Resolve patient names for the scoped rules in one query.
    const pids = [...new Set(rows.map((r) => r.patientId).filter(Boolean) as string[])]
    const names = pids.length
      ? new Map((await prisma.user.findMany({ where: { id: { in: pids } }, select: { id: true, name: true } })).map((u) => [u.id, u.name]))
      : new Map<string, string | null>()
    return rows.map((r) => ({
      id: r.id,
      templateId: r.templateId,
      templateTitle: r.template?.title ?? 'Form',
      trackSlug: r.trackSlug,
      recurrence: r.recurrence as FormRecurrence,
      sessionNumber: r.sessionNumber,
      active: r.active,
      scope: r.therapistId ? 'MINE' : 'PLATFORM',
      patientId: r.patientId,
      patientName: r.patientId ? (names.get(r.patientId) ?? 'Patient') : null,
    }))
  } catch {
    return []
  }
}

/** Delete a rule, guarded to the scope that owns it (admin: null; expert: theirs). */
export async function deleteFormRule(id: string, therapistId: string | null): Promise<boolean> {
  try {
    await ensureFormRuleSchema()
    const res = await prisma.formAutoRule.deleteMany({ where: { id, therapistId: therapistId ?? null } })
    return res.count > 0
  } catch {
    return false
  }
}

/** Enable/disable a rule, scope-guarded. */
export async function setFormRuleActive(id: string, active: boolean, therapistId: string | null): Promise<boolean> {
  try {
    await ensureFormRuleSchema()
    const res = await prisma.formAutoRule.updateMany({ where: { id, therapistId: therapistId ?? null }, data: { active } })
    return res.count > 0
  } catch {
    return false
  }
}

function ruleFiresOn(recurrence: FormRecurrence, ruleSessionNumber: number | null, sessionNumber: number): boolean {
  switch (recurrence) {
    case 'EVERY': return true
    case 'EVEN': return sessionNumber % 2 === 0
    case 'ODD': return sessionNumber % 2 === 1
    case 'ONCE': return ruleSessionNumber != null && sessionNumber === ruleSessionNumber
    default: return false
  }
}

/**
 * Evaluate auto-send rules after a booking and dispatch any matching forms.
 * `sessionNumber` is this booking's position within the given track (1-based).
 * Applies platform-wide rules plus the booking clinician's own rules. Best-effort
 * and fully guarded: a failure here must never fail the booking. Dedupes by
 * template within this run so a form matched by two rules is sent once.
 */
export async function runBookingFormRules(input: {
  patientId: string
  trackSlug: string
  therapistId: string
  therapistName: string | null
  sessionNumber: number
}): Promise<void> {
  try {
    await ensureFormRuleSchema()
    const rules = await prisma.formAutoRule.findMany({
      where: {
        active: true,
        trackSlug: { in: [input.trackSlug, 'any'] },
        // Platform (therapistId null) OR this clinician's own rules.
        OR: [{ therapistId: null }, { therapistId: input.therapistId }],
        // Applies to all patients (patientId null) OR to this specific patient.
        AND: [{ OR: [{ patientId: null }, { patientId: input.patientId }] }],
      },
      select: { templateId: true, recurrence: true, sessionNumber: true },
    })
    const sendTemplateIds = new Set<string>()
    for (const r of rules) {
      if (ruleFiresOn(r.recurrence as FormRecurrence, r.sessionNumber, input.sessionNumber)) {
        sendTemplateIds.add(r.templateId)
      }
    }
    for (const templateId of sendTemplateIds) {
      await prisma.formAssignment.create({
        data: { templateId, patientId: input.patientId, assignedBy: input.therapistName ?? 'Your care team' },
      }).catch(() => {})
    }
    if (sendTemplateIds.size > 0) {
      await notify(input.patientId, { type: 'form', title: 'New form to fill', body: 'A form was sent for your upcoming session.', href: '/app/forms' })
    }
  } catch {
    /* best-effort — never block a completed booking */
  }
}
