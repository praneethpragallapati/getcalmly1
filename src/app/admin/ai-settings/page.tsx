import { getAiConfig, MODEL_KEYS } from '@/lib/ai/settings'
import { MODELS } from '@/lib/ai/models'
import { AiSettingsForm } from '@/components/admin/AiSettingsForm'

export const dynamic = 'force-dynamic'

export default async function AiSettingsPage() {
  const cfg = await getAiConfig()
  const modelOptions = MODEL_KEYS.map((k) => ({ key: k, id: MODELS[k] }))

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">AI settings</h1>
          <span className="page-meta">Choose which AI features run for each customer type, the model each feature uses, the daily chat limit and a monthly token cap.</span>
        </div>
      </div>
      <AiSettingsForm initial={cfg} modelOptions={modelOptions} />
    </>
  )
}
