import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight, Star, UserPlus } from 'lucide-react'
import { getAdminSession, getClinicians } from '@/lib/admin'
import { expertCode } from '@/lib/ids'

export const dynamic = 'force-dynamic'

const charcoal = '#1C2B3A'
const idChip: React.CSSProperties = { fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#6D5BD0', background: 'rgba(109,91,208,.1)', padding: '2px 7px', borderRadius: 6, whiteSpace: 'nowrap' }

export default async function AdminCliniciansPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const rows = await getClinicians()

  return (
    <div className="stack">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Clinicians</div>
          <div className="page-meta">{rows.length} on the platform · tap one to edit rates, engagement, ratings, supervisors</div>
        </div>
        <Link href="/admin/create" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <UserPlus size={15} /> New clinician
        </Link>
      </div>

      {rows.length === 0 && <div className="card"><p className="muted">No clinicians yet. Create one from an approved application or from scratch.</p></div>}

      <div className="card" style={{ padding: 0 }}>
        {rows.map((c) => (
          <Link key={c.profileId} href={`/admin/therapists/${c.profileId}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', borderBottom: '1px solid rgba(28,43,58,.07)', textDecoration: 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: charcoal }}>{c.name}</span>
                <span style={idChip}>{expertCode(c.profileId)}</span>
                {!c.isActive && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#C0504B', background: 'rgba(192,80,75,.1)', padding: '2px 8px', borderRadius: 20 }}>Inactive</span>}
                {!c.isVerified && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#C9973A', background: 'rgba(201,151,58,.12)', padding: '2px 8px', borderRadius: 20 }}>Unverified</span>}
              </div>
              <div className="muted" style={{ fontSize: 12.5 }}>{c.designation} · {c.email}</div>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: c.employmentType === 'PART_TIME' ? '#1A7F7A' : '#3E6E9C', background: c.employmentType === 'PART_TIME' ? 'rgba(26,127,122,.1)' : 'rgba(62,110,156,.1)', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
              {c.employmentType === 'PART_TIME' ? 'Part-time' : 'Full-time'}
            </span>
            {c.totalReviews > 0 && (
              <span className="muted" style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <Star size={12} style={{ color: '#C9973A' }} /> {c.rating.toFixed(1)}
              </span>
            )}
            <ChevronRight size={16} style={{ color: '#8E9EAE', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  )
}
