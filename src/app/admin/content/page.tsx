import { redirect } from 'next/navigation'
import { getAdminSession, getBlogsForModeration, getCommunityForModeration } from '@/lib/admin'
import { getPollsForAdmin } from '@/lib/polls'
import { ContentMod } from '@/components/admin/ContentMod'
import { PollAdmin } from '@/components/admin/PollAdmin'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [blogs, community, polls] = await Promise.all([getBlogsForModeration(), getCommunityForModeration(), getPollsForAdmin()])
  return (
    <div className="stack">
      <ContentMod blogs={blogs} community={community} />
      <PollAdmin polls={polls} />
    </div>
  )
}
