// Apply any pending Prisma migrations at build/deploy time so the live database
// schema keeps up with the code. Without this, newer columns referenced by the
// app (e.g. therapist pay fields, per-category clinician assignments) are
// missing on a deployment that was never migrated, and pages that select them
// fail (a clinician/patient detail page 404s, the caseload degrades, etc.).
//
// Best-effort by design: if the database can't be reached at build time (some
// platforms build without DB access), we log and continue rather than failing
// the whole deploy — the site is then no worse off than before, and the
// migration can still be applied with `npm run db:deploy`.
import { execSync } from 'node:child_process'

if (!process.env.DATABASE_URL) {
  console.warn('[migrate-deploy] DATABASE_URL not set — skipping migrations.')
  process.exit(0)
}

try {
  console.log('[migrate-deploy] applying pending migrations…')
  execSync('npx --no-install prisma migrate deploy', { stdio: 'inherit' })
  console.log('[migrate-deploy] done.')
} catch (e) {
  console.warn('[migrate-deploy] could not apply migrations (continuing):', e?.message ?? e)
}
