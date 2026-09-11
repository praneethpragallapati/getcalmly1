import Link from 'next/link'
import { Flame, TrendingUp, CalendarCheck, NotebookPen, Activity } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getDashboardData, getWeeklyProgress } from '@/lib/dashboard'
import { getSessionUserId } from '@/lib/patient'
import { getOutcomeState, type InstrumentProgress } from '@/lib/outcomes/store'
import { dueInstruments } from '@/lib/outcomes/pulse'
import { INSTRUMENTS } from '@/lib/outcomes/instruments'
import { moodTier, type BandTone } from '@/lib/outcomes/classify'
import { OutcomeChart } from '@/components/outcomes/OutcomeChart'
import { OutcomeTabs } from '@/components/outcomes/OutcomeTabs'

export const dynamic = 'force-dynamic'

/** Fixed clinical order so the page never rearranges between visits. */
const PRIORITY = ['PHQ9', 'GAD7', 'K10', 'WHO5', 'GAS', 'CGI', 'CSSRS']
const TONE_CLASS: Record<BandTone, string> = { good: 't-green', mild: 't-gold', warn: 't-gold', bad: 't-coral' }
const PROV_LABEL: Record<string, string> = { patient: 'Self-reported', clinician: 'Clinician-rated', derived: 'From your data' }

function byPriority(a: InstrumentProgress, b: InstrumentProgress) {
  return PRIORITY.indexOf(a.instrumentId) - PRIORITY.indexOf(b.instrumentId)
}

/** A compact mood sparkline (daily 1-10) with the current action tier. */
function MoodStrip({ series }: { series: { mood: number; createdAt: Date }[] }) {
  if (series.length === 0) return null
  const w = 240, h = 40, pad = 3
  const xs = (i: number) => pad + (series.length === 1 ? (w - 2 * pad) / 2 : (i / (series.length - 1)) * (w - 2 * pad))
  const ys = (v: number) => pad + (1 - v / 10) * (h - 2 * pad)
  const pts = series.map((p, i) => `${xs(i).toFixed(1)},${ys(p.mood).toFixed(1)}`).join(' ')
  const latest = series[series.length - 1].mood
  const tier = moodTier(latest)
  return (
    <div className="card">
      <div className="prov-row">
        <span className="section-title">Daily mood</span>
        <span className="prov-badge">Self-reported</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
        <div>
          <div className="stat-n" style={{ fontSize: 30 }}>{latest}<span> /10</span></div>
          <div className={`stat-badge ${TONE_CLASS[tier.tone]}`}>{tier.label}</div>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ flex: 1, minWidth: 160, maxWidth: 300 }} aria-label="Mood over recent check-ins">
          <polyline points={pts} fill="none" stroke="var(--c-coral)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>{tier.action} A daily snapshot of how you feel, not a clinical score.</p>
    </div>
  )
}

/** A status tile for the summary band: current state + verdict + trend. */
function StatusCard({ p }: { p: InstrumentProgress }) {
  const inst = INSTRUMENTS[p.instrumentId]
  const v = p.verdict
  const value = p.instrumentId === 'WHO5' && v.currentPercent != null ? `${v.currentPercent}%` : String(v.current ?? '—')
  const arrow = v.deltaPoints == null || v.deltaPoints === 0 ? '' : (inst.direction === 'higher_better' ? (v.deltaPoints > 0 ? '↑' : '↓') : (v.deltaPoints < 0 ? '↓' : '↑'))
  return (
    <div className="card stat-card">
      <span className={`stat-badge ${TONE_CLASS[v.tone]}`}>{v.label}</span>
      <div className="stat-n" style={{ fontSize: 30 }}>{value}{arrow && <span style={{ fontSize: 15 }}> {arrow}</span>}</div>
      <div className="stat-l">{inst.short}{v.bandLabel ? ` · ${v.bandLabel}` : ''}</div>
    </div>
  )
}

/** One measure's detail, without a card wrapper (the tab container provides it). */
function MeasurePanel({ p }: { p: InstrumentProgress }) {
  const inst = INSTRUMENTS[p.instrumentId]
  return (
    <>
      <div className="prov-row">
        <span className="section-title">{inst.short}</span>
        <span className="prov-badge">{PROV_LABEL[p.source] ?? 'Recorded'}</span>
      </div>
      {p.series.length >= 2 ? (
        <OutcomeChart instrumentId={p.instrumentId} series={p.series} />
      ) : (
        <p className="muted" style={{ marginTop: 4 }}>
          Baseline recorded{p.verdict.bandLabel ? ` (${p.verdict.bandLabel})` : ''}. Your next check will start the trend line.
        </p>
      )}
      <p className="measure-verdict">{p.verdict.narrative}</p>
      <p className="muted measure-legend">{inst.blurb} {inst.denotes}</p>
    </>
  )
}

export default async function ProgressPage() {
  const d = await getDashboardData()
  const userId = await getSessionUserId()
  if (!userId) {
    return (
      <>
        <div className="page-head"><h1 className="page-title">My Progress</h1></div>
        <div className="card"><p className="muted">Sign in to see your progress.</p></div>
      </>
    )
  }

  const [weekly, outcomes, due, moodRows] = await Promise.all([
    getWeeklyProgress(userId),
    getOutcomeState(userId),
    dueInstruments(userId),
    prisma.moodEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 30, select: { mood: true, createdAt: true } }).catch(() => []),
  ])
  const moodSeries = [...moodRows].reverse()

  const withData = outcomes.filter((o) => o.verdict.current != null)
  const summary = [...withData].sort(byPriority)
  const promBlocks = withData.filter((o) => INSTRUMENTS[o.instrumentId]?.chartable && o.instrumentId !== 'CSSRS').sort(byPriority)
  const clinician = withData.filter((o) => o.instrumentId === 'CGI' || o.instrumentId === 'CSSRS').sort(byPriority)
  const lead = summary[0]

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">My Progress</h1>
        <span className="page-meta">Started {d.startedOn} · {d.daysOnPlatform} days on getCalmly</span>
      </div>

      <div className="stack">
        {/* Pulse due */}
        {due.length > 0 && (
          <Link href="/app/pulse" className="card pulse-due">
            <div>
              <div className="pulse-card-t">You have {due.length} Pulse {due.length === 1 ? 'check' : 'checks'} due</div>
              <p className="muted">A couple of minutes keeps your progress accurate and up to date.</p>
            </div>
            <span className="btn btn-primary">Take now</span>
          </Link>
        )}

        {/* Summary band */}
        {summary.length > 0 ? (
          <>
            {lead && (
              <div className="card tint-green">
                <div className="prov-row"><span className="section-title" style={{ marginBottom: 0 }}>How therapy is going</span></div>
                <p className="lead-narrative">{lead.verdict.narrative}</p>
              </div>
            )}
            <div className="grid-4">
              {summary.map((p) => <StatusCard key={p.instrumentId} p={p} />)}
            </div>
          </>
        ) : (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 6 }}>Your progress will build here</div>
            <p className="muted">Complete your first Pulse check and it will start tracking how you are doing over time, in clear charts.</p>
            <Link href="/app/pulse" className="btn btn-primary" style={{ marginTop: 12 }}>Take your first Pulse</Link>
          </div>
        )}

        {/* Your Pulse (self-report trajectories) — one at a time behind tabs */}
        {promBlocks.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 4 }}>Your Pulse</div>
            <OutcomeTabs
              tabs={promBlocks.map((p) => ({ id: p.instrumentId, label: INSTRUMENTS[p.instrumentId].short.replace(/\s*\(.*\)/, '') }))}
              panels={promBlocks.map((p) => <MeasurePanel key={p.instrumentId} p={p} />)}
            />
          </>
        )}

        {/* From your therapist */}
        {clinician.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 4 }}>From your therapist</div>
            {clinician.map((p) => (
              <div key={p.instrumentId} className="card">
                <div className="prov-row">
                  <span className="section-title">{INSTRUMENTS[p.instrumentId].short}</span>
                  <span className="prov-badge">Clinician-rated</span>
                </div>
                <p className="measure-verdict">{p.verdict.narrative}</p>
                <p className="muted measure-legend">{INSTRUMENTS[p.instrumentId].blurb}</p>
              </div>
            ))}
          </>
        )}

        {/* Daily patterns */}
        <div className="section-title" style={{ marginTop: 4 }}>Your daily patterns</div>
        <MoodStrip series={moodSeries} />
        {weekly && (
          <div className="card">
            <div className="prov-row"><span className="section-title">This week</span><span className="prov-badge">From your activity</span></div>
            <div className="muted">Tasks from your expert: <b style={{ color: 'var(--c-charcoal)' }}>{weekly.tasksCompleted}/{weekly.tasksAssigned}</b> completed ({weekly.completionPct}%)</div>
            <div className="muted">Mood check-ins: <b style={{ color: 'var(--c-charcoal)' }}>{weekly.moodCheckins}</b>{weekly.moodAvg !== null ? ` · avg ${weekly.moodAvg}/10` : ''}</div>
          </div>
        )}

        {/* Consistency (engagement, not clinical outcome) */}
        <div className="section-title" style={{ marginTop: 4 }}>Consistency</div>
        <div className="grid-4">
          <div className="card stat-card">
            <span className="stat-ic t-coral"><Flame size={20} /></span>
            <div className="stat-n">{d.streakDays}<span> days</span></div>
            <div className="stat-l">Current streak</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-purple"><TrendingUp size={20} /></span>
            <div className="stat-n">{d.avgMood > 0 ? d.avgMood.toFixed(1) : '—'}{d.avgMood > 0 && <span> /10</span>}</div>
            <div className="stat-l">Avg mood score</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-green"><CalendarCheck size={20} /></span>
            <div className="stat-n">{d.sessionsDone}</div>
            <div className="stat-l">Therapy sessions</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-gold"><NotebookPen size={20} /></span>
            <div className="stat-n">{d.journalCount}</div>
            <div className="stat-l">Journal entries</div>
          </div>
        </div>

        <p className="muted" style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={13} /> Scores use validated tools (PHQ-9, GAD-7, K10, WHO-5). This page summarises them and is not a diagnosis.
        </p>
      </div>
    </>
  )
}
