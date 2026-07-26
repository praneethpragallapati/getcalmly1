// Applies pending Prisma migrations at build time so a deploy never runs new
// code against an out-of-date schema. Skips cleanly when DATABASE_URL is not
// set (e.g. a preview/CI build with no database), so those builds still pass.
// If a migration fails while a database IS configured, the build fails loudly.
import { execSync } from 'node:child_process'

if (!process.env.DATABASE_URL) {
  console.log('[build] DATABASE_URL not set — skipping prisma migrate deploy')
  process.exit(0)
}

console.log('[build] Applying database migrations (prisma migrate deploy)…')
execSync('prisma migrate deploy', { stdio: 'inherit' })
