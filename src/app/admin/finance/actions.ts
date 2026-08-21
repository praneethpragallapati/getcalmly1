'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LEDGER_CATEGORIES, ensureLedgerSchema } from '@/lib/ledger'
import { canAccess } from '@/lib/adminRoles'

type Res = { ok: boolean; error?: string }

/** Bills are inlined as data URLs, the same store clinician documents use. */
const MAX_BILL_BYTES = 2_500_000

async function requireFinanceAdmin(): Promise<{ id: string; name: string | null } | null> {
  const session = await getServerSession(authOptions)
  const u = session?.user as { id?: string; role?: string; name?: string | null; adminType?: string | null } | undefined
  if (u?.role !== 'ADMIN' || !u.id) return null
  if (!canAccess(u.adminType, 'money')) return null
  return { id: u.id, name: u.name ?? null }
}

export async function addLedgerEntry(input: {
  direction: string
  category: string
  amount: number
  occurredAt: string
  counterparty?: string | null
  note?: string | null
  billName?: string | null
  billUrl?: string | null
}): Promise<Res> {
  const admin = await requireFinanceAdmin()
  if (!admin) return { ok: false, error: 'Finance access required.' }

  const cat = LEDGER_CATEGORIES.find((c) => c.value === input.category)
  if (!cat) return { ok: false, error: 'Pick a category.' }
  // The category owns the direction; taking it from the client would allow an
  // expense filed as income and quietly flip a month from loss to profit.
  const direction = cat.direction

  const amount = Math.round(Number(input.amount))
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'Enter an amount above zero.' }

  const when = new Date(input.occurredAt)
  if (Number.isNaN(when.getTime())) return { ok: false, error: 'Enter a valid date.' }

  const billUrl = input.billUrl?.trim() || null
  if (billUrl) {
    if (!billUrl.startsWith('data:')) return { ok: false, error: 'Attach the bill as a file.' }
    if (billUrl.length > MAX_BILL_BYTES) return { ok: false, error: 'That bill is over 2.5 MB — attach a smaller file.' }
  }

  try {
    await ensureLedgerSchema()
    await prisma.ledgerEntry.create({
      data: {
        direction,
        category: cat.value,
        amount,
        occurredAt: when,
        counterparty: input.counterparty?.trim().slice(0, 120) || null,
        note: input.note?.trim().slice(0, 1000) || null,
        billName: billUrl ? (input.billName?.trim().slice(0, 200) || 'bill') : null,
        billUrl,
        createdById: admin.id,
        createdByName: admin.name,
      },
    })
    revalidatePath('/admin/finance')
    revalidatePath('/admin/money')
    return { ok: true }
  } catch (e) {
    // A bare catch here turned a missing TABLE into "Could not save that entry"
    // and hid it for as long as the ledger existed. Log the real reason, and
    // name the one cause we can actually explain to the person in front of us.
    console.error('[addLedgerEntry] failed', e)
    const message = e instanceof Error ? e.message : ''
    if (/does not exist in the current database/i.test(message)) {
      return { ok: false, error: 'The ledger table is missing from this database. Run the pending migrations (npm run db:deploy), then try again.' }
    }
    return { ok: false, error: 'Could not save that entry. Please try again, and check the server logs if it keeps happening.' }
  }
}

export async function deleteLedgerEntry(id: string): Promise<Res> {
  const admin = await requireFinanceAdmin()
  if (!admin) return { ok: false, error: 'Finance access required.' }
  try {
    await ensureLedgerSchema()
    await prisma.ledgerEntry.delete({ where: { id } })
    revalidatePath('/admin/finance')
    revalidatePath('/admin/money')
    return { ok: true }
  } catch (e) {
    console.error('[deleteLedgerEntry] failed', e)
    return { ok: false, error: 'Could not remove that entry.' }
  }
}
