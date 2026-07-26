import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTherapistContext, getExpertBlogPostForEdit } from '@/lib/expert'
import { BlogComposer } from '@/components/expert/BlogComposer'

export const metadata = { title: 'Edit post · Expert portal', robots: { index: false, follow: false } }

export default async function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const post = await getExpertBlogPostForEdit(ctx.userId, slug)
  if (!post) notFound()

  return (
    <div className="stack">
      <Link href="/expert/blogs" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> Back to blogs
      </Link>
      <div className="page-head">
        <div className="page-title">Edit post</div>
        <div className="page-meta">{post.title}</div>
      </div>
      <BlogComposer designation={ctx.designation} initial={post} />
    </div>
  )
}
