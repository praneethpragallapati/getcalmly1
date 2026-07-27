import { redirect } from 'next/navigation'
import { getAdminSession, getBlogsForModeration, getCommunityForModeration } from '@/lib/admin'
import { ContentMod } from '@/components/admin/ContentMod'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [blogs, community] = await Promise.all([getBlogsForModeration(), getCommunityForModeration()])
  return <ContentMod blogs={blogs} community={community} />
}
