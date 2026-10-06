import { getSessionUserId } from '@/lib/patient'
import { prisma } from '@/lib/prisma'
import { buildInvoicePdf, pdfResponse } from '@/lib/pdf'
import { patientCode } from '@/lib/ids'
import { fmtIn } from '@/lib/tz'
import { userTz } from '@/lib/userTz'

export const dynamic = 'force-dynamic'

const KIND_LABEL: Record<string, string> = {
  package: 'Session package',
  first_session: 'Intro session',
  calmplus: 'Calm+ subscription',
}

/** Invoice/receipt for one of the signed-in patient's payments. */
export async function GET(_req: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  const userId = await getSessionUserId()
  const tz = await userTz(userId)
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const { paymentId } = await params

  const [payment, user] = await Promise.all([
    prisma.payment.findFirst({ where: { id: paymentId, userId }, select: { id: true, amount: true, kind: true, planName: true, createdAt: true } }).catch(() => null),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }).catch(() => null),
  ])
  if (!payment) return new Response('Not found', { status: 404 })

  const invoiceNo = payment.id.slice(-8).toUpperCase()
  const bytes = await buildInvoicePdf({
    invoiceNo,
    dateLabel: fmtIn(tz, payment.createdAt, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
    patientName: user?.name ?? 'Patient',
    patientCode: patientCode(userId),
    items: [{ desc: payment.planName ?? KIND_LABEL[payment.kind] ?? 'Purchase', amount: payment.amount }],
    total: payment.amount,
  })
  return pdfResponse(`invoice-${invoiceNo}.pdf`, bytes)
}
