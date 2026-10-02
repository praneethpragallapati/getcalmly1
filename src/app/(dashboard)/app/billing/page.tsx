import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSessionUserId } from '@/lib/patient'
import { hasPartnerOnRecord, getActivePackages, getInvoices, type PackageBalance } from '@/lib/billing'
import { getPricingConfig } from '@/lib/pricingConfig'
import { prisma } from '@/lib/prisma'
import { MATCH_HREF, TRACK_SLOT } from '@/lib/clinicianChoice'
import { BuyPackagePanel, FirstSessionPanel, type BuyGate } from '@/components/dashboard/BuyPackagePanel'
import { ChooseClinician } from '@/components/dashboard/ChooseClinician'
import { InvoiceList } from '@/components/dashboard/InvoiceList'

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
async function getBuyGates(userId: string): Promise<Record<BuyableTrack, { gate: BuyGate; clinician: string | null; clinicianId: string | null }>> {
  const out = {
    therapy: { gate: 'packs', clinician: null, clinicianId: null },
    psychiatry: { gate: 'packs', clinician: null, clinicianId: null },
    couples: { gate: 'packs', clinician: null, clinicianId: null },
  } as Record<BuyableTrack, { gate: BuyGate; clinician: string | null; clinicianId: string | null }>
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
      out[t] = { gate: bought ? 'packs' : id ? 'first' : 'choose', clinician: id ? names.get(id) ?? null : null, clinicianId: id ?? null }
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

  const gateMap = gates ? { therapy: gates.therapy.gate, psychiatry: gates.psychiatry.gate, couples: gates.couples.gate } : {}

  // Just bought the first session: a warm confirmation and the next step,
  // picking a time. Packages wait until later.
  if (track && sp.booked) {
    const who = gates?.[track].clinician ?? null
    const withId = gates?.[track].clinicianId ?? null
    return (
      <>
        <div className="page-head">
          <div>
            {back}
            <h1 className="page-title" style={{ marginTop: 6 }}>First session booked</h1>
          </div>
        </div>
        <div className="card" style={{ maxWidth: 560, textAlign: 'center', padding: '36px 28px' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }} aria-hidden>🎉</div>
          <div className="section-title" style={{ fontSize: 22, marginBottom: 6 }}>You&apos;re all set</div>
          <p className="muted" style={{ margin: '0 auto 20px', maxWidth: 400, lineHeight: 1.6 }}>
            Your first {TRACK_LABEL[track].toLowerCase()} session{who ? <> with <b style={{ color: 'var(--c-charcoal)' }}>{who}</b></> : null} is
            purchased. Pick a time that suits you, and you can change it later if you need to.
          </p>
          <Link href={withId ? `/app/sessions?with=${withId}` : '/app/sessions'} className="btn btn-primary" style={{ padding: '12px 22px' }}>
            Book a slot
          </Link>
        </div>
      </>
    )
  }

  // Buying more or renewing one service: that service only.
  if (track) {
    const pkg = packages.find((p) => p.track === track)
    return (
      <>
        <div className="page-head">
          <div>
            {back}
            <h1 className="page-title" style={{ marginTop: 6 }}>{TRACK_LABEL[track]} sessions</h1>
          </div>
        </div>
        <div className="stack" style={{ maxWidth: 560 }}>
          {pkg && <BalanceCard pkg={pkg} withId={gates?.[track].clinicianId ?? null} />}
          <BuyPackagePanel sessionsRemaining={sessionsRemaining} hasPartner={hasPartner} pricing={pricing} gates={gateMap} only={track} />
        </div>
      </>
    )
  }

  // Manage plan: each service's balance, then buying, then invoices.
  return (
    <>
      <div className="page-head">
        <div>
          {back}
          <h1 className="page-title" style={{ marginTop: 6 }}>{hasPurchased ? 'Manage plan' : 'Book your first session'}</h1>
        </div>
        {hasPurchased && <span className="page-meta">{sessionsRemaining} {sessionsRemaining === 1 ? 'session' : 'sessions'} remaining</span>}
      </div>

      <div className="stack" style={{ maxWidth: 1200 }}>
        {hasPurchased && (
          <div>
            <div className="section-title" style={{ marginBottom: 12 }}>Your balance</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
              {packages.map((pkg) => (
                <BalanceCard key={pkg.track} pkg={pkg} withId={gates && isBuyable(pkg.track) ? gates[pkg.track].clinicianId : null} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="section-title" style={{ marginBottom: 4 }}>{hasPurchased ? 'Buy sessions' : 'Choose your care'}</div>
          <p className="muted" style={{ margin: '0 0 14px', fontSize: 13.5 }}>
            {hasPurchased
              ? 'Add sessions to a service you have, or start a new one with your first session.'
              : 'Start with your first session, at an introductory price.'}
          </p>
          <BuyPackagePanel sessionsRemaining={sessionsRemaining} hasPartner={hasPartner} pricing={pricing} gates={gateMap} />
        </div>

        {invoices.length > 0 && <InvoiceList invoices={invoices} />}
      </div>
    </>
  )
}

function isBuyable(t: string): t is BuyableTrack {
  return (BUYABLE as readonly string[]).includes(t)
}

/** One service's balance on its own card, with the way to use it. */
function BalanceCard({ pkg, withId }: { pkg: PackageBalance; withId: string | null }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--c-green, #3D9E72)' }}>{pkg.label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: pkg.remaining > 0 ? 'var(--c-charcoal)' : 'var(--c-coral, #C8553D)', lineHeight: 1 }}>
          {pkg.remaining}
        </span>
        <span className="muted" style={{ fontSize: 13.5 }}>of {pkg.sessionsTotal} {pkg.sessionsTotal === 1 ? 'session' : 'sessions'} left</span>
      </div>
      <div className="muted" style={{ fontSize: 12.5 }}>
        {pkg.planName}{pkg.validUntil ? ` · ${pkg.expired ? 'expired' : 'valid until'} ${pkg.validUntil}` : ''}
      </div>
      {pkg.remaining > 0 && !pkg.expired && (
        <Link href={withId ? `/app/sessions?with=${withId}` : '/app/sessions'} className="link-action" style={{ marginTop: 4, fontSize: 13.5, fontWeight: 700 }}>
          Book a slot →
        </Link>
      )}
    </div>
  )
}
