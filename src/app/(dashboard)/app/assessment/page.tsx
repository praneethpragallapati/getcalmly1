import { getSessionUserId } from '@/lib/patient'
import { prisma } from '@/lib/prisma'
import { AssessmentForm } from '@/components/dashboard/AssessmentForm'

/**
 * The patient assessment. Concerns + preferred language feed clinician
 * auto-matching; completing this is required before a patient can book.
 */
export default async function AssessmentPage() {
  const userId = await getSessionUserId()
  let concerns: string[] = []
  let primary: string | null = null
  let language: string | null = null
  if (userId) {
    try {
      const p = await prisma.patientProfile.findUnique({
        where: { userId },
        select: { track: true, subTrack: true, preferredLanguage: true },
      })
      concerns = p?.track ?? []
      primary = p?.subTrack ?? null
      language = p?.preferredLanguage ?? null
    } catch {
      /* fresh profile — start blank */
    }
  }

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Your assessment</h1>
        <span className="page-meta">Takes a minute</span>
      </div>
      <AssessmentForm initialConcerns={concerns} initialPrimary={primary} initialLanguage={language} />
    </>
  )
}
