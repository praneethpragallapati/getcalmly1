import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import { getSessionUserId } from '@/lib/patient'
import { hasPartnerOnRecord, getActivePackages, getInvoices } from '@/lib/billing'
import { getPricingConfig } from '@/lib/pricingConfig'
import { prisma } from '@/lib/prisma'
import { MATCH_HREF, TRACK_SLOT } from '@/lib/clinicianChoice'
import { BuyPackagePanel, FirstSessionPanel, type BuyGate } from '@/components/dashboard/BuyPackagePanel'
import { ChooseClinician } from '@/components/dashboard/ChooseClinician'

const BUYABLE = ['therapy', 'psychiatry', 'couples'] as const
type BuyableTrack = (typeof BUYABLE)[number]

const TRACK_LABEL: Record<BuyableTrack, string> = {
  therapy: 'Individual therapy',
  psychiatry: 'Psychiatry',
  couples: 'Couples therapy',
}
const ASSIGN_COLUMN: Record<BuyableTrack, string> = {
  therapy: 'assignedTherapistIndividualId',
  psychiatry: 'assignedTherapistPsychiatryId',
  couples: 'assignedTherapistCouplesId',
}

/**
 * Where each care type stands in the buy flow, and its clinician's name:
 * - choose: no clinician yet, so Match or Browse comes first;
 * - first:  a clinician, but the first session not yet bought;
 * - packs:  the first session is bought, so packages are open.
 * Read defensively: anything unreadable falls back to packages, as before.
 */
async function getBuyGates(userId: string): Promise<Record<BuyableTrack, { gate: BuyGate; clinician: string | null }>> {
  const out = {
    therapy: { gate: 'packs', clinician: null },
    psychiatry: { gate: 'packs', clinician: null },
    couples: { gate: 'packs', clinician: null },
  } as Record<BuyableTrack, { gate: BuyGate; clinician: string | null }>
  try {
    const [subs, profile] = await Promise.all([
      prisma.subscription.findMany({
        where: { userId, trackSlug: { in: [...BUYABLE] }, sessionsTotal: { gt: 0 } },
        select: { trackSlug: true, therapistId: true, status: true },
      }),
      prisma.patientProfile.findUnique({
        where: { userId },
        select: Object.fromEntries(BUYABLE.map((t) => [ASSIGN_COLUMN[t], true])) as Record<string, true>,
      }),
    ])
    const ids = new Map<BuyableTrack, string>()
    for (const t of BUYABLE) {
      const col = (profile as Record<string, unknown> | null)?.[ASSIGN_COLUMN[t]]
      const onPack = subs.find((x) => x.trackSlug === t && x.status === 'ACTIVE' && x.therapistId)?.therapistId
      const id = (typeof col === 'string' && col) || onPack
      if (id) ids.set(t, id)
    }
    const names = new Map(
      (await prisma.therapistProfile.findMany({
        where: { id: { in: [...ids.values()] } },
        select: { id: true, user: { select: { name: true } } },
      })).map((r) => [r.id, r.user?.name ?? null]),
    )
    for (const t of BUYABLE) {
      const bought = subs.some((x) => x.trackSlug === t)
      const id = ids.get(t)
      out[t] = { gate: bought ? 'packs' : id ? 'first' : 'choose', clinician: id ? names.get(id) ?? null : null }
    }
  } catch { /* keep the packages fallback */ }
  return out
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ track?: string; booked?: string }> }) {
  const sp = await searchParams
  const track: BuyableTrack | undefined = (BUYABLE as readonly string[]).includes(sp.track ?? '') ? (sp.track as BuyableTrack) : undefined
  const userId = await getSessionUserId()
  const [packages, pricing, invoices, gates] = await Promise.all([
    userId ? getActivePackages(userId) : Promise.resolve([]),
    getPricingConfig(),
    userId ? getInvoices(userId) : Promise.resolve([]),
    userId ? getBuyGates(userId) : Promise.resolve(null),
  ])
  const hasPartner = userId ? await hasPartnerOnRecord(userId) : false

  // Totals across every package type the patient holds.
  const sessionsRemaining = packages.reduce((n, p) => n + p.remaining, 0)
  const totalUsed = packages.reduce((n, p) => n + p.sessionsUsed, 0)
  const firstSessionDone = totalUsed >= 1
  const hasPurchased = packages.length > 0

  const back = (
    <Link
      href={track ? '/app/billing' : '/app/settings'}
      className="muted"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none' }}
    >
      <ArrowLeft size={14} /> {track ? 'All care types' : 'Back to settings'}
    </Link>
  )

  // One care type, not yet past its first session: just that step.
  const focus = track && gates ? gates[track] : null
  if (track && focus && focus.gate !== 'packs') {
    const slot = TRACK_SLOT[track]
    return (
      <>
        <div className="page-head">
          <div>
            {back}
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {focus.gate === 'choose' ? `Book your ${track === 'psychiatry' ? 'psychiatrist' : 'psychologist'}` : 'Book your first session'}
            </h1>
          </div>
          <span className="page-meta">{focus.gate === 'choose' ? 'Step 1 of 2 · your clinician' : 'Step 2 of 2 · your first session'}</span>
        </div>
        <div className="stack" style={{ maxWidth: focus.gate === 'choose' ? 880 : 560 }}>
          {focus.gate === 'choose' ? (
            <ChooseClinician
              label={TRACK_LABEL[track]}
              title={`Let's find your ${track === 'psychiatry' ? 'psychiatrist' : 'psychologist'}`}
              matchHref={MATCH_HREF[slot]}
              browseHref={`/app/therapist/browse?care=${slot}`}
              sub={`First, the ${track === 'psychiatry' ? 'psychiatrist' : 'psychologist'} you will work with: we can match you, or you can choose from our team. Then your first session with them, at an introductory price.`}
            />
          ) : (
            <FirstSessionPanel track={track} clinicianName={focus.clinician} hasPartner={hasPartner} pricing={pricing} />
          )}
        </div>
      </>
    )
  }

  // Nothing bought yet and no care type picked: which one to start with.
  if (!hasPurchased && !track) {
    return (
      <>
        <div className="page-head">
          <div>
            {back}
            <h1 className="page-title" style={{ marginTop: 6 }}>Book your first session</h1>
          </div>
        </div>
        <div className="stack" style={{ maxWidth: 1200 }}>
          <p className="muted" style={{ margin: 0 }}>Choose the kind of care you would like. Packages open after your first session.</p>
          <BuyPackagePanel
            sessionsRemaining={0}
            hasPartner={hasPartner}
            pricing={pricing}
            gates={gates ? { therapy: gates.therapy.gate, psychiatry: gates.psychiatry.gate, couples: gates.couples.gate } : {}}
          />
        </div>
      </>
    )
  }

  const justBooked = Boolean(track && sp.booked)
  return (
    <>
      <div className="page-head">
        <div>
          {back}
          <h1 className="page-title" style={{ marginTop: 6 }}>{track ? `${TRACK_LABEL[track]} sessions` : 'Buy a package'}</h1>
        </div>
        <span className="page-meta">{sessionsRemaining} {sessionsRemaining === 1 ? 'session' : 'sessions'} remaining</span>
      </div>

      <div className="stack" style={{ maxWidth: 1200 }}>
        {justBooked && track && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: 'var(--c-green-pale, #E5F4EE)', borderColor: 'transparent' }}>
            <span style={{ fontSize: 26 }} aria-hidden>🎉</span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="section-title" style={{ marginBottom: 2 }}>Your first session is booked</div>
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
                {gates?.[track].clinician ? `Pick a time with ${gates[track].clinician} in Sessions. ` : 'Pick a time in Sessions. '}
                Packages for {TRACK_LABEL[track].toLowerCase()} are open below whenever you would like more.
              </p>
            </div>
            <Link href="/app/sessions" className="btn btn-primary btn-sm">Pick a time</Link>
          </div>
        )}
        {hasPurchased && (!track || packages.some((pkg) => pkg.track === track)) && (
          <div className="card">
            <div className="section-title">Your current balances</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {packages.filter((pkg) => !track || pkg.track === track).map((pkg) => (
                <div
                  key={pkg.track}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', paddingBottom: 10, borderBottom: '1px solid var(--c-line)' }}
                >
                  <div>
                    <div className="doc-name" style={{ fontSize: 15 }}>{pkg.label}</div>
                    <div className="muted" style={{ fontSize: 12.5 }}>
                      {pkg.planName}{pkg.validUntil ? ` · valid until ${pkg.validUntil}` : ''}{pkg.expired ? ' · expired' : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: pkg.remaining > 0 ? 'var(--c-green, #3D9E72)' : 'var(--c-coral, #C8553D)' }}>
                    {pkg.remaining} of {pkg.sessionsTotal} left
                  </div>
                </div>
              ))}
            </div>
            {!firstSessionDone && !justBooked && (
              <p className="muted" style={{ marginTop: 12 }}>
                Your first session is booked. Schedule it in{' '}
                <Link href="/app/sessions" className="link-action">Sessions</Link>. You can add a package below whenever you&apos;re ready.
              </p>
            )}
          </div>
        )}
        {!track && invoices.length > 0 && (
          <div className="card">
            <div className="section-title">Invoices</div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              {invoices.map((inv) => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid var(--c-line)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-charcoal)' }}>{inv.label}</div>
                    <div className="muted" style={{ fontSize: 12.5 }}>{inv.dateLabel} · ₹{inv.amount.toLocaleString('en-IN')}</div>
                  </div>
                  <a href={`/app/billing/invoice/${inv.id}`} target="_blank" rel="noopener" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Download size={14} /> Invoice
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        <BuyPackagePanel
          sessionsRemaining={sessionsRemaining}
          hasPartner={hasPartner}
          pricing={pricing}
          gates={gates ? { therapy: gates.therapy.gate, psychiatry: gates.psychiatry.gate, couples: gates.couples.gate } : {}}
          only={track}
        />
      </div>
    </>
  )
}
