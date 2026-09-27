import '@/components/assessment/assess.css'
import AssessmentForm from '@/components/assessment/AssessmentForm'
import AssessmentStep1 from '@/components/assessment/AssessmentStep1'
import { saveAssessmentResult } from '@/app/(dashboard)/app/actions'
import { isFlowId } from '@/data/assessments'

// The in-app assessment uses the SAME questionnaires as the marketing site; on
// finish we persist it to the patient's profile and match a clinician (instead
// of the public sessionStorage → results-page flow). Without a path chosen, it
// opens on the same four-path start screen.
export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const sp = await searchParams
  if (!isFlowId(sp.type)) return <AssessmentStep1 hrefFor={(id) => `/app/assessment?type=${id}`} />
  return <AssessmentForm type={sp.type} onComplete={saveAssessmentResult} startHref="/app/assessment" />
}
