'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateTempPassword } from '@/lib/password'
import { updateEarningsConfig, type EarningsConfigValues } from '@/lib/earningsConfig'

async function requireAdmin(): Promise<{ name: string | null } | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { role?: string; name?: string | null } | undefined
  if (user?.role !== 'ADMIN') return null
  return { name: user.name ?? null }
}

export type AdminResult = { ok: boolean; error?: string }

// ── Create accounts (temp password → forced change on first login) ───────────

export type CreateResult = { ok: boolean; email?: string; tempPassword?: string; error?: string }

const arr = (s?: string): string[] => (s ?? '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 30)
const posInt = (n: unknown): number | null => {
  const v = Number(n)
  return Number.isFinite(v) && v >= 0 ? Math.round(v) : null
}

export type CreateTherapistInput = {
  name: string; email: string; phone?: string
  council?: string; registrationNo: string; yearsExp?: number
  qualifications?: string; languages?: string; specializations?: string; bio?: string
  sessionFee?: number; employmentType?: string
  baseFeeIndividual?: number | ''; baseFeeCouples?: number | ''; baseFeePsychiatry?: number | ''
}

export async function createTherapist(input: CreateTherapistInput): Promise<CreateResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const name = input.name?.trim()
  const email = input.email?.trim().toLowerCase()
  const registrationNo = input.registrationNo?.trim()
  if (!name || !email) return { ok: false, error: 'Name and email are required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Enter a valid email.' }
  if (!registrationNo) return { ok: false, error: 'Registration (RCI/NMC) number is required.' }
  const employmentType = input.employmentType === 'PART_TIME' ? 'PART_TIME' : 'FULL_TIME'

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { ok: false, error: 'An account with that email already exists.' }
    const regTaken = await prisma.therapistProfile.findUnique({ where: { rciNumber: registrationNo } }).catch(() => null)
    if (regTaken) return { ok: false, error: 'That registration number is already in use.' }

    const tempPassword = generateTempPassword()
    await prisma.user.create({
      data: {
        name, email, role: 'THERAPIST', passwordHash: hashPassword(tempPassword), mustChangePassword: true,
        therapistProfile: {
          create: {
            bio: input.bio?.trim() || 'Clinician on GetCalmly.',
            qualifications: arr(input.qualifications),
            yearsExp: posInt(input.yearsExp) ?? 0,
            languages: arr(input.languages),
            specializations: arr(input.specializations),
            rciNumber: registrationNo,
            sessionFee: posInt(input.sessionFee) ?? 0,
            employmentType,
            baseFeeIndividual: input.baseFeeIndividual === '' ? null : posInt(input.baseFeeIndividual),
            baseFeeCouples: input.baseFeeCouples === '' ? null : posInt(input.baseFeeCouples),
            baseFeePsychiatry: input.baseFeePsychiatry === '' ? null : posInt(input.baseFeePsychiatry),
            isVerified: true,
            isActive: true,
          },
        },
      },
    })
    revalidatePath('/admin/therapists'); revalidatePath('/admin')
    return { ok: true, email, tempPassword }
  } catch {
    return { ok: false, error: 'Could not create the clinician account.' }
  }
}

export async function createAdmin(input: { name: string; email: string }): Promise<CreateResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const name = input.name?.trim()
  const email = input.email?.trim().toLowerCase()
  if (!name || !email) return { ok: false, error: 'Name and email are required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Enter a valid email.' }
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { ok: false, error: 'An account with that email already exists.' }
    const tempPassword = generateTempPassword()
    await prisma.user.create({
      data: { name, email, role: 'ADMIN', passwordHash: hashPassword(tempPassword), mustChangePassword: true },
    })
    return { ok: true, email, tempPassword }
  } catch {
    return { ok: false, error: 'Could not create the admin account.' }
  }
}

// ── Submissions triage ──────────────────────────────────────────────────────

const APP_STATUSES = ['APPLIED', 'INTERVIEW_SCHEDULED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const
type AppStatus = (typeof APP_STATUSES)[number]

export async function setApplicationStatus(input: { id: string; status: string; notes?: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  if (!APP_STATUSES.includes(input.status as AppStatus)) return { ok: false, error: 'Invalid status.' }
  try {
    await prisma.therapistApplication.update({
      where: { id: input.id },
      data: { status: input.status as AppStatus, reviewerNotes: input.notes?.trim() || undefined },
    })
    revalidatePath('/admin/submissions')
    revalidatePath('/admin')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the application.' }
  }
}

export async function setContactHandled(input: { id: string; handled: boolean }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.contactMessage.update({ where: { id: input.id }, data: { handled: input.handled } })
    revalidatePath('/admin/submissions'); revalidatePath('/admin')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the message.' }
  }
}

export async function setLeadHandled(input: { id: string; handled: boolean }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.enterpriseLead.update({ where: { id: input.id }, data: { handled: input.handled } })
    revalidatePath('/admin/submissions'); revalidatePath('/admin')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the lead.' }
  }
}

/** Save the editable earnings pay structure. ADMIN only. */
export async function saveEarningsConfig(values: EarningsConfigValues): Promise<AdminResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Admin access required.' }
  try {
    await updateEarningsConfig(values, admin.name)
    revalidatePath('/admin/earnings')
    revalidatePath('/expert/earnings')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save the configuration.' }
  }
}

// ── Supervision assignments (admin-only) ────────────────────────────────────
// Only admins may assign or de-assign a doctor to a supervising doctor.

export async function assignSupervisionAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return
  const supervisorId = String(formData.get('supervisorId') ?? '')
  const superviseeId = String(formData.get('superviseeId') ?? '')
  const { adminAssignSupervision } = await import('@/lib/expert')
  await adminAssignSupervision(supervisorId, superviseeId)
  revalidatePath('/admin/supervision')
  revalidatePath('/expert/supervision')
}

export async function removeSupervisionAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return
  const linkId = String(formData.get('linkId') ?? '')
  if (!linkId) return
  const { adminRemoveSupervision } = await import('@/lib/expert')
  await adminRemoveSupervision(linkId)
  revalidatePath('/admin/supervision')
  revalidatePath('/expert/supervision')
}

// ── Employment type (admin-only) ────────────────────────────────────────────
// Full-time (salaried) vs part-time (per-session). Gates the earnings ledger.

export async function setEmploymentTypeAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return
  const profileId = String(formData.get('profileId') ?? '')
  const employmentType = String(formData.get('employmentType') ?? '')
  if (employmentType !== 'FULL_TIME' && employmentType !== 'PART_TIME') return
  const { adminSetEmploymentType } = await import('@/lib/expert')
  await adminSetEmploymentType(profileId, employmentType)
  revalidatePath('/admin/therapists')
  revalidatePath('/expert/profile')
  revalidatePath('/expert/earnings')
  revalidatePath('/expert')
}
