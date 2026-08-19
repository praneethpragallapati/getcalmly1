import { getPerspectivesAdmin, getPerspectiveSubmissions } from '@/lib/perspectives'
import { PerspectivesManager } from '@/components/admin/PerspectivesManager'

import { SectionTabs } from '@/components/ui/SectionTabs'
import { ADMIN_CONTENT_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Perspectives · Admin', robots: { index: false } }

export default async function AdminPerspectivesPage() {
  const [sections, submissions] = await Promise.all([getPerspectivesAdmin(), getPerspectiveSubmissions()])
  return (
    <>
      <SectionTabs title="Content" meta="Curate the Calm Club video sections. Approve clinician submissions and manage what members see." tabs={ADMIN_CONTENT_TABS} active="/admin/perspectives" />
      <PerspectivesManager sections={sections} submissions={submissions} />
    </>
  )
}
