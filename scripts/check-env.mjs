/**
 * Fail a production build when an environment variable whose absence is SILENT
 * is missing. Runs from `npm run build`, before `next build`.
 *
 * The bar for adding something here is deliberately high: only variables where
 * a missing value produces a working-looking site that is quietly wrong. If the
 * app crashes loudly without it (DATABASE_URL) or degrades in a documented,
 * visible way (the AI keys, Resend, MSG91, 100ms), it does not belong here —
 * that failure already announces itself.
 *
 * Development is never blocked; the fallbacks exist so `npm run dev` works on a
 * fresh clone with no configuration at all.
 */

const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'

const required = [
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    why:
      'Canonical URLs, OpenGraph tags, sitemap entries, referral invite links and\n' +
      '    llms.txt are all built from it. Unset, it falls back to http://localhost:3000\n' +
      '    and the site ships with every one of those pointing at localhost — pages\n' +
      '    render fine, so nothing looks broken until search engines index it or a\n' +
      '    member shares a referral link that goes nowhere.',
  },
  {
    name: 'NEXTAUTH_SECRET',
    why:
      'Signs every session token. Missing in production, NextAuth refuses to issue\n' +
      '    sessions and nobody can sign in.',
  },
]

const missing = required.filter(({ name }) => !process.env[name]?.trim())

if (missing.length === 0) {
  process.exit(0)
}

if (!isProduction) {
  console.warn(`\n⚠  Not set: ${missing.map((m) => m.name).join(', ')}`)
  console.warn('   Fine for local development — falling back to defaults.')
  console.warn('   A production build will refuse to run without them. See .env.example.\n')
  process.exit(0)
}

console.error('\n✗ Production build stopped: required environment variables are missing.\n')
for (const { name, why } of missing) {
  console.error(`  ${name}`)
  console.error(`    ${why}\n`)
}
console.error('  Set them and build again. See .env.example for the full list.\n')
process.exit(1)
