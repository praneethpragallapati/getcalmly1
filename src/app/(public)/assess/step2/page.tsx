import type { Metadata } from 'next'
import AssessmentStep2 from '@/components/assessment/AssessmentStep2'

// Mid-funnel step, no standalone search value; keep out of the index.
export const metadata: Metadata = { robots: { index: false, follow: true } }

export default function AssessStep2Page() {
  return <AssessmentStep2 />
}
