import { getSessionUserId } from '@/lib/patient'
import { getAssignedTherapistId } from '@/lib/expert'
import { dueInstruments, getAssignments, seedDefaultAssignments } from '@/lib/outcomes/pulse'
import { INSTRUMENTS, type Instrument } from '@/lib/outcomes/instruments'
import { PulseRunner, type PulseDef } from '@/components/outcomes/PulseRunner'

export const dynamic = 'force-dynamic'

/** Turn a catalog instrument into the client-safe shape the runner needs. */
function toDef(inst: Instrument): PulseDef {
  if (inst.id === 'GAS') {
    return {
      id: inst.id, short: inst.short, blurb: inst.blurb, denotes: inst.denotes,
      items: [{ key: 'goal', text: 'How close do you feel to achieving what you hoped to accomplish in therapy?' }],
      choices: Array.from({ length: 11 }, (_, v) => ({ value: v, label: String(v) })),
    }
  }
  return {
    id: inst.id, short: inst.short, blurb: inst.blurb, denotes: inst.denotes,
    items: inst.items, choices: inst.choices,
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

  const therapistId = await getAssignedTherapistId(userId).catch(() => null)
  await seedDefaultAssignments(userId, therapistId ?? null)

  const due = await dueInstruments(userId)
  const assignedIds = (await getAssignments(userId)).map((a) => a.instrumentId)
  const fillableIds = Array.from(new Set([...due, ...assignedIds])).filter(
    (id) => INSTRUMENTS[id] && (INSTRUMENTS[id].items.length > 0 || id === 'GAS'),
  )
  const defs = fillableIds.map((id) => toDef(INSTRUMENTS[id]))

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Pulse</h1>
        <span className="page-meta">Quick, private check-ins that track how you are really doing over time.</span>
      </div>
      <PulseRunner due={due} defs={defs} />
    </>
  )
}
