import { getSessionUserId } from '@/lib/patient'
import { prisma } from '@/lib/prisma'
import { buildPrescriptionPdf, pdfResponse } from '@/lib/pdf'
import { patientCode } from '@/lib/ids'
import { fmtIn } from '@/lib/tz'
import { userTz } from '@/lib/userTz'

export const dynamic = 'force-dynamic'

/** The signed-in patient's current e-prescription (active medications), valid 1 week. */
export async function GET() {
  const userId = await getSessionUserId()
  const tz = await userTz(userId)
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const [user, meds] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }).catch(() => null),
    prisma.medication.findMany({ where: { userId, active: true }, orderBy: { createdAt: 'desc' } }).catch(() => []),
  ])
  const prescriber = meds.find((m) => m.prescribedBy)?.prescribedBy ?? 'GetCalmly clinician'
  const now = new Date()
  const validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const dateOpts = { day: 'numeric', month: 'short', year: 'numeric' } as const

  const bytes = await buildPrescriptionPdf({
    patientName: user?.name ?? 'Patient',
    patientCode: patientCode(userId),
    prescriber,
    dateLabel: fmtIn(tz, now, dateOpts),
    validUntilLabel: fmtIn(tz, validUntil, dateOpts),
    meds: meds.map((m) => ({
      name: m.name,
      dosage: m.dosage ?? '',
      frequency: m.frequency ?? '',
      duration: m.durationDays ? `${m.durationDays} days` : '',
      notes: m.notes ?? '',
    })),
  })
  return pdfResponse(`prescription-${patientCode(userId)}.pdf`, bytes)
}
