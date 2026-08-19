import { getPerspectivesPublic } from '@/lib/perspectives'
import { PerspectivesView } from '@/components/media/PerspectivesView'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { PERSPECTIVES_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function AppPerspectivesPage() {
  const sections = await getPerspectivesPublic()
  return (
    <>
      <SectionTabs
        eyebrow="Calm Club · Perspectives"
        title="Perspectives"
        meta="The things nobody says out loud — from our experts and the people living it."
        tabs={PERSPECTIVES_TABS}
        active="/app/perspectives"
      />
      <PerspectivesView sections={sections} showHero={false} />
    </>
  )
}
