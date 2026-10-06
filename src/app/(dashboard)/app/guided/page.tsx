import { getGuidedTracksForPatient } from '@/lib/guided'
import { getSessionUserId } from '@/lib/patient'
import { GuidedView } from '@/components/media/GuidedView'
import { userTz } from '@/lib/userTz'

export const dynamic = 'force-dynamic'

export default async function AppGuidedPage() {
  const userId = await getSessionUserId()
  const tracks = await getGuidedTracksForPatient(userId)
  return <GuidedView tracks={tracks} tz={await userTz(userId)} />
}
