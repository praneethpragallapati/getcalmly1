import { getGuidedTracksAdmin } from '@/lib/guided'
import { GuidedManager } from '@/components/admin/GuidedManager'

import { SectionTabs } from '@/components/ui/SectionTabs'
import { ADMIN_CONTENT_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Guided calm · Admin', robots: { index: false } }

export default async function AdminGuidedPage() {
  const tracks = await getGuidedTracksAdmin()
  return (
    <>
      <SectionTabs title="Content" meta="Author guided video tracks. Make them public, or leave them for experts to assign to patients." tabs={ADMIN_CONTENT_TABS} active="/admin/guided" />
      <GuidedManager tracks={tracks} />
    </>
  )
}
