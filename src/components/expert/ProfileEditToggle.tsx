'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { TherapistProfileEditor } from './TherapistProfileEditor'

type Props = {
  name: string
  bio: string
  gender: string | null
  qualifications: string[]
  languages: string[]
  specializations: string[]
  rciNumber: string
  council: string
  yearsExp: number
  isVerified: boolean
  photoUrl: string | null
  phone: string | null
  dateOfBirth: string | null
  country: string
  state: string | null
  city: string | null
  addressLine1: string | null
  addressLine2: string | null
  postalCode: string | null
  emergencyName: string | null
  emergencyPhone: string | null
  emergencyRelation: string | null
  /** The read-only profile view, shown when not editing. */
  children: React.ReactNode
}

/**
 * Wraps the clinician's read-only profile. Shows an "Edit profile" button; when
 * clicked it swaps the whole view for the editor, and restores it on save/cancel.
 */
export function ProfileEditToggle({ children, ...editable }: Props) {
  const [editing, setEditing] = useState(false)
  if (editing) return <TherapistProfileEditor {...editable} onClose={() => setEditing(false)} />
  return (
    <div className="stack">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
          <Pencil size={14} /> Edit profile
        </button>
      </div>
      {children}
    </div>
  )
}
