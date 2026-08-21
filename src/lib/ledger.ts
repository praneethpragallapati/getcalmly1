/**
 * The money ledger: what came in, what went out, and what it cost.
 *
 * Two of the four money flows are already derivable and are NOT stored here —
 * customer revenue is the Payment table, and therapist pay is computed from
 * completed sessions. Recording either here as well would let two records of the
 * same fact disagree. What the ledger owns is the rest: money the founders put
 * in, and every non-session cost going out.
 *
 * Reporting joins all four so the dashboard shows the whole picture from one
 * place, while each number keeps a single source of truth.
 */
import { prisma } from '@/lib/prisma'
import { istParts, fmtIST } from '@/lib/tz'
import { MONTHS } from '@/lib/bookingCalendar'

/**
 * Create the ledger table if it isn't there yet, so the feature works on a
 * database that hasn't had migration 0041 applied by hand.
 *
 * This exists because it didn't, and saving a pay-in failed with a bare "Could
 * not save that entry" on every database that was migrated rather than pushed.
 * Every other table added to this codebase carries one of these — referrals,
 * polls, blog review, contact details, admin types — and the ledger shipped
 * without one.
 *
 * Mirrors 0041 exactly and is `IF NOT EXISTS` throughout, so it is idempotent
 * and a no-op once the migration is in place. The `ready` flag keeps it to one
 * round trip per process rather than one per call.
 */
let ledgerSchemaReady = false
export async function ensureLedgerSchema(): Promise<void> {
  if (ledgerSchemaReady) return
  const stmts = [
    `CREATE TABLE IF NOT EXISTS "LedgerEntry" (
      "id"            TEXT PRIMARY KEY,
      "direction"     TEXT NOT NULL,
      "category"      TEXT NOT NULL,
      "amount"        INTEGER NOT NULL,
      "occurredAt"    TIMESTAMP(3) NOT NULL,
      "counterparty"  TEXT,
      "note"          TEXT,
      "billName"      TEXT,
      "billUrl"       TEXT,
      "createdById"   TEXT,
      "createdByName" TEXT,
      "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS "LedgerEntry_occurredAt_idx" ON "LedgerEntry"("occurredAt")`,
    `CREATE INDEX IF NOT EXISTS "LedgerEntry_direction_idx" ON "LedgerEntry"("direction")`,
  ]
  for (const sql of stmts) await prisma.$executeRawUnsafe(sql)
  ledgerSchemaReady = true
}

export type Direction = 'IN' | 'OUT'

export type LedgerCategory = {
  value: string
  label: string
  direction: Direction
  /** Chart slot. Validated as a set — see the palette note below. */
  color: string
}

/*
 * Chart colours.
 *
 * These are not picked by eye. The set was run through the data-viz palette
 * validator (lightness band, chroma floor, colourblind separation on adjacent
 * pairs, normal-vision floor, contrast against the surface) and re-stepped from
 * the raw brand hues until every check passed — the brand values themselves
 * failed on chroma, CVD separation and contrast.
 *
 * The order matters: the CVD check runs on ADJACENT pairs, so gold and green are
 * deliberately kept apart. Money in/out uses blue vs coral rather than the
 * obvious green vs red, which is the classic colourblind trap (green/coral
 * separates at ΔE 6.1 for deuteranopia; blue/coral at 23.6).
 */
export const MONEY_IN_COLOR = '#2A6FD6'
export const MONEY_OUT_COLOR = '#C8553D'

export const LEDGER_CATEGORIES: LedgerCategory[] = [
  // Pay-in
  { value: 'INVESTMENT', label: 'Founder investment', direction: 'IN', color: '#2A6FD6' },
  { value: 'GRANT', label: 'Grant / other income', direction: 'IN', color: '#1B8F5A' },
  // Pay-out
  { value: 'THERAPIST_PAYOUT', label: 'Therapist payout', direction: 'OUT', color: '#C8553D' },
  { value: 'SALARY', label: 'Salaries', direction: 'OUT', color: '#2A6FD6' },
  { value: 'MARKETING', label: 'Marketing', direction: 'OUT', color: '#1B8F5A' },
  { value: 'TOOLS', label: 'Tools & software', direction: 'OUT', color: '#7A4FD0' },
  { value: 'RENT', label: 'Rent & facilities', direction: 'OUT', color: '#B07C10' },
  { value: 'PROFESSIONAL', label: 'Legal & professional', direction: 'OUT', color: '#C43A7E' },
  { value: 'OTHER', label: 'Other', direction: 'OUT', color: '#6B7280' },
]

/* Derived buckets that are reported but never entered by hand. */
const DERIVED: Record<string, { label: string; color: string }> = {
  REVENUE: { label: 'Member payments', color: '#7A4FD0' },
}

export function categoryLabel(value: string): string {
  return DERIVED[value]?.label ?? LEDGER_CATEGORIES.find((c) => c.value === value)?.label ?? value
}
export function categoryColor(value: string): string {
  return DERIVED[value]?.color ?? LEDGER_CATEGORIES.find((c) => c.value === value)?.color ?? '#6B7280'
}

export type LedgerRow = {
  id: string
  direction: Direction
  category: string
  categoryLabel: string
  amount: number
  occurredAt: string // ISO
  dateLabel: string
  counterparty: string | null
  note: string | null
  billName: string | null
  hasBill: boolean
  createdByName: string | null
}

/** `YYYY-MM` in IST — the bucket key every report groups on. */
export function monthKey(d: Date): string {
  const p = istParts(d)
  return `${p.year}-${String(p.month + 1).padStart(2, '0')}`
}
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS[m - 1].slice(0, 3)} ${y}`
}

/** Every month between two keys inclusive, so a quiet month still gets a bar. */
export function monthRange(from: string, to: string): string[] {
  const out: string[] = []
  let [y, m] = from.split('-').map(Number)
  const [ty, tm] = to.split('-').map(Number)
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return out
}

export async function listLedger(limit = 500): Promise<LedgerRow[]> {
  try {
    await ensureLedgerSchema()
    const rows = await prisma.ledgerEntry.findMany({
      orderBy: { occurredAt: 'desc' },
      take: limit,
      // billUrl is a data URL and can be megabytes — never pull it into a list.
      select: {
        id: true, direction: true, category: true, amount: true, occurredAt: true,
        counterparty: true, note: true, billName: true, billUrl: false,
        createdByName: true,
      },
    })
    // Prisma can't select a field as false alongside true, so ask separately
    // which rows have a bill rather than fetching the bills themselves.
    const withBill = await prisma.ledgerEntry.findMany({
      where: { billUrl: { not: null }, id: { in: rows.map((r) => r.id) } },
      select: { id: true },
    })
    const billSet = new Set(withBill.map((b) => b.id))
    return rows.map((r) => ({
      id: r.id,
      direction: r.direction as Direction,
      category: r.category,
      categoryLabel: categoryLabel(r.category),
      amount: r.amount,
      occurredAt: r.occurredAt.toISOString(),
      dateLabel: fmtIST(r.occurredAt, { day: 'numeric', month: 'short', year: 'numeric' }),
      counterparty: r.counterparty,
      note: r.note,
      billName: r.billName,
      hasBill: billSet.has(r.id),
      createdByName: r.createdByName,
    }))
  } catch {
    return []
  }
}

/** One bill, fetched only when someone actually asks to see it. */
export async function getLedgerBill(id: string): Promise<{ name: string; url: string } | null> {
  try {
    await ensureLedgerSchema()
    const r = await prisma.ledgerEntry.findUnique({
      where: { id },
      select: { billName: true, billUrl: true },
    })
    if (!r?.billUrl) return null
    return { name: r.billName ?? 'bill', url: r.billUrl }
  } catch {
    return null
  }
}

// ── Reporting ────────────────────────────────────────────────────────────────

export type MonthMoney = {
  key: string
  label: string
  /** Customer payments (from Payment) plus ledger IN. */
  in: number
  /** Therapist pay (computed) plus ledger OUT. */
  out: number
  net: number
  /** The split behind `in` / `out`, for the drill-down. */
  revenue: number
  investment: number
  therapistPay: number
  otherOut: number
}

export type CategoryTotal = { category: string; label: string; color: string; amount: number; count: number }

export type MoneyReport = {
  months: MonthMoney[]
  outByCategory: CategoryTotal[]
  inByCategory: CategoryTotal[]
  totals: { in: number; out: number; net: number }
  /** This month against last, and this year against last. */
  compare: {
    monthIn: number; prevMonthIn: number
    monthOut: number; prevMonthOut: number
    yearIn: number; prevYearIn: number
    yearOut: number; prevYearOut: number
  }
  /**
   * Rest-of-year projection from the trailing run rate. Explicitly a
   * straight-line estimate, not a forecast — it says so on the chart.
   */
  projection: { months: string[]; inPerMonth: number; outPerMonth: number; basisMonths: number }
}

/**
 * The whole money picture, from all four sources.
 *
 * Therapist pay is taken from COMPLETED sessions with a note (the same rule the
 * earnings ledger pays on), so this can't drift from what clinicians are told
 * they earned.
 */
export async function getMoneyReport(monthsBack = 12): Promise<MoneyReport> {
  const now = new Date()
  const p = istParts(now)
  const thisMonth = monthKey(now)
  const startMonth = (() => {
    let y = p.year, m = p.month + 1 - (monthsBack - 1)
    while (m <= 0) { m += 12; y-- }
    return `${y}-${String(m).padStart(2, '0')}`
  })()
  const keys = monthRange(startMonth, thisMonth)
  const since = new Date(Date.UTC(Number(startMonth.slice(0, 4)), Number(startMonth.slice(5)) - 1, 1))

  const blank = (): MonthMoney => ({
    key: '', label: '', in: 0, out: 0, net: 0,
    revenue: 0, investment: 0, therapistPay: 0, otherOut: 0,
  })
  const bucket = new Map<string, MonthMoney>()
  for (const k of keys) bucket.set(k, { ...blank(), key: k, label: monthLabel(k) })

  const outCat = new Map<string, CategoryTotal>()
  const inCat = new Map<string, CategoryTotal>()
  const bumpCat = (m: Map<string, CategoryTotal>, category: string, amount: number) => {
    const cur = m.get(category) ?? {
      category, label: categoryLabel(category), color: categoryColor(category), amount: 0, count: 0,
    }
    cur.amount += amount
    cur.count += 1
    m.set(category, cur)
  }

  try {
    // All three run in one Promise.all, so without this a missing LedgerEntry
    // table rejects the whole batch — payments and sessions included — and the
    // entire money page reads zero rather than just the ledger part of it.
    await ensureLedgerSchema()
    const [payments, entries, sessions] = await Promise.all([
      prisma.payment.findMany({
        where: { createdAt: { gte: since } },
        select: { amount: true, createdAt: true },
      }),
      prisma.ledgerEntry.findMany({
        where: { occurredAt: { gte: since } },
        select: { direction: true, category: true, amount: true, occurredAt: true },
      }),
      prisma.appointment.findMany({
        where: { status: 'COMPLETED', summary: { not: null }, scheduledAt: { gte: since } },
        select: { fee: true, scheduledAt: true },
      }),
    ])

    for (const pay of payments) {
      const b = bucket.get(monthKey(pay.createdAt)); if (!b) continue
      b.revenue += pay.amount
      b.in += pay.amount
      bumpCat(inCat, 'REVENUE', pay.amount)
    }
    for (const s of sessions) {
      const b = bucket.get(monthKey(s.scheduledAt)); if (!b) continue
      b.therapistPay += s.fee
      b.out += s.fee
      bumpCat(outCat, 'THERAPIST_PAYOUT', s.fee)
    }
    for (const e of entries) {
      const b = bucket.get(monthKey(e.occurredAt)); if (!b) continue
      if (e.direction === 'IN') {
        b.investment += e.amount
        b.in += e.amount
        bumpCat(inCat, e.category, e.amount)
      } else {
        b.otherOut += e.amount
        b.out += e.amount
        bumpCat(outCat, e.category, e.amount)
      }
    }
  } catch {
    /* reporting only — an empty report beats a broken page */
  }

  const months = keys.map((k) => {
    const b = bucket.get(k)!
    b.net = b.in - b.out
    return b
  })

  const totals = months.reduce(
    (acc, m) => ({ in: acc.in + m.in, out: acc.out + m.out, net: acc.net + m.net }),
    { in: 0, out: 0, net: 0 },
  )

  const cur = months[months.length - 1] ?? blank()
  const prev = months[months.length - 2] ?? blank()
  const yearOf = (k: string) => k.slice(0, 4)
  const sumYear = (y: string, pick: (m: MonthMoney) => number) =>
    months.filter((m) => yearOf(m.key) === y).reduce((n, m) => n + pick(m), 0)
  const thisYear = String(p.year)
  const lastYear = String(p.year - 1)

  // Run rate from the completed months only: the current month is part-way
  // through, and including it drags every projection down.
  const completed = months.slice(0, -1).filter((m) => m.in > 0 || m.out > 0)
  const basis = completed.slice(-3)
  const avg = (pick: (m: MonthMoney) => number) =>
    basis.length ? Math.round(basis.reduce((n, m) => n + pick(m), 0) / basis.length) : 0
  const remaining = monthRange(thisMonth, `${p.year}-12`).slice(1)

  return {
    months,
    outByCategory: [...outCat.values()].sort((a, b) => b.amount - a.amount),
    inByCategory: [...inCat.values()].sort((a, b) => b.amount - a.amount),
    totals,
    compare: {
      monthIn: cur.in, prevMonthIn: prev.in,
      monthOut: cur.out, prevMonthOut: prev.out,
      yearIn: sumYear(thisYear, (m) => m.in), prevYearIn: sumYear(lastYear, (m) => m.in),
      yearOut: sumYear(thisYear, (m) => m.out), prevYearOut: sumYear(lastYear, (m) => m.out),
    },
    projection: {
      months: remaining,
      inPerMonth: avg((m) => m.in),
      outPerMonth: avg((m) => m.out),
      basisMonths: basis.length,
    },
  }
}
