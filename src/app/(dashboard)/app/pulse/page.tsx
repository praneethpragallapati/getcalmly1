import { getSessionUserId } from '@/lib/patient'
import { dueInstruments, getAssignments } from '@/lib/outcomes/pulse'
import { INSTRUMENTS, type Instrument } from '@/lib/outcomes/instruments'
import { PulseRunner, type PulseDef } from '@/components/outcomes/PulseRunner'

export const dynamic = 'force-dynamic'

/** Turn a catalog instrument into the client-safe shape the runner needs. */
function toDef(inst: Instrument): PulseDef {
  return {
    id: inst.id, short: inst.short, blurb: inst.blurb, denotes: inst.denotes,
    items: inst.items.map((it) => ({ key: it.key, text: it.text, choices: it.choices })),
    choices: inst.choices,
  }
}

export default async function PulsePage() {
  const userId = await getSessionUserId()
  if (!userId) {
    return (
      <div className="page-head"><h1 className="page-title">Pulse</h1>
        <span className="page-meta">Please sign in to see your checks.</span></div>
    )
  }

  // Only what a therapist has assigned is fillable — nothing is auto-assigned.
  const due = await dueInstruments(userId)
  const assignedIds = (await getAssignments(userId)).map((a) => a.instrumentId)
  const fillableIds = Array.from(new Set([...due, ...assignedIds])).filter(
    (id) => INSTRUMENTS[id] && INSTRUMENTS[id].items.length > 0,
  )
  const defs = fillableIds.map((id) => toDef(INSTRUMENTS[id]))

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Pulse</h1>
        <span className="page-meta">Quick, private check-ins that track how you are really doing over time.</span>
      </div>
      {defs.length === 0
        ? <div className="card"><p className="muted">No check-ins have been set up yet. Your therapist assigns these, and they will appear here when they do.</p></div>
        : <PulseRunner due={due} defs={defs} />}
    </>
  )
}
