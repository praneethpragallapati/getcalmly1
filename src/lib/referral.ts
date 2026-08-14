import { prisma } from '@/lib/prisma'

/**
 * Referral program — data access + the reward engine's read side. The write side
 * (attribution at signup, discount + reward at checkout, clawback) lands in
 * phase 2 and lives in billing / a server action; this file holds the config,
 * per-user code, and the views the patient page and admin panel render.
 */

export type ReferrerRewardKind = 'WALLET_CREDIT' | 'FREE_SESSION' | 'NONE'

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

/** Human label for a referrer reward, e.g. "₹500 wallet credit" / "1 free session". */
export function referrerRewardLabel(kind: ReferrerRewardKind, value: number): string {
  if (kind === 'FREE_SESSION') return `${value} free session${value === 1 ? '' : 's'}`
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
  // This patient's earned balances.
  walletCreditRupees: number
  bonusSessions: number
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
    bonusSessions: 0,
    invites: [],
    invitedCount: 0,
    rewardedCount: 0,
  }
  if (!config.enabled) return base

  try {
    const [code, user, referrals] = await Promise.all([
      ensureReferralCode(userId),
      prisma.user.findUnique({ where: { id: userId }, select: { walletCreditRupees: true, bonusSessions: true } }),
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
      bonusSessions: user?.bonusSessions ?? 0,
      invites,
      invitedCount: referrals.length,
      rewardedCount: referrals.filter((r) => r.status === 'REWARDED').length,
    }
  } catch {
    return base
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
