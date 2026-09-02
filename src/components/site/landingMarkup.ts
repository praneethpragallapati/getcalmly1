// Faithful section markup ported from getcalmly-landing-v2.html (nav, footer,
// therapists, enterprise & modal removed; CTAs routed to /assess).
export const LANDING_MARKUP = `<!-- ── HERO ── -->
<section class="hero" id="home">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="hero-layout">

    <!-- LEFT: headline + CTA -->
    <div class="hero-left">
      <div class="hero-pill"><span class="pill-dot"></span>First session from ₹799</div>
      <h1 class="hero-h1">
        <span class="rl"><span class="light">You don't have to carry</span></span>
        <span class="hero-rot-line"><span class="hero-rot-word" id="heroRot">the mask you wear at work.</span></span>
      </h1>
      <p class="hero-sub">getCalmly matches you with the right therapist or psychiatrist, understands your patterns with a context-aware mental health AI, and stays with you from your very first session.</p>
      <div class="hero-beats">
        <div class="hero-beat"><span class="hb-ic" style="background:#C8553D">◑</span><span class="hb-tx"><b>Matched to you</b>The right expert, not just anyone.</span></div>
        <div class="hero-beat"><span class="hb-ic" style="background:#C9973A">✦</span><span class="hb-tx"><b>AI that learns you</b>Private, context-aware insight.</span></div>
        <div class="hero-beat"><span class="hb-ic" style="background:#3D9E72">♡</span><span class="hb-tx"><b>Never alone</b>A community that gets it.</span></div>
      </div>
      <div class="hero-actions">
        <a href="/assess" class="btn-hero fill">✦ Take the free assessment</a>
        <a href="#how-it-works" class="btn-hero outline">How it works</a>
      </div>
      <div class="hero-trust">
        <span class="ht">Free, confidential assessment</span>
        <span class="ht">RCI &amp; NMC-verified clinicians</span>
        <span class="ht">Care from home, in-app</span>
      </div>
    </div>

    <!-- RIGHT: phone mockup -->
    <div class="hero-phone">
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="ps-statusbar">
            <span>9:41</span>
            <span>●●●</span>
          </div>
          <div class="ps-header">
            <div class="ps-greeting">Good morning</div>
            <span class="ps-name">welcome back</span>
          </div>
          <div class="ps-body">
            <div class="ps-card">
              <div class="ps-badge">AI Insight · just now</div>
              <div class="gc-cyc-track">
                <div class="gc-cyc-item">
                  <div class="ps-card-title">Mondays tend to weigh on you, and that's okay.</div>
                  <div class="ps-card-sub">A 5-min breathing exercise before your first call may help. Tap to try it.</div>
                </div>
                <div class="gc-cyc-item">
                  <div class="ps-card-title">Your sleep improved 3 nights running.</div>
                  <div class="ps-card-sub">Mood tends to follow your rest, keep protecting that wind-down hour.</div>
                </div>
                <div class="gc-cyc-item">
                  <div class="ps-card-title">You journaled 4 days straight. That's a streak.</div>
                  <div class="ps-card-sub">Less self-criticism this week than last. Want to see the pattern?</div>
                </div>
              </div>
            </div>
            <div class="ps-card">
              <div class="ps-badge">Today's session</div>
              <div class="ps-card-title">Dr. Riya Lokesh · 3:00 PM</div>
              <div class="ps-card-sub">Clinical Psychologist · Secure video</div>
            </div>
            <div class="ps-card">
              <div class="ps-badge">Your week so far</div>
              <div class="ps-metrics">
                <div class="ps-m"><span class="ps-mn" style="color:var(--coral-l);">7</span><span class="ps-ml">Day streak <svg width="13" height="13" viewBox="0 0 24 24" fill="#E8896F" style="vertical-align:middle;display:inline-block"><polygon points="13,3 6,13 11,13 10,21 18,10 13,10"/></svg></span></div>
                <div class="ps-m"><span class="ps-mn" style="color:#7FD4A8;">↑12%</span><span class="ps-ml">Mood trend</span></div>
                <div class="ps-m"><span class="ps-mn" style="color:#B8B4D4;">14</span><span class="ps-ml">Journals</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Floating badges -->
      <div class="phone-float float-1">
        <div class="float-dot" style="background:var(--green);"></div>
        Dr. Riya Lokesh is online
      </div>
      <div class="phone-float float-2">
        <div class="float-dot" style="background:var(--coral);"></div>
        Mood improved 12% this week
      </div>
    </div>

  </div>
  <div class="scroll-cue"><div class="sc-line"></div>Scroll</div>
</section>

<!-- ── HOW IT WORKS ── -->
<section class="hiw-section" id="how-it-works">
  <div class="hiw-head">
    <div class="sec-label reveal">How it works</div>
    <h2 class="sec-h2 reveal">Four steps to<br><span>feeling like you again.</span></h2>
    <p class="sec-p reveal">No endless browsing. We match you, you book, and your care stays with you from the very first session.</p>
  </div>
  <div class="hiw-grid">
    <div class="hiw-step reveal"><div class="hiw-line"></div><span class="hiw-n">1</span><h3>Take the free assessment</h3><p>A few honest questions about how things have been. In five minutes, get a clearer sense of the support that may fit.</p><span class="hiw-tag">Free · 5 min</span></div>
    <div class="hiw-step reveal d1"><div class="hiw-line"></div><span class="hiw-n">2</span><h3>Meet your match, book your session</h3><p>We pair you with a verified clinician suited to your needs. Choose a time and book your first session from ₹799.</p><span class="hiw-tag">First session from ₹799</span></div>
    <div class="hiw-step reveal d2"><div class="hiw-line"></div><span class="hiw-n">3</span><h3>The intelligence between your sessions</h3><p>Calm AI finds patterns in your journey, spots emerging shifts in how you feel, and offers timely, personalised support when your clinician isn&apos;t there.</p><span class="hiw-tag">Context-aware AI</span></div>
    <div class="hiw-step reveal d3"><span class="hiw-n">4</span><h3>See how far you&apos;ve come</h3><p>Your mood, journals and care insights come together over time, revealing patterns and progress you can track week by week.</p><span class="hiw-tag">Measurable progress</span></div>
  </div>
</section>

<!-- ── FEATURES ── -->
<section class="features-section" id="features">
  <div class="feat-header">
    <div>
      <div class="sec-label reveal">One connected system</div>
      <h2 class="sec-h2 reveal">Your therapist and your AI<br><span>share the same brain.</span></h2>
      <p class="sec-p reveal" style="margin-top:14px;">Your sessions, your mood and your journal all feed one shared context. So the AI at 3 AM and your therapist on Thursday work from the same picture of you, and it only gets sharper the longer you stay.</p>
    </div>
  </div>
  <div class="feat-grid">
    <div class="feat-card dk reveal"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E8896F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="8"/><circle cx="12" cy="4.3" r="1.1" fill="#E8896F" stroke="none"/><rect x="6.5" y="8" width="11" height="9" rx="3"/><line x1="9.7" y1="11.8" x2="9.7" y2="13.4"/><line x1="14.3" y1="11.8" x2="14.3" y2="13.4"/><line x1="4" y1="11.5" x2="4" y2="13.5" opacity=".6"/><line x1="20" y1="11.5" x2="20" y2="13.5" opacity=".6"/></svg></span><div class="feat-t">The world's first context-aware AI companion</div><div class="feat-d">It doesn't push. But when you message at midnight, it already knows your last sessions, your mood dip that week, your journal. No other platform does this. That's what turns a chat into something useful.</div><span class="feat-badge fb-dk">World's first</span></div>
    <div class="feat-card reveal d1"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,16 9,11 13,14 20,6"/><circle cx="20" cy="6" r="1.6" fill="#C8553D" stroke="none"/><line x1="4" y1="20" x2="20" y2="20" opacity=".4"/></svg></span><div class="feat-t">Mood, energy and sleep, tracked together</div><div class="feat-d">You won't spot your own patterns. We will. Mood, energy and sleep tracked daily, the connections surfaced weekly, for you and for your therapist.</div><span class="feat-badge fb-c">Science-backed</span></div>
    <div class="feat-card reveal d2"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><line x1="8" y1="9" x2="14" y2="9"/><line x1="8" y1="13" x2="13" y2="13"/></svg></span><div class="feat-t">A journal that reads between the lines</div><div class="feat-d">Write whatever comes. getCalmly reads for the themes underneath, the self-criticism, the boundaries, the quiet wins. You choose what your therapist sees, and switch off anything you'd rather keep to yourself.</div><span class="feat-badge fb-c">You're in control</span></div>
    <div class="feat-card reveal"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.5v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10v-5L12 3Z"/><polyline points="9,12 11,14 15,10"/></svg></span><div class="feat-t">Real experts, verified for real</div><div class="feat-d">Every psychologist is RCI-verified and every psychiatrist NMC-verified, checked by us before they ever meet you. Credentials we confirm ourselves, not five stars a stranger left online.</div><span class="feat-badge fb-g">Verified, not vibes</span></div>
    <div class="feat-card reveal d1"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20S4 15 4 9.5C4 6.5 6.5 5 9 6.2 10.2 6.8 11.6 8 12 8s1.8-1.2 3-1.8C17.5 5 20 6.5 20 9.5 20 15 12 20 12 20Z"/><line x1="12" y1="10.4" x2="12" y2="14"/><line x1="10.2" y1="12.2" x2="13.8" y2="12.2"/></svg></span><div class="feat-t">You'll never outgrow getCalmly</div><div class="feat-d">If talking isn't enough on its own, our own psychiatrists step in for medical support, no starting over, no new waitlist. And if a hard moment ever turns into a real crisis, a built-in safety protocol and a real human step in right away. One place, one history, whatever it takes.</div><span class="feat-badge fb-c">Whatever it takes</span></div>
    <div class="feat-card reveal d2"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.4"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5"/><path d="M15 19c0-1.7.8-3.2 2-4"/></svg></span><div class="feat-t">A community, not a comment section</div><div class="feat-d">Someone typed "I actually laughed today" after three months in the dark. 142 people felt it. Human moderation keeps it safe, and crisis support is built in.</div><span class="feat-badge fb-g">Safe &amp; moderated</span></div>
  </div>
</section>



<!-- ── ASSESSMENT BREAK ── -->
<section class="assess-break">
  <div class="assess-layout">
    <div class="assess-left reveal">
      <div class="sec-label">Start here</div>
      <h2 class="sec-h2">Not sure<br>where to start?<br><span>Let's find out.</span></h2>
      <p class="sec-p">12 carefully crafted questions. A personalised mental wellness plan, therapist matches, and your first steps, ready in 5 minutes.</p>
      <div class="assess-stats">
        <div class="as-stat"><span class="as-n">40K+</span><span class="as-l">People assessed</span></div>
        <div class="as-stat"><span class="as-n">5 min</span><span class="as-l">To complete</span></div>
        <div class="as-stat"><span class="as-n">5 min</span><span class="as-l">To your first match</span></div>
      </div>
    </div>
    <div class="assess-right reveal d2">
      <div class="assess-card">
        <span class="ac-q">In the past two weeks, how often have you found it difficult to stop worrying?</span>
        <div class="quiz-opts">
          <div class="quiz-opt" onclick="selOpt(this)">Not at all</div>
          <div class="quiz-opt sel" onclick="selOpt(this)">Several days</div>
          <div class="quiz-opt" onclick="selOpt(this)">More than half the days</div>
          <div class="quiz-opt" onclick="selOpt(this)">Nearly every day</div>
        </div>
        <a class="assess-big-btn" href="/assess"><span>✦</span> Take the free assessment</a>
        <div class="assess-note">Free &amp; completely confidential · Book a session right after</div>
      </div>
    </div>
  </div>
</section>

<!-- ── TESTIMONIALS ── -->
<section class="testi-section">
  <div class="sec-label reveal">Real people. Real change.</div>
  <h2 class="sec-h2 reveal">Don't take our word for it.<br><span>Take theirs.</span></h2>
  <div class="testi-marquee reveal">
  <div class="t3-grid" id="testi-track">
    <div class="testi-card reveal" style="border-color:rgba(200,85,61,.15);"><div class="stars">★★★★★</div><div class="testi-q">Honestly I expected to do one session and quietly disappear. I didn&apos;t. My therapist actually remembered the small stuff I&apos;d mentioned weeks earlier, so I wasn&apos;t re-explaining my whole life every time. That&apos;s the bit that kept me coming back.</div><div class="testi-auth"><div class="testi-av">S</div><div><div class="testi-nm">Sana R., 28</div><div class="testi-dt">Software engineer · 4 months in</div></div></div></div>
    <div class="testi-card reveal d1"><div class="stars">★★★★★</div><div class="testi-q">Wasn&apos;t sure therapy over an app could feel like anything real. First couple of sessions were a bit awkward, not gonna lie. By the third I was saying things out loud I&apos;d never told anyone. Still a work in progress, but I&apos;m in a much better place than I was in January.</div><div class="testi-auth"><div class="testi-av" style="background:var(--green-pale);color:var(--green);">K</div><div><div class="testi-nm">Karan M., 34</div><div class="testi-dt">Finance · 7 months in</div></div></div></div>
    <div class="testi-card reveal d2"><div class="stars">★★★★★</div><div class="testi-q">It&apos;s not a magic fix. I still have off days. But it did help me spot a pattern I&apos;d never noticed. My Sundays were quietly wrecking my whole week. Sounds like a small thing. Honestly, just naming it made it manageable.</div><div class="testi-auth"><div class="testi-av" style="background:#EEF0FB;color:#7B7FCC;">A</div><div><div class="testi-nm">Aditya S., 26</div><div class="testi-dt">Design student · 2 months in</div></div></div></div>
    <div class="testi-card reveal d3"><div class="stars">★★★★★</div><div class="testi-q">I&apos;d been &ldquo;fine&rdquo; for everyone for years. This was the first time in ages someone just let me not be. No script, no rushing me. I cried in the first session and left lighter. If you&apos;re on the fence, just try it.</div><div class="testi-auth"><div class="testi-av" style="background:var(--coral-pale);color:var(--coral);">N</div><div><div class="testi-nm">Neha T., 31</div><div class="testi-dt">Teacher · 5 months in</div></div></div></div>
  </div>
  </div>
</section>

<!-- ── APP ── -->
<section class="app-section" style="background:radial-gradient(ellipse 60% 55% at 90% 6%,rgba(200,85,61,.28),transparent 55%),radial-gradient(ellipse 45% 50% at 4% 65%,rgba(200,85,61,.12),transparent 60%),#141E29;padding:96px 6% 80px;overflow:hidden;">
  <div class="app-grid" style="display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;">
    <div>
      <div class="sec-label" style="color:#1FB6A8;">The getCalmly app</div>
      <h2 class="sec-h2" style="color:#fff;margin-bottom:16px;">Your care,<br><span style="color:var(--coral-l);">in your pocket.</span></h2>
      <p style="font-size:16px;color:rgba(255,255,255,.66);line-height:1.7;margin-bottom:22px;font-weight:300;">Your care really comes alive in the app. Check in each day, talk to Calm whenever you need to, journal, and join sessions, all in one calm place. Because it is right there with you, so reminders and nudges land exactly when they help.</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:26px;">
        <div style="display:flex;gap:10px;align-items:center;"><span style="color:#1FB6A8;font-weight:800;">✓</span><span style="font-size:14px;color:rgba(255,255,255,.78);">Daily check-ins that take seconds</span></div>
        <div style="display:flex;gap:10px;align-items:center;"><span style="color:#1FB6A8;font-weight:800;">✓</span><span style="font-size:14px;color:rgba(255,255,255,.78);">Calm AI a tap away, day or night</span></div>
        <div style="display:flex;gap:10px;align-items:center;"><span style="color:#1FB6A8;font-weight:800;">✓</span><span style="font-size:14px;color:rgba(255,255,255,.78);">Timely, personalised nudges that keep you going</span></div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.16);border-radius:12px;padding:10px 18px;"><span style="font-size:18px;"></span><div style="line-height:1.1;"><div style="font-size:9px;color:rgba(255,255,255,.5);">Coming soon to</div><div style="font-size:14px;color:#fff;font-weight:700;">App Store</div></div></div>
        <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.16);border-radius:12px;padding:10px 18px;"><span style="font-size:16px;">▶</span><div style="line-height:1.1;"><div style="font-size:9px;color:rgba(255,255,255,.5);">Coming soon to</div><div style="font-size:14px;color:#fff;font-weight:700;">Google Play</div></div></div>
      </div>
    </div>
    <div style="display:flex;justify-content:center;">
      <div style="width:270px;background:#0F1C28;border-radius:44px;padding:10px;border:1.5px solid rgba(255,255,255,.12);box-shadow:0 30px 60px rgba(0,0,0,.4);">
        <div style="width:250px;height:541px;border-radius:36px;overflow:hidden;background:#FFF8F5;">
          <img src="/mockups/patient-home-1.png" alt="The GetCalmly app home screen" loading="lazy" style="display:block;width:100%;height:100%;object-fit:cover;object-position:top center;" />
        </div>
      </div>
    </div>
  </div>
</section>
`;
