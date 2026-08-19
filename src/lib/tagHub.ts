import { getCommunityPosts } from '@/lib/community'
import { getBlogPosts } from '@/lib/blog'
import { getPerspectivesPublic, type PerspectiveVideoView } from '@/lib/perspectives'
import type { CommunityPostView } from '@/lib/community'

/**
 * Everything carrying one tag, across the three places members read and watch:
 * Real Talk posts, Perspectives essays (blogs) and Perspectives talks (videos).
 * This is what makes the shared vocabulary in data/tags.ts pay off — one tag,
 * one page, all of it.
 */
export type TagHub = {
  posts: CommunityPostView[]
  blogs: Awaited<ReturnType<typeof getBlogPosts>>
  videos: (PerspectiveVideoView & { sectionTitle: string })[]
  total: number
}

export async function getTagHub(slug: string): Promise<TagHub> {
  const tag = slug.toLowerCase()
  const [posts, blogs, sections] = await Promise.all([
    getCommunityPosts().catch(() => []),
    getBlogPosts().catch(() => []),
    getPerspectivesPublic().catch(() => []),
  ])

  const taggedPosts = posts.filter((p) => p.tags.some((t) => t.toLowerCase() === tag))
  const taggedBlogs = blogs.filter((b) => b.tags.some((t) => t.toLowerCase() === tag))
  const taggedVideos = sections.flatMap((s) =>
    s.videos
      .filter((v) => v.tags.some((t) => t.toLowerCase() === tag))
      .map((v) => ({ ...v, sectionTitle: s.title })),
  )

  return {
    posts: taggedPosts,
    blogs: taggedBlogs,
    videos: taggedVideos,
    total: taggedPosts.length + taggedBlogs.length + taggedVideos.length,
  }
}
