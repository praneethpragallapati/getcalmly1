/**
 * "Something landed in your account" notifications.
 *
 * Sessions, validity, wallet credit and Calm+ were being granted silently —
 * an admin topped someone up and the member found out only if they happened to
 * look. Each of these is good news, so it says so.
 *
 * Two rules keep the tone honest:
 *   · only ADDITIONS celebrate. A correction downwards is stated plainly —
 *     "🎉 we removed 2 sessions" would be worse than saying nothing.
 *   · nothing here throws. A notification must never fail the grant that
 *     triggered it, so every call is best-effort (notify swallows its own
 *     errors, and the helpers below never raise on bad input).
 */
import { notify } from '@/lib/notifications'
import { fmtIST } from '@/lib/tz'

const rupees = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN')}`
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** Sessions added to (or removed from) a package. */
export async function notifySessionsChanged(
  userId: string,
  delta: number,
  planName?: string | null,
): Promise<void> {
  if (!delta) return
  const on = planName ? ` on your ${planName}` : ''
  await notify(userId, {
    type: 'plan',
    title: delta > 0
      ? `🎉 ${plural(delta, 'more session')} added`
      : `${plural(Math.abs(delta), 'session')} removed`,
    body: delta > 0
      ? `${plural(delta, 'session')} ${delta === 1 ? 'is' : 'are'} now waiting for you${on}. Book whenever you're ready.`
      : `We've adjusted your balance${on}. Get in touch if that looks wrong.`,
    href: '/app/sessions',
  })
}

/** A package's validity pushed out. */
export async function notifyValidityExtended(
  userId: string,
  months: number,
  newExpiry: Date | null,
  planName?: string | null,
): Promise<void> {
  if (months <= 0) return
  const until = newExpiry ? fmtIST(newExpiry, { day: 'numeric', month: 'short', year: 'numeric' }) : null
  await notify(userId, {
    type: 'plan',
    title: `🎉 ${plural(months, 'more month')} to use your sessions`,
    body: [
      planName ? `Your ${planName} now runs` : 'Your package now runs',
      until ? `until ${until}.` : 'for longer.',
      'No rush — book at the pace that suits you.',
    ].join(' '),
    href: '/app/sessions',
  })
}

/** Wallet credit added or removed. */
export async function notifyWalletChanged(userId: string, amount: number): Promise<void> {
  if (!amount) return
  await notify(userId, {
    type: 'wallet',
    title: amount > 0 ? `🎉 ${rupees(amount)} added to your wallet` : `${rupees(amount)} removed from your wallet`,
    body: amount > 0
      ? 'It comes off your next purchase automatically — nothing to claim.'
      : 'Get in touch if that looks wrong.',
    href: '/app/billing',
  })
}

/** Calm+ membership granted or extended. */
export async function notifyCalmPlusGranted(userId: string, months: number): Promise<void> {
  if (months <= 0) return
  await notify(userId, {
    type: 'plan',
    title: `🎉 Calm+ is yours for ${plural(months, 'month')}`,
    body: 'Mood tracking, journalling and Calm AI are all unlocked. Enjoy.',
    href: '/app',
  })
}

/** A new package bought or granted. */
export async function notifyPackageAdded(
  userId: string,
  planName: string,
  sessions: number,
): Promise<void> {
  await notify(userId, {
    type: 'plan',
    title: `🎉 ${planName} is active`,
    body: sessions > 0
      ? `${plural(sessions, 'session')} ready to book whenever you are.`
      : 'Your new package is ready.',
    href: '/app/sessions',
  })
}
