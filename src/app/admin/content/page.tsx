import { redirect } from 'next/navigation'
import { getAdminSession, getBlogsForModeration, getCommunityForModeration } from '@/lib/admin'
import { getPollsForAdmin } from '@/lib/polls'
import { ContentMod } from '@/components/admin/ContentMod'
import { PollAdmin } from '@/components/admin/PollAdmin'

import { SectionTabs } from '@/components/ui/SectionTabs'
import { ADMIN_CONTENT_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [blogs, community, polls] = await Promise.all([getBlogsForModeration(), getCommunityForModeration(), getPollsForAdmin()])
  return (
    <div className="stack">
      <SectionTabs title="Content" meta="Moderate what members post and read, and curate the video libraries." tabs={ADMIN_CONTENT_TABS} active="/admin/content" />
      <ContentMod blogs={blogs} community={community} />
      <PollAdmin polls={polls} />
    </div>
  )
}
