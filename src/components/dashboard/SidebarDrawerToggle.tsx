'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

/**
 * Mobile hamburger for the admin/expert dashboards. Those layouts render the
 * sidebar server-side as a plain <aside class="app-sidebar">, which the CSS turns
 * into an off-canvas drawer on small screens — but with no button to open it.
 * This adds the button (and backdrop) and toggles `.sb-open` on that aside, the
 * same mechanism the patient sidebar uses. Closes on navigation.
 */
export function SidebarDrawerToggle() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const aside = document.querySelector('.app-sidebar')
    aside?.classList.toggle('sb-open', open)
    return () => document.querySelector('.app-sidebar')?.classList.remove('sb-open')
  }, [open])

  // A tapped nav link changes the route — close the drawer when it does.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <button className="sb-burger" aria-label="Open menu" onClick={() => setOpen(true)}>
        <Menu size={20} />
      </button>
      {open && <button className="sb-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
    </>
  )
}
