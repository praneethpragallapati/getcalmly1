import '@/components/assessment/assess.css'
import AssessmentForm from '@/components/assessment/AssessmentForm'
import AssessmentStep1 from '@/components/assessment/AssessmentStep1'
import { saveAssessmentResult } from '@/app/(dashboard)/app/actions'
import { isFlowId } from '@/data/assessments'

const BUYABLE = ['therapy', 'couples', 'psychiatry']

// The in-app assessment uses the SAME questionnaires as the marketing site; on
// finish we persist it to the patient's profile and match a clinician (instead
// of the public sessionStorage → results-page flow). Without a path chosen, it
// opens on the same four-path start screen.
export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; for?: string }>
}) {
  const sp = await searchParams
  // "Match your clinician" from the buy flow names the care type (?for=), so
  // the match is made for it before buying and the patient returns to buy.
  const forTrack = BUYABLE.includes(sp.for ?? '') ? sp.for : undefined
  const forQs = forTrack ? `&for=${forTrack}` : ''
  if (!isFlowId(sp.type)) return <AssessmentStep1 photo={false} hrefFor={(id) => `/app/assessment?type=${id}${forQs}`} />
  return (
    <AssessmentForm
      type={sp.type}
      onComplete={saveAssessmentResult}
      startHref={`/app/assessment${forTrack ? `?for=${forTrack}` : ''}`}
      forTrack={forTrack}
      doneHref={forTrack ? `/app/billing?track=${forTrack}` : '/app/therapist'}
    />
  )
}
