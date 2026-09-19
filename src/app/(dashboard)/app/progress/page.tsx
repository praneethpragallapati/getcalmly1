import Link from 'next/link'
import type { ReactNode } from 'react'
import { Flame, TrendingUp, CalendarCheck, ListChecks, Activity, Download, BookOpen, CheckCircle2, HeartPulse, Users } from 'lucide-react'
import { getDashboardData, getWeeklyProgress } from '@/lib/dashboard'
import { getSessionUserId } from '@/lib/patient'
import { getOutcomeState, type InstrumentProgress } from '@/lib/outcomes/store'
import { INSTRUMENTS } from '@/lib/outcomes/instruments'
import { type BandTone } from '@/lib/outcomes/classify'
import { OutcomeChart } from '@/components/outcomes/OutcomeChart'
import { OutcomeTabs } from '@/components/outcomes/OutcomeTabs'
import { getWeeklyPatterns } from '@/lib/progressPatterns'
import { WeeklyChart, toPoints, type Zone } from '@/components/outcomes/WeeklyChart'
import { getLifetimeTotals } from '@/lib/progressTotals'

export const dynamic = 'force-dynamic'

/** Fixed clinical order so the page never rearranges between visits. */
const PRIORITY = ['PHQ9', 'GAD7', 'K10', 'WHO5', 'GAS', 'CGI', 'CSSRS']
const TONE_CLASS: Record<BandTone, string> = { good: 't-green', mild: 't-gold', warn: 't-gold', bad: 't-coral' }
const PROV_LABEL: Record<string, string> = { patient: 'Self-reported', clinician: 'Clinician-rated', derived: 'From your data' }

/** Zone bands for the weekly-pattern charts, so a glance shows the zone. */
const MOOD_ZONES: Zone[] = [
  { min: 0, max: 3, tone: 'bad' },
  { min: 3, max: 5, tone: 'warn' },
  { min: 5, max: 7, tone: 'mild' },
  { min: 7, max: 10, tone: 'good' },
]
const ADHERENCE_ZONES: Zone[] = [
  { min: 0, max: 40, tone: 'bad' },
  { min: 40, max: 70, tone: 'warn' },
  { min: 70, max: 100, tone: 'good' },
]

function byPriority(a: InstrumentProgress, b: InstrumentProgress) {
  return PRIORITY.indexOf(a.instrumentId) - PRIORITY.indexOf(b.instrumentId)
}

/** One weekly-pattern chart panel (used inside the tabbed patterns box). */
function WeeklyPanel({ title, sub, prov, points, min, max, suffix, zones }: {
  title: string; sub: string; prov: string
  points: { label: string; value: number | null }[]; min: number; max: number; suffix?: string; zones?: Zone[]
}) {
  const enough = points.filter((p) => p.value != null).length >= 2
  return (
    <>
      <div className="prov-row">
        <span className="section-title">{title}</span>
        <span className="prov-badge">{prov}</span>
      </div>
      {enough
        ? <WeeklyChart points={points} min={min} max={max} suffix={suffix} zones={zones} />
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

/** A lifetime-total tile for the activity strip. */
function TotalCard({ icon, tint, n, label }: { icon: ReactNode; tint: string; n: number; label: string }) {
  return (
    <div className="card stat-card">
      <span className={`stat-ic ${tint}`}>{icon}</span>
      <div className="stat-n">{n}</div>
      <div className="stat-l">{label}</div>
    </div>
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

  const [weekly, outcomes, weeks, totals] = await Promise.all([
    getWeeklyProgress(userId),
    getOutcomeState(userId),
    getWeeklyPatterns(userId),
    getLifetimeTotals(userId),
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="page-meta">Started {d.startedOn} · {d.daysOnPlatform} days on getCalmly</span>
          <a href="/app/progress/pdf" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Download size={15} /> Download PDF
          </a>
        </div>
      </div>

      <div className="stack">
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

        {/* Lifetime activity totals */}
        <div className="section-title" style={{ marginTop: 4 }}>Your journey so far</div>
        <div className="grid-4">
          <TotalCard icon={<BookOpen size={20} />} tint="t-purple" n={totals.journals} label="Journals written" />
          <TotalCard icon={<CheckCircle2 size={20} />} tint="t-green" n={totals.tasksCompleted} label="Tasks completed" />
          <TotalCard icon={<HeartPulse size={20} />} tint="t-coral" n={totals.checkins} label="Mood check-ins" />
          <TotalCard icon={<Users size={20} />} tint="t-gold" n={totals.sessions} label="Sessions completed" />
        </div>

        {/* Pulse (symptom trajectories) and GAS, side by side */}
        {(promBlocks.length > 0 || gasBlock) && (
          <>
            <div className="section-title" style={{ marginTop: 4 }}>Your Pulse</div>
            <div className="pg-two">
              {promBlocks.length > 0 ? (
                <OutcomeTabs
                  tabs={promBlocks.map((p) => ({ id: p.instrumentId, label: INSTRUMENTS[p.instrumentId].short.replace(/\s*\(.*\)/, '') }))}
                  panels={promBlocks.map((p) => <MeasurePanel key={p.instrumentId} p={p} />)}
                />
              ) : <div />}
              {gasBlock && (
                <div className="card">
                  <MeasurePanel p={gasBlock} />
                </div>
              )}
            </div>
          </>
        )}

        {/* Patterns and Consistency, side by side */}
        <div className="section-title" style={{ marginTop: 4 }}>Patterns and consistency</div>
        <div className="pg-two">
          {weeks.length > 0 ? (
            <OutcomeTabs
              tabs={[{ id: 'mood', label: 'Calm' }, { id: 'checkins', label: 'Check-ins' }, { id: 'tasks', label: 'Task adherence' }]}
              panels={[
                <WeeklyPanel key="mood" title="Calm progress" prov="Self-reported"
                  sub="Your daily Calm check-in — mood, energy and sleep — averaged by week. Higher is better, out of 10." points={toPoints(weeks, 'calmAvg')} min={0} max={10} zones={MOOD_ZONES} />,
                <WeeklyPanel key="checkins" title="Calm check-ins per week" prov="From your activity"
                  sub="How many days you checked in each week." points={toPoints(weeks, 'checkins')} min={0} max={maxCheckins} />,
                <WeeklyPanel key="tasks" title="Task adherence" prov="From your activity"
                  sub="Activities and forms completed vs assigned each week." points={toPoints(weeks, 'adherence')} min={0} max={100} suffix="%" zones={ADHERENCE_ZONES} />,
              ]}
            />
          ) : (
            <div className="card">
              <div className="section-title" style={{ fontSize: 18, marginBottom: 6 }}>Your patterns</div>
              <p className="muted">A couple of weeks of check-ins and tasks will show your weekly trends here.</p>
            </div>
          )}

          <div className="card">
            <div className="prov-row">
              <span className="section-title" style={{ fontSize: 18 }}>This week</span>
              <span className="prov-badge">Consistency</span>
            </div>
            <div className="pg-mini-grid">
              <div className="pg-mini">
                <span className="pg-mini-ic t-purple"><TrendingUp size={16} /></span>
                <div className="n">{weekly?.calmAvg != null ? weekly.calmAvg.toFixed(1) : '—'}{weekly?.calmAvg != null && <span> /10</span>}</div>
                <div className="l">Avg calm</div>
              </div>
              <div className="pg-mini">
                <span className="pg-mini-ic t-green"><CalendarCheck size={16} /></span>
                <div className="n">{weekly?.moodCheckins ?? 0}</div>
                <div className="l">Check-ins</div>
              </div>
              <div className="pg-mini">
                <span className="pg-mini-ic t-gold"><ListChecks size={16} /></span>
                <div className="n">{weekly?.completionPct ?? 0}<span>%</span></div>
                <div className="l">Task adherence</div>
              </div>
              <div className="pg-mini">
                <span className="pg-mini-ic t-coral"><Flame size={16} /></span>
                <div className="n">{d.streakDays}<span> days</span></div>
                <div className="l">Current streak</div>
              </div>
            </div>
          </div>
        </div>

        <p className="muted" style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={13} /> Scores use validated tools (PHQ-9, GAD-7, K10, WHO-5). This page summarises them and is not a diagnosis.
        </p>
      </div>
    </>
  )
}
