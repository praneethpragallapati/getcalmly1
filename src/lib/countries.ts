// Countries for the profile "Country" field, as ISO 3166-1 alpha-2 codes paired
// with display names. Client-safe (no imports).
//
// getCalmly is India-first, so India leads the list and is the stored default;
// the rest follow alphabetically. Codes are stored, names are only for display —
// renaming a country here never invalidates an existing record.

export type Country = { code: string; name: string }

/** India first (the default), then the rest alphabetically by name. */
export const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'CN', name: 'China' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EG', name: 'Egypt' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RU', name: 'Russia' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TR', name: 'Türkiye' },
  { code: 'UG', name: 'Uganda' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ZW', name: 'Zimbabwe' },
]

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c.name]))

/** The display name for a stored code, falling back to the code itself. */
export function countryName(code: string | null | undefined): string {
  if (!code) return ''
  return BY_CODE.get(code.toUpperCase()) ?? code
}

/** Keep only a code we actually offer; anything else falls back to India. */
export function normalizeCountry(code: string | null | undefined): string {
  const c = (code ?? '').trim().toUpperCase()
  return BY_CODE.has(c) ? c : 'IN'
}

/** States/UTs only make sense as a picklist for India. */
export function hasStateList(code: string | null | undefined): boolean {
  return normalizeCountry(code) === 'IN'
}
