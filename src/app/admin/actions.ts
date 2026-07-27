'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateEarningsConfig, type EarningsConfigValues } from '@/lib/earningsConfig'

async function requireAdmin(): Promise<{ name: string | null } | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { role?: string; name?: string | null } | undefined
  if (user?.role !== 'ADMIN') return null
  return { name: user.name ?? null }
}

export type AdminResult = { ok: boolean; error?: string }

// ── Submissions triage ──────────────────────────────────────────────────────

const APP_STATUSES = ['APPLIED', 'INTERVIEW_SCHEDULED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const
type AppStatus = (typeof APP_STATUSES)[number]

export async function setApplicationStatus(input: { id: string; status: string; notes?: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  if (!APP_STATUSES.includes(input.status as AppStatus)) return { ok: false, error: 'Invalid status.' }
  const { prisma } = await import('@/lib/prisma')
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
  const { prisma } = await import('@/lib/prisma')
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
  const { prisma } = await import('@/lib/prisma')
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
