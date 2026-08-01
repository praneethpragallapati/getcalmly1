import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, Stethoscope, CalendarClock, Inbox, Building2, FileCheck2, CreditCard } from 'lucide-react'
import { getAdminSession, getAdminOverview } from '@/lib/admin'
import { BroadcastComposer } from '@/components/admin/BroadcastComposer'

export default async function AdminOverviewPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const k = await getAdminOverview()

  const cards: { label: string; value: number; icon: React.ReactNode; href?: string; alert?: boolean }[] = [
    { label: 'Active patients', value: k.patients, icon: <Users size={18} /> },
    { label: 'Active clinicians', value: k.clinicians, icon: <Stethoscope size={18} />, href: '/admin/therapists' },
    { label: 'Sessions today', value: k.sessionsToday, icon: <CalendarClock size={18} /> },
    { label: 'Pending applications', value: k.pendingApplications, icon: <FileCheck2 size={18} />, href: '/admin/submissions' },
    { label: 'New contact messages', value: k.newContacts, icon: <Inbox size={18} />, href: '/admin/submissions' },
    { label: 'New enterprise leads', value: k.newLeads, icon: <Building2 size={18} />, href: '/admin/submissions' },
    { label: 'Active subscriptions', value: k.activeSubscriptions, icon: <CreditCard size={18} /> },
  ]

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Admin dashboard</div>
        <div className="page-meta">A live view of the platform — people, intake, safety and money at a glance</div>
      </div>

      <div className="grid-4">
        {cards.map((c) => {
          const body = (
            <>
              <span style={{ color: c.alert ? '#C0504B' : 'var(--c-coral)' }}>{c.icon}</span>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, marginTop: 8, color: c.alert && c.value > 0 ? '#C0504B' : undefined }}>{c.value}</div>
              <div className="muted">{c.label}</div>
            </>
          )
          return c.href
            ? <Link key={c.label} href={c.href} className="card" style={{ textDecoration: 'none' }}>{body}</Link>
            : <div key={c.label} className="card">{body}</div>
        })}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title" style={{ marginBottom: 10 }}>Triage queue</div>
          <p className="muted" style={{ marginBottom: 14, lineHeight: 1.6 }}>
            Inbound that needs an admin: {k.pendingApplications} clinician application{k.pendingApplications === 1 ? '' : 's'},
            {' '}{k.newContacts} contact message{k.newContacts === 1 ? '' : 's'}, {k.newLeads} enterprise lead{k.newLeads === 1 ? '' : 's'}.
          </p>
          <Link href="/admin/submissions" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <Inbox size={15} /> Open submissions
          </Link>
        </div>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 10 }}>Quick actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/admin/therapists" className="link-action">Manage clinicians &amp; rates →</Link>
            <Link href="/admin/supervision" className="link-action">Assign supervision →</Link>
            <Link href="/admin/money" className="link-action">Therapist payout &amp; statements →</Link>
          </div>
        </div>
      </div>

      <BroadcastComposer />
    </div>
  )
}
