import { redirect } from 'next/navigation'
import { getTherapistContext } from '@/lib/expert'
import { getPerspectivesPublic } from '@/lib/perspectives'
import { PerspectivesView } from '@/components/media/PerspectivesView'
import { SubmitPerspectiveCard } from '@/components/expert/SubmitPerspectiveCard'

export const metadata = { title: 'Perspectives · Expert portal', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function ExpertPerspectivesPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const sections = await getPerspectivesPublic()
  return (
    <div className="stack" style={{ gap: 24 }}>
      <SubmitPerspectiveCard sections={sections.map((s) => ({ id: s.id, title: s.title }))} />
      <PerspectivesView sections={sections} />
    </div>
  )
}
