import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { getSessionPatientId } from '@/lib/patient'
import {
  getBrowsableClinicians, canChooseFor, isSlotKey, SLOT_TRACK, SLOT_LABEL, MATCH_HREF, type SlotKey,
} from '@/lib/clinicianChoice'
import { ClinicianBrowser } from '@/components/dashboard/ClinicianBrowser'

export const dynamic = 'force-dynamic'

const ORDER: SlotKey[] = ['individual', 'couples', 'psychiatry']

/**
 * "Browse your clinician": the patient picks their first clinician for a care
 * type. Only care types with a package and no clinician yet can be chosen
 * here; once everything has a clinician, this page sends them to their team.
 */
export default async function BrowseCliniciansPage({
  searchParams,
}: {
  searchParams: Promise<{ care?: string; pick?: string }>
}) {
  const userId = await getSessionPatientId()
  if (!userId) redirect('/login')
  const sp = await searchParams

  const open: SlotKey[] = []
  for (const key of ORDER) if (await canChooseFor(userId, SLOT_TRACK[key])) open.push(key)

  if (open.length === 0) {
    return (
      <div className="stack">
        <Link href="/app/therapist" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={15} /> My care team
        </Link>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 6 }}>Nothing to choose right now</div>
          <p className="muted" style={{ margin: '0 0 14px' }}>
            Your clinicians are already in place, or you don&apos;t have a package that needs one yet.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/app/therapist" className="btn btn-primary btn-sm">See my care team</Link>
            <Link href="/app/billing" className="btn btn-outline btn-sm">Get a package</Link>
          </div>
        </div>
      </div>
    )
  }

  const slot: SlotKey = isSlotKey(sp.care) && open.includes(sp.care) ? sp.care : open[0]
  const clinicians = await getBrowsableClinicians(SLOT_TRACK[slot])
  // A pick carried back from the details step (an id, nothing else).
  const pick = typeof sp.pick === 'string' && /^[a-z0-9]+$/i.test(sp.pick) ? sp.pick : null

  return (
    <div className="stack">
      <Link href="/app/therapist" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> My care team
      </Link>
      <div className="page-head">
        <div>
          <div className="page-title">Browse your clinician</div>
          <div className="page-meta">
            {SLOT_LABEL[slot]} · every clinician here is licensed and taking new patients
          </div>
        </div>
      </div>

      {open.length > 1 && (
        <div style={{ display: 'inline-flex', background: 'rgba(28,43,58,.05)', borderRadius: 999, padding: 3, gap: 2, flexWrap: 'wrap', alignSelf: 'flex-start' }}>
          {open.map((k) => (
            <Link
              key={k}
              href={`/app/therapist/browse?care=${k}`}
              style={{
                textDecoration: 'none', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 700,
                background: k === slot ? '#fff' : 'transparent',
                color: k === slot ? 'var(--c-charcoal)' : 'var(--c-gray-d)',
                boxShadow: k === slot ? '0 1px 4px rgba(28,43,58,.1)' : 'none',
              }}
            >
              {SLOT_LABEL[k]}
            </Link>
          ))}
        </div>
      )}

      <ClinicianBrowser slot={slot} clinicians={clinicians} initialPick={pick} />

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: 'transparent', border: '1.5px dashed var(--c-line)' }}>
        <span style={{ display: 'inline-grid', placeItems: 'center', width: 40, height: 40, borderRadius: 12, background: 'var(--c-coral-pale)', color: 'var(--c-coral)' }}>
          <Sparkles size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 800, color: 'var(--c-charcoal)' }}>Not sure who to pick?</div>
          <div className="muted" style={{ fontSize: 13.5 }}>Answer a few gentle questions and we will recommend the best fit for you.</div>
        </div>
        <Link href={MATCH_HREF[slot]} className="btn btn-outline btn-sm">Match your clinician</Link>
      </div>
    </div>
  )
}
