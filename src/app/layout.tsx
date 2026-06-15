import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GetCalmly — Mental Health Support That Understands You',
  description: 'Connect with RCI-licensed therapists in your language, at your budget. Start your journey to wellbeing today.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
