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
    ok: false, recorded: false, careTeam: [], emergencyContact: { status: 'none' },
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

    await notifyCrisisAlert(memberName, `${SEVERITY_LABEL[severity]} — raised by the member${trimmedNote ? ` — “${trimmedNote}”` : ''}`, userId)
      .catch(() => {})

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

    return { ok: true, recorded: true, careTeam, emergencyContact }
  } catch (e) {
    console.error('[reportCrisis] failed', e)
    return failed
  }
}

/** Every clinician currently attached to this member, across care types. */
async function assignedClinicianUserIds(userId: string): Promise<string[]> {
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
    const profileIds = [
      p?.assignedTherapistId, p?.assignedTherapistIndividualId,
      p?.assignedTherapistCouplesId, p?.assignedTherapistPsychiatryId,
    ].filter((v): v is string => Boolean(v))
    if (profileIds.length === 0) return []
    const profiles = await prisma.therapistProfile.findMany({
      where: { id: { in: [...new Set(profileIds)] } },
      select: { userId: true },
    })
    return [...new Set(profiles.map((t) => t.userId))]
  } catch {
    return []
  }
}

/** The helplines shown alongside the confirmation, so the panel and the copy agree. */
export const crisisHelplines = primaryHelplines
