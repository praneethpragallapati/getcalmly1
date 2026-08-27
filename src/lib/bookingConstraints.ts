import { prisma } from '@/lib/prisma'

/**
 * Stop a slot from being booked twice.
 *
 * Two guarantees, one partial unique index each:
 *
 *   1. A clinician can hold only ONE live session at a given instant — so two
 *      members can never both take the same slot.
 *   2. A member can hold only ONE live session at a given instant — so they can
 *      never be booked with two clinicians at the same time.
 *
 * "Live" excludes CANCELLED, so a slot freed by a cancellation is bookable
 * again, and a settled void doesn't keep the slot reserved. The index is what
 * makes this race-proof: the friendly pre-checks in the booking and reschedule
 * actions catch the ordinary case, but two requests arriving in the same
 * instant are decided here, by the database, where exactly one can win.
 *
 * A filtered (partial) unique index cannot be expressed in schema.prisma, so it
 * is created here (and in prisma/sync_schema.sql and migration 0045) rather than
 * through the Prisma schema. Self-healing so a database that has not run the SQL
 * is still protected from the first booking attempt onward.
 *
 * Guarded by a module-level flag so the DDL runs at most once per process, and
 * fail-soft: if the index cannot be created because the table already holds
 * duplicate live appointments, the pre-checks still apply — we log rather than
 * throw, so booking is never taken down by this.
 */
let ready = false

export async function ensureBookingConstraints(): Promise<void> {
  if (ready) return
  const stmts = [
    `CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_therapist_slot_active_key"
       ON "Appointment" ("therapistId", "scheduledAt") WHERE "status" <> 'CANCELLED'`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_patient_slot_active_key"
       ON "Appointment" ("patientId", "scheduledAt") WHERE "status" <> 'CANCELLED'`,
  ]
  for (const sql of stmts) {
    try {
      await prisma.$executeRawUnsafe(sql)
    } catch (e) {
      // Most likely: existing duplicate live appointments block the unique build.
      // Leave the pre-checks to carry it and surface the reason once.
      console.error('[ensureBookingConstraints] could not create a slot-uniqueness index — dedupe existing appointments then re-run prisma/sync_schema.sql', e)
    }
  }
  ready = true
}

/** Postgres unique-violation, as Prisma surfaces it (P2002). */
export function isSlotConflict(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002'
}
