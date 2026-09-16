# "How it works" step images

Shipped (square, ~1200px, JPEG):
- step-1.jpg — 3 a.m. check-in with the assessment card ("How have you been feeling?")
- step-2.jpg — a session with a matched clinician on video
- step-3.jpg — a workday with the Calm AI dashboard (patterns, suggestion, mood)
- step-4.jpg — finding calm: content, at ease at home

These are the brand story images. The card shows them as a square, full-bleed
top banner that fades into the card (see .hiw-media in landing.css). Per-card
framing is tuned with background-position in landingMarkup.ts (step-3 uses
"center top"). To swap one, replace the .jpg (keep it roughly square) and, if
needed, adjust its background-position and the card copy so text stays in sync.
