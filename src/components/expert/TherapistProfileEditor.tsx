'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Check, Trash2, X } from 'lucide-react'
import { updateTherapistProfile } from '@/app/(dashboard)/expert/actions'
import { useToast } from '@/components/ui/Toast'
import { fileToAvatarDataUrl } from '@/lib/clientImage'

const MAX_PHOTO_BYTES = 2_000_000

type Props = {
  name: string
  bio: string
  gender: string | null
  qualifications: string[]
  languages: string[]
  specializations: string[]
  photoUrl: string | null
  onClose: () => void
}

/**
 * A clinician editing their own profile — the fields patients and the team see.
 * Verification, employment, RCI number and fees are admin-managed and not shown
 * here; email never changes.
 */
export function TherapistProfileEditor(props: Props) {
  const router = useRouter()
  const toast = useToast()
  const [pending, start] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(props.name)
  const [bio, setBio] = useState(props.bio)
  const [gender, setGender] = useState(props.gender ?? '')
  const [qualifications, setQualifications] = useState(props.qualifications.join(', '))
  const [languages, setLanguages] = useState(props.languages.join(', '))
  const [specializations, setSpecializations] = useState(props.specializations.join(', '))
  const [photo, setPhoto] = useState<string | null | undefined>(undefined)
  const shownPhoto = photo === undefined ? props.photoUrl : photo
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file.')
    if (file.size > MAX_PHOTO_BYTES) return toast.error('Image is too large — keep it under 2 MB.')
    try {
      // Downscale in-browser: a full-res data URL trips the Server Action body limit.
      setPhoto(await fileToAvatarDataUrl(file))
    } catch {
      toast.error('Could not read that image. Try a different one.')
    }
  }

  function save() {
    if (!name.trim()) return toast.error('Please enter your name.')
    start(async () => {
      const res = await updateTherapistProfile({ name, bio, gender, qualifications, languages, specializations, photo })
      if (res.ok) {
        toast.success('Profile updated')
        props.onClose()
        router.refresh()
      } else {
        toast.error(res.error ?? 'Could not save your profile.')
      }
    })
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-title">Edit profile</div>
        <button type="button" className="btn btn-outline btn-sm" onClick={props.onClose}><X size={14} /> Cancel</button>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
        <div className="avatar-edit">
          {shownPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownPhoto} alt="" className="avatar-edit-img" />
          ) : (
            <span className="avatar-edit-img" style={{ background: 'radial-gradient(circle at 30% 30%, #E8896F, #C8553D)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 26 }}>
              {initials}
            </span>
          )}
          <button type="button" className="avatar-edit-btn" aria-label="Change photo" onClick={() => fileRef.current?.click()}>
            <Camera size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label className="field-label">Full name</label>
          <input className="field-input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          {shownPhoto && (
            <button type="button" onClick={() => setPhoto(null)} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--c-coral)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}>
              <Trash2 size={13} /> Remove photo
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="field-label">About / bio</label>
        <textarea className="field-textarea" value={bio} maxLength={2000} onChange={(e) => setBio(e.target.value)} placeholder="How you work, your approach, who you help…" />
      </div>

      <div className="field-grid" style={{ marginTop: 16 }}>
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
          <label className="field-label">Languages <span style={{ fontWeight: 500, color: 'var(--c-gray)' }}>(comma-separated)</span></label>
          <input className="field-input" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Hindi, Tamil" />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="field-label">Qualifications <span style={{ fontWeight: 500, color: 'var(--c-gray)' }}>(comma-separated)</span></label>
        <input className="field-input" value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="M.Phil Clinical Psychology, M.A. Psychology" />
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="field-label">Specializations <span style={{ fontWeight: 500, color: 'var(--c-gray)' }}>(comma-separated)</span></label>
        <input className="field-input" value={specializations} onChange={(e) => setSpecializations(e.target.value)} placeholder="Anxiety, Depression, Trauma" />
      </div>

      <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>
        Verification, employment type, registration number and fees are managed by the admin team.
      </p>

      <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={pending} onClick={save}>
        <Check size={16} /> {pending ? 'Saving…' : 'Save profile'}
      </button>
    </div>
  )
}
