// Single source of truth for the homepage FAQ.
// Rendered visibly as an accordion (landingMarkup) AND emitted as FAQPage
// JSON-LD (app/(public)/page.tsx) so answer engines, Google AI Overviews,
// ChatGPT, Perplexity, can lift the answers directly. Keep answers
// "answer-first": a tight, quotable opening sentence, then context.
export type FaqItem = { q: string; a: string }

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Is online therapy effective?',
    a: 'Yes. For most common concerns like anxiety, depression, stress and burnout, online therapy is as effective as in-person care, backed by extensive clinical research. At getCalmly every session is with a licensed professional over secure video, and your therapist tracks your progress between sessions using your mood data and journal.',
  },
  {
    q: 'Are getCalmly’s therapists and psychiatrists qualified?',
    a: 'Yes. Every therapist and psychiatrist on getCalmly is licensed and background-checked before they ever meet you. These are verified professionals, not five stars a stranger left online.',
  },
  {
    q: 'How much is the first session?',
    a: 'Your first session is just ₹999. It is a real conversation with a matched clinician, so you can see whether the fit feels right before you decide to continue.',
  },
  {
    q: 'How does getCalmly match me with the right expert?',
    a: 'You start with a short, confidential assessment of around twelve gentle questions, with no login needed. getCalmly uses your answers to match you with a therapist or psychiatrist suited to your concerns, preferences and goals, so you are not left guessing who to book.',
  },
  {
    q: 'Are my sessions and data confidential?',
    a: 'Completely. Your sessions, journal entries and mood data are private and encrypted, and are never shared without your consent. getCalmly is built privacy-first and aligned with India’s Digital Personal Data Protection (DPDP) Act.',
  },
  {
    q: 'What do I get with getCalmly?',
    a: 'Every plan includes daily mood tracking, smart journaling, AI insights and the moderated community. When you are ready for therapy or psychiatry, your first session is ₹999 and ongoing session details live inside your dashboard.',
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
    <p class="sec-p reveal">The things people ask us most, about therapy, credentials, privacy and cost. Still unsure? Your first session is just ₹999, so you can simply try.</p>
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
