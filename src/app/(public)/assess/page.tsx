import type { Metadata } from 'next'
import AssessmentStep1 from '@/components/assessment/AssessmentStep1'

export const metadata: Metadata = {
  title: 'Free Mental Health Assessment',
  description:
    'Take a free, confidential mental health check-in, around twelve gentle questions, no login required, and get matched with the right therapist or psychiatrist for you.',
  alternates: { canonical: '/assess' },
}

export default function AssessPage() {
  return <AssessmentStep1 />
}
