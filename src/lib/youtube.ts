// Parse a YouTube URL or bare id into the canonical 11-char video id, and derive
// thumbnail / embed / watch URLs from it. Accepts watch?v=, youtu.be/, /embed/,
// /shorts/ and a raw id. Returns null when nothing usable is found.
export function parseYouTubeId(input: string): string | null {
  const s = (input || '').trim()
  if (!s) return null
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const url = new URL(s.includes('://') ? s : `https://${s}`)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1, 12)
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com')) {
      const v = url.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const m = url.pathname.match(/\/(embed|shorts|v)\/([A-Za-z0-9_-]{11})/)
      if (m) return m[2]
    }
  } catch {
    // not a URL; fall through
  }
  const loose = s.match(/[A-Za-z0-9_-]{11}/)
  return loose ? loose[0] : null
}

export const youTubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
export const youTubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`
export const youTubeWatch = (id: string) => `https://www.youtube.com/watch?v=${id}`
