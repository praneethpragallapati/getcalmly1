import { getCalmAiHistory } from '@/lib/calmAi'
import { CalmAiChat } from '@/components/dashboard/CalmAiChat'

export const metadata = { title: 'Talk to Calm AI' }

export default async function CalmAiPage() {
  const history = await getCalmAiHistory()

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Talk to Calm AI</h1>
        <span className="page-meta">Private · between you and Calm AI</span>
      </div>
      <div style={{ maxWidth: 760 }}>
        <CalmAiChat initial={history} />
      </div>
    </>
  )
}
