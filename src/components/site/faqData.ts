// Single source of truth for the homepage FAQ.
// Rendered visibly as an accordion (landingMarkup) AND emitted as FAQPage
// JSON-LD (app/(public)/page.tsx) so answer engines — Google AI Overviews,
// ChatGPT, Perplexity — can lift the answers directly. Keep answers
// "answer-first": a tight, quotable opening sentence, then context.
export type FaqItem = { q: string; a: string }

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Is online therapy effective?',
    a: 'Yes — for most common concerns like anxiety, depression, stress and burnout, online therapy is as effective as in-person care, backed by extensive clinical research. At getCalmly every session is with a licensed professional over secure video, and your therapist tracks your progress between sessions using your mood data and journal.',
  },
  {
    q: 'What is an RCI-verified therapist or NMC-registered psychiatrist?',
    a: 'RCI (Rehabilitation Council of India) is the statutory body that licenses clinical psychologists in India; NMC (National Medical Commission) registers medical doctors, including psychiatrists. Every getCalmly therapist holds a valid RCI registration and every psychiatrist is NMC-registered — verified credentials, not just good reviews.',
  },
  {
    q: 'Is the first session really free?',
    a: 'Yes. Your first session is completely free, with no card and no commitment required. It is a real conversation with a matched clinician so you can see if the fit feels right before deciding to continue.',
  },
  {
    q: 'How does getCalmly match me with the right expert?',
    a: 'You start with a short, confidential assessment — around twelve gentle questions with no login needed. getCalmly uses your answers to match you with a therapist or psychiatrist suited to your concerns, preferences and goals, so you are not left guessing who to book.',
  },
  {
    q: 'Are my sessions and data confidential?',
    a: 'Completely. Your sessions, journal entries and mood data are private and encrypted, and are never shared without your consent. getCalmly is built privacy-first and aligned with India’s Digital Personal Data Protection (DPDP) Act.',
  },
  {
    q: 'How much does it cost after the free first session?',
    a: 'After your free first session, ongoing sessions are paid per session with transparent pricing and no forced subscription — you can see current rates on the pricing page. Daily mood tracking, journaling, AI insights and the community are included at no extra cost.',
  },
  {
    q: 'Can getCalmly help in a crisis?',
    a: 'getCalmly offers ongoing support and built-in crisis resources, but it is not an emergency service. If you or someone you know is in immediate danger, please contact your local emergency number or a crisis helpline right away. For non-emergency hard moments, Calm AI and daily check-ins are available day or night.',
  },
]

// Pre-rendered HTML fragment for the landing markup (which is a template
// string injected via dangerouslySetInnerHTML). Uses the .faq-* classes in
// landing.css and the toggleFaq handler in landingScript.
export const FAQ_MARKUP = `
<!-- ── FAQ ── -->
<section class="faq-section" id="faq">
  <div class="faq-head">
    <div class="sec-label reveal">Questions, answered</div>
    <h2 class="sec-h2 reveal">Everything you<br><span>might be wondering.</span></h2>
    <p class="sec-p reveal">The things people ask us most — about therapy, credentials, privacy and cost. Still unsure? Your first session is free, so you can simply try.</p>
  </div>
  <div class="faq-list reveal d1">
    ${FAQ_ITEMS.map(
      (it, i) => `
    <div class="faq-item${i === 0 ? ' open' : ''}">
      <button class="faq-q" type="button" onclick="toggleFaq(this)" aria-expanded="${i === 0 ? 'true' : 'false'}">
        <span>${it.q}</span>
        <span class="faq-ic" aria-hidden="true"></span>
      </button>
      <div class="faq-a"><p>${it.a}</p></div>
    </div>`,
    ).join('')}
  </div>
</section>
`
