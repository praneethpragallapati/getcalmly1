import type { Metadata } from 'next'
import Results from '@/components/assessment/Results'
import { getPricingConfig } from '@/lib/pricingConfig'

// Personal assessment results, must never be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } }

// Prices are admin-editable, so they are read here rather than hardcoded into
// the results page. The card used to print the clinician's standard session fee
// beside a call to action quoting the first-session price, so the same page
// showed two different numbers for the same next step.
export const dynamic = 'force-dynamic'

export default async function ResultsPage() {
  const pricing = await getPricingConfig()
  return <Results firstSession={pricing.firstSession} />
}
