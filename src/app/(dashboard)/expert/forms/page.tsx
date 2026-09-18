import { redirect } from 'next/navigation'
import { getTherapistContext, getCaseload } from '@/lib/expert'
import { getFormLibrary, listFormRules, listCustomForms } from '@/lib/forms'
import { FormRulesManager } from '@/components/forms/FormRulesManager'
import { FormBuilder } from '@/components/forms/FormBuilder'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { EXPERT_TASKS_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

export default async function ExpertFormsPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')
  const [templates, rules, caseload, myForms] = await Promise.all([
    getFormLibrary(ctx.userId),
    listFormRules(ctx.therapistProfileId),
    getCaseload(ctx.therapistProfileId),
    listCustomForms(ctx.userId),
  ])
  return (
    <div className="stack">
      <SectionTabs
        eyebrow="Practice"
        title="Forms"
        meta="Build forms only you can send, and auto-send any form after a booking — by patient, package type and session number"
        tabs={EXPERT_TASKS_TABS}
        active="/expert/forms"
      />
      <FormBuilder scope="expert" forms={myForms} />
      <FormRulesManager
        scope="expert"
        rules={rules}
        templates={templates.map((t) => ({ id: t.id, title: t.title }))}
        patients={caseload.map((c) => ({ id: c.patientId, name: c.name }))}
      />
    </div>
  )
}
