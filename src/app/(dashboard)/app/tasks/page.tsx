import { redirect } from 'next/navigation'

// Activities live only on the home page now.
export default function TasksPage() {
  redirect('/app')
}
