import { getPerspectivesPublic } from '@/lib/perspectives'
import { PerspectivesView } from '@/components/media/PerspectivesView'

export const dynamic = 'force-dynamic'

export default async function AppPerspectivesPage() {
  const sections = await getPerspectivesPublic()
  return <PerspectivesView sections={sections} />
}
