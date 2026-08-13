import Link from 'next/link'
import { Crown, CreditCard } from 'lucide-react'
import { getAccount, getPatientProfileForEdit } from '@/lib/account'
import { PrivacyControls } from '@/components/dashboard/PrivacyControls'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import { ProfileEditor } from '@/components/dashboard/ProfileEditor'
import { ChangePasswordCard } from '@/components/dashboard/ChangePasswordCard'
import { DataPrivacyCard } from '@/components/dashboard/DataPrivacyCard'

export default async function SettingsPage() {
  const { plan, privacy } = await getAccount()
  const profile = await getPatientProfileForEdit()
  const sessionsPct = plan.sessionsTotal ? Math.round((plan.sessionsUsed / plan.sessionsTotal) * 100) : 0

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Settings</h1>
        <span className="page-meta">Profile, plan & privacy</span>
      </div>

      <div className="page-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
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


          {/* Profile */}
          {profile && <ProfileEditor profile={profile} />}

          {/* Change password */}
          <ChangePasswordCard />

          {/* Session */}
          <div className="card">
            <div className="section-title">Session</div>
            <p className="muted" style={{ fontSize: 13, margin: '6px 0 14px' }}>
              Signed in as {profile?.email ?? 'this account'}.
            </p>
            <LogoutButton />
          </div>
        </div>

        <div className="stack">
          <PrivacyControls initial={privacy} />
          <DataPrivacyCard />
        </div>
      </div>
    </>
  )
}
