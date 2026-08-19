import { getPerspectivesPublic } from '@/lib/perspectives'
import { PerspectivesView, PerspectivesHero } from '@/components/media/PerspectivesView'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { PERSPECTIVES_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function AppPerspectivesPage() {
  const sections = await getPerspectivesPublic()
  return (
    <>
      <PerspectivesHero comingSoon={sections.some((s) => s.comingSoon)} />
      <SectionTabs tabs={PERSPECTIVES_TABS} active="/app/perspectives" />
      <PerspectivesView sections={sections} showHero={false} />
    </>
  )
}
