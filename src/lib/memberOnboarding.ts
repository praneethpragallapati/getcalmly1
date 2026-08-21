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

/** A stable per-member identifier for a profile row created on the fly. */
function newPatientId(): string {
  return `GC-P-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

/**
 * Save the essentials. Validates server-side against the SAME definition the
 * gate uses, so a member can't skip the form by posting a partial payload.
 */
export async function saveMemberEssentials(
  userId: string,
  input: {
    name: string
    email?: string | null
    dateOfBirth: string
    emergencyName: string
    emergencyPhone: string
    emergencyRelation?: string | null
  },
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

    await prisma.user.update({
      where: { id: userId },
      data: { name, ...(email && !existing?.email ? { email } : {}) },
    })
    await prisma.patientProfile.upsert({
      where: { userId },
      update: {
        dateOfBirth: dob,
        emergencyName,
        emergencyPhone,
        ...(input.emergencyRelation?.trim() ? { emergencyRelation: input.emergencyRelation.trim().slice(0, 40) } : {}),
      },
      create: {
        userId,
        patientId: newPatientId(),
        dateOfBirth: dob,
        emergencyName,
        emergencyPhone,
        ...(input.emergencyRelation?.trim() ? { emergencyRelation: input.emergencyRelation.trim().slice(0, 40) } : {}),
      },
    })
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
