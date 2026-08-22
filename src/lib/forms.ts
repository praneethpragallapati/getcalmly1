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
import { fmtIST } from '@/lib/tz'

export type { FormField } from '@/data/forms'

/**
 * Ensure the in-code library exists in the DB (idempotent upsert by slug). Cheap
 * to call before any form operation so the library is always available without a
 * separate seed run.
 */
export async function ensureFormTemplates(): Promise<void> {
  await ensureCustomFormSchema().catch(() => {})
  // Which built-ins someone has edited. Their content is theirs now, so this
  // seeding must not write over it — that overwrite is the entire reason
  // built-in forms used to be read-only, and it is what this list lifts.
  const customised = new Set(
    (await prisma.formTemplate
      .findMany({ where: { customisedAt: { not: null } }, select: { slug: true } })
      .catch(() => [] as { slug: string }[])
    ).map((r) => r.slug),
  )
  for (const t of FORM_TEMPLATES) {
    await prisma.formTemplate.upsert({
      where: { slug: t.slug },
      // An edited built-in keeps everything the editor set. It is still upserted
      // so a deleted row comes back, but nothing already there is touched.
      update: customised.has(t.slug) ? {} : {
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
    // Set when someone edits a built-in form. Its only job is to tell
    // ensureFormTemplates to leave that row alone.
    `ALTER TABLE "FormTemplate" ADD COLUMN IF NOT EXISTS "customisedAt" TIMESTAMP(3)`,
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
  /** A form that ships with the product, as opposed to one someone built. */
  builtIn: boolean
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
 * Normalise builder rows into stored fields. Shared by create and update so a
 * form edited later is validated exactly as it was when first built.
 */
function normalizeFields(
  rows: CustomFormInput['fields'],
): { ok: true; fields: FormField[] } | { ok: false; error: string } {
  const taken = new Set<string>()
  const fields: FormField[] = []
  for (const f of rows ?? []) {
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
  return { ok: true, fields }
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

  const norm = normalizeFields(input.fields)
  if (!norm.ok) return { ok: false, error: norm.error }
  const fields = norm.fields

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
    // Built-in forms are listed now, not filtered out. Hiding them was why a
    // clinician could create a form but never adjust one of the standard ones —
    // they simply were not on the page to open.
    const rows = await prisma.formTemplate.findMany({
      where: ownerId
        ? { OR: [{ createdById: ownerId }, { slug: { in: [...CODE_SLUGS] } }] }
        : {},
      orderBy: { createdAt: 'desc' },
      select: { id: true, slug: true, title: true, kind: true, fields: true, active: true, createdById: true, createdByName: true },
    })
    return rows.map((r) => {
      const builtIn = CODE_SLUGS.has(r.slug)
      return {
        id: r.id,
        title: r.title,
        kind: String(r.kind),
        fieldCount: Array.isArray(r.fields) ? (r.fields as unknown[]).length : 0,
        active: r.active,
        createdByName: r.createdByName ?? null,
        builtIn,
        // An admin owns the shared library. A clinician owns only what they
        // built — they copy a built-in rather than rewriting it for everyone.
        mine: ownerId ? r.createdById === ownerId : true,
      }
    })
  } catch {
    return []
  }
}

/** One custom form with its questions, for viewing or loading into the builder. */
export type CustomFormDetail = {
  id: string
  title: string
  description: string | null
  kind: string
  active: boolean
  mine: boolean
  /** A form that ships with the product. Editable by an admin, copied by a clinician. */
  builtIn: boolean
  /** How many patients have been sent this form — editing a used form is riskier. */
  sentCount: number
  fields: FormField[]
}

/**
 * Read one custom form in full. `ownerId` null = admin (any form); a clinician
 * may read any form in the shared library but only owns their own — `mine` is
 * what gates editing in the UI, and the update below re-checks it server-side.
 */
export async function getFormTemplate(id: string, ownerId: string | null): Promise<CustomFormDetail | null> {
  try {
    await ensureCustomFormSchema()
    const row = await prisma.formTemplate.findUnique({
      where: { id },
      select: {
        id: true, title: true, description: true, kind: true, fields: true, active: true,
        createdById: true, slug: true, _count: { select: { assignments: true } },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      kind: String(row.kind),
      active: row.active,
      builtIn: CODE_SLUGS.has(row.slug),
      // An admin owns the shared library, built-ins included.
      mine: ownerId ? row.createdById === ownerId : true,
      sentCount: row._count.assignments,
      fields: Array.isArray(row.fields) ? (row.fields as unknown as FormField[]) : [],
    }
  } catch {
    return null
  }
}

/**
 * Edit a custom form in place.
 *
 * The slug is deliberately NOT regenerated on a title change: it is the stable
 * handle that already-sent assignments and auto-send rules point at, and
 * rewriting it would orphan them.
 *
 * Field keys are re-derived from the labels, which means renaming a question
 * detaches it from answers already submitted under the old key. That is why a
 * form which has been sent warns before saving rather than silently rewriting
 * history; past responses keep whatever they were filled in with.
 */
export async function updateFormTemplate(
  id: string,
  input: CustomFormInput,
  ownerId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const title = input.title.trim().replace(/\s+/g, ' ').slice(0, 120)
  if (!title) return { ok: false, error: 'Give the form a title.' }

  const norm = normalizeFields(input.fields)
  if (!norm.ok) return { ok: false, error: norm.error }

  const kind = (CUSTOM_FORM_KINDS as readonly string[]).includes(input.kind)
    ? (input.kind as CustomFormKind)
    : 'INFO'

  try {
    await ensureCustomFormSchema()
    const row = await prisma.formTemplate.findUnique({
      where: { id },
      select: { slug: true, createdById: true },
    })
    if (!row) return { ok: false, error: 'That form no longer exists.' }

    const builtIn = CODE_SLUGS.has(row.slug)
    // A built-in belongs to the platform, so only an admin (ownerId null) edits
    // it in place. A clinician copies it instead — see copyFormTemplate. One
    // clinician quietly rewriting a shared consent form for every other
    // clinician is not an edit anyone intended to allow.
    if (builtIn && ownerId) {
      return { ok: false, error: 'This is a standard form. Use “Make my own copy” to change it for your own use.' }
    }
    if (!builtIn && ownerId && row.createdById !== ownerId) {
      return { ok: false, error: 'That form belongs to someone else.' }
    }

    await prisma.formTemplate.update({
      where: { id },
      data: {
        title,
        description: input.description?.trim().slice(0, 500) || null,
        kind,
        fields: norm.fields as unknown as object,
        // Stamped so ensureFormTemplates() stops re-seeding over this row. Only
        // meaningful for built-ins; harmless on a custom form.
        ...(builtIn ? { customisedAt: new Date() } : {}),
      },
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save the form.' }
  }
}

/**
 * Duplicate a form into one the caller owns, so it can be adjusted freely.
 *
 * This is how a clinician changes a standard form: they get their own copy,
 * pre-filled with the original's questions, and the shared version is left
 * exactly as it was for everyone else. It is also useful for starting a new
 * form from an existing one rather than a blank page.
 *
 * Returns the new form's id so the caller can open it in the builder.
 */
export async function copyFormTemplate(
  id: string,
  ownerId: string | null,
  ownerName: string | null,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    await ensureCustomFormSchema()
    const row = await prisma.formTemplate.findUnique({
      where: { id },
      select: { title: true, description: true, kind: true, fields: true },
    })
    if (!row) return { ok: false, error: 'That form no longer exists.' }

    // INTAKE forms are owned by the booking flow (auto-sent, category-matched),
    // so a copy of one is filed as INFO rather than joining that rotation.
    const kind = (CUSTOM_FORM_KINDS as readonly string[]).includes(String(row.kind))
      ? (String(row.kind) as CustomFormKind)
      : 'INFO'
    const fields = Array.isArray(row.fields) ? (row.fields as unknown as FormField[]) : []

    const created = await prisma.formTemplate.create({
      data: {
        slug: `copy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        title: `${row.title} (my copy)`.slice(0, 120),
        description: row.description,
        kind,
        fields: fields as unknown as object,
        createdById: ownerId,
        createdByName: ownerName,
      },
      select: { id: true },
    })
    return { ok: true, id: created.id }
  } catch (e) {
    console.error('[copyFormTemplate] failed', e)
    return { ok: false, error: 'Could not copy that form.' }
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
  /** How many questions it asks — shown next to the form when picking one. */
  fieldCount: number
  /** A form that ships with the product. Editable by an admin, copied by a clinician. */
  builtIn: boolean
  /** Who built it, or null for a built-in. Lets the caller work out `mine`. */
  createdById: string | null
}

/** The forms a clinician can pick from when sending. INTAKE forms are excluded
 * from the on-demand picker (they're auto-sent), leaving consent/info/feedback. */
export async function getFormLibrary(): Promise<LibraryForm[]> {
  try {
    await ensureFormTemplates()
    const rows = await prisma.formTemplate.findMany({
      where: { active: true, kind: { not: 'INTAKE' } },
      orderBy: [{ kind: 'asc' }, { title: 'asc' }],
      select: { id: true, slug: true, title: true, description: true, kind: true, fields: true, createdById: true },
    })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      kind: r.kind,
      fieldCount: Array.isArray(r.fields) ? (r.fields as unknown[]).length : 0,
      builtIn: CODE_SLUGS.has(r.slug),
      createdById: r.createdById ?? null,
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
  return fmtIST(d, { day: 'numeric', month: 'short', year: 'numeric' })
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
