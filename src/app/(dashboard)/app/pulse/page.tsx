import { redirect } from 'next/navigation'

// Pulse checks live only on the home page now (filled in a pop-up there).
export default function PulsePage() {
  redirect('/app?tab=pulse')
}
