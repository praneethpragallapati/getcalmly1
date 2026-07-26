import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEarningsConfig } from '@/lib/earningsConfig'
import { EarningsConfigForm } from './EarningsConfigForm'

export const metadata = { title: 'Admin · Earnings config', robots: { index: false, follow: false } }

/**
 * Admin earnings-config page (stub of the larger admin area). ADMIN role only.
 * Edits the pay structure used to calculate therapist earnings.
 */
export default async function AdminEarningsPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session) redirect('/login')
  if (role !== 'ADMIN') redirect('/app')

  const config = await getEarningsConfig()

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ fontSize: 12.5, fontWeight: 700, color: '#8E9EAE', letterSpacing: 0.5 }}>ADMIN · STUB</p>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 32, color: '#1C2B3A', marginBottom: 8 }}>
        Earnings configuration
      </h1>
      <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.6, marginBottom: 28 }}>
        These values drive therapist earnings: each completed session pays the base fee for its service
        (individual therapy, couples therapy, or psychiatry) plus the relevant session-number bonus, a
        night-session bonus where applicable, and the misc bonus. This is an early stub, the full admin
        area lands later.
      </p>
      <EarningsConfigForm initial={config} />

      <p style={{ fontSize: 13.5, color: '#6B7D8E', marginTop: 28 }}>
        Set which clinicians are part-time (per-session) vs full-time (salaried) on the{' '}
        <Link href="/admin/therapists" style={{ color: '#C8553D', fontWeight: 600 }}>Clinicians</Link> page.
      </p>
    </div>
  )
}
