# "How it works" step images

Shipped:
- step-1.png — realistic phone mockup: free assessment with sample questions
- step-2.jpg — photo: young woman waving on a video call (Pexels, free license)
- step-3.png — realistic phone mockup: "Calm AI" insight module + mood trend
- step-4.jpg — photo: calm, content woman at home who "found her peace" (Pexels)

Steps 1 & 3 are device mockups rendered from HTML (source in the session
scratchpad: mock1.html / mock3.html) via headless Chromium at 1200x750. To
regenerate with different copy, edit that HTML and re-screenshot, or swap in
AI-generated versions once Bloom image credits are available. Steps 2 & 4 are
free-license Pexels photos cropped to 16:10 (~1200x750). The card pulls each
via the --img CSS var in landingMarkup.ts.
