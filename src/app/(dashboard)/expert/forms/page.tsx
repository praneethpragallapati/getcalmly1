import { redirect } from 'next/navigation'
import { getTherapistContext } from '@/lib/expert'
import { getFormLibrary, listFormRules } from '@/lib/forms'
import { FormRulesManager } from '@/components/forms/FormRulesManager'

export const dynamic = 'force-dynamic'

export default async function ExpertFormsPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')
  const [templates, rules] = await Promise.all([
    getFormLibrary(),
    listFormRules(ctx.therapistProfileId),
  ])
  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Default forms</div>
        <div className="page-meta">Auto-send forms to your patients after a booking, by package type and session number</div>
      </div>
      <FormRulesManager scope="expert" rules={rules} templates={templates.map((t) => ({ id: t.id, title: t.title }))} />
    </div>
  )
}
