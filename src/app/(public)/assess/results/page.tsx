import type { Metadata } from 'next'
import Results from '@/components/assessment/Results'
import { getPricingConfig } from '@/lib/pricingConfig'
import { getMatchPool } from '@/lib/assessmentPool'

// Personal assessment results, must never be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } }

// Prices are admin-editable and the clinician pool is live (what each clinician
// offers, as they picked it), so both are read per request.
export const dynamic = 'force-dynamic'

export default async function ResultsPage() {
  const [pricing, pool] = await Promise.all([getPricingConfig(), getMatchPool()])
  return <Results firstSession={pricing.firstSession} pool={pool} />
}
