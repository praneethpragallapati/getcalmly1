/**
 * Labelled clinician documents.
 *
 * Documents are stored as data URLs in the existing `documentUrls` string
 * arrays. The kind travels in the URL fragment (`#doc=registration&name=…`),
 * which a data URL ignores for its content, so older unlabelled entries and
 * links keep working and no schema change is needed. Client-safe (no imports).
 */

export const DOC_KINDS = [
  { kind: 'identity', label: 'Proof of identity', hint: 'Aadhaar, passport, PAN or driving licence' },
  { kind: 'registration', label: 'Proof of registration', hint: 'Your RCI or NMC registration certificate' },
  { kind: 'cv', label: 'CV', hint: 'Your latest CV or résumé' },
] as const

export type DocKind = (typeof DOC_KINDS)[number]['kind']

export const DOC_MAX_BYTES = 2_500_000
export const DOC_ACCEPT = '.pdf,.jpg,.jpeg,.png,.doc,.docx'

export function labelDoc(dataUrl: string, kind: DocKind, fileName: string): string {
  const base = dataUrl.split('#')[0]
  return `${base}#doc=${kind}&name=${encodeURIComponent(fileName.slice(0, 120))}`
}

export type ReadDoc = { href: string; kind: DocKind | null; label: string; fileName: string }

/** Split a stored document into what to link, what to call it and what to save it as. */
export function readDoc(url: string, index = 0): ReadDoc {
  const [href, frag = ''] = url.split('#')
  const params = new URLSearchParams(frag)
  const kind = (DOC_KINDS.find((d) => d.kind === params.get('doc'))?.kind ?? null) as DocKind | null
  const label = kind ? DOC_KINDS.find((d) => d.kind === kind)!.label : `Attachment ${index + 1}`
  const fileName = params.get('name') || `${label.replace(/\s+/g, '-').toLowerCase()}`
  return { href, kind, label, fileName }
}
