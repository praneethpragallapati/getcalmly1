/**
 * The intelligence layer: turns a series of scores into a clinically grounded
 * verdict, using the thresholds from the CHO Outcome-Measurement spec. This is
 * deliberately rule-based and versioned (no model), so every verdict is
 * explainable and auditable.
 */
import { INSTRUMENTS, bandFor, who5Percent, type BandTone } from './instruments'

// Re-exported so consumers can pull the tone type from here alongside verdicts.
export type { BandTone } from './instruments'

/** Rules version, stamped on derived verdicts for provenance. */
export const CLASSIFIER_VERSION = 'rules-1'

export type ResponseClass =
  | 'success' // dropped below the clinical cutoff / into wellbeing
  | 'reliable' // a reliable, clinically meaningful improvement
  | 'slow' // improving, but under the reliable-change threshold
  | 'none' // essentially unchanged across several measurements
  | 'deterioration' // a meaningful worsening
  | 'baseline' // only one measurement so far
  | 'insufficient' // no measurements

export type OutcomePoint = { score: number; recordedAt: string; source: string }

export type OutcomeVerdict = {
  instrumentId: string
  cls: ResponseClass
  label: string
  tone: BandTone
  current: number | null
  baseline: number | null
  /** current minus baseline, in raw points (sign per the raw scale). */
  deltaPoints: number | null
  /** For display: WHO-5 percentage etc.; null when not a percentage measure. */
  currentPercent: number | null
  /** Plain-language sentence for the patient. No jargon, no em dashes. */
  narrative: string
  /** Current severity band label, if any. */
  bandLabel: string | null
  count: number
}

const TONE: Record<ResponseClass, BandTone> = {
  success: 'good',
  reliable: 'good',
  slow: 'mild',
  none: 'warn',
  deterioration: 'bad',
  baseline: 'mild',
  insufficient: 'warn',
}

const LABEL: Record<ResponseClass, string> = {
  success: 'Recovered',
  reliable: 'Reliable improvement',
  slow: 'Slow progress',
  none: 'No change yet',
  deterioration: 'Needs attention',
  baseline: 'Baseline recorded',
  insufficient: 'Not measured yet',
}

/**
 * Classify a chronological (oldest→newest) series for one instrument.
 * `series` must already be sorted by recordedAt ascending.
 */
export function classify(instrumentId: string, series: OutcomePoint[]): OutcomeVerdict {
  const inst = INSTRUMENTS[instrumentId]
  const count = series.length
  const base = {
    instrumentId,
    current: null as number | null,
    baseline: null as number | null,
    deltaPoints: null as number | null,
    currentPercent: null as number | null,
    bandLabel: null as string | null,
    count,
  }
  if (!inst || count === 0) {
    return { ...base, cls: 'insufficient', label: LABEL.insufficient, tone: TONE.insufficient, narrative: 'No measurements recorded yet.' }
  }

  const current = series[count - 1].score
  const baseline = series[0].score
  const band = bandFor(instrumentId, current)
  const bandLabel = band?.label ?? null
  const pct = instrumentId === 'WHO5' ? who5Percent(current) : null

  // CGI is a direct improvement rating, not a trajectory.
  if (instrumentId === 'CGI') {
    const cls: ResponseClass = current <= 2 ? 'reliable' : current <= 4 ? 'slow' : 'deterioration'
    return {
      ...base, current, baseline, deltaPoints: current - baseline, bandLabel,
      cls, label: LABEL[cls], tone: TONE[cls],
      narrative:
        current <= 2 ? 'Your therapist rates your treatment as improving.'
        : current <= 4 ? 'Your therapist suggests reviewing the approach together.'
        : 'Your therapist has flagged this for a closer clinical review.',
    }
  }

  if (count === 1) {
    return {
      ...base, current, baseline, deltaPoints: 0, currentPercent: pct, bandLabel,
      cls: 'baseline', label: LABEL.baseline, tone: TONE.baseline,
      narrative: `Baseline recorded${bandLabel ? ` (${bandLabel})` : ''}. Your next check will start the trend.`,
    }
  }

  const higher = inst.direction === 'higher_better'
  // "Improvement" is positive regardless of scale direction.
  const improvement = higher ? current - baseline : baseline - current
  const worsening = -improvement
  const rc = inst.reliableChange ?? 6
  const deltaPoints = current - baseline

  // Success / recovery.
  const recovered = higher
    ? inst.clinicalCutoff != null && current >= inst.clinicalCutoff
    : inst.remissionBelow != null && current < inst.remissionBelow

  // Flatness across 4+ measurements = no response.
  const flat = count >= 4 && Math.abs(improvement) < rc

  let cls: ResponseClass
  if (worsening >= rc) cls = 'deterioration'
  else if (recovered) cls = 'success'
  else if (improvement >= rc) cls = 'reliable'
  else if (flat) cls = 'none'
  else if (improvement > 0) cls = 'slow'
  else cls = 'none'

  return {
    ...base, current, baseline, deltaPoints, currentPercent: pct, bandLabel,
    cls, label: LABEL[cls], tone: TONE[cls],
    narrative: narrate(instrumentId, cls, baseline, current, pct),
  }
}

function narrate(id: string, cls: ResponseClass, baseline: number, current: number, pct: number | null): string {
  const inst = INSTRUMENTS[id]
  const name = inst?.short.replace(/\s*\(.*\)/, '').toLowerCase() ?? 'score'
  const fromTo =
    id === 'WHO5' && pct != null
      ? `from ${who5Percent(baseline)}% to ${pct}%`
      : `from ${baseline} to ${current}`
  switch (cls) {
    case 'success':
      return `Your ${name} has moved into the healthy range (${fromTo}). That is real recovery.`
    case 'reliable':
      return `Your ${name} shows a reliable improvement (${fromTo}). This is a meaningful change, not noise.`
    case 'slow':
      return `Your ${name} is moving in the right direction (${fromTo}), a little at a time.`
    case 'none':
      return `Your ${name} has held steady (${fromTo}). Worth talking through with your therapist.`
    case 'deterioration':
      return `Your ${name} has risen (${fromTo}). Your care team can help you work through this.`
    default:
      return `Latest ${name}: ${current}.`
  }
}

// ── Mood action tiers (daily 1-10 mood) ──────────────────────────────────────

export type MoodTier = { tier: 'stable' | 'mild' | 'moderate' | 'severe'; label: string; tone: BandTone; action: string }

export function moodTier(mood: number): MoodTier {
  if (mood >= 8) return { tier: 'stable', label: 'Good / stable', tone: 'good', action: 'Keep self-monitoring.' }
  if (mood >= 5) return { tier: 'mild', label: 'Mild', tone: 'mild', action: 'Self-help strategies can help.' }
  if (mood >= 3) return { tier: 'moderate', label: 'Moderate', tone: 'warn', action: 'Consider scheduling a session.' }
  return { tier: 'severe', label: 'Severe', tone: 'bad', action: 'Urgent support is recommended.' }
}

// ── C-SSRS risk tiers ────────────────────────────────────────────────────────

export type RiskTier = 'none' | 'low' | 'moderate' | 'high'

export function riskTier(cssrs: number): { tier: RiskTier; label: string; tone: BandTone } {
  if (cssrs >= 4) return { tier: 'high', label: 'High risk', tone: 'bad' }
  if (cssrs === 3) return { tier: 'moderate', label: 'Moderate risk', tone: 'warn' }
  if (cssrs >= 1) return { tier: 'low', label: 'Low risk', tone: 'warn' }
  return { tier: 'none', label: 'No current ideation', tone: 'good' }
}
