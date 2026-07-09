import { PrismaClient } from '@prisma/client'
import { verifyPassword, hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

const EMAIL = 'praneethpragallapati@gmail.com'
const PASSWORD = 'Merind07!demo'

async function main() {
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
  console.log(`  verifyPassword('${PASSWORD}'): ${ok ? '✓ MATCH' : '✗ NO MATCH'}`)

  // Sanity: a freshly hashed value of the same password should also verify.
  console.log(`  sanity (fresh hash verifies): ${verifyPassword(PASSWORD, hashPassword(PASSWORD))}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
