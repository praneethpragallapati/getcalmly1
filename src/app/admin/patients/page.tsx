import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { getAdminSession, getPatients } from '@/lib/admin'
import { patientCode } from '@/lib/ids'

export const dynamic = 'force-dynamic'

const charcoal = '#1C2B3A'
const idChip: React.CSSProperties = { fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#6D5BD0', background: 'rgba(109,91,208,.1)', padding: '2px 7px', borderRadius: 6, whiteSpace: 'nowrap' }

export default async function AdminPatientsPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const rows = await getPatients()

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Patients</div>
        <div className="page-meta">{rows.length} shown · open one to reassign their clinician or manage packages</div>
      </div>

      {rows.length === 0 && <div className="card"><p className="muted">No patients found.</p></div>}

      <div className="card" style={{ padding: 0 }}>
        {rows.map((p) => (
          <Link key={p.userId} href={`/admin/patients/${p.userId}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid rgba(28,43,58,.07)', textDecoration: 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: charcoal }}>{p.name}</span>
                <span style={idChip}>{patientCode(p.userId)}</span>
              </div>
              <div className="muted" style={{ fontSize: 12.5 }}>{p.email}</div>
            </div>
            <span className="muted" style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>{p.activePlans} active plan{p.activePlans === 1 ? '' : 's'}</span>
            <ChevronRight size={16} style={{ color: '#8E9EAE', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  )
}
