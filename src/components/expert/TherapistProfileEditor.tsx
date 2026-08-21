'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Check, Trash2, X } from 'lucide-react'
import { updateTherapistProfile } from '@/app/(dashboard)/expert/actions'
import { useToast } from '@/components/ui/Toast'
import { fileToAvatarDataUrl } from '@/lib/clientImage'
import { IN_STATES } from '@/lib/inStates'
import { COUNTRIES, hasStateList } from '@/lib/countries'

const MAX_PHOTO_BYTES = 2_000_000

type Props = {
  name: string
  bio: string
  gender: string | null
  qualifications: string[]
  languages: string[]
  specializations: string[]
  photoUrl: string | null
  phone: string | null
  dateOfBirth: string | null // yyyy-mm-dd
  country: string
  state: string | null
  city: string | null
  addressLine1: string | null
  addressLine2: string | null
  postalCode: string | null
  emergencyName: string | null
  emergencyPhone: string | null
  emergencyRelation: string | null
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
  const [phone, setPhone] = useState(props.phone ?? '')
  const [dob, setDob] = useState(props.dateOfBirth ?? '')
  const [country, setCountry] = useState(props.country || 'IN')
  const [state, setState] = useState(props.state ?? '')
  const [city, setCity] = useState(props.city ?? '')
  const [addr1, setAddr1] = useState(props.addressLine1 ?? '')
  const [addr2, setAddr2] = useState(props.addressLine2 ?? '')
  const [pin, setPin] = useState(props.postalCode ?? '')
  const [emName, setEmName] = useState(props.emergencyName ?? '')
  const [emPhone, setEmPhone] = useState(props.emergencyPhone ?? '')
  const [emRel, setEmRel] = useState(props.emergencyRelation ?? '')
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
      const res = await updateTherapistProfile({
        name, bio, gender, qualifications, languages, specializations, photo,
        phone, dateOfBirth: dob || null, country, state, city,
        addressLine1: addr1, addressLine2: addr2, postalCode: pin,
        emergencyName: emName, emergencyPhone: emPhone, emergencyRelation: emRel,
      })
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
            <button type="button" onClick={() => setPhoto(null)} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--c-coral-d)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}>
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
        <div>
          <label className="field-label">Phone</label>
          <input className="field-input" value={phone} maxLength={20} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" />
        </div>
        <div>
          <label className="field-label">Date of birth</label>
          <input className="field-input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
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

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--c-line)' }}>
        <div className="field-label" style={{ fontSize: 12.5, marginBottom: 10 }}>ADDRESS</div>
        <div style={{ marginBottom: 12 }}>
          <label className="field-label">Address line 1</label>
          <input className="field-input" value={addr1} maxLength={120} onChange={(e) => setAddr1(e.target.value)} placeholder="Flat / house no., building, street" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label className="field-label">Address line 2</label>
          <input className="field-input" value={addr2} maxLength={120} onChange={(e) => setAddr2(e.target.value)} placeholder="Area, landmark (optional)" />
        </div>
        <div className="field-grid">
          <div>
            <label className="field-label">Country</label>
            <select className="field-select" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">{hasStateList(country) ? 'State' : 'State / province'}</label>
            <input
              className="field-input"
              value={state}
              maxLength={60}
              onChange={(e) => setState(e.target.value)}
              placeholder={hasStateList(country) ? 'e.g. Karnataka' : 'e.g. Dubai'}
              list={hasStateList(country) ? 'in-states-expert' : undefined}
            />
            <datalist id="in-states-expert">
              {IN_STATES.map((st) => <option key={st} value={st} />)}
            </datalist>
          </div>
          <div>
            <label className="field-label">City</label>
            <input className="field-input" value={city} maxLength={60} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Bengaluru" />
          </div>
          <div>
            <label className="field-label">{hasStateList(country) ? 'PIN code' : 'Postal code'}</label>
            <input className="field-input" value={pin} maxLength={16} onChange={(e) => setPin(e.target.value)} placeholder={hasStateList(country) ? 'e.g. 560001' : 'Postal code'} />
          </div>
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

      <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>
        Verification, employment type, registration number and fees are managed by the admin team.
        Your address and emergency contact are visible only to the admin team.
      </p>

      <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={pending} onClick={save}>
        <Check size={16} /> {pending ? 'Saving…' : 'Save profile'}
      </button>
    </div>
  )
}
