/**
 * Company identity: contact details, registered address, socials, helplines.
 *
 * WHY THESE ARE CONSTANTS AND NOT ENVIRONMENT VARIABLES
 * -----------------------------------------------------
 * Environment variables are for two things: secrets, and values that differ
 * between dev, preview and production. Nothing below is either. The support
 * email is the same in every environment and is printed on the public website,
 * so putting it in the environment would buy no secrecy — it would only move
 * the value somewhere with no diff, no review and no rollback, and add a way to
 * ship a live site with a placeholder phone number on it.
 *
 * `siteUrl` is the one genuine exception: it really does differ per deployment,
 * so it really does come from the environment.
 *
 * WHAT THIS FIXES
 * ---------------
 * These values used to be typed directly into ~15 files, and had drifted:
 *
 *   - THREE different postal addresses were live at once — "11th A Cross,
 *     Classic Layout" in the footer and the SEO payload, "11th A Main, Classic
 *     Paradise Layout" on the contact and about pages, and a third short form on
 *     therapist earnings statements, which are financial documents.
 *   - TWO different Instagram handles — the SEO payload advertised
 *     instagram.com/getcalmly while the about page linked instagram.com/get.calmly.
 *   - FOUR crisis-helpline lists with different numbers on them, depending on
 *     which page you happened to be on.
 *
 * One definition each, so they cannot drift again.
 */

// ── Site ─────────────────────────────────────────────────────────────────────

/**
 * The public origin of THIS deployment. Genuinely per-environment — production,
 * a preview branch and localhost are three different origins — so this one is
 * read from the environment, unlike everything else in this file.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

// ── Names ────────────────────────────────────────────────────────────────────

/** Product name as written in prose and headings. */
export const brandName = 'getCalmly'

/** Registered entity, for legal text, invoices and structured data. */
export const legalName = 'GetCalmly Private Limited'

// ── Contact ──────────────────────────────────────────────────────────────────

/**
 * Care, billing, privacy and grievance enquiries — the address a member writes
 * to, and the one named as the Data Protection Officer contact. Standardised to
 * the getcalmly.com domain (was a gmail.com address) so every contact point on
 * the site uses one professional inbox.
 */
export const supportEmail = 'connect@getcalmly.com'

/** General, partnership and enterprise enquiries. */
export const contactEmail = 'connect@getcalmly.com'

/** Phone as written for a human. */
export const supportPhone = '+91 88845 18688'

/** The same number as a `tel:` target — digits and a leading + only. */
export const supportPhoneTel = `tel:${supportPhone.replace(/[^\d+]/g, '')}`

/** When the phone line is staffed. */
export const supportHours = 'Mon to Sat, 9:00 AM to 8:00 PM IST'

/** The same hours over two lines, for the contact card. */
export const supportHoursLines: [string, string] = ['Monday to Saturday', '9:00 AM to 8:00 PM IST']

// ── Registered address ───────────────────────────────────────────────────────

/**
 * NOTE: this reconciles the three variants that were live. "11th A Main,
 * Classic Paradise Layout" is used because it had the most agreement (contact
 * page, about page and the earnings statement) over the footer and SEO
 * payload's "11th A Cross, Classic Layout". Worth confirming against the
 * incorporation certificate — it goes on financial documents.
 */
export const address = {
  street: '316, 11th A Main, Classic Paradise Layout',
  area: 'Begur',
  locality: 'Bengaluru',
  region: 'Karnataka',
  postalCode: '560068',
  country: 'India',
  /** ISO 3166-1 alpha-2, for schema.org. */
  countryCode: 'IN',
}

/** Two lines, the shape the footer and contact cards render. */
export const addressLines: [string, string] = [
  `${address.street},`,
  `${address.area}, ${address.locality} ${address.postalCode}, ${address.country}`,
]

/** One line, for invoices and metadata. */
export const addressOneLine =
  `${address.street}, ${address.area}, ${address.locality} ${address.postalCode}, ${address.country}`

/** Street plus area, as schema.org wants `streetAddress`. */
export const streetAddress = `${address.street}, ${address.area}`

// ── Social ───────────────────────────────────────────────────────────────────

/**
 * The handles that are actually ours. The SEO payload previously asserted a
 * different Instagram handle and a LinkedIn company page that nothing else in
 * the codebase links to; a `sameAs` entry pointing at a profile that isn't
 * yours is worse than no entry. Add LinkedIn back here if the page exists.
 */
export const socialLinks: { label: string; url: string }[] = [
  { label: 'Instagram', url: 'https://www.instagram.com/get.calmly' },
  { label: 'YouTube', url: 'https://youtube.com/@getcalmly' },
  { label: 'X (Twitter)', url: 'https://x.com/getCalmly' },
  { label: 'Facebook', url: 'https://www.facebook.com/share/1H2D79NEb3/' },
]

// ── Crisis helplines ─────────────────────────────────────────────────────────

export type Helpline = {
  /** Stable key, so a page can name the ones it shows without copying digits. */
  id: string
  name: string
  /** As printed. */
  number: string
  /** As dialled. */
  tel: string
  hours: string
}

/**
 * Every helpline the product surfaces, in one list. Four different subsets of
 * these were hardcoded in four places, so which numbers a person in crisis saw
 * depended on which page they were on. Nothing here was dropped in the merge.
 *
 * Ordered most-broadly-useful first: the 24/7 national lines come before the
 * business-hours and audience-specific ones.
 */
export const helplines: Helpline[] = [
  { id: 'kiran', name: 'KIRAN (Govt. mental health)', number: '1800-599-0019', tel: '18005990019', hours: '24/7' },
  { id: 'telemanas', name: 'Tele-MANAS (Govt. of India)', number: '14416', tel: '14416', hours: '24/7' },
  { id: 'vandrevala', name: 'Vandrevala Foundation', number: '1860-2662-345', tel: '18602662345', hours: '24/7' },
  { id: 'onelife', name: 'One Life', number: '78930-78930', tel: '+917893078930', hours: '24/7' },
  { id: 'aasra', name: 'AASRA', number: '+91-22-27546669', tel: '+912227546669', hours: '24/7' },
  { id: 'icall', name: 'iCall (TISS)', number: '9152987821', tel: '+919152987821', hours: 'Mon to Sat, 10 AM to 8 PM' },
  { id: 'childline', name: 'CHILDLINE (children)', number: '1098', tel: '1098', hours: '24/7' },
  { id: 'women', name: "Women's Helpline", number: '1091', tel: '1091', hours: '24/7' },
]

const byId = new Map(helplines.map((h) => [h.id, h]))

/**
 * The named helplines, in the order given. Throws on an unknown id rather than
 * silently rendering a shorter list — a crisis panel quietly losing a number is
 * exactly the failure that must not happen quietly.
 */
export function pickHelplines(...ids: string[]): Helpline[] {
  return ids.map((id) => {
    const h = byId.get(id)
    if (!h) throw new Error(`Unknown helpline id: ${id}`)
    return h
  })
}

/** The short list for the dashboard's always-available helpline button. */
export const dashboardHelplines = pickHelplines('kiran', 'icall', 'vandrevala')

/** The pair used in one-line "in crisis?" prompts, where space is tight. */
export const primaryHelplines = pickHelplines('icall', 'onelife')

/**
 * Emergency services for the country this deployment serves. Kept next to the
 * helplines and for the same reason: a placeholder here is a real hazard, so it
 * is a constant with a working value rather than a variable someone can forget.
 */
export const emergencyNumber = '112'
