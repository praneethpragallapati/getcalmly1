import '@/components/assessment/assess.css'
import AssessmentForm from '@/components/assessment/AssessmentForm'
import { saveAssessmentResult } from '@/app/(dashboard)/app/actions'

// The in-app assessment uses the SAME detailed questionnaire as the marketing
// site; on finish we persist it to the patient's profile and match a clinician
// (instead of the public sessionStorage → results-page flow).
const VALID = ['adult', 'couple', 'child', 'psychiatry']

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const sp = await searchParams
  const type = VALID.includes(sp.type ?? '') ? (sp.type as string) : 'adult'
  return <AssessmentForm type={type} onComplete={saveAssessmentResult} />
}
