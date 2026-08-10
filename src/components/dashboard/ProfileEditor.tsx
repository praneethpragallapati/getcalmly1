'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Check, Mail, Trash2 } from 'lucide-react'
import { updatePatientProfile } from '@/app/(dashboard)/app/actions'
import { useToast } from '@/components/ui/Toast'
import type { PatientProfileEdit } from '@/lib/account'
import { IN_STATES } from '@/lib/inStates'

const MAX_PHOTO_BYTES = 2_000_000

/**
 * The patient's own profile: name, phone, photo and personal / emergency-contact
 * details. Email is shown read-only — it's the login identity and can't change.
 */
export function ProfileEditor({ profile }: { profile: PatientProfileEdit }) {
  const router = useRouter()
  const toast = useToast()
  const [pending, start] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [gender, setGender] = useState(profile.gender ?? '')
  const [dob, setDob] = useState(profile.dateOfBirth ?? '')
  const [state, setState] = useState(profile.state ?? '')
  const [language, setLanguage] = useState(profile.preferredLanguage ?? '')
  const [emName, setEmName] = useState(profile.emergencyName ?? '')
  const [emPhone, setEmPhone] = useState(profile.emergencyPhone ?? '')
  const [emRel, setEmRel] = useState(profile.emergencyRelation ?? '')
  // undefined = unchanged; null = removed; string = new data URL
  const [photo, setPhoto] = useState<string | null | undefined>(undefined)
  const shownPhoto = photo === undefined ? profile.photoUrl : photo
  const initial = (name || profile.email || 'U').charAt(0).toUpperCase()

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file.')
    if (file.size > MAX_PHOTO_BYTES) return toast.error('Image is too large — keep it under 2 MB.')
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  function save() {
    if (!name.trim()) return toast.error('Please enter your name.')
    start(async () => {
      const res = await updatePatientProfile({
        name,
        phone,
        gender,
        dateOfBirth: dob || null,
        state,
        preferredLanguage: language,
        emergencyName: emName,
        emergencyPhone: emPhone,
        emergencyRelation: emRel,
        photo,
      })
      if (res.ok) {
        toast.success('Profile updated')
        setPhoto(undefined)
        router.refresh()
      } else {
        toast.error(res.error ?? 'Could not save your profile.')
      }
    })
  }

  return (
    <div className="card">
      <div className="section-title">Your profile</div>

      {/* Photo + name */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
        <div className="avatar-edit">
          {shownPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownPhoto} alt="" className="avatar-edit-img" />
          ) : (
            <span className="avatar-edit-img" style={{ background: 'var(--c-coral)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 30 }}>
              {initial}
            </span>
          )}
          <button type="button" className="avatar-edit-btn" aria-label="Change photo" onClick={() => fileRef.current?.click()}>
            <Camera size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label className="field-label">Full name</label>
          <input className="field-input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          {shownPhoto && (
            <button type="button" onClick={() => setPhoto(null)} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--c-coral)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}>
              <Trash2 size={13} /> Remove photo
            </button>
          )}
        </div>
      </div>

      {/* Email (read-only) */}
      <div style={{ marginTop: 16 }}>
        <label className="field-label">Email (can't be changed)</label>
        <div className="field-input" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--c-bg, #f6efea)', color: 'var(--c-gray-d)' }}>
          <Mail size={14} /> {profile.email ?? 'Not signed in'}
        </div>
      </div>

      <div className="field-grid" style={{ marginTop: 16 }}>
        <div>
          <label className="field-label">Phone</label>
          <input className="field-input" value={phone} maxLength={20} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" />
        </div>
        <div>
          <label className="field-label">Gender</label>
          <select className="field-select" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Prefer not to say</option>
            <option>Female</option>
            <option>Male</option>
            <option>Non-binary</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="field-label">Date of birth</label>
          <input className="field-input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Preferred language</label>
          <input className="field-input" value={language} maxLength={40} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. Hindi, English" />
        </div>
        <div>
          <label className="field-label">State</label>
          <input className="field-input" value={state} maxLength={60} onChange={(e) => setState(e.target.value)} placeholder="e.g. Karnataka" list="in-states" />
          <datalist id="in-states">
            {IN_STATES.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
      </div>

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--c-line)' }}>
        <div className="field-label" style={{ fontSize: 12.5, marginBottom: 10 }}>EMERGENCY CONTACT</div>
        <div className="field-grid">
          <div>
            <label className="field-label">Name</label>
            <input className="field-input" value={emName} maxLength={80} onChange={(e) => setEmName(e.target.value)} placeholder="Contact name" />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input className="field-input" value={emPhone} maxLength={20} onChange={(e) => setEmPhone(e.target.value)} placeholder="Contact phone" />
          </div>
          <div>
            <label className="field-label">Relationship</label>
            <input className="field-input" value={emRel} maxLength={40} onChange={(e) => setEmRel(e.target.value)} placeholder="e.g. Spouse, Parent" />
          </div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 18 }} disabled={pending} onClick={save}>
        <Check size={16} /> {pending ? 'Saving…' : 'Save profile'}
      </button>
    </div>
  )
}
