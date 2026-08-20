/**
 * A public-site FAQ: a collapsed accordion plus the matching FAQPage JSON-LD.
 *
 * Both halves come from one array, so the answers a search engine sees are
 * always the answers on the page — the usual failure mode with hand-written
 * structured data is the two drifting apart.
 *
 * Built on <details>, so it opens without JavaScript and the answers are in the
 * HTML for crawlers rather than behind a click handler.
 *
 * Only emit ONE of these per page: FAQPage is a page-level type, and two blocks
 * on the same URL is invalid structured data.
 */
export type FaqItem = { q: string; a: string }

const charcoal = '#1C2B3A'
// The darker coral cut — brand coral fails AA at this text size on cream.
const coralInk = '#A8432D'

export function FaqSection({
  eyebrow = 'Questions',
  heading,
  items,
  background = '#FFFCFA',
}: {
  eyebrow?: string
  heading: string
  items: FaqItem[]
  background?: string
}) {
  if (items.length === 0) return null
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <section style={{ background }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p className="sec-label" style={{ justifyContent: 'center' }}>{eyebrow}</p>
          <h2
            className="sec-h2"
            style={{ textAlign: 'center', marginBottom: 36 }}
          >
            {heading}
          </h2>
          <div>
            {items.map((f) => (
              <details key={f.q} className="svc-faq-item">
                <summary style={{ color: charcoal }}>
                  <span>{f.q}</span>
                  <span className="svc-faq-ic" aria-hidden="true" style={{ color: coralInk }} />
                </summary>
                <p className="svc-faq-a">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
