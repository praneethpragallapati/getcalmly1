import type { Metadata } from 'next'
import AssessmentForm from '@/components/assessment/AssessmentForm'

// In-progress assessment forms, no standalone search value.
export const metadata: Metadata = { robots: { index: false, follow: true } }

export default async function AssessFormPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  return <AssessmentForm type={type} />
}
