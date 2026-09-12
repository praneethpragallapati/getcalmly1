'use client'

import { useState, useTransition } from 'react'
import { Activity, PlayCircle, Sparkles, Database } from 'lucide-react'
import { runAiProbe, generateInsightsNow, seedDemoAndGenerate, type AiProbeReport, type GenerateReport, type SeedReport } from '@/app/admin/ai-health/actions'

function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className="note-flag" style={{ background: ok ? 'var(--c-green-pale)' : 'var(--c-coral-pale)', color: ok ? 'var(--c-green-ink)' : 'var(--c-coral-d)' }}>
      {children}
    </span>
  )
}

/** Plain-language hint for the common provider error codes. */
function explain(error: string | null): string {
  if (!error) return ''
  const e = error.toLowerCase()
  if (e.includes('no_openai_key') || e.includes('no_anthropic_key')) return 'Key is missing in this environment.'
  if (e.includes('401') || e.includes('403')) return 'Key is present but rejected (wrong or revoked key).'
  if (e.includes('429')) return 'Rate limited or no billing/quota on the account.'
  if (e.includes('404')) return 'The model id is not valid for this account.'
  if (e.includes('timeout')) return 'The provider did not respond in time. Try again.'
  return 'Unexpected error from the provider.'
}

export function AiHealthPanel() {
  const [report, setReport] = useState<AiProbeReport | null>(null)
  const [gen, setGen] = useState<GenerateReport | null>(null)
  const [email, setEmail] = useState('')
  const [probing, startProbe] = useTransition()
  const [generating, startGen] = useTransition()
  const [seedEmail, setSeedEmail] = useState('')
  const [seed, setSeed] = useState<SeedReport | null>(null)
  const [seeding, startSeed] = useTransition()

  return (
    <div className="stack" style={{ gap: 16 }}>
      {/* Live provider test */}
      <div className="card">
        <div className="prov-row">
          <span className="section-title" style={{ fontSize: 18 }}>Live provider test</span>
          <span className="prov-badge">Calls OpenAI &amp; Anthropic now</span>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>
          Makes one tiny call to each provider and shows exactly what came back. No secret values are ever displayed.
        </p>
        <button className="btn btn-primary" disabled={probing} onClick={() => startProbe(async () => setReport(await runAiProbe()))}>
          <PlayCircle size={16} /> {probing ? 'Testing…' : 'Run live test'}
        </button>

        {report && !report.ok && (
          <p style={{ marginTop: 12, color: 'var(--c-coral-d)', fontWeight: 600 }}>{report.error}</p>
        )}

        {report?.ok && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Pill ok={report.keys!.openai}>OPENAI_API_KEY {report.keys!.openai ? 'set' : 'missing'}</Pill>
              <Pill ok={report.keys!.anthropic}>ANTHROPIC_API_KEY {report.keys!.anthropic ? 'set' : 'missing'}</Pill>
              <Pill ok={report.keys!.cron}>CRON_SECRET {report.keys!.cron ? 'set' : 'missing'}</Pill>
            </div>
            {report.probes!.map((p) => (
              <div key={p.label} className="task-row" style={{ alignItems: 'flex-start' }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="task-row-t">{p.label}</span>
                  <span className="muted" style={{ fontSize: 11.5 }}>{p.provider} · {p.model}</span>
                  {!p.ok && p.error && (
                    <span style={{ fontSize: 11.5, color: 'var(--c-coral-d)' }}>{p.error} — {explain(p.error)}</span>
                  )}
                  {p.ok && p.sample && (
                    <span className="muted" style={{ fontSize: 11.5 }}>replied: {p.sample}</span>
                  )}
                </span>
                <Pill ok={p.ok}>{p.ok ? 'OK' : 'FAILED'}</Pill>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate insights now */}
      <div className="card">
        <div className="prov-row">
          <span className="section-title" style={{ fontSize: 18 }}>Generate insights now</span>
          <span className="prov-badge">Skips the overnight wait</span>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>
          Regenerates a patient&apos;s daily and weekly insight for their dashboard, using the same generator the cron runs.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="entry-input"
            style={{ maxWidth: 280 }}
            type="email"
            placeholder="patient@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="btn btn-primary"
            disabled={generating || !email.trim()}
            onClick={() => startGen(async () => setGen(await generateInsightsNow(email)))}
          >
            <Sparkles size={16} /> {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
        {gen && (
          <div style={{ marginTop: 12 }}>
            {gen.ok ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Pill ok={Boolean(gen.daily)}>Daily {gen.daily ? 'generated' : 'not generated'}</Pill>
                <Pill ok={Boolean(gen.weekly)}>Weekly {gen.weekly ? 'generated' : 'not generated'}</Pill>
                {!gen.daily && (
                  <span className="muted" style={{ fontSize: 12 }}>
                    Daily returning nothing usually means the provider call failed — run the live test above.
                  </span>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--c-coral-d)', fontWeight: 600, margin: 0 }}>{gen.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Seed demo activity + refresh (test accounts) */}
      <div className="card">
        <div className="prov-row">
          <span className="section-title" style={{ fontSize: 18 }}>Seed demo activity</span>
          <span className="prov-badge">Test accounts only</span>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>
          Adds ~4 weeks of realistic mood check-ins, journal entries and profile context for this patient, then regenerates their insights — so the cards have consistent material. Seeded rows are tagged and removable.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="entry-input" style={{ maxWidth: 280 }} type="email"
            placeholder="patient@email.com" value={seedEmail} onChange={(e) => setSeedEmail(e.target.value)}
          />
          <button
            className="btn btn-primary" disabled={seeding || !seedEmail.trim()}
            onClick={() => startSeed(async () => setSeed(await seedDemoAndGenerate(seedEmail)))}
          >
            <Database size={16} /> {seeding ? 'Seeding…' : 'Seed + refresh'}
          </button>
        </div>
        {seed && (
          <div style={{ marginTop: 12 }}>
            {seed.ok ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Pill ok>{seed.mood} check-ins</Pill>
                <Pill ok>{seed.journals} journals</Pill>
                <Pill ok={Boolean(seed.daily)}>Daily {seed.daily ? 'generated' : 'pending'}</Pill>
                <Pill ok={Boolean(seed.weekly)}>Weekly {seed.weekly ? 'generated' : 'pending'}</Pill>
              </div>
            ) : (
              <p style={{ color: 'var(--c-coral-d)', fontWeight: 600, margin: 0 }}>{seed.error}</p>
            )}
          </div>
        )}
      </div>

      <p className="muted" style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Activity size={13} /> Insights also regenerate automatically each morning (01:30 UTC) and weekly (Sunday 02:30 UTC) via the scheduled jobs.
      </p>
    </div>
  )
}
