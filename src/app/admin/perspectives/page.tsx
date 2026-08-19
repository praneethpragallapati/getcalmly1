import { getPerspectivesAdmin, getPerspectiveSubmissions } from '@/lib/perspectives'
import { PerspectivesManager } from '@/components/admin/PerspectivesManager'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Perspectives · Admin', robots: { index: false } }

export default async function AdminPerspectivesPage() {
  const [sections, submissions] = await Promise.all([getPerspectivesAdmin(), getPerspectiveSubmissions()])
  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Perspectives</h1>
        <span className="page-meta">Curate the Calm Club video sections. Approve clinician submissions and manage what members see.</span>
      </div>
      <PerspectivesManager sections={sections} submissions={submissions} />
    </>
  )
}
