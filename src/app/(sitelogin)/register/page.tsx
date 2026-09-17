import { redirect } from 'next/navigation'

// Sign-up has been folded into login. A first-time OTP login creates the account
// and /welcome collects everything a new member needs, so there is no separate
// sign-up screen any more. Any remaining /register link just lands on /login,
// carrying a referral code through if one was on the URL.
export default async function RegisterRedirect({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[] }>
}) {
  const sp = await searchParams
  const ref = Array.isArray(sp.ref) ? sp.ref[0] : sp.ref
  redirect(ref ? `/login?ref=${encodeURIComponent(ref)}` : '/login')
}
