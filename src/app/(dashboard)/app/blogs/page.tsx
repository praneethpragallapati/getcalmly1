import { BlogsStrip } from '@/components/dashboard/BlogsStrip'
import { getBlogPosts } from '@/lib/blog'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { PERSPECTIVES_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function BlogsPage() {
  const blogs = await getBlogPosts()
  return (
    <>
      <SectionTabs
        eyebrow="Calm Club · Perspectives"
        title="Perspectives"
        meta="Essays from our experts, and the questions you'd rather Google at 2am."
        tabs={PERSPECTIVES_TABS}
        active="/app/blogs"
      />
      <BlogsStrip posts={blogs} limit={99} />
    </>
  )
}
