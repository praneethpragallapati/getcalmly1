import { BlogsStrip } from '@/components/dashboard/BlogsStrip'
import { getBlogPosts } from '@/lib/blog'
import { PerspectivesHero } from '@/components/media/PerspectivesView'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { PERSPECTIVES_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function BlogsPage() {
  const blogs = await getBlogPosts()
  return (
    <>
      <PerspectivesHero />
      <SectionTabs tabs={PERSPECTIVES_TABS} active="/app/blogs" />
      <BlogsStrip posts={blogs} limit={99} />
    </>
  )
}
