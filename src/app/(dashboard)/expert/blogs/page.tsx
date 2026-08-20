import { redirect } from 'next/navigation'
import { getTherapistContext, getExpertBlogPosts } from '@/lib/expert'
import { getBlogPosts } from '@/lib/blog'
import { BlogsManager } from '@/components/expert/BlogsManager'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { EXPERT_PUBLISH_TABS } from '@/data/sectionTabs'

export const metadata = { title: 'Blogs · Expert portal', robots: { index: false, follow: false } }

export default async function ExpertBlogsPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const [myPosts, allPosts] = await Promise.all([getExpertBlogPosts(ctx.userId), getBlogPosts()])

  return (
    <div className="stack">
      <SectionTabs
        eyebrow="Calm Club · Perspectives"
        title="Perspectives"
        meta={<>Write for the public blog · bylined as <b>{ctx.designation}</b></>}
        tabs={EXPERT_PUBLISH_TABS}
        active="/expert/blogs"
      />
      <BlogsManager myPosts={myPosts} allPosts={allPosts} designation={ctx.designation} />
    </div>
  )
}
