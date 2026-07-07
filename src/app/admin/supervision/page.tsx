import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adminListTherapists, adminListSupervisionLinks } from '@/lib/expert'
import { assignSupervisionAction, removeSupervisionAction } from '../actions'

export const metadata = { title: 'Admin · Supervision', robots: { index: false, follow: false } }

const input: React.CSSProperties = {
  padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14,
  color: '#1C2B3A', fontFamily: "'DM Sans', sans-serif", background: '#fff',
}

/**
 * Admin supervision assignments. Only ADMINs can assign or de-assign a doctor
 * to a supervising doctor; supervisors then see their assignees' patients in
 * the expert portal.
 */
export default async function AdminSupervisionPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session) redirect('/login')
  if (role !== 'ADMIN') redirect('/app')

  const [therapists, links] = await Promise.all([adminListTherapists(), adminListSupervisionLinks()])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ fontSize: 12.5, fontWeight: 700, color: '#8E9EAE', letterSpacing: 0.5 }}>ADMIN</p>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 32, color: '#1C2B3A', marginBottom: 8 }}>
        Supervision assignments
      </h1>
      <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.6, marginBottom: 28 }}>
        Assign a doctor to a supervising doctor. Supervisors get full read-only visibility of their
        assignees&apos; patients in the expert portal, plus shared supervision notes. Only admins can change
        these assignments.
      </p>

      <div style={{ background: '#fff', border: '1px solid rgba(28,43,58,.1)', borderRadius: 16, padding: 22, marginBottom: 26 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A', marginBottom: 12 }}>New assignment</p>
        <form action={assignSupervisionAction} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select name="supervisorId" required defaultValue="" style={{ ...input, minWidth: 220 }}>
            <option value="" disabled>Supervisor…</option>
            {therapists.map((t) => (
              <option key={t.profileId} value={t.profileId}>{t.name} ({t.email})</option>
            ))}
          </select>
          <span style={{ color: '#8E9EAE', fontSize: 13 }}>supervises</span>
          <select name="superviseeId" required defaultValue="" style={{ ...input, minWidth: 220 }}>
            <option value="" disabled>Doctor…</option>
            {therapists.map((t) => (
              <option key={t.profileId} value={t.profileId}>{t.name} ({t.email})</option>
            ))}
          </select>
          <button type="submit" style={{ padding: '10px 20px', borderRadius: 10, background: '#C8553D', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Assign
          </button>
        </form>
      </div>

      <p style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A', marginBottom: 12 }}>
        Current assignments ({links.length})
      </p>
      {links.length === 0 && <p style={{ fontSize: 14, color: '#8E9EAE' }}>No supervision assignments yet.</p>}
      {links.map((l) => (
        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid rgba(28,43,58,.08)', borderRadius: 12, padding: '13px 16px', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: '#1C2B3A' }}>{l.supervisorName}</span>
            <span style={{ fontSize: 13, color: '#8E9EAE' }}> supervises </span>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: '#1C2B3A' }}>{l.superviseeName}</span>
            <span style={{ fontSize: 12, color: '#A0ADB8' }}> · since {l.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <form action={removeSupervisionAction}>
            <input type="hidden" name="linkId" value={l.id} />
            <button type="submit" style={{ padding: '8px 16px', borderRadius: 10, background: 'transparent', color: '#C0504B', border: '1.5px solid rgba(192,80,75,.35)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              De-assign
            </button>
          </form>
        </div>
      ))}
    </div>
  )
}
