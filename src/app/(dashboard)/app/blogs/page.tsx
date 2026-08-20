import { BlogsStrip } from '@/components/dashboard/BlogsStrip'
import { getBlogPosts } from '@/lib/blog'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { PERSPECTIVES_TABS } from '@/data/sectionTabs'
import { TagFilterBar, tagCounts, filterByTag, tagFromSearchParams } from '@/components/ui/TagFilterBar'
import { tagLabel } from '@/data/tags'

export const dynamic = 'force-dynamic'

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const blogs = await getBlogPosts()
  const tag = tagFromSearchParams(await searchParams)
  const shown = filterByTag(blogs, tag)

  return (
    <>
      <SectionTabs
        eyebrow="Calm Club · Perspectives"
        title="Perspectives"
        meta="Essays from our experts, and the questions you'd rather Google at 2am."
        tabs={PERSPECTIVES_TABS}
        active="/app/blogs"
      />
      <TagFilterBar
        tags={tagCounts(blogs)}
        active={tag}
        basePath="/app/blogs"
        total={blogs.length}
        emptyHint="Essays will be filterable by topic once they carry tags."
      />
      {shown.length === 0 ? (
        <p className="muted" style={{ fontSize: 13.5 }}>
          Nothing tagged “{tagLabel(tag ?? '')}” yet.
        </p>
      ) : (
        <BlogsStrip posts={shown} limit={99} />
      )}
    </>
  )
}
