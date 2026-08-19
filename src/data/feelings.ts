// Preset "how I'm feeling" options. Kept in a data module (no server imports) so
// client components can render the picker without pulling server-only code.
export const FEELING_PRESETS: string[] = [
  '😌 Calm',
  '🙂 Doing okay',
  '😊 Good',
  '💪 Motivated',
  '🌱 Healing',
  '😐 Meh',
  '😔 Low',
  '😰 Anxious',
  '😴 Drained',
  '🤯 Overwhelmed',
  '😤 Frustrated',
  '🙏 Grateful',
]

export const MAX_FEELING = 40
