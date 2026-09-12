import { AiHealthPanel } from '@/components/admin/AiHealthPanel'
import { MODELS, PROVIDERS, INSIGHT_MODEL, PAID_ROUTINE } from '@/lib/ai/models'

export const dynamic = 'force-dynamic'

export default function AiHealthPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">AI health</h1>
          <span className="page-meta">Diagnose the Calm AI and insight pipeline. The pipeline fails silently, so use this to see the real status.</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ fontSize: 18, marginBottom: 8 }}>How it is wired</div>
        <p className="muted" style={{ marginTop: 0 }}>
          Daily and weekly insights (and the chat classifier) run on <strong>{PROVIDERS[INSIGHT_MODEL]}/{MODELS[INSIGHT_MODEL]}</strong>, so they need <strong>OPENAI_API_KEY</strong>.
          Calm AI chat routes to <strong>{PROVIDERS[PAID_ROUTINE]}/{MODELS[PAID_ROUTINE]}</strong> (needs ANTHROPIC_API_KEY).
          The scheduled jobs only run when <strong>CRON_SECRET</strong> is set. A key that exists but is wrong, unbilled, or points at an invalid model id fails silently — the test below shows which.
        </p>
      </div>

      <AiHealthPanel />
    </>
  )
}
