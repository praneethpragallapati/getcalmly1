import { getPerspectivesPublic } from '@/lib/perspectives'
import { PerspectivesView } from '@/components/media/PerspectivesView'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { PERSPECTIVES_TABS } from '@/data/sectionTabs'
import { TagFilterBar, tagCounts, filterByTag, tagFromSearchParams } from '@/components/ui/TagFilterBar'
import { tagLabel } from '@/data/tags'

export const dynamic = 'force-dynamic'

export default async function AppPerspectivesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sections = await getPerspectivesPublic()
  const tag = tagFromSearchParams(await searchParams)

  // Tags are counted across every video, then applied inside each section. A
  // section with nothing left after filtering is dropped rather than shown
  // empty — except when nothing is filtered, where the empty-section teasers
  // ("coming soon") are the point.
  const allVideos = sections.flatMap((s) => s.videos)
  const shown = tag
    ? sections
        .map((s) => ({ ...s, videos: filterByTag(s.videos, tag) }))
        .filter((s) => s.videos.length > 0)
    : sections

  return (
    <>
      <SectionTabs
        eyebrow="Calm Club · Perspectives"
        title="Perspectives"
        meta="The things nobody says out loud — from our experts and the people living it."
        tabs={PERSPECTIVES_TABS}
        active="/app/perspectives"
      />
      <TagFilterBar
        tags={tagCounts(allVideos)}
        active={tag}
        basePath="/app/perspectives"
        total={allVideos.length}
        emptyHint={allVideos.length > 0 ? 'Talks will be filterable by topic once they carry tags.' : undefined}
      />
      {tag && shown.length === 0 ? (
        <p className="muted" style={{ fontSize: 13.5 }}>
          No talks tagged “{tagLabel(tag)}” yet.
        </p>
      ) : (
        <PerspectivesView sections={shown} showHero={false} />
      )}
    </>
  )
}
