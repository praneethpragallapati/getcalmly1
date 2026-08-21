/**
 * Turn off screen sharing and recording for every role in the 100ms template.
 *
 * Both controls live in the 100ms template, not in this codebase — the call is
 * their prebuilt UI in an iframe, so the buttons it shows come from the role's
 * own permissions. Blocking display-capture on the iframe (which we also do)
 * stops a screen share from working, but only this removes the button.
 *
 *   npx tsx scripts/hms-lock-template.ts          # dry run — prints the diff
 *   npx tsx scripts/hms-lock-template.ts --apply  # writes it back
 *
 * Needs HMS_ACCESS_KEY, HMS_SECRET and HMS_TEMPLATE_ID in the environment (the
 * same ones the app uses).
 *
 * The 100ms update endpoint replaces the WHOLE roles object rather than merging,
 * so this reads the live template, changes only the four fields below on each
 * role, and posts the result back. It never constructs a template from scratch.
 */
import { SignJWT } from 'jose'

const API = 'https://api.100ms.live/v2'

type Role = {
  permissions?: Record<string, unknown>
  publishParams?: { allowed?: string[] } & Record<string, unknown>
} & Record<string, unknown>

type Template = { id: string; name?: string; roles?: Record<string, Role> } & Record<string, unknown>

async function managementToken(): Promise<string> {
  const secret = new TextEncoder().encode(process.env.HMS_SECRET)
  return new SignJWT({ access_key: process.env.HMS_ACCESS_KEY, type: 'management', version: 2 })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setNotBefore(Math.floor(Date.now() / 1000) - 10)
    .setExpirationTime('10m')
    .sign(secret)
}

async function main() {
  const apply = process.argv.includes('--apply')
  const templateId = process.env.HMS_TEMPLATE_ID
  if (!process.env.HMS_ACCESS_KEY || !process.env.HMS_SECRET || !templateId) {
    console.error('Set HMS_ACCESS_KEY, HMS_SECRET and HMS_TEMPLATE_ID first.')
    process.exit(1)
  }

  const token = await managementToken()
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const res = await fetch(`${API}/templates/${templateId}`, { headers, cache: 'no-store' })
  if (!res.ok) {
    console.error(`Could not read template ${templateId}: ${res.status} ${await res.text()}`)
    process.exit(1)
  }
  const template = (await res.json()) as Template
  console.log(`Template: ${template.name ?? template.id}`)

  let changes = 0
  for (const [name, role] of Object.entries(template.roles ?? {})) {
    const perms = (role.permissions ??= {})
    const publish = (role.publishParams ??= {})
    const allowed: string[] = Array.isArray(publish.allowed) ? publish.allowed : []

    const before = {
      screen: allowed.includes('screen'),
      browserRecording: perms.browserRecording !== false,
      rtmpStreaming: perms.rtmpStreaming !== false,
      hlsStreaming: perms.hlsStreaming !== false,
    }
    const touched = before.screen || before.browserRecording || before.rtmpStreaming || before.hlsStreaming
    if (!touched) {
      console.log(`  ${name}: already locked down`)
      continue
    }

    // Screen share is a publishable track; recording/streaming are permissions.
    publish.allowed = allowed.filter((t) => t !== 'screen')
    perms.browserRecording = false
    perms.rtmpStreaming = false
    perms.hlsStreaming = false
    changes++

    const off = (was: boolean) => (was ? 'on -> OFF' : 'already off')
    console.log(`  ${name}:`)
    console.log(`    screen share      ${off(before.screen)}`)
    console.log(`    browserRecording  ${off(before.browserRecording)}`)
    console.log(`    rtmpStreaming     ${off(before.rtmpStreaming)}`)
    console.log(`    hlsStreaming      ${off(before.hlsStreaming)}`)
  }

  if (changes === 0) {
    console.log('\nNothing to change.')
    return
  }
  if (!apply) {
    console.log(`\n${changes} role(s) would change. Re-run with --apply to write it back.`)
    return
  }

  const put = await fetch(`${API}/templates/${templateId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(template),
  })
  if (!put.ok) {
    console.error(`Update failed: ${put.status} ${await put.text()}`)
    process.exit(1)
  }
  console.log(`\nUpdated ${changes} role(s). New calls pick this up immediately.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
