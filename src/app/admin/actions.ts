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
import { reassignAwayFromTherapist, cancelUpcomingWithTherapist } from '@/lib/reassign'
import { parseCompensationFields, type CompensationField } from '@/lib/compensation'
import { revokeReferral, revokeReferralForPayment, ensureReferralSchema } from '@/lib/referral'
import {
  createFormRule, deleteFormRule, setFormRuleActive, createFormTemplate, deleteFormTemplate,
  type FormRecurrence, type CustomFormInput,
} from '@/lib/forms'
import { notify, notifyMany, markAllRead } from '@/lib/notifications'
import { ensureBlogReviewSchema } from '@/lib/expert'
import { ensurePollSchema } from '@/lib/polls'

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
      const regTaken = await prisma.therapistProfile
        .findUnique({ where: { rciNumber: registrationNo }, select: { id: true } })
        .catch(() => null)
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
    // Deactivating a clinician: move their patients onto a new fit clinician and
    // cancel every upcoming session (restoring the sessions to patients' wallets),
    // so no one is left booked with someone who's no longer practising. Runs after
    // the isActive=false write above so the re-matcher can't re-pick them.
    if (input.isActive === false) {
      await reassignAwayFromTherapist(input.profileId)
      revalidatePath('/app'); revalidatePath('/app/therapist'); revalidatePath('/app/sessions')
      revalidatePath('/expert'); revalidatePath('/expert/patients'); revalidatePath('/expert/schedule')
      revalidatePath('/admin/patients'); revalidatePath('/admin/operations')
    }
    revalidatePath(`/admin/therapists/${input.profileId}`); revalidatePath('/admin/therapists'); revalidatePath('/expert/earnings')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the clinician.' }
  }
}

/**
 * Save the admin-defined compensation fields shown to a full-time clinician on
 * their Earnings tab. Each field is a free-text value or a dropdown (options +
 * chosen value). Stored as JSON on the profile; read-only to the clinician.
 */
export async function saveCompensationFields(input: { profileId: string; fields: CompensationField[] }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    const clean = parseCompensationFields(input.fields)
    await prisma.therapistProfile.update({
      where: { id: input.profileId },
      data: { compensationFields: clean as unknown as object },
    })
    revalidatePath(`/admin/therapists/${input.profileId}`)
    revalidatePath('/expert/earnings')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save the compensation fields.' }
  }
}

/** Create a Calm Club poll: a question, 2–8 options and an optional expiry. */
export async function createPoll(input: { question: string; options: string[]; expiresAt?: string | null; multiple?: boolean }): Promise<AdminResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Admin access required.' }
  const question = (input.question ?? '').trim().slice(0, 200)
  const options = (input.options ?? []).map((o) => o.trim()).filter(Boolean).slice(0, 8)
  if (!question) return { ok: false, error: 'Add a question.' }
  if (options.length < 2) return { ok: false, error: 'Add at least two options.' }
  let expiresAt: Date | null = null
  if (input.expiresAt) {
    const d = new Date(input.expiresAt)
    if (!Number.isNaN(d.getTime())) expiresAt = d
  }
  try {
    await ensurePollSchema()
    await prisma.poll.create({ data: { question, options, expiresAt, multiple: Boolean(input.multiple), createdBy: admin.id ?? null } })
    // Notify patients there's a new poll to vote on (Others tab).
    const patients = await prisma.user.findMany({ where: { role: 'PATIENT' }, select: { id: true }, take: 5000 }).catch(() => [])
    await notifyMany(patients.map((p) => p.id), { type: 'poll', title: 'New poll in the community', body: question, href: '/app/community' })
    revalidatePath('/admin/content'); revalidatePath('/app/community'); revalidatePath('/community')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not create the poll.' }
  }
}

/** Pin or unpin a poll so it sorts to the top of the members' Polls tab. */
export async function togglePollPin(input: { id: string; pinned: boolean }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.poll.update({ where: { id: input.id }, data: { pinned: input.pinned } })
    revalidatePath('/admin/content'); revalidatePath('/app/polls'); revalidatePath('/community')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the poll.' }
  }
}

/** Delete a poll and its votes. */
export async function deletePoll(input: { id: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.poll.delete({ where: { id: input.id } })
    revalidatePath('/admin/content'); revalidatePath('/app/community'); revalidatePath('/community')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not delete the poll.' }
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
    const before = await prisma.patientProfile.findUnique({ where: { userId: input.userId }, select: { assignedTherapistId: true } })
    await prisma.patientProfile.update({
      where: { userId: input.userId },
      data: { assignedTherapistId: input.therapistProfileId || null },
    })
    // Reassigning away from a clinician cancels this patient's upcoming sessions
    // with the previous one (restoring the sessions to their wallet), so they
    // re-book with the new clinician rather than keeping a stale booking.
    const oldId = before?.assignedTherapistId
    if (oldId && oldId !== input.therapistProfileId) await cancelUpcomingWithTherapist(oldId, input.userId)
    if (oldId !== (input.therapistProfileId || null)) {
      await notify(input.userId, { type: 'therapist', title: 'Your therapist was updated', body: 'Your care team has changed. Open your dashboard to see who you now book with.', href: '/app/therapist' })
    }
    revalidatePath(`/admin/patients/${input.userId}`)
    revalidatePath('/app/therapist'); revalidatePath('/app'); revalidatePath('/app/sessions')
    revalidatePath('/expert'); revalidatePath('/expert/patients'); revalidatePath('/expert/schedule')
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
    const before = await prisma.patientProfile.findUnique({ where: { userId: input.userId }, select: { [column]: true } as never })
    const oldId = (before as Record<string, string | null> | null)?.[column] ?? null
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
    // Reassigning this care type cancels the patient's upcoming sessions with the
    // previous clinician (sessions restored to the wallet), so they re-book with
    // the new one instead of holding a stale booking.
    if (oldId && oldId !== input.therapistProfileId) await cancelUpcomingWithTherapist(oldId, input.userId)
    if (oldId !== (input.therapistProfileId || null)) {
      await notify(input.userId, { type: 'therapist', title: `Your ${input.category} therapist was updated`, body: 'Your care team changed. Open your dashboard to see who you now book with.', href: '/app/therapist' })
    }
    revalidatePath(`/admin/patients/${input.userId}`)
    revalidatePath('/app/therapist')
    revalidatePath('/app'); revalidatePath('/app/sessions')
    // The (un)assigned clinician's own caseload changed too.
    revalidatePath('/expert')
    revalidatePath('/expert/patients'); revalidatePath('/expert/schedule')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update. The patient may not have a profile yet.' }
  }
}

export async function cancelSubscription(input: { id: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.subscription.update({ where: { id: input.id }, data: { status: 'CANCELLED' } })
    // Clawback: if a referral was earned on a purchase for this cancelled package,
    // reverse it (gated by the program's clawback setting inside the helper).
    const payments = await prisma.payment.findMany({ where: { subscriptionId: input.id }, select: { id: true } })
    for (const p of payments) await revokeReferralForPayment(p.id)
    revalidatePath('/admin/patients')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not cancel the subscription.' }
  }
}

/** Manual referral clawback from the admin Referrals table. */
export async function revokeReferralReward(input: { id: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const ok = await revokeReferral(input.id)
  if (ok) revalidatePath('/admin/referrals')
  return ok ? { ok: true } : { ok: false, error: 'This referral can’t be revoked (not in a rewarded state).' }
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
    // Move any patients assigned to this clinician onto a new fit clinician before
    // removing them (deactivate first so the re-matcher can't re-pick this one).
    // There are no sessions to cancel here — deletion is blocked once any exist.
    await prisma.therapistProfile.update({ where: { id: profile.id }, data: { isActive: false } }).catch(() => {})
    await reassignAwayFromTherapist(profile.id)
    await eraseUserData(input.userId, profile.id)
    revalidatePath('/admin/therapists'); revalidatePath('/admin/patients')
    revalidatePath('/app'); revalidatePath('/app/therapist'); revalidatePath('/app/sessions')
    revalidatePath('/expert'); revalidatePath('/expert/patients')
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

/**
 * Gift a free Calm+ app subscription from scratch (no charge, no Payment record).
 * Session plans already bundle Calm+, so if the patient has any active plan this
 * simply extends its validity; otherwise it creates a standalone Calm+ package
 * with no sessions. Mirrors the paid buy flow minus the money-in ledger.
 */
export async function grantCalmPlus(input: { userId: string; months: number }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const months = Math.max(1, Math.round(Number(input.months) || 0))
  if (!months) return { ok: false, error: 'Pick how many months of Calm+ to gift.' }
  try {
    const existing = await prisma.subscription.findFirst({
      where: { userId: input.userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })
    const now = new Date()
    const planLabel = `Calm+ · ${months} month${months === 1 ? '' : 's'} (gifted)`
    if (existing) {
      // Extend the live plan's validity; keep a session plan's own name, otherwise
      // relabel a standalone Calm+ package.
      const base = existing.expiresAt && existing.expiresAt > now ? existing.expiresAt : now
      const expiresAt = addMonths(base, months)
      const keepSessionPlan = existing.sessionsTotal > 0
      await prisma.subscription.update({
        where: { id: existing.id },
        data: { status: 'ACTIVE', planName: keepSessionPlan ? existing.planName : planLabel, expiresAt, renewsAt: expiresAt },
      })
    } else {
      const expiresAt = addMonths(now, months)
      await prisma.subscription.create({
        data: {
          userId: input.userId,
          category: 'INDIVIDUAL',
          trackSlug: 'calmplus',
          planName: planLabel,
          sessionsTotal: 0,
          sessionsUsed: 0,
          status: 'ACTIVE',
          startedAt: now,
          expiresAt,
          renewsAt: expiresAt,
        },
      })
    }
    revalidatePath(`/admin/patients/${input.userId}`)
    revalidatePath('/app'); revalidatePath('/app/billing'); revalidatePath('/app/therapist')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not gift Calm+.' }
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
    const before = await prisma.subscription.findUnique({ where: { id: input.id }, select: { userId: true, therapistId: true } })
    await prisma.subscription.update({
      where: { id: input.id },
      data: { therapistId: input.therapistProfileId || null },
    })
    // Changing a package's clinician cancels that patient's upcoming sessions with
    // the previous one (sessions restored to the wallet).
    if (before?.therapistId && before.therapistId !== input.therapistProfileId) {
      await cancelUpcomingWithTherapist(before.therapistId, before.userId)
    }
    revalidatePath('/admin/patients')
    revalidatePath('/app/therapist'); revalidatePath('/app'); revalidatePath('/app/sessions')
    revalidatePath('/expert'); revalidatePath('/expert/patients'); revalidatePath('/expert/schedule')
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
 * Approve a clinician's cancellation request: this is where the cancellation
 * actually happens. Cancels the session and restores the reserved session to the
 * exact package it was booked from (atomic guarded decrement, mirroring patient
 * cancel), then clears the request flag.
 */
export async function approveCancellation(input: { appointmentId: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: input.appointmentId },
      select: { id: true, status: true, notes: true, consumedSubscriptionId: true, cancelReason: true, patientId: true },
    })
    if (!appt) return { ok: false, error: 'Session not found.' }
    if (appt.status === 'CANCELLED' || appt.status === 'COMPLETED') {
      return { ok: false, error: 'This session can no longer be cancelled.' }
    }
    const stamp = `[Cancelled by clinician request, admin-approved ${new Date().toISOString().slice(0, 10)}${appt.cancelReason ? `: ${appt.cancelReason}` : ''}]`
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appt.id },
        data: {
          status: 'CANCELLED', consumedSubscriptionId: null,
          cancelRequested: false, cancelReason: null, cancelRequestedAt: null,
          notes: appt.notes ? `${appt.notes}\n${stamp}` : stamp,
        },
      }),
      ...(appt.consumedSubscriptionId
        ? [prisma.subscription.updateMany({
            where: { id: appt.consumedSubscriptionId, sessionsUsed: { gt: 0 } },
            data: { sessionsUsed: { decrement: 1 } },
          })]
        : []),
    ])
    await notify(appt.patientId, { type: 'cancellation', title: 'A session was cancelled', body: 'Your clinician had to cancel a session — it has been credited back to you. Please re-book at a time that suits you.', href: '/app/sessions' })
    revalidatePath('/admin/operations'); revalidatePath('/admin/money')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not approve the cancellation.' } }
}

/** Reject a clinician's cancellation request: clear the flag, session stays live. */
export async function rejectCancellation(input: { appointmentId: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  try {
    await prisma.appointment.update({
      where: { id: input.appointmentId },
      data: { cancelRequested: false, cancelReason: null, cancelRequestedAt: null },
    })
    revalidatePath('/admin/operations')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not update the request.' } }
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

// ── Referral program settings ────────────────────────────────────────────────

/**
 * Save the referral program settings. Turning `enabled` off removes the program
 * entirely (patient UI hides, no rewards granted). Referrer reward is either
 * WALLET_CREDIT (₹) or NONE; the referee gets a first-purchase discount in ₹.
 * Wallet credit can be spent as part-payment on any purchase.
 */
export async function saveReferralConfig(input: {
  enabled: boolean
  referrerRewardKind: string
  referrerRewardValue: number
  refereeDiscount: number
  clawback: boolean
}): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const kind = ['WALLET_CREDIT', 'NONE'].includes(input.referrerRewardKind)
    ? input.referrerRewardKind
    : 'NONE'
  const value = Math.max(0, Math.round(Number(input.referrerRewardValue) || 0))
  const discount = Math.max(0, Math.round(Number(input.refereeDiscount) || 0))
  const data = {
    enabled: Boolean(input.enabled),
    referrerRewardKind: kind,
    referrerRewardValue: value,
    refereeDiscount: discount,
    clawback: Boolean(input.clawback),
  }
  try {
    // Self-heal: create the referral tables if the DB hasn't had the migration
    // applied yet, so the setting actually persists (otherwise the toggle
    // "reverts" on refresh because nothing was ever stored).
    await ensureReferralSchema()
    await prisma.referralConfig.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    })
    revalidatePath('/admin/referrals')
    return { ok: true }
  } catch (e) {
    console.error('saveReferralConfig failed:', e)
    return { ok: false, error: 'Could not save referral settings. Please try again.' }
  }
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
        reviewStatus: 'APPROVED',
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

// ── Blog review: clinician submissions ───────────────────────────────────────

/**
 * Approve a clinician's submission — it goes live on the public blog, dated from
 * the moment of approval so the feed orders by when readers could actually see
 * it. Re-approving an already-live post that was edited just clears the flag and
 * leaves its original date alone.
 */
export async function approveBlogPost(input: { slug: string }): Promise<AdminResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Admin access required.' }
  try {
    await ensureBlogReviewSchema()
    const post = await prisma.blogPost.findUnique({
      where: { slug: input.slug },
      select: { authorId: true, title: true, published: true },
    })
    if (!post) return { ok: false, error: 'That post no longer exists.' }
    await prisma.blogPost.update({
      where: { slug: input.slug },
      data: {
        published: true,
        reviewStatus: 'APPROVED',
        reviewNote: null,
        reviewedAt: new Date(),
        reviewedByName: admin.name ?? 'Admin',
        ...(post.published ? {} : { publishedAt: new Date() }),
      },
    })
    if (post.authorId) {
      await notify(post.authorId, {
        type: 'announcement',
        title: 'Your post is live',
        body: post.title,
        href: `/blog/${input.slug}`,
      })
    }
    revalidatePath('/admin/content'); revalidatePath('/blog'); revalidatePath(`/blog/${input.slug}`)
    revalidatePath('/expert/blogs')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not approve the post.' } }
}

/**
 * Send a submission back with a reason. The post comes off the public blog (if
 * it was live) and the author sees the note, so they can fix it and resubmit.
 */
export async function rejectBlogPost(input: { slug: string; note: string }): Promise<AdminResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Admin access required.' }
  const note = input.note.trim().slice(0, 1000)
  if (!note) return { ok: false, error: 'Give the author a reason.' }
  try {
    await ensureBlogReviewSchema()
    const post = await prisma.blogPost.findUnique({
      where: { slug: input.slug },
      select: { authorId: true, title: true },
    })
    if (!post) return { ok: false, error: 'That post no longer exists.' }
    await prisma.blogPost.update({
      where: { slug: input.slug },
      data: {
        published: false,
        reviewStatus: 'REJECTED',
        reviewNote: note,
        reviewedAt: new Date(),
        reviewedByName: admin.name ?? 'Admin',
      },
    })
    if (post.authorId) {
      await notify(post.authorId, {
        type: 'announcement',
        title: 'Your post needs changes',
        body: note,
        href: '/expert/blogs',
      })
    }
    revalidatePath('/admin/content'); revalidatePath('/blog'); revalidatePath(`/blog/${input.slug}`)
    revalidatePath('/expert/blogs')
    return { ok: true }
  } catch { return { ok: false, error: 'Could not send the post back.' } }
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

/** Build a new form. Admin-built forms join the library for every clinician. */
export async function createPlatformForm(input: CustomFormInput): Promise<AdminResult> {
  const admin = await requireAdmin()
  if (!admin?.id) return { ok: false, error: 'Admin access required.' }
  const res = await createFormTemplate(input, { id: admin.id, name: admin.name })
  if (res.ok) revalidatePath('/admin/config')
  return { ok: res.ok, error: res.error }
}

/** Retire any custom form (admin scope covers forms clinicians built too). */
export async function removePlatformForm(id: string): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const res = await deleteFormTemplate(id, null)
  if (res.ok) revalidatePath('/admin/config')
  return res
}

// ── Automatic form rules (platform-wide) ─────────────────────────────────────

export async function createPlatformFormRule(input: {
  templateId: string; trackSlug: string; recurrence: FormRecurrence; sessionNumber?: number | null; patientId?: string | null
}): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const res = await createFormRule({ ...input, therapistId: null, patientId: input.patientId ?? null })
  if (res.ok) revalidatePath('/admin/config')
  return res
}

export async function deletePlatformFormRule(input: { id: string }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const ok = await deleteFormRule(input.id, null)
  if (ok) revalidatePath('/admin/config')
  return ok ? { ok: true } : { ok: false, error: 'Rule not found.' }
}

export async function togglePlatformFormRule(input: { id: string; active: boolean }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const ok = await setFormRuleActive(input.id, input.active, null)
  if (ok) revalidatePath('/admin/config')
  return ok ? { ok: true } : { ok: false, error: 'Rule not found.' }
}

/**
 * Add (or remove, with a negative amount) wallet credit for a patient. Wallet
 * credit is spendable as part-payment on any purchase. Self-heals the referral
 * schema so the column always exists; floors the balance at 0.
 */
export async function adjustWalletCredit(input: { userId: string; amount: number }): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Admin access required.' }
  const amount = Math.round(Number(input.amount) || 0)
  if (!amount) return { ok: false, error: 'Enter an amount.' }
  try {
    await ensureReferralSchema()
    await prisma.user.update({ where: { id: input.userId }, data: { walletCreditRupees: { increment: amount } } })
    // Never let a removal push the balance negative.
    await prisma.user.updateMany({ where: { id: input.userId, walletCreditRupees: { lt: 0 } }, data: { walletCreditRupees: 0 } })
    await notify(input.userId, {
      type: 'wallet',
      title: amount > 0 ? `₹${amount.toLocaleString('en-IN')} added to your wallet` : `₹${Math.abs(amount).toLocaleString('en-IN')} removed from your wallet`,
      body: 'Wallet credit is applied automatically as part-payment on your next purchase.',
      href: '/app/billing',
    })
    revalidatePath(`/admin/patients/${input.userId}`)
    revalidatePath('/app/billing'); revalidatePath('/app/refer')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the wallet.' }
  }
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

  // Ring the clinician's bell — otherwise a task only shows up if they happen to
  // open their portal and look.
  await notify(therapistUserId, {
    type: 'task',
    title: 'New task from admin',
    body: title,
    href: '/expert/tasks',
  })

  if (profileId) revalidatePath(`/admin/therapists/${profileId}`)
  revalidatePath('/expert')
  revalidatePath('/expert/tasks')
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
  revalidatePath('/expert/tasks')
}

// ── Notifications ────────────────────────────────────────────────────────────

/** Clear the admin's notification badge (opening the bell marks all read). */
export async function markAdminNotificationsRead(): Promise<void> {
  const admin = await requireAdmin()
  if (!admin?.id) return
  try {
    await markAllRead(admin.id)
    revalidatePath('/admin/notifications')
    revalidatePath('/admin')
  } catch {
    /* the badge is cosmetic — never surface a failure here */
  }
}
