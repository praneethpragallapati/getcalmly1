import type { FaqItem } from '@/components/site/FaqSection'

/**
 * The questions people actually ask before booking, answered plainly.
 *
 * Kept in one file so the wording stays consistent across the pages that use
 * them, and so it's obvious at a glance which page answers what — a question
 * should live on the page where someone is asking it, not be repeated on three.
 * (Each URL gets exactly one FAQPage block; duplicating a question across pages
 * also splits which one search engines choose to show.)
 */

/** Pricing objections — asked at the point of paying. */
export const PRICING_FAQ: FaqItem[] = [
  {
    q: 'How much does therapy cost on getCalmly?',
    a: 'Your first session is a flat ₹799, whichever kind of care you start with. After that you choose a session pack, and the more sessions in the pack, the lower the price per session. Psychiatry consultations and couples sessions are priced separately — the current rates are on this page.',
  },
  {
    q: 'What if I stop part-way through a pack?',
    a: 'You only pay for the sessions you actually used. Stop whenever you like and we work out a fair refund on the rest — no cancellation window to catch, no questions, no fine print.',
  },
  {
    q: 'What if I don’t click with my therapist?',
    a: 'Tell us and we will match you with someone else, at no extra cost. It is a normal thing to happen and it is not a failure on your part — fit matters more than almost anything else in therapy.',
  },
  {
    q: 'Are there any hidden charges?',
    a: 'No. The price you see is the price you pay, and the Calm+ app — mood tracking, journaling and Calm AI — is included with every plan rather than sold as an add-on.',
  },
  {
    q: 'Can I claim this on insurance?',
    a: 'Most Indian health insurance policies do not yet cover outpatient therapy, though a few corporate plans do. We can give you an itemised invoice with our registration details to submit if your policy or employer reimburses.',
  },
  {
    q: 'Do I have to commit to a pack?',
    a: 'No. You can take the ₹799 first session on its own and decide afterwards. Packs exist because most people come for more than one session and it works out cheaper, not because you have to.',
  },
]

/** What people ask before they trust the platform at all. */
export const HOME_FAQ: FaqItem[] = [
  {
    q: 'Is online therapy as effective as meeting in person?',
    a: 'For most common concerns — anxiety, depression, stress, sleep, relationship difficulty — the research finds online therapy works about as well as in-person. What matters far more is the fit with your therapist and turning up regularly.',
  },
  {
    q: 'Who are the therapists on getCalmly?',
    a: 'Clinical psychologists registered with the RCI and psychiatrists registered with the NMC. We verify every registration before anyone sees a patient — no life coaches, no unlicensed counsellors.',
  },
  {
    q: 'Is what I say confidential?',
    a: 'Yes. Your sessions and notes are private between you and your clinician, and the platform is built to India’s DPDP Act. The only exceptions are the ones every clinician works under: a serious risk to your life or someone else’s, or a court order.',
  },
  {
    q: 'How does the AI work, and can it read my sessions?',
    a: 'Calm AI works from what you choose to log — your mood check-ins and journal entries — to spot patterns and prepare a brief for your clinician. It is a companion between sessions, never a replacement for one, and it never joins or transcribes your calls.',
  },
  {
    q: 'How quickly can I get a session?',
    a: 'Usually within a few days. Take the free assessment, and we match you with a clinician whose availability, language and specialism fit — then you pick a slot from their live calendar.',
  },
  {
    q: 'What if I am in crisis right now?',
    a: 'Please do not wait for a booking. Tele-MANAS is free and open 24/7 on 14416, and AASRA is on +91 98204 66726. Our crisis resources page lists more, and every page of the app has a helpline button.',
  },
]

/** Choosing between kinds of care. */
export const SERVICES_FAQ: FaqItem[] = [
  {
    q: 'What is the difference between a therapist and a psychiatrist?',
    a: 'A clinical psychologist works with you through talking therapy and cannot prescribe medication. A psychiatrist is a medical doctor who can prescribe and manage medication. Plenty of people see both, and on getCalmly the two share context so you are not repeating yourself.',
  },
  {
    q: 'Which service should I start with?',
    a: 'If you are not sure, take the free assessment — twelve questions, no login — and we will point you to the right kind of care. Most people start with individual therapy, and you can move between services later without starting over.',
  },
  {
    q: 'Do you offer therapy in languages other than English?',
    a: 'Yes. Our clinicians between them work in Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali and more, and the assessment asks which language you would rather think and talk in so we can match you accordingly.',
  },
  {
    q: 'Can I get therapy for my child or teenager?',
    a: 'Yes — our child and adolescent specialists work with children, teenagers and their parents. A parent or guardian sets up the account, gives consent, and stays involved in the way the clinician recommends for that age.',
  },
  {
    q: 'Do you provide medication delivery?',
    a: 'If your psychiatrist prescribes medication, you can order it through the app and have it delivered, and track adherence alongside your mood so both you and your clinician can see how it is going.',
  },
]
