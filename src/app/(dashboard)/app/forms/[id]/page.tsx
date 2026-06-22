import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { getSessionUserId } from '@/lib/patient'
import { getFormToFill } from '@/lib/forms'
import { FormFiller } from '@/components/dashboard/FormFiller'

export default async function FillFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getSessionUserId()
  if (!userId) redirect('/login')

  const form = await getFormToFill(userId, id)
  if (!form) notFound()

  const completed = form.status === 'COMPLETED'

  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/app/forms" className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to forms
          </Link>
          <h1 className="page-title" style={{ marginTop: 6 }}>{form.title}</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {form.description && <p className="muted" style={{ marginBottom: 18 }}>{form.description}</p>}

        {completed && (
          <div
            className="pattern"
            style={{ background: 'var(--c-coral-pale)', borderRadius: 10, marginBottom: 18, padding: 12 }}
          >
            <span className="pattern-ic t-green">
              <CheckCircle2 size={16} />
            </span>
            <div className="pattern-title">You completed this form. Your answers are below.</div>
          </div>
        )}

        <FormFiller assignmentId={form.id} fields={form.fields} readOnly={completed} initial={form.responses} />
      </div>
    </>
  )
}
