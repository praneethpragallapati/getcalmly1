/**
 * Canonical track vocabulary shared across the platform. `track` slugs on
 * PatientProfile map to human labels here; PatientProfile.trackLabel overrides
 * when set. TRACK_FALLBACKS are the track-appropriate daily suggestions used only
 * when a patient has zero personal history (ported from the daily-patterns notebook).
 */
export const TRACK_LABELS: Record<string, string> = {
  anxiety: 'Anxiety and Overthinking',
  depression: 'Depression and Low Mood',
  stress_burnout: 'Stress and Burnout',
  trauma_grief: 'Trauma and Grief',
  ocd: 'OCD and Intrusive Thoughts',
  sleep: 'Sleep and Rest',
  relationships: 'Relationships',
  psychotic_disorders: 'Psychotic Disorders',
  geriatric: 'Geriatric Mental Health',
  medical_psychology: 'Health and Medical Psychology',
  impulse_control: 'Impulse Control',
  anger_management: 'Anger Management',
  pregnancy_postpartum: 'Pregnancy and Postpartum',
  parenting_stress: 'Parenting Stress',
  lgbtqia_gender: 'LGBTQIA+ and Gender',
  pre_adoption: 'Pre-Adoption Support',
}

export const TRACK_FALLBACKS: Record<string, string> = {
  anxiety: 'Try 2 minutes of box breathing — inhale for 4, hold for 4, exhale for 4, hold for 4.',
  depression:
    'Do one small behavioural activation step — water a plant, step outside briefly, text someone.',
  stress_burnout:
    "Set one hard boundary today — a stop time, a task you won't take on, a message you won't send.",
  trauma_grief: 'Ground yourself with 5-4-3-2-1 — name five things you can see right now.',
  ocd: 'Sit with one small uncertainty today without checking or seeking reassurance.',
  sleep: 'Keep your fixed rise time today no matter how last night went.',
  relationships:
    'Write one sentence about what you need from your relationship today — just for yourself.',
  psychotic_disorders: "Run through your daily routine anchor — is today's structure in place?",
  geriatric: 'Do one thing today that gives you a sense of purpose or connection.',
  medical_psychology: 'Use the pacing rule — stop an activity at 80% energy, not at exhaustion.',
  impulse_control: 'If an urge comes today, try the 10-minute wait before acting on it.',
  anger_management:
    'When tension rises, pause and name the feeling underneath the anger before responding.',
  pregnancy_postpartum:
    'Carve out ten minutes that belong only to you today — even a short walk counts.',
  parenting_stress: "Today, let 'fed, safe, and loved' be enough. That is genuinely enough.",
  lgbtqia_gender:
    "Spend a little time today in a space — or with a person — where you don't have to translate yourself.",
  pre_adoption: 'Revisit one moment from your preparation that reminded you why you chose this path.',
}

const GENERIC_FALLBACK = 'Try two minutes of slow, deep breathing before your next task.'

export function trackLabelFor(slug: string | undefined, override?: string | null): string {
  if (override) return override
  if (!slug) return 'Wellbeing'
  return TRACK_LABELS[slug] ?? slug
}

export function trackFallback(track: string | undefined, subTrack?: string | null): string {
  if (subTrack && TRACK_FALLBACKS[subTrack]) return TRACK_FALLBACKS[subTrack]
  if (track && TRACK_FALLBACKS[track]) return TRACK_FALLBACKS[track]
  return GENERIC_FALLBACK
}
