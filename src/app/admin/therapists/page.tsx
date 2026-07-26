import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adminListTherapistEmployment } from '@/lib/expert'
import { setEmploymentTypeAction } from '../actions'

export const metadata = { title: 'Admin · Clinicians', robots: { index: false, follow: false } }

const charcoal = '#1C2B3A'
const coral = '#C8553D'

export default async function AdminTherapistsPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session) redirect('/login')
  if (role !== 'ADMIN') redirect('/app')

  const therapists = await adminListTherapistEmployment()

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ fontSize: 12.5, fontWeight: 700, color: '#8E9EAE', letterSpacing: 0.5 }}>ADMIN</p>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 32, color: charcoal, marginBottom: 8 }}>
        Clinicians &amp; engagement
      </h1>
      <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.6, marginBottom: 28 }}>
        Set each clinician&apos;s engagement. <b>Part-time</b> clinicians are paid per session and see the
        earnings ledger; <b>full-time</b> clinicians are salaried, so their earnings page is disabled.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {therapists.map((t) => {
          const partTime = t.employmentType === 'PART_TIME'
          return (
            <div key={t.profileId} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', border: '1px solid #EAE7E3', borderRadius: 14, padding: '16px 18px', background: '#fff' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: charcoal }}>{t.name}</div>
                <div style={{ fontSize: 12.5, color: '#8E9EAE' }}>{t.designation}{t.email ? ` · ${t.email}` : ''}</div>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 20,
                color: partTime ? '#1A7F7A' : '#3E6E9C',
                background: partTime ? 'rgba(26,127,122,.1)' : 'rgba(62,110,156,.1)',
              }}>
                {partTime ? 'Part-time' : 'Full-time'}
              </span>
              <form action={setEmploymentTypeAction} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="hidden" name="profileId" value={t.profileId} />
                <select
                  name="employmentType"
                  defaultValue={t.employmentType}
                  style={{ padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13.5, background: '#fff' }}
                >
                  <option value="FULL_TIME">Full-time (salaried)</option>
                  <option value="PART_TIME">Part-time (per session)</option>
                </select>
                <button type="submit" style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: coral, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
                  Save
                </button>
              </form>
            </div>
          )
        })}
        {therapists.length === 0 && <p style={{ color: '#8E9EAE' }}>No clinicians found.</p>}
      </div>
    </div>
  )
}
