import Link from 'next/link'
import { Crown, CreditCard, Mail } from 'lucide-react'
import { getAccount } from '@/lib/account'
import { PrivacyControls } from '@/components/dashboard/PrivacyControls'
import { LogoutButton } from '@/components/dashboard/LogoutButton'

export default async function SettingsPage() {
  const { name, email, plan, privacy } = await getAccount()
  const sessionsPct = plan.sessionsTotal ? Math.round((plan.sessionsUsed / plan.sessionsTotal) * 100) : 0

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Settings</h1>
        <span className="page-meta">Plan & privacy</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="stack">
          {/* Plan & billing */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={17} /> Plan & billing
              </div>
              <span className="tier-badge">
                <Crown size={13} /> {plan.tier}
              </span>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="doc-name" style={{ fontSize: 18 }}>{plan.planName}</div>
              <div className="doc-sub">
                {plan.sessionsTotal > 0
                  ? `${plan.category} care · member for ${plan.paidMonths} months`
                  : 'Book your first session to start a plan'}
              </div>
            </div>

            <div style={{ margin: '18px 0 6px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--c-gray-d)', fontWeight: 600 }}>Sessions used</span>
              <span style={{ color: 'var(--c-charcoal)', fontWeight: 700 }}>
                {plan.sessionsUsed} / {plan.sessionsTotal}
              </span>
            </div>
            <div className="progress">
              <span style={{ width: `${sessionsPct}%` }} />
            </div>

            {plan.minutesTotal != null && (
              <>
                <div style={{ margin: '14px 0 6px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--c-gray-d)', fontWeight: 600 }}>Counselling minutes</span>
                  <span style={{ color: 'var(--c-charcoal)', fontWeight: 700 }}>
                    {plan.minutesUsed ?? 0} / {plan.minutesTotal}
                  </span>
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.round(((plan.minutesUsed ?? 0) / plan.minutesTotal) * 100)}%` }} />
                </div>
              </>
            )}

            <div className="session-info-grid" style={{ marginTop: 18 }}>
              <div>
                <div className="lbl">STARTED</div>
                <div className="val">{plan.startedOn}</div>
              </div>
              <div>
                <div className="lbl">RENEWS</div>
                <div className="val">{plan.renewsOn ?? '—'}</div>
              </div>
            </div>

            <Link href="/app/billing" className="btn btn-primary" style={{ marginTop: 18, width: '100%', justifyContent: 'center' }}>
              Buy a package
            </Link>
          </div>


          {/* Account */}
          <div className="card">
            <div className="section-title">Your account</div>
            <div className="med-row" style={{ borderBottom: 'none' }}>
              <span className="sb-avatar" style={{ background: 'var(--c-coral)' }}>
                {name.charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="doc-name" style={{ fontSize: 15 }}>{name}</div>
                <div className="doc-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={12} /> {email ?? 'Not signed in (preview)'}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--c-line)' }}>
              <LogoutButton />
            </div>
          </div>
        </div>

        <PrivacyControls initial={privacy} />
      </div>
    </>
  )
}
