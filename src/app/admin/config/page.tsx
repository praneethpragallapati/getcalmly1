import { redirect } from 'next/navigation'
import { getAdminSession, getFormsLibrary } from '@/lib/admin'
import { ConfigPanel } from '@/components/admin/ConfigPanel'
import { ChangePasswordCard } from '@/components/dashboard/ChangePasswordCard'
import { FormRulesManager } from '@/components/forms/FormRulesManager'
import { getFormLibrary, listFormRules } from '@/lib/forms'

export const dynamic = 'force-dynamic'

export default async function AdminConfigPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [forms, ruleTemplates, rules] = await Promise.all([
    getFormsLibrary(),
    getFormLibrary(),
    listFormRules(null),
  ])
  return (
    <div className="stack">
      <ConfigPanel forms={forms} />
      <FormRulesManager scope="admin" rules={rules} templates={ruleTemplates.map((t) => ({ id: t.id, title: t.title }))} />
      <ChangePasswordCard />
    </div>
  )
}
