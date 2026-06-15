import AssessmentForm from '@/components/assessment/AssessmentForm'

export default async function AssessFormPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  return <AssessmentForm type={type} />
}
