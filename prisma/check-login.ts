import { PrismaClient } from '@prisma/client'
import { verifyPassword, hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

// Diagnostic for "my password doesn't work". Takes the account to check as
// arguments rather than carrying them in the file — it used to hardcode a real
// person's address next to their password in plaintext.
//
//   npx tsx prisma/check-login.ts <email> <password>
const [EMAIL, PASSWORD] = process.argv.slice(2)

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.log('Usage: npx tsx prisma/check-login.ts <email> <password>')
    process.exitCode = 1
    return
  }

  // 1) Does the passwordHash column even exist? (migration 0006 applied?)
  try {
    await prisma.$queryRawUnsafe('SELECT "passwordHash" FROM "User" LIMIT 1')
    console.log('✓ passwordHash column exists (migration 0006 applied).')
  } catch (e) {
    console.log('✗ passwordHash column MISSING. Run `npm run db:deploy`.')
    console.log('  ', (e as Error).message)
    return
  }

  // 2) Does the user exist, and does the stored hash verify?
  const user = await prisma.user.findUnique({ where: { email: EMAIL } })
  if (!user) {
    console.log(`✗ No user with email ${EMAIL}. Run \`npm run db:seed\`.`)
    return
  }
  console.log(`✓ User found: id=${user.id} role=${user.role} name=${user.name}`)
  console.log(`  passwordHash present: ${user.passwordHash ? 'yes' : 'NO'}`)

  if (!user.passwordHash) {
    console.log('✗ passwordHash is null. Seed did not set it. Re-run `npm run db:seed`.')
    return
  }

  const ok = verifyPassword(PASSWORD, user.passwordHash)
  console.log(`  password verifies: ${ok ? '✓ MATCH' : '✗ NO MATCH'}`)

  // Sanity: a freshly hashed value of the same password should also verify.
  console.log(`  sanity (fresh hash verifies): ${verifyPassword(PASSWORD, hashPassword(PASSWORD))}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
