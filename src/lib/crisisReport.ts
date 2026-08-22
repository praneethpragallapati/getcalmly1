/**
 * Member-initiated crisis alert.
 *
 * Until now the only thing that raised a crisis alert was the AI classifier
 * reading a chat message. That misses the person who simply wants to say "I need
 * help now" without talking to a bot first, and it is the one path where being
 * slow or wrong matters most.
 *
 * This is that path: the member presses a button, confirms, and four things
 * happen at once — a CrisisAlert row (which is what the clinician's alert box
 * and /expert/risk already read), an in-app notification to every clinician on
 * their care team, a notification to admins, and an SMS to their emergency
 * contact.
 *
 * DESIGN NOTE — why this returns what it does
 * -------------------------------------------
 * Every step is attempted independently and the result says which ones actually
 * worked. A crisis feature that silently half-fails is worse than one that
 * didn't exist, because the member walks away believing help was summoned. If
 * the SMS could not be sent, the member is told to call their contact
 * themselves, and the clinician's handoff note records that nobody was reached.
 *
 * The alert is recorded FIRST and separately from the notifications: the record
 * reaching the care team's screen is the part that must survive a partial
 * failure, so nothing that follows can prevent it.
 */
import { prisma } from '@/lib/prisma'
import { notify } from '@/lib/notifications'
import { notifyCrisisAlert } from '@/lib/adminNotify'
import { sendCrisisSms } from '@/lib/msg91'
import { ensureContactSchema } from '@/lib/contactSchema'
import { brandName, primaryHelplines } from '@/config/site'
import { fmtIST } from '@/lib/tz'

/** What the member told us, so the care team knows what they are walking into. */
export type CrisisSeverity = 'SUPPORT' | 'URGENT'

export type CrisisReportResult = {
  ok: boolean
  /** The alert reached the care team's screen. Everything else is secondary. */
  recorded: boolean
  /** Clinicians who were notified, by name, so the member knows who is coming. */
  careTeam: string[]
  /**
   * Whether this member has a care team at all. False for someone with no
   * clinician yet — no appointment, no assignment, no active package. They still
   * raise a valid alert; it is admins who respond to it.
   */
  hasCareTeam: boolean
  /** Emergency contact outcome — never claim a message was sent when it wasn't. */
  emergencyContact:
    | { status: 'sent'; name: string | null }
    | { status: 'failed'; name: string | null; phone: string | null }
    | { status: 'none' }
  error?: string
}

const SEVERITY_LABEL: Record<CrisisSeverity, string> = {
  SUPPORT: 'Needs support now',
  URGENT: 'In immediate danger',
}

/**
 * Raise a member-reported crisis alert. Best-effort on every channel, honest
 * about which ones landed.
 */
export async function reportCrisis(
  userId: string,
  severity: CrisisSeverity,
  note?: string | null,
): Promise<CrisisReportResult> {
  const failed: CrisisReportResult = {
    ok: false, recorded: false, careTeam: [], hasCareTeam: false, emergencyContact: { status: 'none' },
    error: 'We could not raise the alert. Please call a helpline now — the numbers are on this panel.',
  }

  try {
    await ensureContactSchema().catch(() => {})

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true, email: true },
    })
    if (!user) return failed

    // The emergency contact lives on columns added by 0038/0042, so it is read
    // in its own query — a database missing them must still raise the alert.
    const contact = await prisma.patientProfile
      .findUnique({
        where: { userId },
        select: { emergencyName: true, emergencyPhone: true, emergencyRelation: true },
      })
      .catch(() => null)

    const pkg = await packageStatus(userId)
    const memberName = user.name?.trim() || user.email || 'A member'
    const when = fmtIST(new Date(), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
    const trimmedNote = note?.trim().slice(0, 500) || null

    // ── 1. The record. This is the part that must not fail. ──────────────────
    const handoff = [
      `${memberName} raised a crisis alert themselves at ${when}.`,
      `Severity: ${SEVERITY_LABEL[severity]}.`,
      trimmedNote ? `They said: “${trimmedNote}”` : null,
      user.phone ? `Member's number: ${user.phone}.` : 'No phone number on the member record.',
      contact?.emergencyPhone
        ? `Emergency contact: ${contact.emergencyName ?? 'unnamed'}${contact.emergencyRelation ? ` (${contact.emergencyRelation})` : ''} ${contact.emergencyPhone}.`
        : 'No emergency contact on file.',
      // Whether they can actually be booked in, so whoever picks this up knows
      // before they promise the member a session.
      pkg,
    ].filter(Boolean).join(' ')

    let alertId: string | null = null
    try {
      const created = await prisma.crisisAlert.create({
        data: {
          userId,
          patientName: user.name ?? null,
          label: 'SELF_REPORTED',
          // question/answer are non-null on this model because it was built for
          // the AI path. For a self-report they carry the member's own words and
          // what the platform did in response.
          question: trimmedNote ?? SEVERITY_LABEL[severity],
          answer: 'Member pressed the crisis button on their dashboard.',
          handoffNote: handoff,
        },
        select: { id: true },
      })
      alertId = created.id
    } catch (e) {
      console.error('[reportCrisis] could not record the alert', e)
      return failed
    }

    // ── 2. Care team, admins, emergency contact — independently. ─────────────
    const careTeam: string[] = []
    const clinicianIds = await assignedClinicianUserIds(userId)
    const clinicians = clinicianIds.length
      ? await prisma.user.findMany({ where: { id: { in: clinicianIds } }, select: { id: true, name: true } }).catch(() => [])
      : []

    await Promise.allSettled(
      clinicians.map(async (c) => {
        await notify(c.id, {
          type: 'announcement',
          title: `Crisis alert · ${memberName}`,
          body: `${SEVERITY_LABEL[severity]}${trimmedNote ? ` — “${trimmedNote}”` : ''}`,
          // Straight to the profile, which carries both their number and their
          // emergency contact's.
          href: `/expert/patients/${userId}`,
        })
        if (c.name) careTeam.push(c.name)
      }),
    )

    // Admins are always told. When the member has no clinician, they are not a
    // second pair of eyes — they are the only ones, so the notification says so
    // rather than reading like a copy of something a therapist is handling.
    const adminBody = [
      SEVERITY_LABEL[severity],
      'raised by the member',
      clinicians.length > 0
        ? `care team notified: ${clinicians.map((c) => c.name ?? 'clinician').join(', ')}`
        : 'NO CARE TEAM — nobody clinical has been alerted, ops must respond',
      trimmedNote ? `“${trimmedNote}”` : null,
    ].filter(Boolean).join(' · ')
    await notifyCrisisAlert(memberName, adminBody, userId).catch(() => {})

    let emergencyContact: CrisisReportResult['emergencyContact'] = { status: 'none' }
    if (contact?.emergencyPhone) {
      const mobile = contact.emergencyPhone.replace(/[^\d]/g, '')
      // Bare 10-digit Indian numbers are the common case in this data; MSG91
      // wants the country code and no "+".
      const normalized = mobile.length === 10 ? `91${mobile}` : mobile
      const res = await sendCrisisSms(normalized, {
        name: (contact.emergencyName ?? 'there').slice(0, 30),
        member: memberName.slice(0, 30),
        brand: brandName,
      }).catch(() => ({ ok: false, configured: true, message: 'send failed' }))

      emergencyContact = res.ok
        ? { status: 'sent', name: contact.emergencyName ?? null }
        : { status: 'failed', name: contact.emergencyName ?? null, phone: contact.emergencyPhone }

      if (!res.ok) {
        console.error('[reportCrisis] emergency contact SMS not sent', res.message)
        // The care team must know nobody was reached, so it goes on the record
        // they actually read rather than only into a log.
        await prisma.crisisAlert
          .update({
            where: { id: alertId },
            data: { handoffNote: `${handoff} EMERGENCY CONTACT WAS NOT REACHED — call ${contact.emergencyPhone} directly.` },
          })
          .catch(() => {})
      }
    }

    return { ok: true, recorded: true, careTeam, hasCareTeam: clinicians.length > 0, emergencyContact }
  } catch (e) {
    console.error('[reportCrisis] failed', e)
    return failed
  }
}

/**
 * This member's care team — the SAME three signals patientIdsFor uses to build a
 * clinician's caseload, just inverted.
 *
 * They have to match. patientIdsFor counts an appointment, an admin assignment
 * OR an active package; this originally read only the four assignment columns.
 * A clinician who had seen the member but was never formally assigned would
 * therefore find the alert sitting in their alert box (which reads
 * patientIdsFor) while never receiving the notification that told them to look.
 * One definition, so what a clinician is told and what a clinician can see
 * cannot disagree.
 *
 * Each source is queried defensively: a member in crisis must not lose their
 * whole care team because one column needs a migration.
 */
async function careTeamProfileIds(userId: string): Promise<string[]> {
  const ids = new Set<string>()
  try {
    const appts = await prisma.appointment.findMany({
      where: { patientId: userId }, select: { therapistId: true }, distinct: ['therapistId'],
    })
    appts.forEach((a) => a.therapistId && ids.add(a.therapistId))
  } catch (e) {
    console.error('[careTeamProfileIds] appointments query failed', e)
  }
  try {
    const p = await prisma.patientProfile.findUnique({
      where: { userId },
      select: {
        assignedTherapistId: true,
        assignedTherapistIndividualId: true,
        assignedTherapistCouplesId: true,
        assignedTherapistPsychiatryId: true,
      },
    })
    for (const v of [p?.assignedTherapistId, p?.assignedTherapistIndividualId, p?.assignedTherapistCouplesId, p?.assignedTherapistPsychiatryId]) {
      if (v) ids.add(v)
    }
  } catch (e) {
    console.error('[careTeamProfileIds] assignment columns failed (migration 0016?)', e)
  }
  try {
    const subs = await prisma.subscription.findMany({
      where: { userId, status: 'ACTIVE' }, select: { therapistId: true },
    })
    subs.forEach((s) => s.therapistId && ids.add(s.therapistId))
  } catch (e) {
    console.error('[careTeamProfileIds] subscription query failed', e)
  }
  return [...ids]
}

/** Care-team clinicians as user ids, for notifying. */
async function assignedClinicianUserIds(userId: string): Promise<string[]> {
  const profileIds = await careTeamProfileIds(userId)
  if (profileIds.length === 0) return []
  try {
    const profiles = await prisma.therapistProfile.findMany({
      where: { id: { in: profileIds } },
      select: { userId: true },
    })
    return [...new Set(profiles.map((t) => t.userId))]
  } catch {
    return []
  }
}

/**
 * Whether the member currently holds a usable package, and of what kind.
 *
 * Used for CONTEXT, not as a gate. `status: 'ACTIVE'` alone is not the same as
 * usable — a package can be ACTIVE and past its expiry, or ACTIVE with every
 * session consumed — so validity is computed the same way the member's own
 * billing page computes it.
 *
 * Deliberately NOT used to decide whether the care team is told. A lapsed
 * package is a billing state; someone in crisis is a clinical one. Withholding
 * the alert from the clinician who knows them because a renewal is overdue is
 * the wrong failure. The state is put in front of the clinician instead, so they
 * know what they are picking up.
 */
async function packageStatus(userId: string): Promise<string> {
  try {
    const subs = await prisma.subscription.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { planName: true, trackSlug: true, sessionsTotal: true, sessionsUsed: true, expiresAt: true },
    })
    if (subs.length === 0) return 'No active package.'
    const now = Date.now()
    const usable = subs.filter(
      (s) => s.sessionsTotal - s.sessionsUsed > 0 && (!s.expiresAt || s.expiresAt.getTime() > now),
    )
    if (usable.length === 0) return 'Package on file but NOT usable (expired or fully used).'
    return `Active package: ${usable.map((s) => `${s.planName ?? s.trackSlug} (${s.sessionsTotal - s.sessionsUsed} left)`).join(', ')}.`
  } catch {
    return 'Package status unavailable.'
  }
}

/** The helplines shown alongside the confirmation, so the panel and the copy agree. */
export const crisisHelplines = primaryHelplines
