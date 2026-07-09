import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

/**
 * Safe migrate runner for a database that already has tables but no Prisma
 * migration history (the classic P3005 situation on Supabase projects that were
 * first created with `db push` or manual SQL).
 *
 * It detects which migrations are *already* reflected in the live schema, marks
 * exactly those as applied (baseline), then runs `migrate deploy` so only the
 * genuinely-new migrations actually execute. Idempotent: once the history table
 * exists it just defers to a normal `migrate deploy`.
 */
const prisma = new PrismaClient()

async function tableExists(name: string): Promise<boolean> {
  const r = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
    name,
  )
  return Array.isArray(r) && r.length > 0
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const r = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2 LIMIT 1`,
    table,
    column,
  )
  return Array.isArray(r) && r.length > 0
}

function resolveApplied(migration: string) {
  console.log(`  ↳ marking ${migration} as already applied`)
  execSync(`npx prisma migrate resolve --applied ${migration}`, { stdio: 'inherit' })
}

async function main() {
  const hasHistory = await tableExists('_prisma_migrations')

  if (hasHistory) {
    console.log('Migration history table exists, running a normal migrate deploy.')
  } else {
    const schemaIsEmpty = !(await tableExists('User'))
    if (schemaIsEmpty) {
      console.log('Fresh/empty database, migrate deploy will apply everything.')
    } else {
      console.log('Existing schema with no migration history detected, baselining.')

      // 0001–0004 produced the core schema the app already runs on, so they are
      // present whenever the User table exists.
      const baseline = [
        '0001_init',
        '0002_blog_community',
        '0003_patient_dashboard',
        '0004_checkin_journal_grain',
      ]

      // 0005/0006 are the new ones, only baseline them if their schema is
      // genuinely already present, otherwise let migrate deploy apply them.
      if (await tableExists('ClinicalContext')) baseline.push('0005_ai_integration')
      if (await columnExists('User', 'passwordHash')) baseline.push('0006_password_auth')

      for (const m of baseline) resolveApplied(m)
    }
  }

  await prisma.$disconnect()

  console.log('Running prisma migrate deploy…')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
