import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Where an OAuth (Google) sign-in lands. Because Google does a full-page redirect
// we can't role-route in the client the way the credentials flow does, so this
// tiny server route reads the session and sends each role to its dashboard.
export const dynamic = 'force-dynamic'

export default async function PostLoginPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!role) redirect('/login')
  redirect(role === 'THERAPIST' ? '/expert' : role === 'ADMIN' ? '/admin' : '/app')
}
