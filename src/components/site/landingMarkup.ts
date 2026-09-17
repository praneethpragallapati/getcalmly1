// Faithful section markup ported from getcalmly-landing-v2.html (nav, footer,
// therapists, enterprise & modal removed; CTAs routed to /assess).
export const LANDING_MARKUP = `<!-- ── HERO ── -->
<section class="hero" id="home">
  <div class="hero-media"></div>
  <div class="hero-veil"></div>
  <div class="hero-layout">

    <!-- LEFT: headline + CTA -->
    <div class="hero-left">
      <div class="hero-pill"><span class="pill-dot"></span>First session from ₹799</div>
      <h1 class="hero-h1">
        <span class="rl"><span class="light">You don't have to carry</span></span>
        <span class="hero-rot-line"><span class="hero-rot-word" id="heroRot">the mask you wear at work.</span></span>
      </h1>
      <p class="hero-sub">Talk to RCI-verified therapists and psychiatrists, matched to what you need — with a context-aware mental health AI that remembers your story from your very first session.</p>
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

  </div>
  <div class="scroll-cue"><div class="sc-line"></div>Scroll</div>
</section>

<!-- ── HOW IT WORKS ── -->
<section class="hiw-section" id="how-it-works">
  <div class="hiw-head">
    <div class="sec-label reveal">How it works</div>
    <h2 class="sec-h2 reveal">Four steps to<br><span>feeling like you again.</span></h2>
  </div>
  <!-- Step photos live in public/hiw/step-1..4.jpg (square, ~1200px). Until a
       file exists a tinted placeholder shows. -->
  <div class="hiw-grid">
    <div class="hiw-step reveal"><div class="hiw-media" style="--img:url('/hiw/step-1.jpg')"></div><span class="hiw-n">1</span><h3>Find the right match</h3><p class="hiw-lead">Start with a better understanding of what you need.</p><p>Tell us about yourself, what you&apos;re going through and what you&apos;re looking for. Your assessment helps us understand your needs and preferences, so you can find a therapist who feels right for you.</p></div>
    <div class="hiw-step reveal d1"><div class="hiw-media" style="--img:url('/hiw/step-2.jpg')"></div><span class="hiw-n">2</span><h3>Meet regularly with your therapist</h3><p class="hiw-lead">Build a relationship that grows with you.</p><p>Have private, one-on-one sessions with your therapist and work together on what matters to you. As they get to know you over time, your care becomes more personal and meaningful.</p></div>
    <div class="hiw-step reveal d2"><div class="hiw-media" style="--img:url('/hiw/step-3.jpg');background-position:center top"></div><span class="hiw-n">3</span><h3>Stay supported between sessions</h3><p class="hiw-lead">Because life doesn&apos;t wait for your next session.</p><p>getCalmly learns from your journey, from the things you share to the patterns that emerge over time. This helps you get support that feels relevant to what you are going through, even when your therapist isn&apos;t around.</p></div>
    <div class="hiw-step reveal d3"><div class="hiw-media" style="--img:url('/hiw/step-4.jpg')"></div><span class="hiw-n">4</span><h3>Find your calm</h3><p class="hiw-lead">Understand yourself better. Feel better equipped for what comes next.</p><p>With the right therapist and support that stays with you between sessions, build healthier ways to manage what life brings your way and move towards feeling more like yourself.</p></div>
  </div>
</section>

<!-- ── CARE YOU CAN TRUST ── -->
<section class="trust-section" id="features">
  <div class="tr-head">
    <div class="sec-label reveal">Why getCalmly</div>
    <h2 class="sec-h2 reveal">Care you <span>can trust.</span></h2>
  </div>

  <div class="tr-row1">
    <div class="tr-card a reveal">
      <span class="tr-num">01</span>
      <div class="tr-card-head">
        <span class="tr-ic g"><svg viewBox="0 0 24 24" fill="none" stroke="#276B4B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="16.6" cy="9.5" r="2.1"/><path d="M15.2 20a4.6 4.6 0 0 1 5.8-4.2"/></svg></span>
        <h3 class="tr-title">Qualified professionals</h3>
      </div>
      <p class="tr-lead">RCI &amp; NMC verified. Vetted through extensive checks.</p>
      <p class="tr-body">Our psychologists and psychiatrists go through an extensive verification and vetting process before joining getCalmly. Your care is always centred around qualified professionals who take the time to understand you.</p>
      <div class="tr-creds">
        <div class="tr-cred"><span class="tr-cred-ic n"><svg viewBox="0 0 24 24" fill="none" stroke="#5A6A7A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5A2.2 2.2 0 0 0 7.3 7.2 2.2 2.2 0 0 0 6 11a2.3 2.3 0 0 0 1 4.2A2 2 0 0 0 11 15V6.3A1.3 1.3 0 0 0 9.5 5Z"/><path d="M14.5 5A2.2 2.2 0 0 1 16.7 7.2 2.2 2.2 0 0 1 18 11a2.3 2.3 0 0 1-1 4.2A2 2 0 0 1 13 15"/></svg></span><span class="tr-cred-tx"><b>RCI</b><small>Registered Clinical Psychologist</small></span></div>
        <div class="tr-cred"><span class="tr-cred-ic n"><svg viewBox="0 0 24 24" fill="none" stroke="#5A6A7A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v4.5a4 4 0 0 0 8 0V3"/><path d="M10 15.2V16a5 5 0 0 0 5 5 4 4 0 0 0 4-4v-1.2"/><circle cx="19" cy="12.5" r="2.1"/></svg></span><span class="tr-cred-tx"><b>NMC</b><small>Registered Psychiatrist</small></span></div>
      </div>
    </div>

    <div class="tr-card b reveal d1">
      <span class="tr-num">02</span>
      <div class="tr-card-head">
        <span class="tr-ic s"><svg viewBox="0 0 24 24" fill="none" stroke="#2E3E50" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.4v5.1c0 4.4-3 7.8-7 9.5-4-1.7-7-5.1-7-9.5V5.4L12 3Z"/><rect x="9.5" y="11" width="5" height="4" rx="1"/><path d="M10.4 11V9.8a1.6 1.6 0 0 1 3.2 0V11"/></svg></span>
        <h3 class="tr-title">Private &amp; confidential</h3>
      </div>
      <p class="tr-lead">Your thoughts are yours. Your data should be too.</p>
      <p class="tr-body">Your conversations and personal information are deeply personal. getCalmly uses strong data security and privacy practices to protect your information and give you a safe space to seek support.</p>
      <div class="tr-badges">
        <div class="tr-badge"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><span>End-to-end<br>encryption</span></div>
        <div class="tr-badge"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><line x1="7.5" y1="7.5" x2="7.6" y2="7.5"/><line x1="7.5" y1="16.5" x2="7.6" y2="16.5"/></svg><span>Secure<br>infrastructure</span></div>
        <div class="tr-badge"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.4v5.1c0 4.4-3 7.8-7 9.5-4-1.7-7-5.1-7-9.5V5.4L12 3Z"/><polyline points="9,12 11,14 15,10"/></svg><span>Strict access<br>controls</span></div>
        <div class="tr-badge"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7Z"/><line x1="9.5" y1="12" x2="14.5" y2="12"/><line x1="9.5" y1="15.5" x2="13.5" y2="15.5"/></svg><span>GDPR<br>compliant</span></div>
      </div>
    </div>
  </div>

  <div class="tr-card c">
    <span class="tr-num c">03</span>
    <div class="tr-c-grid">
      <div class="tr-c-text">
        <div class="tr-card-head">
          <span class="tr-ic c"><svg viewBox="0 0 24 24" fill="none" stroke="#C8553D" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 4A2.4 2.4 0 0 0 7.1 6.4 2.4 2.4 0 0 0 5.6 11a2.5 2.5 0 0 0 1 4.6A2.2 2.2 0 0 0 11 15.5V5.4A1.4 1.4 0 0 0 9.5 4Z"/><path d="M14.5 4A2.4 2.4 0 0 1 16.9 6.4 2.4 2.4 0 0 1 18.4 11a2.5 2.5 0 0 1-1 4.6A2.2 2.2 0 0 1 13 15.5"/></svg></span>
          <h3 class="tr-title">Intelligent support</h3>
        </div>
        <p class="tr-lead">It remembers the context, not just the conversation.</p>
        <p class="tr-body">getCalmly connects the information you choose to share across conversations, reflections and your care journey. It can identify patterns, spot changes over time and bring together insights that help deliver more relevant support when your therapist isn&apos;t around.</p>
      </div>

      <div class="ai-diagram">
        <svg class="ai-lines" viewBox="0 0 680 360" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="#E3A692" stroke-width="1.4" stroke-dasharray="2 6" stroke-linecap="round"><path d="M186 66 C 252 66 250 180 302 180"/><path d="M186 123 C 252 123 262 180 302 180"/><path d="M186 180 L 302 180"/><path d="M186 237 C 252 237 262 180 302 180"/><path d="M186 294 C 252 294 250 180 302 180"/><path d="M356 180 C 398 180 400 150 432 150"/><path d="M356 180 C 398 180 400 210 432 210"/></g></svg>
        <div class="ai-chips">
          <span class="ai-chip"><svg viewBox="0 0 24 24" fill="none" stroke="#5A6A7A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5h16v9H8l-4 3.5V5.5Z"/></svg>Conversations</span>
          <span class="ai-chip"><svg viewBox="0 0 24 24" fill="none" stroke="#5A6A7A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4C11 5 6 10 5 19c6-1 12-4 14-11"/><path d="M8.5 15.5c2-2.2 5-3.4 8-3.9"/></svg>Reflections</span>
          <span class="ai-chip"><svg viewBox="0 0 24 24" fill="none" stroke="#5A6A7A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M7.4 16.6L6 18"/></svg>Mood &amp; wellbeing</span>
          <span class="ai-chip"><svg viewBox="0 0 24 24" fill="none" stroke="#5A6A7A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"/><line x1="4" y1="9.5" x2="20" y2="9.5"/><line x1="8" y1="3" x2="8" y2="6"/><line x1="16" y1="3" x2="16" y2="6"/></svg>Life events</span>
          <span class="ai-chip"><svg viewBox="0 0 24 24" fill="none" stroke="#5A6A7A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1.2" fill="#5A6A7A" stroke="none"/></svg>Goals</span>
        </div>
        <div class="ai-core"><span class="ai-brain"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 4A2.4 2.4 0 0 0 7.1 6.4 2.4 2.4 0 0 0 5.6 11a2.5 2.5 0 0 0 1 4.6A2.2 2.2 0 0 0 11 15.5V5.4A1.4 1.4 0 0 0 9.5 4Z"/><path d="M14.5 4A2.4 2.4 0 0 1 16.9 6.4 2.4 2.4 0 0 1 18.4 11a2.5 2.5 0 0 1-1 4.6A2.2 2.2 0 0 1 13 15.5"/></svg></span></div>
        <div class="ai-benefits">
          <div class="ai-ben-h">Deeper context.<br>More relevant support.</div>
          <div class="ai-ben"><span class="ai-ck">✓</span>Spotting patterns</div>
          <div class="ai-ben"><span class="ai-ck">✓</span>Connecting the dots</div>
          <div class="ai-ben"><span class="ai-ck">✓</span>Personalised insights</div>
          <div class="ai-ben"><span class="ai-ck">✓</span>Timely support</div>
        </div>
      </div>
    </div>
  </div>

</section>

<!-- ── OUR CLINICIANS ── -->
<section class="clin-section" id="clinicians">
  <div class="clin-head">
    <div class="sec-label reveal">Our clinicians</div>
    <h2 class="sec-h2 reveal">Meet the people<br><span>behind your care.</span></h2>
    <p class="sec-p reveal">Talk to RCI-verified therapists and NMC-registered psychiatrists, matched to what you need. Stay supported between sessions with Calm AI that remembers your story from the start.</p>
  </div>
  <div class="clin-grid reveal">
    <div class="clin-card">
      <div class="clin-photo" style="--img:url('/team/riya.jpg')" role="img" aria-label="Dr Riya Lokesh"></div>
      <div class="clin-body">
        <h3 class="clin-name">Dr Riya Lokesh</h3>
        <p class="clin-role">Chief Clinical Psychologist · Co-founder, getCalmly</p>
        <div class="clin-creds">
          <span class="clin-cred">Ph.D. in Clinical Psychology</span>
          <span class="clin-cred">RCI-registered</span>
        </div>
        <div class="clin-tags">
          <span class="clin-tag">Individual Therapy</span>
          <span class="clin-tag">Couples</span>
          <span class="clin-tag">Children &amp; Teens</span>
          <span class="clin-tag">Depression</span>
          <span class="clin-tag">Anxiety</span>
          <span class="clin-tag">Sleep</span>
        </div>
      </div>
    </div>
    <div class="clin-more">
      <span class="clin-more-plus">+</span>
      <span class="clin-more-t">&amp; many more</span>
    </div>
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
<section class="app-section" style="background:radial-gradient(ellipse 60% 55% at 90% 6%,rgba(200,85,61,.28),transparent 55%),radial-gradient(ellipse 45% 50% at 4% 65%,rgba(200,85,61,.12),transparent 60%),#141E29;padding:72px max(6%, calc((100% - 1360px) / 2)) 64px;overflow:hidden;">
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
          <img src="/mockups/patient-home-1.png" alt="The getCalmly app home screen" loading="lazy" style="display:block;width:100%;height:100%;object-fit:cover;object-position:top center;" />
        </div>
      </div>
    </div>
  </div>
</section>
`;
