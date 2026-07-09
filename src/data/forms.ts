// The clinical forms library. Templates live in code (one source of truth) and
// are upserted into the DB on demand (lib/forms.ts), so the library is always
// present without a separate seed step. Each form's `fields` is an ordered list
// the patient fills in; new forms need no schema change.

export type FormFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'tel' | 'email'

export type FormField = {
  key: string
  label: string
  type: FormFieldType
  options?: string[]
  required?: boolean
  help?: string
}

export type FormTemplateSeed = {
  slug: string
  title: string
  description: string
  kind: 'INTAKE' | 'CONSENT' | 'INFO' | 'FEEDBACK'
  category?: 'INDIVIDUAL' | 'COUPLE' | 'KIDS'
  autoSend?: boolean
  fields: FormField[]
}

const CONTACT_FIELDS: FormField[] = [
  { key: 'fullName', label: 'Full name', type: 'text', required: true },
  { key: 'dob', label: 'Date of birth', type: 'date' },
  { key: 'phone', label: 'Contact number', type: 'tel' },
  { key: 'emergencyName', label: 'Emergency contact name', type: 'text' },
  { key: 'emergencyPhone', label: 'Emergency contact number', type: 'tel' },
]

export const FORM_TEMPLATES: FormTemplateSeed[] = [
  // ── Auto-sent intake forms (one per care category) ──────────────────────────
  {
    slug: 'intake-individual',
    title: 'Individual intake & information form',
    description: 'A few details before your first session so your therapist can prepare.',
    kind: 'INTAKE',
    category: 'INDIVIDUAL',
    autoSend: true,
    fields: [
      ...CONTACT_FIELDS,
      { key: 'mainConcern', label: 'What brings you in right now?', type: 'textarea', required: true },
      { key: 'duration', label: 'How long has this been going on?', type: 'text' },
      {
        key: 'priorTherapy',
        label: 'Have you been in therapy before?',
        type: 'select',
        options: ['No', 'Yes, currently', 'Yes, in the past'],
      },
      { key: 'medications', label: 'Any current medications?', type: 'textarea' },
      { key: 'goals', label: 'What would you like to get out of therapy?', type: 'textarea' },
    ],
  },
  {
    slug: 'intake-couple',
    title: 'Couples intake & information form',
    description: 'Some context about your relationship before your first session together.',
    kind: 'INTAKE',
    category: 'COUPLE',
    autoSend: true,
    fields: [
      ...CONTACT_FIELDS,
      { key: 'partnerName', label: "Partner's name", type: 'text', required: true },
      { key: 'relationshipLength', label: 'How long have you been together?', type: 'text' },
      { key: 'mainConcern', label: 'What would you like to work on as a couple?', type: 'textarea', required: true },
      {
        key: 'priorCounselling',
        label: 'Have you tried couples counselling before?',
        type: 'select',
        options: ['No', 'Yes'],
      },
      { key: 'goals', label: 'What does a good outcome look like for you both?', type: 'textarea' },
    ],
  },
  {
    slug: 'intake-kids',
    title: 'Child & adolescent intake form',
    description: "Details about your child so the clinician can prepare for the first session.",
    kind: 'INTAKE',
    category: 'KIDS',
    autoSend: true,
    fields: [
      { key: 'childName', label: "Child's full name", type: 'text', required: true },
      { key: 'childDob', label: "Child's date of birth", type: 'date' },
      { key: 'guardianName', label: 'Parent / guardian name', type: 'text', required: true },
      { key: 'phone', label: 'Contact number', type: 'tel' },
      { key: 'school', label: 'School & grade', type: 'text' },
      { key: 'mainConcern', label: 'What are your main concerns about your child?', type: 'textarea', required: true },
      {
        key: 'diagnosed',
        label: 'Has your child been diagnosed with anything before?',
        type: 'select',
        options: ['No', 'Yes'],
      },
      { key: 'goals', label: 'What would you like help with?', type: 'textarea' },
    ],
  },
  // ── On-demand library forms ─────────────────────────────────────────────────
  {
    slug: 'consent-treatment',
    title: 'Informed consent for treatment',
    description: 'Please read and acknowledge before we begin care.',
    kind: 'CONSENT',
    fields: [
      {
        key: 'consentTreatment',
        label: 'I consent to receive mental-health care through getCalmly.',
        type: 'checkbox',
        required: true,
      },
      {
        key: 'consentConfidentiality',
        label:
          'I understand confidentiality and its limits (risk of harm to self or others, legal requirements).',
        type: 'checkbox',
        required: true,
      },
      {
        key: 'consentTelehealth',
        label: 'I consent to receiving care over secure video / telehealth.',
        type: 'checkbox',
        required: true,
      },
      { key: 'signature', label: 'Type your full name as signature', type: 'text', required: true },
    ],
  },
  {
    slug: 'consent-data',
    title: 'Data & privacy consent',
    description: 'How your data is used, under the DPDP Act 2023.',
    kind: 'CONSENT',
    fields: [
      {
        key: 'dataRetention',
        label: 'I consent to getCalmly storing my health records securely.',
        type: 'checkbox',
        required: true,
      },
      {
        key: 'aiSharing',
        label: 'I consent to de-identified data being used to improve AI support (optional).',
        type: 'checkbox',
      },
      { key: 'signature', label: 'Type your full name as signature', type: 'text', required: true },
    ],
  },
  {
    slug: 'history-medical',
    title: 'Medical & psychiatric history',
    description: 'Background that helps your clinician give safe, personalised care.',
    kind: 'INFO',
    fields: [
      { key: 'conditions', label: 'Any ongoing medical conditions?', type: 'textarea' },
      { key: 'medications', label: 'Current medications & supplements', type: 'textarea' },
      { key: 'allergies', label: 'Known allergies', type: 'text' },
      { key: 'psychHistory', label: 'Past psychiatric history (diagnoses, hospitalisations)', type: 'textarea' },
      { key: 'familyHistory', label: 'Relevant family history', type: 'textarea' },
      {
        key: 'substances',
        label: 'Alcohol / tobacco / other substance use',
        type: 'select',
        options: ['None', 'Occasional', 'Regular', 'Prefer not to say'],
      },
    ],
  },
  {
    slug: 'feedback-session',
    title: 'Session feedback',
    description: 'A quick check-in on how your sessions are going.',
    kind: 'FEEDBACK',
    fields: [
      {
        key: 'helpful',
        label: 'How helpful have your sessions been so far?',
        type: 'select',
        options: ['Very helpful', 'Somewhat helpful', 'Neutral', 'Not very helpful'],
        required: true,
      },
      { key: 'whatWorking', label: "What's working well?", type: 'textarea' },
      { key: 'whatChange', label: "What would you like to be different?", type: 'textarea' },
    ],
  },
]

/** The auto-send intake template slug for a given care category. */
export function intakeSlugForCategory(category: 'INDIVIDUAL' | 'COUPLE' | 'KIDS'): string {
  return { INDIVIDUAL: 'intake-individual', COUPLE: 'intake-couple', KIDS: 'intake-kids' }[category]
}
