/**
 * The details every member account must carry, and whether a given account has
 * them yet: full name, email, phone, date of birth and gender. Nothing else.
 *
 * Accounts are created by the OTP providers at first sign-in with only a phone
 * or an email. These are asked once, at the moment they matter (just before
 * assessment results, or after choosing a clinician), never at sign-in.
 *
 * This is the single definition of "complete", used both by those gates and to
 * validate the form, so the two can't drift.
 */
import { prisma } from '@/lib/prisma'
import { ensureContactSchema } from '@/lib/contactSchema'

/** What we ask every member for, once: exactly these five, nothing more. */
export type MemberEssentials = {
  name: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null // yyyy-mm-dd
  gender: string | null
}

export type MissingField = 'name' | 'email' | 'phone' | 'dateOfBirth' | 'gender'

export const FIELD_LABEL: Record<MissingField, string> = {
  name: 'Your full name',
  email: 'Your email',
  phone: 'Your phone number',
  dateOfBirth: 'Date of birth',
  gender: 'Gender',
}

export { GENDER_OPTIONS } from '@/lib/memberOnboardingShared'

/** Which of the five are missing. "Prefer not to say" counts as an answer. */
export function missingEssentials(m: MemberEssentials): MissingField[] {
  const out: MissingField[] = []
  if (!m.name?.trim()) out.push('name')
  if (!m.email?.trim()) out.push('email')
  if (!m.phone?.trim()) out.push('phone')
  if (!m.dateOfBirth) out.push('dateOfBirth')
  if (!m.gender?.trim()) out.push('gender')
  return out
}

/** Read the essentials for one member. Null when there is no such user. */
export async function getMemberEssentials(userId: string): Promise<MemberEssentials | null> {
  try {
    await ensureContactSchema().catch(() => {})
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true, patientProfile: { select: { dateOfBirth: true } } },
    })
    if (!user) return null
    // Gender lives on a newer column: read on its own, and if it can't be read
    // treat it as answered, so a database without it never traps anyone here.
    let gender: string | null = 'unknown'
    try {
      const g = await prisma.patientProfile.findUnique({ where: { userId }, select: { gender: true } })
      gender = g?.gender ?? null
    } catch { /* column missing: leave as answered */ }
    return {
      name: user.name ?? '',
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.patientProfile?.dateOfBirth ? user.patientProfile.dateOfBirth.toISOString().slice(0, 10) : null,
      gender,
    }
  } catch {
    // A read failure must not lock someone out, so an unknown state reads as
    // "complete" rather than trapping them on the form.
    return null
  }
}

/** A stable per-member identifier for a profile row created on the fly. */
function newPatientId(): string {
  return `GC-P-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

/**
 * Save the five essentials. Validates server-side against the SAME definition
 * the gate uses, so a partial payload can't skip the form. The email or phone
 * a member signed in with is never overwritten; the other one is added.
 */
export async function saveMemberEssentials(
  userId: string,
  input: { name: string; email?: string | null; phone?: string | null; dateOfBirth: string; gender?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  const name = input.name?.trim().replace(/\s+/g, ' ').slice(0, 80) ?? ''
  const email = input.email?.trim().toLowerCase() || null
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Enter a valid email address.' }
  const phoneDigits = (input.phone ?? '').replace(/[^\d+]/g, '')
  if (phoneDigits && phoneDigits.replace(/\D/g, '').length < 10) return { ok: false, error: 'Enter a valid phone number.' }
  const gender = input.gender?.trim().slice(0, 30) || null

  let dob: Date | null = null
  if (input.dateOfBirth) {
    const d = new Date(input.dateOfBirth)
    if (Number.isNaN(d.getTime()) || d.getTime() > Date.now()) return { ok: false, error: 'Enter a valid date of birth.' }
    dob = d
  }

  try {
    await ensureContactSchema().catch((e) => console.error('[saveMemberEssentials] ensureContactSchema failed', e))
    const existing = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true, email: true } })
    const finalEmail = existing?.email ?? email
    const finalPhone = existing?.phone ?? (phoneDigits || null)
    const gaps = missingEssentials({
      name, email: finalEmail, phone: finalPhone, dateOfBirth: dob ? dob.toISOString().slice(0, 10) : null, gender,
    })
    if (gaps.length > 0) return { ok: false, error: `Still needed: ${gaps.map((g) => FIELD_LABEL[g]).join(', ')}.` }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          ...(!existing?.email && email ? { email } : {}),
          ...(!existing?.phone && phoneDigits ? { phone: phoneDigits.slice(0, 20) } : {}),
        },
      })
    } catch (e) {
      if ((e as { code?: string }).code === 'P2002') {
        return { ok: false, error: 'That email or phone number is already used by another account. Sign in with it instead, or use a different one.' }
      }
      throw e
    }

    await prisma.patientProfile.upsert({
      where: { userId },
      update: { dateOfBirth: dob },
      create: { userId, patientId: newPatientId(), dateOfBirth: dob },
    })
    // Gender is on a newer column, written on its own so a database without it
    // still saves the rest (and the gate then treats it as answered).
    if (gender) {
      await prisma.patientProfile.update({ where: { userId }, data: { gender } }).catch((e) => {
        console.error('[saveMemberEssentials] gender not saved (column missing?)', e)
      })
    }
    return { ok: true }
  } catch (e) {
    console.error('[saveMemberEssentials] failed', e)
    return { ok: false, error: 'Could not save your details. Please try again.' }
  }
}
