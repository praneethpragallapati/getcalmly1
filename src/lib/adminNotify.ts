/**
 * Notifications for the admin team.
 *
 * Admins had no bell at all: everything needing a decision — a clinician
 * applying, a contact message, an enterprise lead, a cancellation request, a
 * blog submission, a crisis alert — sat in a console nobody was told to open.
 * These helpers fan one notification out to every admin account.
 *
 * Best-effort throughout: a notification must never fail the thing that
 * triggered it. A patient's contact form still submits if the bell write
 * hiccups, and a crisis alert is still raised.
 */
import { prisma } from '@/lib/prisma'
import { notifyMany } from '@/lib/notifications'

/** Every admin account's user id. Empty on any failure. */
async function adminIds(): Promise<string[]> {
  try {
    const rows = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } })
    return rows.map((r) => r.id)
  } catch {
    return []
  }
}

export type AdminNotice = {
  type: string
  title: string
  body?: string | null
  href?: string | null
}

/** Send one notice to every admin. Never throws. */
export async function notifyAdmins(n: AdminNotice): Promise<void> {
  try {
    const ids = await adminIds()
    if (ids.length === 0) return
    await notifyMany(ids, { type: n.type, title: n.title, body: n.body ?? null, href: n.href ?? null })
  } catch {
    /* best-effort */
  }
}

// ── The events worth interrupting an admin for ───────────────────────────────
// Each takes the smallest useful payload and links straight to the queue that
// resolves it, so the notification is one click from being actioned.

/** A clinician applied through the public "For therapists" form. */
export const notifyClinicianApplication = (name: string, specialism?: string | null) =>
  notifyAdmins({
    type: 'announcement',
    title: 'New clinician application',
    body: [name, specialism].filter(Boolean).join(' · '),
    href: '/admin/submissions',
  })

/** Someone used the public contact form. */
export const notifyContactMessage = (name: string, subject?: string | null) =>
  notifyAdmins({
    type: 'announcement',
    title: 'New contact message',
    body: [name, subject].filter(Boolean).join(' · '),
    href: '/admin/submissions',
  })

/** An organisation asked about Enterprise. */
export const notifyEnterpriseLead = (company: string, contact?: string | null) =>
  notifyAdmins({
    type: 'announcement',
    title: 'New enterprise enquiry',
    body: [company, contact].filter(Boolean).join(' · '),
    href: '/admin/submissions',
  })

/** A clinician asked to cancel a session — it stays live until admin decides. */
export const notifyCancellationRequest = (clinician: string, patient: string, whenLabel: string) =>
  notifyAdmins({
    type: 'cancellation',
    title: 'Session cancellation requested',
    body: `${clinician} · ${patient} · ${whenLabel}`,
    href: '/admin/operations',
  })

/**
 * A crisis alert — the most urgent thing here. Raised either by the AI detector
 * or by the member pressing the crisis button themselves.
 *
 * `patientId` links straight to that member's profile, which is where their
 * phone number and their emergency contact's are. It used to point at
 * /admin/operations, leaving whoever opened the notification to go and find the
 * person by hand — the wrong amount of friction for this particular alert.
 */
export const notifyCrisisAlert = (patient: string, detail?: string | null, patientId?: string) =>
  notifyAdmins({
    type: 'announcement',
    title: `Crisis alert · ${patient}`,
    body: detail ?? 'A patient message was flagged as high risk.',
    href: patientId ? `/admin/patients/${patientId}` : '/admin/operations',
  })

/** A clinician submitted (or edited) a blog post awaiting review. */
export const notifyBlogSubmission = (author: string | null, title: string) =>
  notifyAdmins({
    type: 'announcement',
    title: 'Blog post awaiting review',
    body: `${author ?? 'A clinician'} submitted “${title.trim().slice(0, 90)}”`,
    href: '/admin/content',
  })

/** A patient bought a package — the money signal admins watch. */
export const notifyPurchase = (patient: string, planName: string, amount: number) =>
  notifyAdmins({
    type: 'invoice',
    title: 'New package purchase',
    body: `${patient} · ${planName} · ₹${amount.toLocaleString('en-IN')}`,
    href: '/admin/revenue',
  })
