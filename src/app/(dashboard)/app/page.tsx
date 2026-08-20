import Link from 'next/link'
import {
  Sparkles,
  PenLine,
  Video,
  FileText,
  Flame,
  TrendingUp,
  NotebookPen,
  CalendarCheck,
  Pill,
  Heart,
  MessageCircle,
  Truck,
} from 'lucide-react'
import { getDashboardData } from '@/lib/dashboard'
import { getMilestones } from '@/lib/milestones'
import { getMedications } from '@/lib/account'
import { getSessionUserId } from '@/lib/patient'
import { getMedicationOrders } from '@/lib/orders'
import { getCommunityPolls } from '@/lib/polls'
import { CheckIn } from '@/components/dashboard/CheckIn'
import { MoodTrendChart } from '@/components/dashboard/MoodTrendChart'
import { NextSessionCard } from '@/components/dashboard/NextSessionCard'
import { MilestonesMini } from '@/components/dashboard/MilestonesMini'
import { TaskList } from '@/components/dashboard/TaskList'
import { HomePolls } from '@/components/dashboard/HomePolls'
import { LocalTime } from '@/components/dashboard/LocalTime'

export default async function AppHomePage() {
  const userId = await getSessionUserId()
  const [d, meds, orders, polls, milestones] = await Promise.all([
    getDashboardData(),
    getMedications(),
    userId ? getMedicationOrders(userId) : Promise.resolve([]),
    getCommunityPolls(userId),
    userId ? getMilestones(userId) : Promise.resolve([]),
  ])
  const openTasks = d.tasks.filter((t) => !t.done).length
  const med = meds.find((m) => m.active)

  // Prescribed (DB-backed) active meds that haven't been ordered/paid for yet.
  const orderedMedIds = new Set(orders.map((o) => o.medicationId).filter(Boolean) as string[])
  const awaitingPayment = meds.filter(
    (m) => m.active && !m.id.startsWith('local-') && m.prescribedBy && !orderedMedIds.has(m.id)
  )

  return (
    <div className="stack">
      {/* Calm AI leads the page: the day ahead, with the week's insight beside it. */}
      <section className="hero">
        <div>
          <span className="hero-badge">CALM AI · YOUR DAY AHEAD</span>
          <h2>{d.dailyInsight ? d.dailyInsight.title : `Welcome, ${d.name}.`}</h2>
          <p>
            {d.dailyInsight
              ? d.dailyInsight.body
              : 'Your personalised daily insight appears here once you’ve checked in and journaled for a few days. Start with a check-in below.'}
          </p>
          <div className="hero-actions">
            <Link href="/app/calm-ai" className="btn btn-primary">
              <Sparkles size={16} /> Open Calm AI
            </Link>
            <Link href="/app/journal" className="btn btn-ghost-d">
              <PenLine size={16} /> Start a journal entry
            </Link>
          </div>
        </div>
        <div className="hero-side">
          <div className="hero-side-label">WEEKLY INSIGHT</div>
          {d.weeklyInsight?.parts ? (
            // Three distinct reads: what recurs, what's underneath it, what's working.
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <InsightPart label="Pattern found" text={d.weeklyInsight.parts.pattern} tone="#e8896f" />
              <InsightPart label="Hidden driver" text={d.weeklyInsight.parts.driver} tone="#9184e0" />
              <InsightPart label="Quiet win" text={d.weeklyInsight.parts.win} tone="#6fc79b" />
            </div>
          ) : (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                {d.weeklyInsight ? d.weeklyInsight.title : 'Nothing to reflect on yet'}
              </div>
              <p style={{ fontSize: 13, color: '#b9c3cd', lineHeight: 1.6, margin: 0 }}>
                {d.weeklyInsight
                  ? d.weeklyInsight.body
                  : 'A weekly pattern summary shows up here once you have a week of check-ins and journal entries.'}
              </p>
            </>
          )}
        </div>
      </section>

      {awaitingPayment.length > 0 && (
        <Link
          href="/app/medications"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            borderRadius: 12,
            background: 'var(--c-coral-pale, #FDEEEA)',
            border: '1px solid var(--c-coral, #E8765A)',
            textDecoration: 'none',
          }}
        >
          <span className="task-ic" style={{ background: 'var(--c-coral, #E8765A)', color: '#fff', flexShrink: 0 }}>
            <Truck size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--c-charcoal)', fontSize: 14 }}>
              {awaitingPayment.length === 1
                ? 'A prescribed medicine is ready to order'
                : `${awaitingPayment.length} prescribed medicines are ready to order`}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              Pay & get {awaitingPayment.map((m) => m.name).join(', ')} delivered to your door →
            </div>
          </div>
        </Link>
      )}

      {/* Band 1 — today's check-in, with what's next beside it. */}
      <div className="home-band">
        <CheckIn initial={d.checkin} streakDays={d.streakDays} />
        <NextSessionCard d={d} />
      </div>

      {/* Band 2 — how you've been, with milestones at a glance beside it. */}
      <div className="home-band">
        <MoodTrendChart data={d.moodWeek} avgMood={d.avgMood} sixWeeks={d.moodSixWeeks} />
        <MilestonesMini milestones={milestones} />
      </div>




      {polls.length > 0 && <HomePolls polls={polls} canVote={Boolean(userId)} />}

      {/* Recent journal · tasks + meds · community */}
      <div className="home-split home-split-3" style={{ gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div className="section-title">Recent journal</div>
            <Link href="/app/journal" className="link-action">
              All entries →
            </Link>
          </div>
          {d.journals.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, margin: '8px 0 0' }}>
              No journal entries yet. Your reflections will appear here.
            </p>
          ) : (
            d.journals.slice(0, 3).map((j) => (
              <div className="entry" key={j.id}>
                <div className="entry-head">
                  <span className="entry-title">{j.title}</span>
                  <span className="entry-date">{j.date}</span>
                </div>
                <div className="entry-preview">{j.preview.slice(0, 110)}…</div>
              </div>
            ))
          )}
        </div>

        {/* One card, like its neighbours — tasks, with today's medication as a
            footer strip rather than a second card of a different size. */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div className="section-title">Today’s tasks</div>
            <span className="link-action">{openTasks} left</span>
          </div>
          <TaskList tasks={d.tasks} />

          {med && (
            <Link href="/app/medications" className="med-strip">
              <span className="task-ic"><Pill size={15} /></span>
              <span className="med-strip-body">
                <span className="med-strip-name">{med.name} {med.dosage}</span>
                <span className="med-strip-sub">{med.frequency} · {med.times.join(', ')}</span>
              </span>
              <span className="link-action">Manage →</span>
            </Link>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div className="section-title">Community</div>
            <Link href="/app/community" className="link-action">
              See all →
            </Link>
          </div>
          {d.community.map((c) => (
            <div className="comm-item" key={c.author}>
              <span className="comm-avatar">{c.author.charAt(0).toUpperCase()}</span>
              <div style={{ minWidth: 0 }}>
                <div className="comm-meta">
                  {c.author} · {c.role}
                </div>
                <div className="comm-text">{c.text}</div>
                <div className="comm-stats">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={12} /> {c.likes}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <MessageCircle size={12} /> {c.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** One labelled line of the weekly insight: a coloured label, then the finding. */
function InsightPart({ label, text, tone }: { label: string; text: string; tone: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.9px', textTransform: 'uppercase', color: tone, marginBottom: 3 }}>
        {label}
      </div>
      <p style={{ fontSize: 13, color: '#c9d3dd', lineHeight: 1.55, margin: 0 }}>{text}</p>
    </div>
  )
}
