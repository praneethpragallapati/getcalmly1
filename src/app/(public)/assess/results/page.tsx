import type { Metadata } from 'next'
import Results from '@/components/assessment/Results'

// Personal assessment results, must never be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function ResultsPage() {
  return <Results />
}
