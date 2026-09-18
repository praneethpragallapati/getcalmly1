import { prisma } from '@/lib/prisma'

// The dedicated test accounts (see OTP_BYPASS_* in lib/auth). Hardcoded here
// rather than imported from auth to avoid an import cycle.
const PATIENT_EMAIL = 'praneethpragallapati@gmail.com' // Praneeth — phone-bypass patient
const THERAPIST_EMAIL = 'hom.pragallapati@gmail.com' // Riya — therapist test account

/**
 * Demo wiring for the test accounts: make sure the phone-bypass patient
 * (Praneeth) exists and is assigned to the therapist test account (Riya), so
 * Riya sees him in her caseload on a fresh deployment without a manual reseed.
 *
 * Idempotent and best-effort from either side — it never throws, so it can be
 * called from a login path without risking the sign-in.
 */
export async function ensureDemoCaseload(): Promise<void> {
  try {
    // Praneeth — keyed by email only (User.phone is unique; setting it here
    // could collide with a separate phone-OTP account).
    const praneeth = await prisma.user.upsert({
      where: { email: PATIENT_EMAIL },
      update: {},
      create: { email: PATIENT_EMAIL, role: 'PATIENT', name: 'Praneeth' },
      select: { id: true },
    })

    // Riya's therapist profile — may not exist yet if she hasn't signed in.
    const riya = await prisma.user.findUnique({
      where: { email: THERAPIST_EMAIL },
      select: { therapistProfile: { select: { id: true } } },
    })
    const tpId = riya?.therapistProfile?.id ?? null

    await prisma.patientProfile.upsert({
      where: { userId: praneeth.id },
      update: tpId ? { assignedTherapistId: tpId, assignedTherapistIndividualId: tpId } : {},
      create: {
        userId: praneeth.id,
        patientId: `GC-P-${praneeth.id.slice(-8).toUpperCase()}`,
        careMode: 'INDIVIDUAL',
        track: [],
        assignedTherapistId: tpId,
        assignedTherapistIndividualId: tpId,
      },
    })
  } catch {
    // best-effort — never block a login
  }
}
