import Link from 'next/link'
import { Flame, TrendingUp, CalendarCheck, ListChecks, Activity } from 'lucide-react'
import { getDashboardData, getWeeklyProgress } from '@/lib/dashboard'
import { getSessionUserId } from '@/lib/patient'
import { getOutcomeState, type InstrumentProgress } from '@/lib/outcomes/store'
import { dueInstruments } from '@/lib/outcomes/pulse'
import { INSTRUMENTS } from '@/lib/outcomes/instruments'
import { type BandTone } from '@/lib/outcomes/classify'
import { OutcomeChart } from '@/components/outcomes/OutcomeChart'
import { OutcomeTabs } from '@/components/outcomes/OutcomeTabs'
import { getWeeklyPatterns } from '@/lib/progressPatterns'
import { WeeklyChart, toPoints } from '@/components/outcomes/WeeklyChart'

export const dynamic = 'force-dynamic'

/** Fixed clinical order so the page never rearranges between visits. */
const PRIORITY = ['PHQ9', 'GAD7', 'K10', 'WHO5', 'GAS', 'CGI', 'CSSRS']
const TONE_CLASS: Record<BandTone, string> = { good: 't-green', mild: 't-gold', warn: 't-gold', bad: 't-coral' }
const PROV_LABEL: Record<string, string> = { patient: 'Self-reported', clinician: 'Clinician-rated', derived: 'From your data' }

function byPriority(a: InstrumentProgress, b: InstrumentProgress) {
  return PRIORITY.indexOf(a.instrumentId) - PRIORITY.indexOf(b.instrumentId)
}

/** One weekly-pattern chart panel (used inside the tabbed patterns box). */
function WeeklyPanel({ title, sub, prov, points, min, max, suffix }: {
  title: string; sub: string; prov: string
  points: { label: string; value: number | null }[]; min: number; max: number; suffix?: string
}) {
  const enough = points.filter((p) => p.value != null).length >= 2
  return (
    <>
      <div className="prov-row">
        <span className="section-title">{title}</span>
        <span className="prov-badge">{prov}</span>
      </div>
      {enough
        ? <WeeklyChart points={points} min={min} max={max} suffix={suffix} />
        : <p className="muted" style={{ marginTop: 4 }}>A couple of weeks of data will show this trend.</p>}
      <p className="muted measure-legend">{sub}</p>
    </>
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

  const [weekly, outcomes, due, weeks] = await Promise.all([
    getWeeklyProgress(userId),
    getOutcomeState(userId),
    dueInstruments(userId),
    getWeeklyPatterns(userId),
  ])
  const maxCheckins = Math.max(7, ...weeks.map((w) => w.checkins))

  // CGI and C-SSRS are clinician-only and never shown to the patient.
  const PATIENT_HIDDEN = new Set(['CGI', 'CSSRS'])
  const withData = outcomes.filter((o) => o.verdict.current != null && !PATIENT_HIDDEN.has(o.instrumentId))
  const summary = [...withData].sort(byPriority)
  // Symptom trajectories go in the tabbed Pulse card; GAS gets its own card.
  const promBlocks = withData.filter((o) => INSTRUMENTS[o.instrumentId]?.chartable && o.instrumentId !== 'GAS').sort(byPriority)
  const gasBlock = withData.find((o) => o.instrumentId === 'GAS')
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

        {/* GAS — Goal Attainment Scale, shown on its own below Pulse */}
        {gasBlock && (
          <>
            <div className="section-title" style={{ marginTop: 4 }}>GAS (Goal Attainment Scale)</div>
            <div className="card">
              <MeasurePanel p={gasBlock} />
            </div>
          </>
        )}

        {/* Weekly patterns — one at a time behind tabs, averaged from the start */}
        {weeks.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 4 }}>Your patterns</div>
            <OutcomeTabs
              tabs={[{ id: 'mood', label: 'Mood' }, { id: 'checkins', label: 'Check-ins' }, { id: 'tasks', label: 'Task adherence' }]}
              panels={[
                <WeeklyPanel key="mood" title="Weekly mood average" prov="Self-reported"
                  sub="Your daily mood, averaged by week. Higher is better, out of 10." points={toPoints(weeks, 'moodAvg')} min={0} max={10} />,
                <WeeklyPanel key="checkins" title="Mood check-ins per week" prov="From your activity"
                  sub="How many days you checked in each week." points={toPoints(weeks, 'checkins')} min={0} max={maxCheckins} />,
                <WeeklyPanel key="tasks" title="Task adherence" prov="From your activity"
                  sub="Tasks completed vs assigned each week." points={toPoints(weeks, 'adherence')} min={0} max={100} suffix="%" />,
              ]}
            />
          </>
        )}

        {/* Consistency — this week's snapshot */}
        <div className="section-title" style={{ marginTop: 4 }}>Consistency</div>
        <div className="grid-4">
          <div className="card stat-card">
            <span className="stat-ic t-purple"><TrendingUp size={20} /></span>
            <div className="stat-n">{weekly?.moodAvg != null ? weekly.moodAvg.toFixed(1) : '—'}{weekly?.moodAvg != null && <span> /10</span>}</div>
            <div className="stat-l">Avg mood this week</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-green"><CalendarCheck size={20} /></span>
            <div className="stat-n">{weekly?.moodCheckins ?? 0}</div>
            <div className="stat-l">Check-ins this week</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-gold"><ListChecks size={20} /></span>
            <div className="stat-n">{weekly?.completionPct ?? 0}<span>%</span></div>
            <div className="stat-l">Task adherence this week</div>
          </div>
          <div className="card stat-card">
            <span className="stat-ic t-coral"><Flame size={20} /></span>
            <div className="stat-n">{d.streakDays}<span> days</span></div>
            <div className="stat-l">Current streak</div>
          </div>
        </div>

        <p className="muted" style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={13} /> Scores use validated tools (PHQ-9, GAD-7, K10, WHO-5). This page summarises them and is not a diagnosis.
        </p>
      </div>
    </>
  )
}
