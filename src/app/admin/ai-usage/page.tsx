import { getUsageOverview } from '@/lib/ai/usage'

export const dynamic = 'force-dynamic'

const usd = (n: number) => '$' + (n < 1 ? n.toFixed(4) : n.toFixed(2))
const num = (n: number) => n.toLocaleString('en-IN')
const FEATURE_LABEL: Record<string, string> = {
  chat_classify: 'Chat · classify', chat_reply: 'Chat · reply', daily: 'Daily insight',
  weekly: 'Weekly insight', synth: 'Synthesizer', copilot: 'Clinician Copilot',
}

function Kpi({ label, tokens, cost, calls }: { label: string; tokens: number; cost: number; calls: number }) {
  return (
    <div className="card stat-card">
      <div className="stat-l" style={{ marginTop: 0 }}>{label}</div>
      <div className="stat-n" style={{ fontSize: 26 }}>{usd(cost)}</div>
      <div className="stat-l">{num(tokens)} tokens · {num(calls)} calls</div>
    </div>
  )
}

export default async function AiUsagePage() {
  const o = await getUsageOverview()
  const maxDaily = Math.max(1, ...o.daily.map((d) => d.cost))

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">AI usage & cost</h1>
          <span className="page-meta">Token consumption and spend across all AI features. Costs are estimated in USD from model list prices.</span>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <Kpi label="Today" tokens={o.day.tokens} cost={o.day.cost} calls={o.day.calls} />
        <Kpi label="Last 7 days" tokens={o.week.tokens} cost={o.week.cost} calls={o.week.calls} />
        <Kpi label="Last 30 days" tokens={o.month.tokens} cost={o.month.cost} calls={o.month.calls} />
        <Kpi label="Last 365 days" tokens={o.year.tokens} cost={o.year.cost} calls={o.year.calls} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ fontSize: 18 }}>Average cost per day (30-day)</div>
        <div className="stat-n" style={{ fontSize: 30, marginTop: 6 }}>{usd(o.avgCostPerDay30)}<span style={{ fontSize: 14, color: 'var(--c-gray)' }}> / day</span></div>
      </div>

      <div className="pg-two" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-title" style={{ fontSize: 18, marginBottom: 10 }}>By customer type (30 days)</div>
          {o.byType.length === 0 ? <p className="muted">No usage recorded yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {o.byType.map((r) => (
                <div key={r.userType} className="task-row">
                  <span className="task-row-t" style={{ textTransform: 'capitalize' }}>{r.userType}</span>
                  <span className="muted" style={{ fontSize: 12.5 }}>{usd(r.cost)} · {num(r.tokens)} tokens</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="section-title" style={{ fontSize: 18, marginBottom: 10 }}>By AI feature (30 days)</div>
          {o.byFeature.length === 0 ? <p className="muted">No usage recorded yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {o.byFeature.map((r) => (
                <div key={r.feature} className="task-row">
                  <span className="task-row-t">{FEATURE_LABEL[r.feature] ?? r.feature}</span>
                  <span className="muted" style={{ fontSize: 12.5 }}>{usd(r.cost)} · {num(r.tokens)} tokens</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ fontSize: 18, marginBottom: 10 }}>Daily spend (last 30 days)</div>
        {o.daily.length === 0 ? <p className="muted">No usage recorded yet.</p> : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
            {o.daily.map((d) => (
              <div key={d.day} title={`${d.day}: ${usd(d.cost)} · ${num(d.tokens)} tokens`}
                style={{ flex: 1, minWidth: 3, height: `${Math.max(2, (d.cost / maxDaily) * 100)}%`, background: 'var(--c-coral)', borderRadius: '3px 3px 0 0' }} />
            ))}
          </div>
        )}
        <p className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>Hover a bar for the day, cost and tokens.</p>
      </div>
    </>
  )
}
