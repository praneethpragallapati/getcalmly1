import { redirect } from 'next/navigation'

// The "who is it for" step is gone: the start screen now offers the four paths
// directly. Old links land on it.
export default function AssessStep2Page() {
  redirect('/assess')
}
