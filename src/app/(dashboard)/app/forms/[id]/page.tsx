import { redirect } from 'next/navigation'

// A link to one form opens that form's pop-up on the home page.
export default async function FillFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/app?form=${encodeURIComponent(id)}`)
}
