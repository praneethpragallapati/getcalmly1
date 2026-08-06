'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateTempPassword } from '@/lib/password'
import { getEarningsConfig } from '@/lib/earningsConfig'
import { updatePricingConfig } from '@/lib/pricingConfig'
import type { PricingValues } from '@/data/pricing'
import { normalizeFrequency, normalizeTimesOfDay } from '@/lib/taskRecurrence'

async function requireAdmin(): Promise<{ id: string | null; name: string | null } | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; role?: string; name?: string | null } | undefined
  if (user?.role !== 'ADMIN') return null
  return { id: user.id ?? null, name: user.name ?? null }
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
  gender?: string; clinicianType?: string
  employmentType?: string
  baseFeeIndividual?: number | ''; baseFeeCouples?: number | ''; baseFeePsychiatry?: number | ''
  secondSessionBonus?: number | ''; thirdOnwardsBonus?: number | ''; miscBonus?: number | ''; nightSessionBonus?: number | ''
  documentUrls?: string[]
}

export async function createTherapist(input: CreateTherapistInput): Promise<CreateResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const name = input.name?.trim()
  const email = input.email?.trim().toLowerCase()
  const council = (input.council ?? '').trim()
  const registrationNo = input.registrationNo?.trim()
  if (!name || !email) return { ok: false, error: 'Name and email are required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Enter a valid email.' }
  // Registration is required unless the clinician is on no council ("None").
  const councilNone = council === '' || council.toLowerCase() === 'none'
  if (!councilNone && !registrationNo) return { ok: false, error: 'Registration (RCI/NMC) number is required.' }
  const employmentType = input.employmentType === 'PART_TIME' ? 'PART_TIME' : 'FULL_TIME'
  // rciNumber is unique + non-null; when there's no council, store a unique sentinel.
  const regValue = registrationNo || `NONE-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { ok: false, error: 'An account with that email already exists.' }
    if (registrationNo) {
      const regTaken = await prisma.therapistProfile.findUnique({ where: { rciNumber: registrationNo } }).catch(() => null)
      if (regTaken) return { ok: false, error: 'That registration number is already in use.' }
    }

    // Default the (internal) session fee to the clinician's individual base fee,
    // falling back to the platform default — there is no separate "standard fee".
    const cfg = await getEarningsConfig()
    const feeInd = input.baseFeeIndividual === '' ? null : posInt(input.baseFeeIndividual)
    const sessionFee = feeInd ?? cfg.baseFeeIndividual
    const ov = (v: number | '' | undefined) => (v === '' || v === undefined ? null : posInt(v))
    const docs = (input.documentUrls ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 12)

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
            gender: input.gender?.trim() || null,
            clinicianType: input.clinicianType?.trim() || 'Therapist',
            rciNumber: regValue,
            sessionFee,
            employmentType,
            baseFeeIndividual: feeInd,
            baseFeeCouples: ov(input.baseFeeCouples),
            baseFeePsychiatry: ov(input.baseFeePsychiatry),
            secondSessionBonus: ov(input.secondSessionBonus),
            thirdOnwardsBonus: ov(input.thirdOnwardsBonus),
            miscBonus: ov(input.miscBonus),
            nightSessionBonus: ov(input.nightSessionBonus),
            documentUrls: docs,
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

// ── Clinician management ──────────────────────────────────────────────────────

export type TherapistSettingsInput = {
  profileId: string
  employmentType?: string
  isActive?: boolean; isVerified?: boolean
  baseFeeIndividual?: number | ''; baseFeeCouples?: number | ''; baseFeePsychiatry?: number | ''
  secondSessionBonus?: number | ''; thirdOnwardsBonus?: number | ''; miscBonus?: number | ''; nightSessionBonus?: number | ''
}

export async function updateTherapistSettings(input: TherapistSettingsInput): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const override = (v: number | '' | undefined): number | null | undefined =>
    v === undefined ? undefined : v === '' ? null : posInt(v)
  try {
    // The internal session fee tracks the individual base fee (no separate
    // "standard fee" concept): when a base is set, mirror it; when cleared,
    // fall back to the platform default so appointment.fee always has a value.
    const feeInd = override(input.baseFeeIndividual)
    const cfg = feeInd === null ? await getEarningsConfig() : null
    const sessionFee = feeInd === undefined ? undefined : feeInd ?? cfg!.baseFeeIndividual
    await prisma.therapistProfile.update({
      where: { id: input.profileId },
      data: {
        sessionFee,
        employmentType: input.employmentType === 'PART_TIME' ? 'PART_TIME' : input.employmentType === 'FULL_TIME' ? 'FULL_TIME' : undefined,
        isActive: input.isActive,
        isVerified: input.isVerified,
        // rating + totalReviews are derived from patient reviews, never hand-set.
        baseFeeIndividual: feeInd,
        baseFeeCouples: override(input.baseFeeCouples),
        baseFeePsychiatry: override(input.baseFeePsychiatry),
        secondSessionBonus: override(input.secondSessionBonus),
        thirdOnwardsBonus: override(input.thirdOnwardsBonus),
        miscBonus: override(input.miscBonus),
        nightSessionBonus: override(input.nightSessionBonus),
      },
    })
    revalidatePath(`/admin/therapists/${input.profileId}`); revalidatePath('/admin/therapists'); revalidatePath('/expert/earnings')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the clinician.' }
  }
}

export async function assignSupervisor(input: { superviseeId: string; supervisorId: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  if (input.superviseeId === input.supervisorId) return { ok: false, error: 'A clinician cannot supervise themselves.' }
  try {
    await prisma.supervisionLink.upsert({
      where: { supervisorId_superviseeId: { supervisorId: input.supervisorId, superviseeId: input.superviseeId } },
      update: {}, create: { supervisorId: input.supervisorId, superviseeId: input.superviseeId },
    })
    revalidatePath(`/admin/therapists/${input.superviseeId}`); revalidatePath('/admin/supervision')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not assign the supervisor.' }
  }
}

export async function removeSupervisionLink(input: { linkId: string; profileId: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.supervisionLink.delete({ where: { id: input.linkId } })
    revalidatePath(`/admin/therapists/${input.profileId}`); revalidatePath('/admin/supervision')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not remove the link.' }
  }
}

// ── Patient assignment & subscriptions ─────────────────────────────────────────

export async function reassignPatient(input: { userId: string; therapistProfileId: string | null }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.patientProfile.update({
      where: { userId: input.userId },
      data: { assignedTherapistId: input.therapistProfileId || null },
    })
    revalidatePath(`/admin/patients/${input.userId}`)
    revalidatePath('/app/therapist'); revalidatePath('/app')
    revalidatePath('/expert'); revalidatePath('/expert/patients')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not reassign. The patient may not have a profile yet.' }
  }
}

const CATEGORY_COLUMN = {
  individual: 'assignedTherapistIndividualId',
  couples: 'assignedTherapistCouplesId',
  psychiatry: 'assignedTherapistPsychiatryId',
} as const

/** Assign the clinician a patient sees for a specific care type. */
export async function assignCategoryClinician(input: { userId: string; category: keyof typeof CATEGORY_COLUMN; therapistProfileId: string | null }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const column = CATEGORY_COLUMN[input.category]
  if (!column) return { ok: false, error: 'Unknown care type.' }
  const TRACKS: Record<keyof typeof CATEGORY_COLUMN, string> = { individual: 'therapy', couples: 'couples', psychiatry: 'psychiatry' }
  try {
    await prisma.patientProfile.update({
      where: { userId: input.userId },
      data: { [column]: input.therapistProfileId || null },
    })
    // Keep the package's attached expert in sync with the per-type assignment so
    // both the admin package view and the patient's Care Team show the same
    // clinician (they read different fields).
    await prisma.subscription.updateMany({
      where: { userId: input.userId, trackSlug: TRACKS[input.category], status: 'ACTIVE' },
      data: { therapistId: input.therapistProfileId || null },
    })
    revalidatePath(`/admin/patients/${input.userId}`)
    revalidatePath('/app/therapist')
    revalidatePath('/app')
    // The (un)assigned clinician's own caseload changed too.
    revalidatePath('/expert')
    revalidatePath('/expert/patients')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update. The patient may not have a profile yet.' }
  }
}

export async function cancelSubscription(input: { id: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.subscription.update({ where: { id: input.id }, data: { status: 'CANCELLED' } })
    revalidatePath('/admin/patients')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not cancel the subscription.' }
  }
}

// ── Delete accounts (hard delete) ────────────────────────────────────────────
// Some child rows don't cascade on a User delete (MoodEntry, JournalEntry, and
// Appointment), so they're removed explicitly first, inside a transaction, so
// the whole thing is atomic — a failure rolls everything back rather than
// leaving a half-deleted account.

async function eraseUserData(userId: string, therapistProfileId: string | null): Promise<void> {
  await prisma.$transaction([
    prisma.moodEntry.deleteMany({ where: { userId } }),
    prisma.journalEntry.deleteMany({ where: { userId } }),
    prisma.appointment.deleteMany({ where: { patientId: userId } }),
    // Deleting the profile cascades availability, exceptions, supervision links
    // and reviews, and nulls it out on any package it was attached to.
    ...(therapistProfileId ? [prisma.therapistProfile.delete({ where: { id: therapistProfileId } })] : []),
    // The user delete cascades everything else that IS wired to cascade.
    prisma.user.delete({ where: { id: userId } }),
  ])
}

/** Permanently delete a patient and all their data. */
export async function deletePatient(input: { userId: string }): Promise<AdminResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Admin access required.' }
  if (admin.id === input.userId) return { ok: false, error: 'You can’t delete your own account.' }
  try {
    const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { role: true } })
    if (!user) return { ok: false, error: 'Account not found.' }
    if (user.role !== 'PATIENT') return { ok: false, error: 'This account isn’t a patient.' }
    await eraseUserData(input.userId, null)
    revalidatePath('/admin/patients')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not delete this patient. Please try again.' }
  }
}

/** Permanently delete a clinician. Blocked while they have session history so
 *  patient records aren't destroyed — deactivate the clinician instead. */
export async function deleteClinician(input: { userId: string }): Promise<AdminResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Admin access required.' }
  if (admin.id === input.userId) return { ok: false, error: 'You can’t delete your own account.' }
  try {
    const profile = await prisma.therapistProfile.findUnique({ where: { userId: input.userId }, select: { id: true } })
    if (!profile) return { ok: false, error: 'No clinician profile found for this account.' }
    const apptCount = await prisma.appointment.count({ where: { therapistId: profile.id } })
    if (apptCount > 0) {
      return { ok: false, error: `This clinician has ${apptCount} session${apptCount === 1 ? '' : 's'} on record. Deactivate them instead so patient history is preserved.` }
    }
    await eraseUserData(input.userId, profile.id)
    revalidatePath('/admin/therapists')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not delete this clinician. Please try again.' }
  }
}

const TRACK_TO_CATEGORY: Record<string, 'INDIVIDUAL' | 'COUPLE' | 'KIDS'> = { couples: 'COUPLE', child: 'KIDS' }
const TRACK_PLAN_NAME: Record<string, string> = { therapy: 'Individual therapy', couples: 'Couples therapy', psychiatry: 'Psychiatry' }
function addMonths(from: Date, months: number): Date { const d = new Date(from); d.setMonth(d.getMonth() + months); return d }

/**
 * Grant or top up a package of a specific type for a patient, with validity.
 * If an active package of that type exists it adds sessions and extends validity;
 * otherwise it creates one. `sessions` may be negative to remove sessions
 * (never below the number already used).
 */
export async function grantSessionsByType(input: { userId: string; trackSlug: string; sessions: number; validityMonths?: number }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const track = String(input.trackSlug || '').trim()
  const delta = Math.round(Number(input.sessions) || 0)
  const months = Math.max(0, Math.round(Number(input.validityMonths) || 0))
  if (!track) return { ok: false, error: 'Pick a package type.' }
  try {
    const existing = await prisma.subscription.findFirst({
      where: { userId: input.userId, status: 'ACTIVE', trackSlug: track },
      orderBy: { createdAt: 'desc' },
    })
    const now = new Date()
    if (existing) {
      const nextTotal = Math.max(existing.sessionsUsed, existing.sessionsTotal + delta)
      const base = existing.expiresAt && existing.expiresAt > now ? existing.expiresAt : now
      await prisma.subscription.update({
        where: { id: existing.id },
        data: { sessionsTotal: nextTotal, ...(months > 0 ? { expiresAt: addMonths(base, months), renewsAt: addMonths(base, months) } : {}) },
      })
    } else {
      if (delta <= 0) return { ok: false, error: 'No package of that type to remove sessions from.' }
      const expiresAt = months > 0 ? addMonths(now, months) : null
      await prisma.subscription.create({
        data: {
          userId: input.userId,
          category: TRACK_TO_CATEGORY[track] ?? 'INDIVIDUAL',
          trackSlug: track,
          planName: `${TRACK_PLAN_NAME[track] ?? track} (admin)`,
          sessionsTotal: delta,
          sessionsUsed: 0,
          status: 'ACTIVE',
          expiresAt,
          renewsAt: expiresAt,
        },
      })
    }
    revalidatePath(`/admin/patients/${input.userId}`)
    revalidatePath('/app/therapist'); revalidatePath('/app/billing')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the package.' }
  }
}

/** Extend (or set) a package's validity by a number of months from today or its current expiry. */
export async function extendValidity(input: { id: string; months: number }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const months = Math.round(Number(input.months) || 0)
  if (!months) return { ok: false, error: 'Enter a number of months.' }
  try {
    const sub = await prisma.subscription.findUnique({ where: { id: input.id }, select: { expiresAt: true } })
    if (!sub) return { ok: false, error: 'Package not found.' }
    const now = new Date()
    const base = sub.expiresAt && sub.expiresAt > now ? sub.expiresAt : now
    const expiresAt = addMonths(base, months)
    await prisma.subscription.update({ where: { id: input.id }, data: { expiresAt, renewsAt: expiresAt } })
    revalidatePath('/admin/patients'); revalidatePath('/app/therapist'); revalidatePath('/app/billing')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update validity.' }
  }
}

/** Attach (or detach) the expert who delivers a specific package. */
export async function attachSubscriptionExpert(input: { id: string; therapistProfileId: string | null }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.subscription.update({
      where: { id: input.id },
      data: { therapistId: input.therapistProfileId || null },
    })
    revalidatePath('/admin/patients')
    revalidatePath('/app/therapist'); revalidatePath('/app')
    revalidatePath('/expert'); revalidatePath('/expert/patients')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not attach the expert to this package.' }
  }
}

/** Adjust a package's total sessions by delta (+ to add, − to remove). Won't go below sessionsUsed. */
export async function adjustSessionsTotal(input: { id: string; delta: number }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    const sub = await prisma.subscription.findUnique({ where: { id: input.id }, select: { sessionsTotal: true, sessionsUsed: true } })
    if (!sub) return { ok: false, error: 'Package not found.' }
    const next = Math.max(sub.sessionsUsed, sub.sessionsTotal + Math.round(input.delta))
    await prisma.subscription.update({ where: { id: input.id }, data: { sessionsTotal: next } })
    revalidatePath('/admin/patients')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the package.' }
  }
}

/**
 * Adjust sessions *used* by delta. Used to credit back a session the patient
 * says never happened (delta −1), or to correct an under-count (delta +1).
 */
export async function adjustSessionsUsed(input: { id: string; delta: number }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    const sub = await prisma.subscription.findUnique({ where: { id: input.id }, select: { sessionsTotal: true, sessionsUsed: true } })
    if (!sub) return { ok: false, error: 'Package not found.' }
    const next = Math.max(0, Math.min(sub.sessionsTotal, sub.sessionsUsed + Math.round(input.delta)))
    await prisma.subscription.update({ where: { id: input.id }, data: { sessionsUsed: next } })
    revalidatePath('/admin/patients')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the package.' }
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

/** Save the editable customer-facing pricing. ADMIN only. */
export async function savePricingConfig(values: PricingValues): Promise<AdminResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Admin access required.' }
  try {
    await updatePricingConfig(values, admin.name)
    // Pricing shows on the public marketing pages and the in-app buy flow.
    revalidatePath('/admin/pricing')
    revalidatePath('/pricing')
    revalidatePath('/terms')
    revalidatePath('/app/billing')
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

// ── Safety: crisis oversight ─────────────────────────────────────────────────

export async function resolveCrisis(input: { id: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.crisisAlert.update({ where: { id: input.id }, data: { resolved: true } })
    revalidatePath('/admin/safety'); revalidatePath('/admin')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not resolve the alert.' } }
}

// ── Operations: appointments ─────────────────────────────────────────────────

const APPT_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'] as const
type ApptStatus = (typeof APPT_STATUSES)[number]

export async function reassignAppointment(input: { id: string; therapistProfileId: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.appointment.update({ where: { id: input.id }, data: { therapistId: input.therapistProfileId } })
    revalidatePath('/admin/operations')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not reassign the session.' } }
}

export async function setAppointmentStatusAdmin(input: { id: string; status: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  if (!APPT_STATUSES.includes(input.status as ApptStatus)) return { ok: false, error: 'Invalid status.' }
  try {
    await prisma.appointment.update({ where: { id: input.id }, data: { status: input.status as ApptStatus } })
    revalidatePath('/admin/operations')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not update the session.' } }
}

/**
 * Void a session the clinician was credited for but shouldn't be paid for — e.g.
 * the patient reports the clinician never joined. Cancels the appointment and
 * clears its summary so it drops out of earnings, records the reason, and
 * (optionally) credits the patient back a session on their latest plan.
 */
export async function voidSession(input: { appointmentId: string; reason?: string; creditPatient?: boolean }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    const appt = await prisma.appointment.findUnique({ where: { id: input.appointmentId }, select: { id: true, patientId: true, notes: true, consumedSubscriptionId: true } })
    if (!appt) return { ok: false, error: 'Session not found.' }
    const reason = (input.reason ?? '').trim()
    const stamp = `[Voided ${new Date().toISOString().slice(0, 10)}${reason ? `: ${reason}` : ''}]`
    // CANCELLED + no summary → never counts toward clinician pay. Null out the
    // consumed link so a second void can't double-credit the same session.
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { status: 'CANCELLED', summary: null, notes: appt.notes ? `${appt.notes}\n${stamp}` : stamp, consumedSubscriptionId: null },
    })
    if (input.creditPatient) {
      // Credit back the EXACT package the session drew from (not "most recent",
      // which could refund a therapy pack for a voided psychiatry session), with
      // an atomic guarded decrement. Legacy appointments without a consumed link
      // fall back to the patient's most recent active package, best-effort.
      if (appt.consumedSubscriptionId) {
        await prisma.subscription.updateMany({
          where: { id: appt.consumedSubscriptionId, sessionsUsed: { gt: 0 } },
          data: { sessionsUsed: { decrement: 1 } },
        })
      } else {
        const sub = await prisma.subscription.findFirst({ where: { userId: appt.patientId, status: 'ACTIVE', sessionsUsed: { gt: 0 } }, orderBy: { createdAt: 'desc' }, select: { id: true } })
        if (sub) await prisma.subscription.updateMany({ where: { id: sub.id, sessionsUsed: { gt: 0 } }, data: { sessionsUsed: { decrement: 1 } } })
      }
    }
    revalidatePath('/admin/therapists'); revalidatePath('/admin/operations'); revalidatePath('/admin/money')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not void the session.' } }
}

// ── Content moderation + admin authoring ─────────────────────────────────────

// Byline used for admin-authored content, so it reads as the platform team.
const ADMIN_BYLINE = 'GetCalmly Team'
const ADMIN_ROLE_LABEL = 'GetCalmly Team'

function adminSlugify(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60)
  return `${base || 'post'}-${Math.random().toString(36).slice(2, 7)}`
}
function adminReadTime(paragraphs: string[]): string {
  const words = paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}
// Accept an https URL or a modestly-sized inline data image, same as blog covers.
function adminCleanCover(cover?: string | null): string | null {
  const c = (cover ?? '').trim()
  if (!c || c.length > 1_500_000) return null
  return /^(https?:\/\/|data:image\/)/i.test(c) ? c : null
}

/** Publish a blog post under the GetCalmly Team byline (admin authoring). */
export async function createAdminBlogPost(input: {
  title: string; excerpt?: string; body: string; tags?: string; coverImage?: string
}): Promise<AdminResult & { slug?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Admin access required.' }
  const title = input.title?.trim()
  const body = input.body?.trim()
  if (!title || !body) return { ok: false, error: 'Add a title and body.' }
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  if (paragraphs.length === 0) return { ok: false, error: 'Add some body text.' }
  const excerpt = (input.excerpt?.trim() || paragraphs[0]).slice(0, 280)
  const tags = arr(input.tags).slice(0, 6)
  try {
    const post = await prisma.blogPost.create({
      data: {
        slug: adminSlugify(title),
        title, excerpt, content: paragraphs,
        authorId: admin.id ?? undefined,
        authorName: admin.name || ADMIN_BYLINE,
        authorRole: ADMIN_ROLE_LABEL,
        tags,
        coverImage: adminCleanCover(input.coverImage),
        readTime: adminReadTime(paragraphs),
        published: true,
      },
    })
    revalidatePath('/admin/content'); revalidatePath('/blog'); revalidatePath(`/blog/${post.slug}`)
    return { ok: true, slug: post.slug }
  } catch { return { ok: false, error: 'Could not publish the post.' } }
}

/** Start a community discussion carrying the ADMIN badge (admin authoring). */
export async function createAdminCommunityPost(input: {
  title: string; body: string; tags?: string
}): Promise<AdminResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Admin access required.' }
  const title = input.title?.trim()
  const body = input.body?.trim()
  if (!title || !body) return { ok: false, error: 'Add a title and a message.' }
  try {
    await prisma.communityPost.create({
      data: {
        title, body,
        authorId: admin.id ?? undefined,
        authorName: admin.name || ADMIN_BYLINE,
        authorRole: 'ADMIN',
        tags: arr(input.tags).slice(0, 6),
      },
    })
    revalidatePath('/admin/content'); revalidatePath('/community'); revalidatePath('/app/community')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not post the discussion.' } }
}

export async function setBlogPublished(input: { slug: string; published: boolean }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.blogPost.update({ where: { slug: input.slug }, data: { published: input.published } })
    revalidatePath('/admin/content'); revalidatePath('/blog'); revalidatePath(`/blog/${input.slug}`)
    return { ok: true }
  } catch { return { ok: false, error: 'Could not update the post.' } }
}

export async function deleteBlogPost(input: { slug: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.blogPost.delete({ where: { slug: input.slug } })
    revalidatePath('/admin/content'); revalidatePath('/blog')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not delete the post.' } }
}

export async function deleteCommunityPost(input: { id: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.communityPost.delete({ where: { id: input.id } })
    revalidatePath('/admin/content'); revalidatePath('/community'); revalidatePath('/app/community')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not delete the discussion.' } }
}

export async function deleteCommunityComment(input: { id: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.communityComment.delete({ where: { id: input.id } })
    revalidatePath('/admin/content'); revalidatePath('/community')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not delete the reply.' } }
}

// ── Config: forms library + announcements ────────────────────────────────────

export async function setFormActive(input: { id: string; active: boolean }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.formTemplate.update({ where: { id: input.id }, data: { active: input.active } })
    revalidatePath('/admin/config')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not update the form.' } }
}

export async function broadcastAnnouncement(input: { audience: 'ALL' | 'PATIENT' | 'THERAPIST'; title: string; body?: string; href?: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const title = input.title?.trim()
  if (!title) return { ok: false, error: 'Add a title.' }
  try {
    const where = input.audience === 'ALL' ? {} : { role: input.audience }
    const users = await prisma.user.findMany({ where, select: { id: true }, take: 5000 })
    if (users.length === 0) return { ok: false, error: 'No recipients found.' }
    await prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, type: 'announcement', title, body: input.body?.trim() || null, href: input.href?.trim() || null })),
    })
    return { ok: true }
  } catch { return { ok: false, error: 'Could not send the announcement.' } }
}

// ── Admin → therapist tasks ──────────────────────────────────────────────────
// Admins assign work tasks to a clinician in the same shape therapists use for
// patients: frequency, time(s) of day, and an expiry. The task is stored on the
// Task table against the therapist's own User id, and surfaces in their portal.

/** Assign a task to a therapist. `profileId` is only used to revalidate the page. */
export async function assignTherapistTask(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return

  const therapistUserId = String(formData.get('therapistUserId') ?? '')
  const profileId = String(formData.get('profileId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  if (!therapistUserId || !title) return

  // Only ever target an actual clinician account.
  const target = await prisma.user.findUnique({ where: { id: therapistUserId }, select: { role: true } })
  if (!target || target.role !== 'THERAPIST') return

  const description = String(formData.get('description') ?? '').trim()
  const dueRaw = String(formData.get('dueDate') ?? '').trim()
  const dueDate = dueRaw ? new Date(dueRaw) : null
  const frequency = normalizeFrequency(String(formData.get('frequency') ?? ''))
  const timesOfDay = normalizeTimesOfDay(formData.getAll('timesOfDay').map(String))

  await prisma.task.create({
    data: {
      userId: therapistUserId,
      type: 'REFLECTION',
      title,
      description: description || null,
      frequency: frequency === 'ONE_TIME' ? null : frequency,
      timesOfDay,
      dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
      assignedBy: admin.name ?? 'Admin',
      assignedById: admin.id,
    },
  })

  if (profileId) revalidatePath(`/admin/therapists/${profileId}`)
  revalidatePath('/expert')
}

/** Remove a task an admin assigned to a therapist. */
export async function deleteTherapistTask(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return
  const taskId = String(formData.get('taskId') ?? '')
  const profileId = String(formData.get('profileId') ?? '')
  if (!taskId || !admin.id) return
  // Only delete admin-assigned tasks (assignedById set to a real admin), never a
  // therapist's patient-facing ones.
  await prisma.task.deleteMany({ where: { id: taskId, assignedById: admin.id } })
  if (profileId) revalidatePath(`/admin/therapists/${profileId}`)
  revalidatePath('/expert')
}
