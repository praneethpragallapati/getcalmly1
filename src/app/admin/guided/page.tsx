import { getGuidedTracksAdmin } from '@/lib/guided'
import { GuidedManager } from '@/components/admin/GuidedManager'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Guided calm · Admin', robots: { index: false } }

export default async function AdminGuidedPage() {
  const tracks = await getGuidedTracksAdmin()
  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Guided calm</h1>
        <span className="page-meta">Author guided video tracks. Make them public, or leave them for experts to assign to patients.</span>
      </div>
      <GuidedManager tracks={tracks} />
    </>
  )
}
