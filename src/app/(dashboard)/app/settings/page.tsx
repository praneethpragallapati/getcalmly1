import Link from 'next/link'
import { Crown, CreditCard } from 'lucide-react'
import { getAccount, getPatientProfileForEdit } from '@/lib/account'
import { PrivacyControls } from '@/components/dashboard/PrivacyControls'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import { ProfileEditor } from '@/components/dashboard/ProfileEditor'
import { ChangePasswordCard } from '@/components/dashboard/ChangePasswordCard'
import { DataPrivacyCard } from '@/components/dashboard/DataPrivacyCard'

export default async function SettingsPage() {
  const { plan, plans, privacy } = await getAccount()
  const profile = await getPatientProfileForEdit()

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Settings</h1>
        <span className="page-meta">Profile, plan & privacy</span>
      </div>

      <div className="page-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="stack">
          {/* Plan & billing. A patient may hold one package PER TRACK at once —
              therapy, psychiatry and couples — so every active one is listed.
              Showing only the newest is why a bought psychiatry package looked
              like it had gone missing. */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={17} /> Plans &amp; billing
              </div>
              <span className="tier-badge">
                <Crown size={13} /> {plan.tier}
              </span>
            </div>

            {plans.length === 0 ? (
              <div style={{ marginTop: 16 }}>
                <div className="doc-name" style={{ fontSize: 18 }}>No active plan</div>
                <div className="doc-sub">Book your first session to start a plan</div>
              </div>
            ) : (
              <div style={{ marginTop: 6 }}>
                {plans.map((p, i) => {
                  const pct = p.sessionsTotal ? Math.round((p.sessionsUsed / p.sessionsTotal) * 100) : 0
                  return (
                    <div
                      key={`${p.track ?? p.category}-${i}`}
                      style={{
                        paddingTop: 14, marginTop: i === 0 ? 4 : 14,
                        borderTop: i === 0 ? 'none' : '1px solid rgba(28,43,58,.08)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                        <div className="doc-name" style={{ fontSize: 17 }}>{p.careLabel}</div>
                        <span className="muted" style={{ fontSize: 12.5 }}>{p.planName}</span>
                      </div>
                      <div className="doc-sub">
                        {p.sessionsTotal > 0
                          ? `${p.paidMonths}-month pack · started ${p.startedOn}`
                          : 'No sessions on this pack'}
                      </div>

                      <div style={{ margin: '12px 0 6px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--c-gray-d)', fontWeight: 600 }}>Sessions used</span>
                        <span style={{ color: 'var(--c-charcoal)', fontWeight: 700 }}>
                          {p.sessionsUsed} / {p.sessionsTotal}
                        </span>
                      </div>
                      <div className="progress">
                        <span style={{ width: `${pct}%` }} />
                      </div>

                      {p.minutesTotal != null && (
                        <>
                          <div style={{ margin: '12px 0 6px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: 'var(--c-gray-d)', fontWeight: 600 }}>Counselling minutes</span>
                            <span style={{ color: 'var(--c-charcoal)', fontWeight: 700 }}>
                              {p.minutesUsed ?? 0} / {p.minutesTotal}
                            </span>
                          </div>
                          <div className="progress">
                            <span style={{ width: `${Math.round(((p.minutesUsed ?? 0) / p.minutesTotal) * 100)}%` }} />
                          </div>
                        </>
                      )}

                      <div className="session-info-grid" style={{ marginTop: 14 }}>
                        <div>
                          <div className="lbl">STARTED</div>
                          <div className="val">{p.startedOn}</div>
                        </div>
                        <div>
                          <div className="lbl">VALID UNTIL</div>
                          <div className="val">{p.renewsOn ?? '—'}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

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
