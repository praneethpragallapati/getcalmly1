import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminSession, getPatientDetail, getPatientActivity } from '@/lib/admin'
import { PatientAdmin } from '@/components/admin/PatientAdmin'
import { PatientActivitySections } from '@/components/admin/PatientActivity'
import { DeleteAccount } from '@/components/admin/DeleteAccount'
import { patientCode } from '@/lib/ids'
import { PersonDetailsCard } from '@/components/ui/PersonDetailsCard'
import { PatientTimeline } from '@/components/admin/PatientTimeline'
import { getPatientTimeline } from '@/lib/patientTimeline'
import { getPatientUsage } from '@/lib/ai/usage'

export const dynamic = 'force-dynamic'

export default async function AdminPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [p, activity, timeline] = await Promise.all([
    getPatientDetail(id), getPatientActivity(id), getPatientTimeline(id),
  ])
  if (!p) notFound()
  const usage = await getPatientUsage(p.userId)
  const usd = (n: number) => '$' + (n < 1 ? n.toFixed(4) : n.toFixed(2))

  return (
    <div className="stack">
      <Link href="/admin/patients" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> All patients
      </Link>
      <div className="page-head">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {p.name}
          <span style={{ fontSize: 13, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#6D5BD0', background: 'rgba(109,91,208,.1)', padding: '3px 9px', borderRadius: 7 }}>{p.contact.code ?? patientCode(p.userId)}</span>
        </div>
        <div className="page-meta">{p.email}</div>
      </div>
      <PersonDetailsCard
        contact={p.contact}
        name={p.name}
        note="Everything on file for this patient."
      />
      <PatientAdmin p={p} />

      <div className="card">
        <div className="section-title" style={{ fontSize: 18, marginBottom: 4 }}>AI usage & cost</div>
        <p className="muted" style={{ marginTop: 0 }}>This patient&apos;s token consumption and estimated spend across their AI features.</p>
        <div className="grid-4" style={{ marginTop: 12 }}>
          <div className="card stat-card"><div className="stat-l" style={{ marginTop: 0 }}>Avg cost / day</div><div className="stat-n" style={{ fontSize: 24 }}>{usd(usage.avgCostPerDay)}</div><div className="stat-l">{usage.avgTokensPerDay.toLocaleString('en-IN', { maximumFractionDigits: 0 })} tokens / day</div></div>
          <div className="card stat-card"><div className="stat-l" style={{ marginTop: 0 }}>Last 30 days</div><div className="stat-n" style={{ fontSize: 24 }}>{usd(usage.last30.cost)}</div><div className="stat-l">{usage.last30.tokens.toLocaleString('en-IN')} tokens</div></div>
          <div className="card stat-card"><div className="stat-l" style={{ marginTop: 0 }}>All time</div><div className="stat-n" style={{ fontSize: 24 }}>{usd(usage.total.cost)}</div><div className="stat-l">{usage.total.tokens.toLocaleString('en-IN')} tokens</div></div>
          <div className="card stat-card"><div className="stat-l" style={{ marginTop: 0 }}>Calls (all time)</div><div className="stat-n" style={{ fontSize: 24 }}>{usage.total.calls.toLocaleString('en-IN')}</div><div className="stat-l">{usage.firstDay ? `since ${usage.firstDay}` : 'no AI usage yet'}</div></div>
        </div>
      </div>

      <PatientTimeline events={timeline} />
      <PatientActivitySections activity={activity} />
      <DeleteAccount kind="patient" userId={p.userId} name={p.name} />
    </div>
  )
}
