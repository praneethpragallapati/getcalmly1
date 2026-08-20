import { redirect } from 'next/navigation'
import { getAdminSession, getFormsLibrary } from '@/lib/admin'
import { ConfigPanel } from '@/components/admin/ConfigPanel'
import { ChangePasswordCard } from '@/components/dashboard/ChangePasswordCard'
import { FormRulesManager } from '@/components/forms/FormRulesManager'
import { FormBuilder } from '@/components/forms/FormBuilder'
import { getFormLibrary, listFormRules, listCustomForms } from '@/lib/forms'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminConfigPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/login')
  const [forms, ruleTemplates, rules, patients, customForms] = await Promise.all([
    getFormsLibrary(),
    getFormLibrary(),
    listFormRules(null),
    prisma.user.findMany({ where: { role: 'PATIENT' }, select: { id: true, name: true, email: true }, orderBy: { createdAt: 'desc' }, take: 1000 }).catch(() => []),
    listCustomForms(null),
  ])
  return (
    <div className="stack">
      <ConfigPanel forms={forms} />
      <FormBuilder scope="admin" forms={customForms} />
      <FormRulesManager
        scope="admin"
        rules={rules}
        templates={ruleTemplates.map((t) => ({ id: t.id, title: t.title }))}
        patients={patients.map((p) => ({ id: p.id, name: p.name ?? p.email ?? 'Patient' }))}
      />
      <ChangePasswordCard />
    </div>
  )
}
