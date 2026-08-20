/**
 * Medicine home-delivery orders. The patient enters delivery contact + address
 * and pays in-app (mock today). Fulfilment is handed to a pharmacy partner
 * (Tata 1mg etc.) later via the order's `provider` field, left null for now.
 */
import { prisma } from '@/lib/prisma'
import { estimateOrderAmount } from '@/data/delivery'
import { fmtIST } from '@/lib/tz'

export { estimateOrderAmount } from '@/data/delivery'

export type DeliveryDetails = {
  contactName: string
  phone: string
  addressLine: string
  city: string
  pincode: string
}

export type MedicationOrderView = {
  id: string
  medicationId: string | null
  itemName: string
  status: string
  statusLabel: string
  amount: number
  createdLabel: string
}

export const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Pending payment',
  PAID: 'Paid · awaiting dispatch',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export async function getMedicationOrders(userId: string): Promise<MedicationOrderView[]> {
  try {
    const rows = await prisma.medicationOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((r) => {
      const item = r.item as { name?: string } | null
      return {
        id: r.id,
        medicationId: r.medicationId,
        itemName: item?.name ?? 'Medication',
        status: r.status,
        statusLabel: STATUS_LABEL[r.status] ?? r.status,
        amount: r.amount,
        createdLabel: fmtIST(r.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }),
      }
    })
  } catch {
    return []
  }
}

/**
 * Place a (mock-paid) delivery order for one of the patient's own medications.
 * Ownership-gated: the medication must belong to the signed-in patient.
 */
export async function placeMedicationOrder(
  userId: string,
  medicationId: string,
  details: DeliveryDetails
): Promise<{ ok: boolean; error?: string }> {
  const med = await prisma.medication.findFirst({
    where: { id: medicationId, userId },
    select: { id: true, name: true, dosage: true, durationDays: true },
  })
  if (!med) return { ok: false, error: 'Medication not found.' }

  const required = [details.contactName, details.phone, details.addressLine, details.city, details.pincode]
  if (required.some((v) => !v?.trim())) return { ok: false, error: 'Please fill in all delivery details.' }

  const amount = estimateOrderAmount(med.durationDays)
  await prisma.medicationOrder.create({
    data: {
      userId,
      medicationId: med.id,
      item: { name: med.name, dosage: med.dosage ?? null, durationDays: med.durationDays ?? null },
      // Mock payment: marked PAID immediately. Real gateway slots in here later.
      status: 'PAID',
      paidAt: new Date(),
      contactName: details.contactName.trim(),
      phone: details.phone.trim(),
      addressLine: details.addressLine.trim(),
      city: details.city.trim(),
      pincode: details.pincode.trim(),
      amount,
    },
  })

  await prisma.notification.create({
    data: {
      userId,
      type: 'order',
      title: `Order placed: ${med.name}`,
      body: `Your medicine order (₹${amount}) is paid and queued for dispatch.`,
      href: '/app/medications',
    },
  })
  return { ok: true }
}
