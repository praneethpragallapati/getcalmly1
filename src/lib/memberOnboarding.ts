/**
 * The details every member account must carry, and whether a given account has
 * them yet.
 *
 * Accounts are created by the OTP providers at first sign-in, which have only a
 * phone number or an email to go on — so a brand-new member has no name, no date
 * of birth and no emergency contact. Nothing was collecting them: /register
 * gathered them into unbound inputs and then showed "Account created" without
 * saving anything or creating an account.
 *
 * This is the single definition of "complete", used both to gate entry to the
 * dashboard and to validate the form that fills the gap, so the two can't drift.
 */
import { prisma } from '@/lib/prisma'
import { ensureContactSchema } from '@/lib/contactSchema'

/** What we refuse to run a care account without. */
export type MemberEssentials = {
  name: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null // yyyy-mm-dd
  emergencyName: string | null
  emergencyPhone: string | null
}

export type MissingField =
  | 'name' | 'contact' | 'dateOfBirth' | 'emergencyName' | 'emergencyPhone'

export const FIELD_LABEL: Record<MissingField, string> = {
  name: 'Your name',
  contact: 'An email or phone number',
  dateOfBirth: 'Date of birth',
  emergencyName: 'Emergency contact name',
  emergencyPhone: 'Emergency contact number',
}

/**
 * Which essentials are missing. Contact is one requirement, not two: an account
 * signed up by phone has no email and vice versa, and demanding both would lock
 * out everyone who used the other route.
 */
export function missingEssentials(m: MemberEssentials): MissingField[] {
  const out: MissingField[] = []
  if (!m.name?.trim()) out.push('name')
  if (!m.email?.trim() && !m.phone?.trim()) out.push('contact')
  if (!m.dateOfBirth) out.push('dateOfBirth')
  if (!m.emergencyName?.trim()) out.push('emergencyName')
  if (!m.emergencyPhone?.trim()) out.push('emergencyPhone')
  return out
}

/** Read the essentials for one member. Null when there is no such user. */
export async function getMemberEssentials(userId: string): Promise<MemberEssentials | null> {
  try {
    await ensureContactSchema().catch(() => {})
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true, email: true, phone: true,
        patientProfile: { select: { dateOfBirth: true, emergencyName: true, emergencyPhone: true } },
      },
    })
    if (!user) return null
    const p = user.patientProfile
    return {
      name: user.name ?? '',
      email: user.email,
      phone: user.phone,
      dateOfBirth: p?.dateOfBirth ? p.dateOfBirth.toISOString().slice(0, 10) : null,
      emergencyName: p?.emergencyName ?? null,
      emergencyPhone: p?.emergencyPhone ?? null,
    }
  } catch {
    // A read failure must not lock someone out of their own dashboard, so an
    // unknown state reads as "complete" rather than trapping them on the form.
    return null
  }
}

/** Include a field only when the member actually gave one, trimmed to its column width. */
function opt(key: string, value: string | null | undefined, max: number): Record<string, string> {
  const v = value?.trim()
  return v ? { [key]: v.slice(0, max) } : {}
}

/** A stable per-member identifier for a profile row created on the fly. */
function newPatientId(): string {
  return `GC-P-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

/**
 * Save the essentials. Validates server-side against the SAME definition the
 * gate uses, so a member can't skip the form by posting a partial payload.
 */
/**
 * Everything the profile page holds, so signup can capture it once instead of
 * asking again later. Only the fields in `missingEssentials` are required; the
 * rest are collected because a member filling a form at signup is far cheaper
 * than chasing them for an address six weeks in.
 *
 * preferredLanguage is the one with teeth: matchTherapistForTrack scores on it,
 * so collecting it at signup measurably improves the first clinician match
 * rather than just filling a database column.
 */
export type MemberExtras = {
  phone?: string | null
  gender?: string | null
  preferredLanguage?: string | null
  maritalStatus?: string | null
  occupation?: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  postalCode?: string | null
}

export async function saveMemberEssentials(
  userId: string,
  input: {
    name: string
    email?: string | null
    dateOfBirth: string
    emergencyName: string
    emergencyPhone: string
    emergencyRelation?: string | null
  } & MemberExtras,
): Promise<{ ok: boolean; error?: string }> {
  const name = input.name?.trim().replace(/\s+/g, ' ').slice(0, 80) ?? ''
  const email = input.email?.trim().toLowerCase() || null
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Enter a valid email address.' }
  }

  let dob: Date | null = null
  if (input.dateOfBirth) {
    const d = new Date(input.dateOfBirth)
    if (Number.isNaN(d.getTime()) || d.getTime() > Date.now()) {
      return { ok: false, error: 'Enter a valid date of birth.' }
    }
    dob = d
  }

  const emergencyName = input.emergencyName?.trim().slice(0, 80) ?? ''
  const emergencyPhone = input.emergencyPhone?.trim().slice(0, 20) ?? ''

  try {
    await ensureContactSchema().catch((e) => {
      console.error('[saveMemberEssentials] ensureContactSchema failed', e)
    })
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, email: true },
    })
    const gaps = missingEssentials({
      name,
      email: email ?? existing?.email ?? null,
      phone: existing?.phone ?? null,
      dateOfBirth: dob ? dob.toISOString().slice(0, 10) : null,
      emergencyName,
      emergencyPhone,
    })
    if (gaps.length > 0) {
      return { ok: false, error: `Still needed: ${gaps.map((g) => FIELD_LABEL[g]).join(', ')}.` }
    }

    const phone = input.phone?.trim().slice(0, 20) || null
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        ...(email && !existing?.email ? { email } : {}),
        // Only fill a phone we don't already have — never overwrite the number
        // an OTP sign-in proved they control.
        ...(phone && !existing?.phone ? { phone } : {}),
      },
    })
    const core = {
      dateOfBirth: dob,
      emergencyName,
      emergencyPhone,
      ...(input.emergencyRelation?.trim() ? { emergencyRelation: input.emergencyRelation.trim().slice(0, 40) } : {}),
    }
    // The optional extras live on columns added by 0038. They are written in a
    // SECOND statement on purpose: on a database missing those columns, folding
    // them into the upsert below would take the required details down with them
    // — and the required details are what gate entry to the dashboard.
    const extras = {
      ...opt('gender', input.gender, 30),
      ...opt('preferredLanguage', input.preferredLanguage, 40),
      ...opt('maritalStatus', input.maritalStatus, 30),
      ...opt('occupation', input.occupation, 80),
      ...opt('country', input.country, 2),
      ...opt('state', input.state, 60),
      ...opt('city', input.city, 60),
      ...opt('addressLine1', input.addressLine1, 120),
      ...opt('addressLine2', input.addressLine2, 120),
      ...opt('postalCode', input.postalCode, 16),
    }

    await prisma.patientProfile.upsert({
      where: { userId },
      update: core,
      create: { userId, patientId: newPatientId(), ...core },
    })

    if (Object.keys(extras).length > 0) {
      await prisma.patientProfile
        .update({ where: { userId }, data: extras })
        .catch((e) => {
          // Not fatal: they are already through, and the profile page can take
          // these later. Logged so a migration-drift deploy is diagnosable.
          console.error('[saveMemberEssentials] optional profile fields not saved (migration 0038 applied?)', e)
        })
    }
    return { ok: true }
  } catch (e) {
    // A blanket "could not save" hid a missing COLUMN here for as long as this
    // form existed — the failure looked like the member's fault. Log the real
    // reason so it is visible in the server logs, and name the two causes we
    // can actually explain to the person in front of us.
    console.error('[saveMemberEssentials] failed', e)
    const message = e instanceof Error ? e.message : ''
    if (/Unique constraint/i.test(message)) {
      return { ok: false, error: 'That email is already used by another account.' }
    }
    if (/does not exist in the current database/i.test(message)) {
      return {
        ok: false,
        error: 'We can\u2019t save this right now — the account database is mid-upgrade. Please try again shortly.',
      }
    }
    return { ok: false, error: 'Could not save your details. Please try again, or contact support if it keeps happening.' }
  }
}
