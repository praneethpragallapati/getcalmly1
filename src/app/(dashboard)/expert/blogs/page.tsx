import { redirect } from 'next/navigation'
import { getTherapistContext, getExpertBlogPosts } from '@/lib/expert'
import { getBlogPosts } from '@/lib/blog'
import { BlogsManager } from '@/components/expert/BlogsManager'

export const metadata = { title: 'Blogs · Expert portal', robots: { index: false, follow: false } }

export default async function ExpertBlogsPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const [myPosts, allPosts] = await Promise.all([getExpertBlogPosts(ctx.userId), getBlogPosts()])

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Blogs</div>
        <div className="page-meta">Write for the public blog · bylined as <b>{ctx.designation}</b></div>
      </div>
      <BlogsManager myPosts={myPosts} allPosts={allPosts} designation={ctx.designation} />
    </div>
  )
}
