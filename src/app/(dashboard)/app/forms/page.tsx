import { redirect } from 'next/navigation'

// Forms live only on the home page now (filled in a pop-up there).
export default function FormsPage() {
  redirect('/app?tab=forms')
}
