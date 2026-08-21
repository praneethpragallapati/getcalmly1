/**
 * Registration numbers — the human-facing identifier every account carries.
 *
 * FORMAT
 *   GC-P-26-00042
 *   ├─ ├ ├─ └────── sequence, zero-padded to 5, restarting each year
 *   │  │  └───────── two-digit year the account was registered (IST)
 *   │  └──────────── role: P patient · E expert (clinician) · A admin
 *   └─────────────── getCalmly
 *
 * Why this shape: it is short enough to read aloud on a call, sorts sensibly,
 * says at a glance what kind of account it is and when it joined, and carries no
 * personal data. The sequence restarts per role per year so the numbers stay
 * short instead of growing forever.
 *
 * ALLOCATION
 * The sequence comes from a RegistrationCounter row, incremented atomically in
 * a single statement — two simultaneous signups get 41 and 42, never both 42.
 * The number is written to User.registrationNo, which is UNIQUE, so even a
 * pathological race fails closed rather than issuing a duplicate.
 *
 * A number is allocated once and never changes: it stays with the account for
 * life, including if the person's role is later changed by an admin (the letter
 * records what they registered AS, and rewriting history would break every
 * reference to it).
 */
import { prisma } from '@/lib/prisma'
import { istParts } from '@/lib/tz'

export type RegistrationRole = 'PATIENT' | 'THERAPIST' | 'ADMIN'

const ROLE_LETTER: Record<RegistrationRole, string> = {
  PATIENT: 'P',
  THERAPIST: 'E',
  ADMIN: 'A',
}

/** What each letter means, for UI that explains the number. */
export const REGISTRATION_LEGEND = 'GC-<role>-<year>-<sequence> · P member, E expert, A admin'

/**
 * What to call this id in the UI, per role.
 *
 * "Registration number" is deliberately NOT one of these: that name belongs to
 * the clinician's RCI/NMC council registration, and using it for both made the
 * platform id look like a clinical credential.
 */
export const ID_LABEL: Record<RegistrationRole, string> = {
  PATIENT: 'Member ID',
  THERAPIST: 'Expert ID',
  ADMIN: 'Admin ID',
}

/** Schema self-heal, matching the pattern used by the other migrations here. */
let registrationSchemaReady = false
export async function ensureRegistrationSchema(): Promise<void> {
  if (registrationSchemaReady) return
  const stmts = [
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "registrationNo" TEXT`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_registrationNo_key" ON "User"("registrationNo")`,
    `CREATE TABLE IF NOT EXISTS "RegistrationCounter" (
      "key" TEXT NOT NULL,
      "value" INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "RegistrationCounter_pkey" PRIMARY KEY ("key")
    )`,
  ]
  for (const sql of stmts) await prisma.$executeRawUnsafe(sql)
  registrationSchemaReady = true
}

/** Take the next number in a role-and-year bucket. Atomic. */
async function nextInSequence(bucket: string): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<{ value: number }[]>(
    `INSERT INTO "RegistrationCounter" ("key", "value", "updatedAt")
     VALUES ($1, 1, CURRENT_TIMESTAMP)
     ON CONFLICT ("key") DO UPDATE
       SET "value" = "RegistrationCounter"."value" + 1, "updatedAt" = CURRENT_TIMESTAMP
     RETURNING "value"`,
    bucket,
  )
  return rows[0]?.value ?? 1
}

/** Build the printed form from its parts. Exported for tests and for display. */
export function formatRegistrationNo(role: RegistrationRole, year: number, seq: number): string {
  return `GC-${ROLE_LETTER[role]}-${String(year % 100).padStart(2, '0')}-${String(seq).padStart(5, '0')}`
}

/**
 * The account's registration number, allocating one on first use. Idempotent:
 * an account that already has a number keeps it. Returns null only if the
 * allocation genuinely failed, so callers can fall back to showing nothing
 * rather than a wrong number.
 */
export async function ensureRegistrationNo(
  userId: string,
  role: RegistrationRole,
  registeredAt?: Date,
): Promise<string | null> {
  try {
    await ensureRegistrationSchema()
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { registrationNo: true, createdAt: true },
    })
    if (!existing) return null
    if (existing.registrationNo) return existing.registrationNo

    const year = istParts(registeredAt ?? existing.createdAt ?? new Date()).year
    const bucket = `${ROLE_LETTER[role]}-${String(year % 100).padStart(2, '0')}`

    // Retry a few times: the UNIQUE index is the real guarantee, so a collision
    // (only possible if a number was assigned out-of-band) just takes the next.
    for (let attempt = 0; attempt < 5; attempt++) {
      const seq = await nextInSequence(bucket)
      const no = formatRegistrationNo(role, year, seq)
      try {
        await prisma.user.update({ where: { id: userId }, data: { registrationNo: no } })
        return no
      } catch {
        // Either this number is taken, or someone assigned one to this user
        // concurrently — re-read before trying again.
        const now = await prisma.user.findUnique({ where: { id: userId }, select: { registrationNo: true } })
        if (now?.registrationNo) return now.registrationNo
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Give every account that predates this feature a number, in signup order so
 * the sequence reflects when people actually joined rather than when an admin
 * happened to open their page. Flag-guarded: one pass per process, and a no-op
 * once every account has one.
 */
let backfilled = false
export async function backfillRegistrationNumbers(): Promise<void> {
  if (backfilled) return
  backfilled = true // set first: a failure shouldn't retry on every request
  try {
    await ensureRegistrationSchema()
    const pending = await prisma.user.findMany({
      where: { registrationNo: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, createdAt: true },
      take: 5000,
    })
    for (const u of pending) {
      await ensureRegistrationNo(u.id, u.role as RegistrationRole, u.createdAt)
    }
  } catch {
    /* best-effort — a missing number shows as "—", never breaks a page */
  }
}
