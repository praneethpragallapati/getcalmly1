import { prisma } from '@/lib/prisma'

/**
 * Referral program — data access + the reward engine's read side. The write side
 * (attribution at signup, discount + reward at checkout, clawback) lands in
 * phase 2 and lives in billing / a server action; this file holds the config,
 * per-user code, and the views the patient page and admin panel render.
 */

export type ReferrerRewardKind = 'WALLET_CREDIT' | 'NONE'

export type ReferralConfigValues = {
  enabled: boolean
  referrerRewardKind: ReferrerRewardKind
  referrerRewardValue: number
  refereeDiscount: number
  clawback: boolean
}

export const REFERRAL_DEFAULTS: ReferralConfigValues = {
  enabled: false,
  referrerRewardKind: 'WALLET_CREDIT',
  referrerRewardValue: 500,
  refereeDiscount: 500,
  clawback: true,
}

/**
 * Create the referral tables/columns if they don't exist yet — so the feature
 * works on a database that hasn't had the 0026_referrals migration applied by
 * hand. Every statement is `IF NOT EXISTS`-guarded (mirrors that migration), so
 * this is idempotent and a no-op once the schema is in place. Called before the
 * first write from the admin panel. Runs statement-by-statement because most
 * drivers reject multiple commands in one prepared query.
 */
let referralSchemaReady = false
export async function ensureReferralSchema(): Promise<void> {
  if (referralSchemaReady) return
  const stmts = [
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredById" TEXT`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "walletCreditRupees" INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bonusSessions" INTEGER NOT NULL DEFAULT 0`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode")`,
    `CREATE TABLE IF NOT EXISTS "Referral" (
      "id" TEXT NOT NULL,
      "referrerId" TEXT NOT NULL,
      "refereeId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "qualifyingPaymentId" TEXT,
      "referrerRewardKind" TEXT,
      "referrerRewardValue" INTEGER,
      "refereeDiscount" INTEGER,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "qualifiedAt" TIMESTAMP(3),
      CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Referral_refereeId_key" ON "Referral"("refereeId")`,
    `CREATE INDEX IF NOT EXISTS "Referral_referrerId_idx" ON "Referral"("referrerId")`,
    `CREATE INDEX IF NOT EXISTS "Referral_status_idx" ON "Referral"("status")`,
    `DO $$ BEGIN
      ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey"
        FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN
      ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeId_fkey"
        FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `CREATE TABLE IF NOT EXISTS "ReferralConfig" (
      "id" TEXT NOT NULL DEFAULT 'default',
      "enabled" BOOLEAN NOT NULL DEFAULT false,
      "referrerRewardKind" TEXT NOT NULL DEFAULT 'WALLET_CREDIT',
      "referrerRewardValue" INTEGER NOT NULL DEFAULT 500,
      "refereeDiscount" INTEGER NOT NULL DEFAULT 500,
      "clawback" BOOLEAN NOT NULL DEFAULT true,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ReferralConfig_pkey" PRIMARY KEY ("id")
    )`,
  ]
  for (const sql of stmts) {
    await prisma.$executeRawUnsafe(sql)
  }
  referralSchemaReady = true
}

/** Human label for a referrer reward, e.g. "₹500 wallet credit". */
export function referrerRewardLabel(kind: ReferrerRewardKind, value: number): string {
  if (kind === 'WALLET_CREDIT') return `₹${value.toLocaleString('en-IN')} wallet credit`
  return 'No reward'
}

/** Read the singleton config, falling back to defaults (program off) if unset. */
export async function getReferralConfig(): Promise<ReferralConfigValues> {
  try {
    const row = await prisma.referralConfig.findUnique({ where: { id: 'default' } })
    if (!row) return REFERRAL_DEFAULTS
    return {
      enabled: row.enabled,
      referrerRewardKind: row.referrerRewardKind as ReferrerRewardKind,
      referrerRewardValue: row.referrerRewardValue,
      refereeDiscount: row.refereeDiscount,
      clawback: row.clawback,
    }
  } catch {
    return REFERRAL_DEFAULTS
  }
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars

function randomCode(len = 7): string {
  let s = ''
  for (let i = 0; i < len; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return s
}

/** Get (or lazily create) this user's own referral code. */
export async function ensureReferralCode(userId: string): Promise<string | null> {
  try {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } })
    if (u?.referralCode) return u.referralCode
    // Retry a few times in the astronomically unlikely case of a collision.
    for (let i = 0; i < 5; i++) {
      const code = randomCode()
      try {
        await prisma.user.update({ where: { id: userId }, data: { referralCode: code } })
        return code
      } catch {
        // unique clash → try another
      }
    }
    return null
  } catch {
    return null
  }
}

function siteUrl(): string {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return u || 'https://getcalmly1.vercel.app'
}

export type ReferralInvite = { name: string; status: string; joinedLabel: string }

export type PatientReferralView = {
  enabled: boolean
  code: string | null
  link: string | null
  // The current benefits, so the patient knows what they and their friend get.
  referrerRewardLabel: string
  refereeDiscount: number
  // This patient's earned wallet balance.
  walletCreditRupees: number
  // People they've invited and where each stands.
  invites: ReferralInvite[]
  invitedCount: number
  rewardedCount: number
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Joined',
  QUALIFIED: 'Purchased',
  REWARDED: 'Rewarded',
  REVOKED: 'Reversed',
}

/** Everything the patient "Refer & earn" page needs. */
export async function getPatientReferral(userId: string): Promise<PatientReferralView> {
  const config = await getReferralConfig()
  const base: PatientReferralView = {
    enabled: config.enabled,
    code: null,
    link: null,
    referrerRewardLabel: referrerRewardLabel(config.referrerRewardKind, config.referrerRewardValue),
    refereeDiscount: config.refereeDiscount,
    walletCreditRupees: 0,
    invites: [],
    invitedCount: 0,
    rewardedCount: 0,
  }
  if (!config.enabled) return base

  try {
    const [code, user, referrals] = await Promise.all([
      ensureReferralCode(userId),
      prisma.user.findUnique({ where: { id: userId }, select: { walletCreditRupees: true } }),
      prisma.referral.findMany({
        where: { referrerId: userId },
        orderBy: { createdAt: 'desc' },
        select: { status: true, createdAt: true, referee: { select: { name: true } } },
      }),
    ])
    const invites: ReferralInvite[] = referrals.map((r) => ({
      name: r.referee?.name ?? 'Invited friend',
      status: STATUS_LABEL[r.status] ?? r.status,
      joinedLabel: r.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }))
    return {
      ...base,
      code,
      link: code ? `${siteUrl()}/register?ref=${code}` : null,
      walletCreditRupees: user?.walletCreditRupees ?? 0,
      invites,
      invitedCount: referrals.length,
      rewardedCount: referrals.filter((r) => r.status === 'REWARDED').length,
    }
  } catch {
    return base
  }
}

// ── Reward engine (write side) ───────────────────────────────────────────────

/**
 * Attribution at signup. Tags a NEW referee to the referrer behind `code` and
 * opens a PENDING referral. No-ops on self-referral, an unknown code, an already
 * attributed user, or someone who has already paid (existing customers don't
 * qualify). Best-effort — never throws into the caller.
 */
export async function attributeReferral(refereeId: string, code: string): Promise<void> {
  try {
    const clean = code.trim().toUpperCase()
    if (!clean) return
    const referee = await prisma.user.findUnique({ where: { id: refereeId }, select: { id: true, referredById: true } })
    if (!referee || referee.referredById) return
    const priorPayments = await prisma.payment.count({ where: { userId: refereeId } })
    if (priorPayments > 0) return // only genuinely new customers
    const referrer = await prisma.user.findUnique({ where: { referralCode: clean }, select: { id: true } })
    if (!referrer || referrer.id === refereeId) return // unknown code or self-referral
    await prisma.user.update({ where: { id: refereeId }, data: { referredById: referrer.id } })
    await prisma.referral.upsert({
      where: { refereeId },
      update: {},
      create: { referrerId: referrer.id, refereeId, status: 'PENDING' },
    })
  } catch {
    /* best-effort */
  }
}

export type CheckoutResolution = {
  refereeDiscount: number
  creditUsed: number
  finalAmount: number
  referralId: string | null // set only when this is the referee's first qualifying package
}

/**
 * Work out the discounts to apply to a package purchase of `basePrice`:
 * the referee's one-time first-purchase discount (if they were referred and this
 * is their first package), then any wallet credit as part-payment.
 * Read-only — the caller applies the numbers and then calls finalizeReferralCheckout.
 */
export async function resolveReferralCheckout(userId: string, basePrice: number): Promise<CheckoutResolution> {
  const fallback: CheckoutResolution = { refereeDiscount: 0, creditUsed: 0, finalAmount: basePrice, referralId: null }
  try {
    const [config, user] = await Promise.all([
      getReferralConfig(),
      prisma.user.findUnique({ where: { id: userId }, select: { walletCreditRupees: true } }),
    ])
    if (!user) return fallback

    let refereeDiscount = 0
    let referralId: string | null = null
    if (config.enabled && config.refereeDiscount > 0) {
      const referral = await prisma.referral.findFirst({ where: { refereeId: userId, status: 'PENDING' }, select: { id: true } })
      if (referral) {
        const priorPackages = await prisma.payment.count({ where: { userId, kind: 'package' } })
        if (priorPackages === 0) {
          refereeDiscount = Math.min(config.refereeDiscount, basePrice)
          referralId = referral.id
        }
      }
    }
    const afterReferee = Math.max(0, basePrice - refereeDiscount)
    const creditUsed = Math.min(Math.max(0, user.walletCreditRupees), afterReferee)
    const finalAmount = Math.max(0, afterReferee - creditUsed)
    return { refereeDiscount, creditUsed, finalAmount, referralId }
  } catch {
    return fallback
  }
}

export type WalletApplication = { creditUsed: number; finalAmount: number }

/**
 * Apply the patient's wallet credit as part-payment on ANY purchase of
 * `basePrice` (first session, Calm+, anything). Read-only — the caller records
 * the net `finalAmount` and then calls spendWalletCredit(creditUsed). Wallet
 * credit can only ever reduce a bill, never take it below zero.
 */
export async function resolveWalletPayment(userId: string, basePrice: number): Promise<WalletApplication> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { walletCreditRupees: true } })
    const balance = Math.max(0, user?.walletCreditRupees ?? 0)
    const creditUsed = Math.min(balance, Math.max(0, basePrice))
    return { creditUsed, finalAmount: Math.max(0, basePrice - creditUsed) }
  } catch {
    return { creditUsed: 0, finalAmount: basePrice }
  }
}

/** Deduct spent wallet credit after a purchase completes. Best-effort, floored at 0. */
export async function spendWalletCredit(userId: string, amount: number): Promise<void> {
  if (amount <= 0) return
  try {
    await prisma.user.update({ where: { id: userId }, data: { walletCreditRupees: { decrement: amount } } })
    await prisma.user.updateMany({ where: { id: userId, walletCreditRupees: { lt: 0 } }, data: { walletCreditRupees: 0 } })
  } catch {
    /* best-effort */
  }
}

/**
 * Apply the side-effects of a resolved checkout AFTER the package is created:
 * spend the wallet credit and — if this closed a referral — grant the referrer
 * their wallet-credit reward exactly once. Best-effort; a failure here must
 * never fail the purchase the patient already completed.
 */
export async function finalizeReferralCheckout(
  userId: string,
  r: CheckoutResolution,
  qualifyingPaymentId: string | null
): Promise<void> {
  try {
    if (r.creditUsed > 0) await spendWalletCredit(userId, r.creditUsed)

    if (!r.referralId) return
    const config = await getReferralConfig()
    const referral = await prisma.referral.findUnique({ where: { id: r.referralId }, select: { id: true, referrerId: true, status: true } })
    if (!referral || referral.status !== 'PENDING') return // exactly-once guard

    const kind = config.referrerRewardKind
    const value = config.referrerRewardValue
    if (kind === 'WALLET_CREDIT' && value > 0) {
      await prisma.user.update({ where: { id: referral.referrerId }, data: { walletCreditRupees: { increment: value } } })
    }

    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: 'REWARDED',
        qualifyingPaymentId,
        referrerRewardKind: kind === 'NONE' ? null : kind,
        referrerRewardValue: kind === 'NONE' ? null : value,
        refereeDiscount: r.refereeDiscount,
        qualifiedAt: new Date(),
      },
    })
  } catch {
    /* best-effort */
  }
}

/** Reverse a granted reward and mark the referral REVOKED (clawback). */
export async function revokeReferral(referralId: string): Promise<boolean> {
  try {
    const referral = await prisma.referral.findUnique({ where: { id: referralId } })
    if (!referral || referral.status !== 'REWARDED') return false
    if (referral.referrerRewardKind === 'WALLET_CREDIT' && referral.referrerRewardValue) {
      await prisma.user.update({ where: { id: referral.referrerId }, data: { walletCreditRupees: { decrement: referral.referrerRewardValue } } })
      await prisma.user.updateMany({ where: { id: referral.referrerId, walletCreditRupees: { lt: 0 } }, data: { walletCreditRupees: 0 } })
    }
    await prisma.referral.update({ where: { id: referralId }, data: { status: 'REVOKED' } })
    return true
  } catch {
    return false
  }
}

/** Clawback tied to a refunded/voided qualifying purchase. Gated by config. */
export async function revokeReferralForPayment(qualifyingPaymentId: string): Promise<void> {
  try {
    const config = await getReferralConfig()
    if (!config.clawback) return
    const referral = await prisma.referral.findFirst({ where: { qualifyingPaymentId, status: 'REWARDED' }, select: { id: true } })
    if (referral) await revokeReferral(referral.id)
  } catch {
    /* best-effort */
  }
}

export type AdminReferralRow = {
  id: string
  referrer: string
  referee: string
  status: string
  reward: string
  date: string
}

/** The referrals table for the admin panel. */
export async function getReferralsForAdmin(): Promise<AdminReferralRow[]> {
  try {
    const rows = await prisma.referral.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: {
        id: true, status: true, createdAt: true, referrerRewardKind: true, referrerRewardValue: true,
        referrer: { select: { name: true, email: true } },
        referee: { select: { name: true, email: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      referrer: r.referrer?.name || r.referrer?.email || 'Member',
      referee: r.referee?.name || r.referee?.email || 'Member',
      status: STATUS_LABEL[r.status] ?? r.status,
      reward: r.referrerRewardKind
        ? referrerRewardLabel(r.referrerRewardKind as ReferrerRewardKind, r.referrerRewardValue ?? 0)
        : '—',
      date: r.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }))
  } catch {
    return []
  }
}
