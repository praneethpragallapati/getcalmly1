/**
 * Package purchases. The key rule (per product): buying a package never resets a
 * patient's balance, new sessions are ADDED to whatever they already have, and
 * validity is extended. This works whether the current plan is active, expired,
 * or absent, so an expired plan is "renewed" by topping up the same record.
 */
import { prisma } from '@/lib/prisma'
import { packsForIn, type BuyableTrack } from '@/data/pricing'
import { getPricingConfig } from '@/lib/pricingConfig'
import { resolveReferralCheckout, finalizeReferralCheckout, resolveWalletPayment, spendWalletCredit } from '@/lib/referral'

export type { BuyableTrack } from '@/data/pricing'

const PLAN_NAME: Record<BuyableTrack, string> = {
  therapy: 'Therapy',
  psychiatry: 'Psychiatry',
  couples: 'Couples therapy',
}

const CATEGORY: Record<BuyableTrack, 'INDIVIDUAL' | 'COUPLE'> = {
  therapy: 'INDIVIDUAL',
  psychiatry: 'INDIVIDUAL',
  couples: 'COUPLE',
}

// A patient can hold one package PER TYPE (therapy / psychiatry / couples) at
// once. therapy and psychiatry are both category INDIVIDUAL, so category alone
// can't tell them apart — the trackSlug does. Find the existing package for a
// track by matching trackSlug so buying psychiatry never tops up a therapy pack.
function findExistingForTrack(userId: string, track: BuyableTrack) {
  return prisma.subscription.findFirst({
    where: { userId, trackSlug: track },
    orderBy: { createdAt: 'desc' },
  })
}

function tierEnum(paidMonths: number): 'STARTER' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' {
  if (paidMonths >= 24) return 'PLATINUM'
  if (paidMonths >= 12) return 'GOLD'
  if (paidMonths >= 6) return 'SILVER'
  if (paidMonths >= 3) return 'BRONZE'
  return 'STARTER'
}

function addMonths(from: Date, months: number): Date {
  const d = new Date(from)
  d.setMonth(d.getMonth() + months)
  return d
}

export type BuyResult = {
  ok: boolean
  sessionsTotal?: number
  sessionsRemaining?: number
  walletApplied?: number // ₹ of wallet credit used as part-payment
  amountPaid?: number // ₹ actually charged after wallet credit
  error?: string
}

export type PackageBalance = {
  track: string
  label: string
  planName: string
  sessionsTotal: number
  sessionsUsed: number
  remaining: number
  expired: boolean
  validUntil: string | null
}

const TRACK_LABEL: Record<string, string> = {
  therapy: 'Individual therapy',
  psychiatry: 'Psychiatry',
  couples: 'Couples therapy',
  calmplus: 'Calm+',
}

/**
 * Every active session package the patient holds, one row per type, with the
 * live remaining balance. Drives the "all three balances" view on billing.
 */
export async function getActivePackages(patientId: string): Promise<PackageBalance[]> {
  try {
    const subs = await prisma.subscription.findMany({
      where: { userId: patientId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: { trackSlug: true, planName: true, sessionsTotal: true, sessionsUsed: true, expiresAt: true },
    })
    return subs
      .filter((s) => s.sessionsTotal > 0) // hide standalone Calm+ (no sessions)
      .map((s) => ({
        track: s.trackSlug,
        label: TRACK_LABEL[s.trackSlug] ?? s.planName,
        planName: s.planName,
        sessionsTotal: s.sessionsTotal,
        sessionsUsed: s.sessionsUsed,
        remaining: Math.max(0, s.sessionsTotal - s.sessionsUsed),
        expired: Boolean(s.expiresAt && s.expiresAt.getTime() < Date.now()),
        validUntil: s.expiresAt
          ? s.expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : null,
      }))
  } catch {
    return []
  }
}

/**
 * Record a money-in event for a purchase. Best-effort: the sale (the session
 * balance) is what the patient is promised, so a failure to write the revenue
 * ledger row must never fail the purchase itself.
 */
async function recordPayment(input: {
  userId: string
  subscriptionId: string
  amount: number
  kind: 'package' | 'first_session' | 'calmplus'
  trackSlug: string
  planName: string
}): Promise<string | null> {
  // Record even a ₹0 net purchase (fully covered by credit/discount) so the
  // referral engine can tie the qualifying event to a payment row for clawback.
  try {
    const p = await prisma.payment.create({ data: input, select: { id: true } })
    return p.id
  } catch {
    // Ledger is a reporting aid; never block a completed purchase on it.
    return null
  }
}

/**
 * Apply a pack purchase for a patient, additively. Tops up the patient's most
 * recent subscription (any status) in place, preserving sessionsUsed so the
 * remaining balance grows by the pack size, or creates the first one.
 */
export async function buyPackageFor(patientId: string, track: BuyableTrack, packIndex: number): Promise<BuyResult> {
  const pricing = await getPricingConfig()
  const packs = packsForIn(pricing, track)
  const pack = packs[packIndex]
  if (!pack) return { ok: false, error: 'Unknown package.' }
  const planName = `${PLAN_NAME[track]} ${pack.sessions}-session pack`

  // Referral / wallet: work out the referee first-purchase discount and wallet
  // credit to spend as part-payment, before we price the pack.
  const rr = await resolveReferralCheckout(patientId, pack.total)
  const sessionsToAdd = pack.sessions

  // Scope to THIS package type — never merge a psychiatry buy into a therapy pack.
  const existing = await findExistingForTrack(patientId, track)

  const now = new Date()

  if (existing) {
    const paidMonths = existing.paidMonths + pack.months
    // Extend from whichever is later: now, or the current expiry (so unused time
    // isn't lost when topping up an still-active plan).
    const base = existing.expiresAt && existing.expiresAt > now ? existing.expiresAt : now
    const expiresAt = addMonths(base, pack.months)
    const sessionsTotal = existing.sessionsTotal + sessionsToAdd

    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: 'ACTIVE',
        category: CATEGORY[track],
        trackSlug: track,
        planName,
        paidMonths,
        tier: tierEnum(paidMonths),
        sessionsTotal,
        expiresAt,
        renewsAt: expiresAt,
      },
    })
    const paymentId = await recordPayment({ userId: patientId, subscriptionId: existing.id, amount: rr.finalAmount, kind: 'package', trackSlug: track, planName })
    await finalizeReferralCheckout(patientId, rr, paymentId)
    return { ok: true, sessionsTotal, sessionsRemaining: Math.max(0, sessionsTotal - existing.sessionsUsed), walletApplied: rr.creditUsed, amountPaid: rr.finalAmount }
  }

  const expiresAt = addMonths(now, pack.months)
  try {
    const created = await prisma.subscription.create({
      data: {
        userId: patientId,
        category: CATEGORY[track],
        trackSlug: track,
        planName,
        status: 'ACTIVE',
        tier: tierEnum(pack.months),
        paidMonths: pack.months,
        sessionsTotal: sessionsToAdd,
        sessionsUsed: 0,
        startedAt: now,
        expiresAt,
        renewsAt: expiresAt,
      },
    })
    const paymentId = await recordPayment({ userId: patientId, subscriptionId: created.id, amount: rr.finalAmount, kind: 'package', trackSlug: track, planName })
    await finalizeReferralCheckout(patientId, rr, paymentId)
    return { ok: true, sessionsTotal: sessionsToAdd, sessionsRemaining: sessionsToAdd, walletApplied: rr.creditUsed, amountPaid: rr.finalAmount }
  } catch (e) {
    // Lost a concurrent create race (double-submit): the partial-unique index on
    // ACTIVE (userId, trackSlug) rejected this one. Treat it as idempotent — the
    // sibling request already created the package — so we neither surface an
    // error nor double-charge / double-add sessions.
    if ((e as { code?: string }).code === 'P2002') {
      const winner = await findExistingForTrack(patientId, track)
      if (winner) return { ok: true, sessionsTotal: winner.sessionsTotal, sessionsRemaining: Math.max(0, winner.sessionsTotal - winner.sessionsUsed) }
    }
    throw e
  }
}

/**
 * The intro purchase: exactly one session at the fixed first-session price for
 * the track (FIRST_SESSION in data/pricing). Only offered while the patient has
 * no session history; packs stay hidden until the first session is done.
 */
export async function buyFirstSessionFor(patientId: string, track: BuyableTrack): Promise<BuyResult> {
  const pricing = await getPricingConfig()
  const price = pricing.firstSession[track]
  if (!price) return { ok: false, error: 'Unknown track.' }

  // Scope to THIS package type: the intro offer is per care type, and buying a
  // therapy first session must not touch a psychiatry package (or vice versa).
  const existing = await prisma.subscription.findFirst({
    where: { userId: patientId, trackSlug: track },
    orderBy: { createdAt: 'desc' },
    select: { id: true, sessionsUsed: true, sessionsTotal: true },
  })
  // Already has sessions of this type (used or waiting): the intro offer no longer applies.
  if (existing && (existing.sessionsUsed > 0 || existing.sessionsTotal > 0)) {
    return { ok: false, error: 'The first-session offer applies only to your very first session.' }
  }

  const now = new Date()
  const expiresAt = addMonths(now, 1)
  const planName = `${PLAN_NAME[track]} · first session`
  const data = {
    category: CATEGORY[track],
    trackSlug: track,
    planName,
    status: 'ACTIVE' as const,
    tier: 'STARTER' as const,
    paidMonths: 1,
    sessionsTotal: 1,
    sessionsUsed: 0,
    startedAt: now,
    expiresAt,
    renewsAt: expiresAt,
  }
  // Wallet credit can part-pay any purchase, including the intro session.
  const wallet = await resolveWalletPayment(patientId, price)

  let sub
  if (existing) {
    sub = await prisma.subscription.update({ where: { id: existing.id }, data })
  } else {
    try {
      sub = await prisma.subscription.create({ data: { userId: patientId, ...data } })
    } catch (e) {
      // Concurrent double-submit lost the create race (partial-unique on ACTIVE).
      // A first session is a single session, so just reject the loser rather than
      // charging twice.
      if ((e as { code?: string }).code === 'P2002') {
        return { ok: false, error: 'The first-session offer applies only to your very first session.' }
      }
      throw e
    }
  }
  await recordPayment({ userId: patientId, subscriptionId: sub.id, amount: wallet.finalAmount, kind: 'first_session', trackSlug: track, planName })
  await spendWalletCredit(patientId, wallet.creditUsed)
  return { ok: true, sessionsTotal: 1, sessionsRemaining: 1, walletApplied: wallet.creditUsed, amountPaid: wallet.finalAmount }
}

/**
 * Buy a Calm+ app plan. Session plans already include Calm+, so for a patient
 * with an active session balance this simply extends their validity; otherwise
 * it creates (or renews) a standalone Calm+ subscription with no sessions.
 */
export async function buyCalmPlusFor(patientId: string, packIndex: number): Promise<BuyResult> {
  const pricing = await getPricingConfig()
  const pack = pricing.calmPlusPacks[packIndex]
  if (!pack) return { ok: false, error: 'Unknown plan.' }

  const existing = await prisma.subscription.findFirst({
    where: { userId: patientId },
    orderBy: { createdAt: 'desc' },
  })
  const now = new Date()
  const planLabel = `Calm+ · ${pack.label}`

  // Wallet credit part-pays a Calm+ purchase like any other.
  const wallet = await resolveWalletPayment(patientId, pack.total)

  if (existing) {
    const base = existing.expiresAt && existing.expiresAt > now ? existing.expiresAt : now
    const expiresAt = addMonths(base, pack.months)
    const paidMonths = existing.paidMonths + pack.months
    const keepSessionPlan = existing.sessionsTotal > 0
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: 'ACTIVE',
        planName: keepSessionPlan ? existing.planName : planLabel,
        paidMonths,
        tier: tierEnum(paidMonths),
        expiresAt,
        renewsAt: expiresAt,
      },
    })
    await recordPayment({ userId: patientId, subscriptionId: existing.id, amount: wallet.finalAmount, kind: 'calmplus', trackSlug: 'calmplus', planName: planLabel })
    await spendWalletCredit(patientId, wallet.creditUsed)
    return {
      ok: true,
      sessionsTotal: existing.sessionsTotal,
      sessionsRemaining: Math.max(0, existing.sessionsTotal - existing.sessionsUsed),
      walletApplied: wallet.creditUsed,
      amountPaid: wallet.finalAmount,
    }
  }

  const expiresAt = addMonths(now, pack.months)
  const created = await prisma.subscription.create({
    data: {
      userId: patientId,
      category: 'INDIVIDUAL',
      trackSlug: 'calmplus',
      planName: planLabel,
      status: 'ACTIVE',
      tier: tierEnum(pack.months),
      paidMonths: pack.months,
      sessionsTotal: 0,
      sessionsUsed: 0,
      startedAt: now,
      expiresAt,
      renewsAt: expiresAt,
    },
  })
  await recordPayment({ userId: patientId, subscriptionId: created.id, amount: wallet.finalAmount, kind: 'calmplus', trackSlug: 'calmplus', planName: planLabel })
  await spendWalletCredit(patientId, wallet.creditUsed)
  return { ok: true, sessionsTotal: 0, sessionsRemaining: 0, walletApplied: wallet.creditUsed, amountPaid: wallet.finalAmount }
}

/** Whether the patient already has a partner on record (for couples purchases). */
export async function hasPartnerOnRecord(patientId: string): Promise<boolean> {
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: patientId },
    select: { id: true },
  })
  if (!profile) return false
  const partner = await prisma.relatedPerson.findFirst({
    where: { profileId: profile.id, relation: 'PARTNER' },
    select: { id: true },
  })
  return !!partner
}

/** Save the partner's contact details collected during a couples purchase. */
export async function savePartnerFor(
  patientId: string,
  partner: { name: string; phone: string; email: string }
): Promise<boolean> {
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: patientId },
    select: { id: true },
  })
  if (!profile) return false
  await prisma.relatedPerson.create({
    data: {
      profileId: profile.id,
      relation: 'PARTNER',
      name: partner.name.trim(),
      phone: partner.phone.trim() || null,
      email: partner.email.trim() || null,
    },
  })
  return true
}
