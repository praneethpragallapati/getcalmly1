// Faithful section markup ported from getcalmly-landing-v2.html (nav, footer,
// therapists, enterprise & modal removed; CTAs routed to /assess).
export const LANDING_MARKUP = `<!-- ── HERO ── -->
<section class="hero" id="home">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <div class="hero-layout">

    <!-- LEFT: headline + CTA -->
    <div class="hero-left">
      <div class="hero-pill"><span class="pill-dot"></span>Your first session, just ₹999</div>
      <h1 class="hero-h1">
        <span class="light">You don't have to</span>
        figure this out<br>
        <span class="accent">alone.</span>
      </h1>
      <p class="hero-sub">getCalmly matches you with the right therapist or psychiatrist, understands your patterns with the world's first context-aware mental health AI, and stays with you from your very first session.</p>
      <div class="hero-actions">
        <a href="/assess" class="btn-hero fill">✦ Book your first session</a>
        <a href="#how" class="btn-hero outline">See how it works</a>
      </div>
      <div class="hero-trust">
        <span class="ht">World's-first context-aware AI</span>
        <span class="ht">Licensed, vetted clinicians</span>
        <span class="ht">100% confidential</span>
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
            <span class="ps-name">Priya</span>
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
              <div class="ps-card-title">Dr. Ananya Sharma · 3:00 PM</div>
              <div class="ps-card-sub">Clinical Psychologist · Google Meet</div>
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
        Dr. Ananya is online
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
<section class="how-section" id="how">
  <div class="sec-label reveal">A real journey</div>
  <h2 class="sec-h2 reveal">This is Priya.<br><span>You might know the feeling.</span></h2>
  <p class="sec-p reveal" style="margin-bottom:48px;">For two years, "I'm fine" was her reflex, not her truth. Here is what changed the night she finally stopped saying it.</p>
  <div class="how-layout">
    <div class="how-steps">
      <div class="how-step reveal"><div class="hs-n">01</div><div><div class="hs-t">The night she stopped saying "I'm fine"</div><div class="hs-d">11 PM, thumb hovering over the close button. Twelve honest questions later, no login, no judgement, Priya finally had a name for what she'd been carrying for two years, and a therapist who actually fit.</div></div></div>
      <div class="how-step reveal d1"><div class="hs-n">02</div><div><div class="hs-t">The first session felt like being seen</div><div class="hs-d">Not a stranger reading a script. Dr. Ananya had already read her week before "hello". By the third session, Priya was saying things out loud she'd never told anyone.</div></div></div>
      <div class="how-step reveal d2"><div class="hs-n">03</div><div><div class="hs-t">The same face, every single week</div><div class="hs-d">No re-explaining. No starting over. Her therapist and her whole history stayed with her, so every session picked up exactly where the last one ended.</div></div></div>
      <div class="how-step reveal d3"><div class="hs-n">04</div><div><div class="hs-t">3 AM finally had someone in it</div><div class="hs-d">The hardest nights don't wait for appointments. getCalmly's AI already knew her last session, her mood dip, her journal, so it met her right there, then handed the context straight back to Dr. Ananya.</div></div></div>
      <div class="how-step reveal d3"><div class="hs-n">05</div><div><div class="hs-t">She didn't just feel better. She saw why.</div><div class="hs-d">Sleep steadied. Mood climbed. And for the first time, the pattern was on a screen in front of her, not a weight she carried alone. That's what makes it last.</div></div></div>
    </div>
    <div class="how-visual reveal d1">
      <!-- Therapist match card (no portrait, monogram only) -->
      <div class="how-card" style="padding:0;overflow:hidden;background:transparent;border:none;box-shadow:none;">
        <div class="therapist-match-card">
          <div class="tmc-label">✦ Your match · Based on your assessment</div>
          <div class="tmc-head">
            <div class="tmc-mono">AS</div>
            <div>
              <div class="tmc-badge">Clinical Psychologist</div>
              <div class="tmc-name">Dr. Ananya Sharma</div>
              <div class="tmc-meta">8 years · CBT · Anxiety &amp; Work Stress</div>
            </div>
          </div>
          <div class="tmc-body">
            <div class="tmc-tags">
              <span class="tmc-tag">Anxiety</span>
              <span class="tmc-tag">CBT</span>
              <span class="tmc-tag">Burnout</span>
              <span class="tmc-tag">Relationships</span>
            </div>
            <div class="tmc-footer">
              <div class="tmc-rating">⭐ 4.9 <span>(340 sessions)</span></div>
              <div class="tmc-avail">● Available Thu</div>
            </div>
            <a href="/assess" class="tmc-btn">Book your first session →</a>
          </div>
        </div>
      </div>
      <!-- Journal entry card -->
      <div class="how-card">
        <div class="hc-badge">Priya's journal · Thursday, 8:42 PM</div>
        <div class="hc-title">Today was hard but I didn't spiral. That's new.</div>
        <div class="hc-sub">getCalmly detected 3 themes: <span style="color:var(--coral-l);font-weight:600;">self-compassion · boundary-setting · resilience</span></div>
        <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;">
          <span style="font-size:9px;padding:3px 9px;border-radius:20px;background:rgba(200,85,61,.15);color:var(--coral-l);font-weight:700;">Growth moment ✦</span>
          <span style="font-size:9px;padding:3px 9px;border-radius:20px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.4);font-weight:600;">Shared with Dr. Ananya</span>
        </div>
      </div>
      <!-- Week 8 result card -->
      <div class="how-card">
        <div class="hc-badge">Week 8 · Priya's progress</div>
        <div class="hc-title">Sleep: 3 nights at 7+ hours. Mood up 18%.</div>
        <div class="hc-sub" style="margin-bottom:10px;">Calm AI flagged the pattern before Priya even noticed it herself.</div>
        <div class="hc-metrics">
          <div class="hc-m"><span class="hc-mn" style="color:#7FD4A8;">+18%</span><span class="hc-ml">Mood trend</span></div>
          <div class="hc-m"><span class="hc-mn" style="color:var(--coral-l);">7.5h</span><span class="hc-ml">Avg sleep</span></div>
          <div class="hc-m"><span class="hc-mn" style="color:#B8B4D4;">21</span><span class="hc-ml">Journals</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── FEATURES ── -->
<section class="features-section" id="features">
  <div class="feat-header">
    <div>
      <div class="sec-label reveal">Why no one else can copy this</div>
      <h2 class="sec-h2 reveal">Your therapist and your AI<br><span>share the same brain.</span></h2>
      <p class="sec-p reveal" style="margin-top:14px;">Every other app gives you a chatbot in one corner and a therapist in another, strangers to each other. getCalmly is the world's first platform where your sessions, your mood data and your journal feed a single context, so the AI at 3 AM and the human on Thursday are working from the exact same picture of you. That loop is our moat, and it gets smarter every week you stay.</p>
    </div>
  </div>
  <div class="feat-grid">
    <div class="feat-card dk reveal"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E8896F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="8"/><circle cx="12" cy="4.3" r="1.1" fill="#E8896F" stroke="none"/><rect x="6.5" y="8" width="11" height="9" rx="3"/><line x1="9.7" y1="11.8" x2="9.7" y2="13.4"/><line x1="14.3" y1="11.8" x2="14.3" y2="13.4"/><line x1="4" y1="11.5" x2="4" y2="13.5" opacity=".6"/><line x1="20" y1="11.5" x2="20" y2="13.5" opacity=".6"/></svg></span><div class="feat-t">The world's first context-aware AI companion</div><div class="feat-d">It doesn't push. But when you message at midnight, it already knows your last sessions, your mood dip that week, your journal. No other platform does this. That's what turns a chat into something that actually helps.</div><span class="feat-badge fb-dk">World's first</span></div>
    <div class="feat-card reveal d1"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,16 9,11 13,14 20,6"/><circle cx="20" cy="6" r="1.6" fill="#C8553D" stroke="none"/><line x1="4" y1="20" x2="20" y2="20" opacity=".4"/></svg></span><div class="feat-t">Mood, energy and sleep, tracked together</div><div class="feat-d">You won't spot your own patterns. We will. Mood, energy and sleep tracked daily, the connections surfaced weekly, for you and for your therapist.</div><span class="feat-badge fb-c">Science-backed</span></div>
    <div class="feat-card reveal d2"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><line x1="8" y1="9" x2="14" y2="9"/><line x1="8" y1="13" x2="13" y2="13"/></svg></span><div class="feat-t">A journal that reads between the lines</div><div class="feat-d">Write whatever comes. getCalmly reads for the themes underneath, the self-criticism, the boundaries, the quiet wins, and hands your therapist the brief before every session.</div><span class="feat-badge fb-c">Pattern detection</span></div>
    <div class="feat-card reveal"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.5v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10v-5L12 3Z"/><polyline points="9,12 11,14 15,10"/></svg></span><div class="feat-t">Real experts, verified for real</div><div class="feat-d">Every therapist and psychiatrist on getCalmly is licensed and background-checked before they ever meet you. Credentials we actually verify, not five stars a stranger left online.</div><span class="feat-badge fb-g">Verified, not vibes</span></div>
    <div class="feat-card reveal d1"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20S4 15 4 9.5C4 6.5 6.5 5 9 6.2 10.2 6.8 11.6 8 12 8s1.8-1.2 3-1.8C17.5 5 20 6.5 20 9.5 20 15 12 20 12 20Z"/><line x1="12" y1="10.4" x2="12" y2="14"/><line x1="10.2" y1="12.2" x2="13.8" y2="12.2"/></svg></span><div class="feat-t">You'll never outgrow getCalmly</div><div class="feat-d">If talking isn't enough on its own, you don't start over somewhere new. Our psychiatrists step in for medical support, and a built-in crisis protocol has your back the moment things get serious. One place, one history, whatever it takes.</div><span class="feat-badge fb-c">Whatever it takes</span></div>
    <div class="feat-card reveal d2"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.4"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5"/><path d="M15 19c0-1.7.8-3.2 2-4"/></svg></span><div class="feat-t">A community, not a comment section</div><div class="feat-d">Someone typed "I actually laughed today" after three months in the dark. 142 people felt it. Human moderation keeps it safe, and crisis support is built in.</div><span class="feat-badge fb-g">Safe &amp; moderated</span></div>
  </div>
</section>



<!-- ── DASHBOARD PREVIEW ── -->
<section class="preview-section" id="preview">
  <div class="sec-label reveal">See it in action</div>
  <h2 class="sec-h2 reveal">Built for both sides<br>of the <span>care equation.</span></h2>
  <p class="sec-p reveal" style="margin-bottom:40px;">getCalmly gives patients a calm, intelligent space, and gives therapists the clinical tools they need to deliver better care. See both.</p>

  <div class="preview-tabs reveal">
    <div class="ptab active" onclick="switchTab('patient',this)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5A6A7A" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><circle cx="12" cy="8.5" r="3.2"/><path d="M5.5 19c0-3.2 2.9-5.5 6.5-5.5s6.5 2.3 6.5 5.5"/></svg> Patient view</div>
    <div class="ptab" onclick="switchTab('doctor',this)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5A6A7A" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><circle cx="12" cy="8" r="3"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M12 14v3M10.5 15.5h3"/></svg> Therapist view</div>
  </div>

  <!-- PATIENT PANE -->
  <div class="preview-pane active" id="pane-patient">
    <div class="reveal dash-mock-wrap">
      <span class="dash-swipe-hint">← swipe to explore →</span>
      <!-- Full patient dashboard: sidebar + main content -->
      <div class="dash-mock" style="display:flex;border-radius:20px;overflow:hidden;box-shadow:var(--sh-lg);border:1.5px solid var(--border);background:var(--bg-warm);font-size:12px;">

        <!-- Sidebar -->
        <div style="width:56px;background:var(--charcoal);display:flex;flex-direction:column;align-items:center;padding:16px 0;gap:6px;flex-shrink:0;">
          <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:16px;color:var(--coral);transform:scaleX(.63);transform-origin:center;letter-spacing:-1px;margin-bottom:12px;">C.</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(200,85,61,.2);display:flex;align-items:center;justify-content:center;font-size:15px;" title="Home"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8896F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/><line x1="10.5" y1="19" x2="10.5" y2="14"/><line x1="13.5" y1="19" x2="13.5" y2="14"/></svg></div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:15px;" title="Mood"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><polyline points="4,16 9,11 13,14 20,6"/><line x1="4" y1="20" x2="20" y2="20" opacity=".4"/></svg></div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:15px;" title="Journal"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M6 4h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><line x1="8" y1="9" x2="14" y2="9"/><line x1="8" y1="13" x2="13" y2="13"/></svg></div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:15px;" title="Sessions"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><rect x="4" y="6" width="16" height="14" rx="2.5"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="4" x2="8" y2="7"/><line x1="16" y1="4" x2="16" y2="7"/></svg></div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:15px;" title="Community"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.4"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5"/><path d="M15 19c0-1.7.8-3.2 2-4"/></svg></div>
          <div style="margin-top:auto;width:30px;height:30px;border-radius:50%;background:var(--coral-pale);color:var(--coral);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">P</div>
        </div>

        <!-- Main area -->
        <div style="flex:1;display:flex;flex-direction:column;min-width:0;">

          <!-- Top bar -->
          <div style="background:var(--white);border-bottom:1px solid var(--border);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:10px;color:var(--gray);font-weight:500;">Good morning</div>
              <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:18px;color:var(--charcoal);transform:scaleX(.88);transform-origin:left;letter-spacing:-.5px;">Priya ✦</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="background:var(--coral-pale);color:var(--coral);font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;display:flex;align-items:center;gap:4px;"><span style="width:5px;height:5px;background:var(--coral);border-radius:50%;display:inline-block;"></span>14-day streak <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8553D" style="vertical-align:middle;display:inline-block"><polygon points="13,3 6,13 11,13 10,21 18,10 13,10"/></svg></div>
              <div style="width:28px;height:28px;border-radius:50%;background:var(--coral-pale);color:var(--coral);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">P</div>
            </div>
          </div>

          <!-- Dashboard body -->
          <div style="padding:14px;display:flex;flex-direction:column;gap:10px;overflow:hidden;">

            <!-- Row 1: 3 stat cards -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
              <div style="background:var(--white);border-radius:12px;padding:12px;border:1.5px solid var(--border);">
                <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gray);margin-bottom:5px;">Mood today</div>
                <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:26px;color:var(--coral);transform:scaleX(.8);transform-origin:left;letter-spacing:-1px;line-height:1;">7.2</div>
                <div style="font-size:9px;color:var(--green);font-weight:600;margin-top:3px;">↑ from 5.8</div>
              </div>
              <div style="background:var(--white);border-radius:12px;padding:12px;border:1.5px solid var(--border);">
                <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gray);margin-bottom:5px;">Energy</div>
                <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:26px;color:#7B7FCC;transform:scaleX(.8);transform-origin:left;letter-spacing:-1px;line-height:1;">6.1</div>
                <div style="font-size:9px;color:var(--gray);font-weight:500;margin-top:3px;">→ steady</div>
              </div>
              <div style="background:var(--white);border-radius:12px;padding:12px;border:1.5px solid var(--border);">
                <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gray);margin-bottom:5px;">Sleep</div>
                <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:26px;color:#7FB3A8;transform:scaleX(.8);transform-origin:left;letter-spacing:-1px;line-height:1;">7.5</div>
                <div style="font-size:9px;color:var(--green);font-weight:600;margin-top:3px;">↑ better</div>
              </div>
            </div>

            <!-- Row 2: mood chart + session -->
            <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:8px;">
              <!-- Mood chart -->
              <div style="background:var(--white);border-radius:12px;padding:12px;border:1.5px solid var(--border);">
                <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gray);margin-bottom:10px;">Mood · past 7 days</div>
                <!-- SVG line chart -->
                <svg viewBox="0 0 160 48" style="width:100%;height:48px;overflow:visible;">
                  <defs>
                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#C8553D" stop-opacity=".18"/>
                      <stop offset="100%" stop-color="#C8553D" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <path class="gc-chart-line" d="M0,34 L23,28 L46,38 L69,18 L92,26 L115,8 L138,14" fill="none" stroke="#C8553D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M0,34 L23,28 L46,38 L69,18 L92,26 L115,8 L138,14 L138,48 L0,48Z" fill="url(#mg)"/>
                  <circle cx="138" cy="14" r="3" fill="#C8553D"/>
                  <text x="138" y="10" text-anchor="middle" font-size="7" fill="#C8553D" font-weight="700">7.2</text>
                </svg>
                <div style="display:flex;justify-content:space-between;margin-top:4px;">
                  <span style="font-size:7px;color:var(--gray);">Mon</span><span style="font-size:7px;color:var(--gray);">Tue</span><span style="font-size:7px;color:var(--gray);">Wed</span><span style="font-size:7px;color:var(--gray);">Thu</span><span style="font-size:7px;color:var(--gray);">Fri</span><span style="font-size:7px;color:var(--gray);">Sat</span><span style="font-size:7px;color:var(--coral);font-weight:700;">Sun</span>
                </div>
              </div>
              <!-- Next session -->
              <div style="background:var(--charcoal);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;">
                <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.35);">Next session</div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#FFF0ED,#F5D8D1);font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8553D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><circle cx="12" cy="8" r="3"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M12 14v3M10.5 15.5h3"/></svg></div>
                  <div>
                    <div style="font-size:11px;font-weight:600;color:var(--white);line-height:1.2;">Dr. Ananya</div>
                    <div style="font-size:9px;color:rgba(255,255,255,.4);">Today · 3:00 PM</div>
                  </div>
                </div>
                <div style="font-size:9px;color:rgba(255,255,255,.4);background:rgba(255,255,255,.05);border-radius:8px;padding:6px 8px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><rect x="5" y="5" width="14" height="16" rx="2"/><rect x="9" y="3" width="6" height="4" rx="1.2"/><line x1="8.5" y1="12" x2="15" y2="12"/><line x1="8.5" y1="16" x2="13" y2="16"/></svg> Pre-session brief ready</div>
                <button style="width:100%;padding:7px;border-radius:8px;background:var(--coral);color:white;border:none;font-size:10px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">Join session →</button>
              </div>
            </div>

            <!-- Row 3: AI insight + journal -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <!-- Calm AI -->
              <div style="background:linear-gradient(135deg,rgba(200,85,61,.08),rgba(200,85,61,.03));border-radius:12px;padding:12px;border:1.5px solid rgba(200,85,61,.15);">
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:7px;">
                  <span style="display:inline-flex"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8553D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><line x1="12" y1="5" x2="12" y2="8"/><rect x="6.5" y="8" width="11" height="9" rx="3"/><line x1="9.7" y1="11.8" x2="9.7" y2="13.4"/><line x1="14.3" y1="11.8" x2="14.3" y2="13.4"/><line x1="4" y1="11.5" x2="4" y2="13.5" opacity=".6"/><line x1="20" y1="11.5" x2="20" y2="13.5" opacity=".6"/></svg></span>
                  <span style="font-size:8px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--coral);">Calm AI</span>
                </div>
                <div style="font-size:11px;color:var(--charcoal);line-height:1.55;font-weight:400;">You've journaled 4 days in a row. Less self-criticism this week, that's real progress.</div>
                <div style="margin-top:8px;font-size:9px;color:var(--coral);font-weight:600;cursor:pointer;">→ Full insight report</div>
              </div>
              <!-- Journal preview -->
              <div style="background:var(--white);border-radius:12px;padding:12px;border:1.5px solid var(--border);">
                <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gray);margin-bottom:7px;">Latest journal</div>
                <div style="font-size:11px;color:var(--charcoal);line-height:1.55;font-style:italic;">"Today was hard but I didn't spiral. That felt new..."</div>
                <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">
                  <span style="font-size:8px;padding:2px 7px;border-radius:10px;background:var(--coral-pale);color:var(--coral);font-weight:700;">resilience</span>
                  <span style="font-size:8px;padding:2px 7px;border-radius:10px;background:#EEF0FB;color:#7B7FCC;font-weight:700;">growth ✦</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    <div class="reveal d2">
      <div class="sec-label" style="margin-bottom:12px;">Patient experience</div>
      <h3 style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:clamp(28px,3vw,40px);color:var(--charcoal);letter-spacing:-1px;transform:scaleX(.9);transform-origin:left;margin-bottom:14px;line-height:1.05;">Everything your mind needs, in one calm space.</h3>
      <p style="font-size:16px;font-weight:300;color:var(--charcoal-l);line-height:1.75;margin-bottom:28px;">Track your mood daily. Journal freely. Get AI-powered insights. Book and attend sessions, all from one dashboard designed to feel as calm as getCalmly's name promises.</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:28px;height:28px;border-radius:50%;background:var(--coral-pale);color:var(--coral);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">1</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:2px;">3-dimensional mood tracking</div><div style="font-size:13px;color:var(--gray);font-weight:300;">Mood, energy and sleep, tracked daily, visualised clearly.</div></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:28px;height:28px;border-radius:50%;background:var(--coral-pale);color:var(--coral);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">2</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:2px;">AI insights from your own patterns</div><div style="font-size:13px;color:var(--gray);font-weight:300;">Calm AI reads your journal and mood data to surface what matters.</div></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:28px;height:28px;border-radius:50%;background:var(--coral-pale);color:var(--coral);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">3</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:2px;">Sessions that know your history</div><div style="font-size:13px;color:var(--gray);font-weight:300;">Your therapist sees your week before you even say hello.</div></div>
        </div>
      </div>
      <a href="/assess" class="btn-hero fill">✦ Book your first session</a>
    </div>
  </div>

  <!-- DOCTOR PANE -->
  <div class="preview-pane" id="pane-doctor">
    <div class="reveal dash-mock-wrap">
      <span class="dash-swipe-hint">← swipe to explore →</span>
      <!-- Full therapist portal: sidebar + main -->
      <div class="dash-mock" style="display:flex;border-radius:20px;overflow:hidden;box-shadow:var(--sh-lg);border:1.5px solid rgba(26,127,122,.2);background:#EEF3F8;font-size:12px;">

        <!-- Sidebar -->
        <div style="width:56px;background:#1A7F7A;display:flex;flex-direction:column;align-items:center;padding:16px 0;gap:6px;flex-shrink:0;">
          <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:16px;color:rgba(255,255,255,.9);transform:scaleX(.63);transform-origin:center;letter-spacing:-1px;margin-bottom:12px;">C.</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:15px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/><line x1="10.5" y1="19" x2="10.5" y2="14"/><line x1="13.5" y1="19" x2="13.5" y2="14"/></svg></div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:15px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.4"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5"/><path d="M15 19c0-1.7.8-3.2 2-4"/></svg></div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:15px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><rect x="4" y="6" width="16" height="14" rx="2.5"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="4" x2="8" y2="7"/><line x1="16" y1="4" x2="16" y2="7"/></svg></div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:15px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><rect x="5" y="5" width="14" height="16" rx="2"/><rect x="9" y="3" width="6" height="4" rx="1.2"/><line x1="8.5" y1="12" x2="15" y2="12"/><line x1="8.5" y1="16" x2="13" y2="16"/></svg></div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:15px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><polyline points="4,16 9,11 13,14 20,6"/><line x1="4" y1="20" x2="20" y2="20" opacity=".4"/></svg></div>
          <div style="margin-top:auto;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.2);color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">A</div>
        </div>

        <!-- Main area -->
        <div style="flex:1;display:flex;flex-direction:column;min-width:0;">

          <!-- Top bar -->
          <div style="background:white;border-bottom:1px solid rgba(26,127,122,.12);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:10px;color:var(--gray);font-weight:500;">Therapist portal</div>
              <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:18px;color:#1A7F7A;transform:scaleX(.88);transform-origin:left;letter-spacing:-.5px;">Dr. Ananya Sharma</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="background:#FFF3F1;color:var(--coral);font-size:9px;font-weight:700;padding:4px 10px;border-radius:20px;border:1px solid rgba(200,85,61,.2);">⚠️ 1 AI flag</div>
              <div style="background:#E5F4EE;color:#1A7F7A;font-size:9px;font-weight:700;padding:4px 10px;border-radius:20px;">● Online</div>
            </div>
          </div>

          <!-- Body -->
          <div style="padding:14px;display:flex;flex-direction:column;gap:10px;">

            <!-- Row 1: stat cards -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
              <div style="background:white;border-radius:12px;padding:10px;border:1px solid rgba(26,127,122,.1);text-align:center;">
                <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:22px;color:#1A7F7A;transform:scaleX(.82);transform-origin:center;letter-spacing:-1px;display:block;">12</div>
                <div style="font-size:8px;color:var(--gray);margin-top:2px;">Active patients</div>
              </div>
              <div style="background:white;border-radius:12px;padding:10px;border:1px solid rgba(26,127,122,.1);text-align:center;">
                <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:22px;color:#1A7F7A;transform:scaleX(.82);transform-origin:center;letter-spacing:-1px;display:block;">3</div>
                <div style="font-size:8px;color:var(--gray);margin-top:2px;">Sessions today</div>
              </div>
              <div style="background:white;border-radius:12px;padding:10px;border:1px solid rgba(26,127,122,.1);text-align:center;">
                <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:22px;color:var(--gold);transform:scaleX(.82);transform-origin:center;letter-spacing:-1px;display:block;">4.9★</div>
                <div style="font-size:8px;color:var(--gray);margin-top:2px;">Avg rating</div>
              </div>
              <div style="background:white;border-radius:12px;padding:10px;border:1px solid rgba(26,127,122,.1);text-align:center;">
                <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:22px;color:var(--green);transform:scaleX(.82);transform-origin:center;letter-spacing:-1px;display:block;">94%</div>
                <div style="font-size:8px;color:var(--gray);margin-top:2px;">Improvement rate</div>
              </div>
            </div>

            <!-- Row 2: today's schedule + AI flag -->
            <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:8px;">
              <!-- Today's schedule -->
              <div style="background:white;border-radius:12px;overflow:hidden;border:1px solid rgba(26,127,122,.1);">
                <div style="padding:8px 12px;border-bottom:1px solid rgba(26,127,122,.08);font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gray);">Today's schedule</div>
                <div style="padding:8px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(26,127,122,.06);">
                  <div style="font-size:9px;color:#1A7F7A;font-weight:700;width:36px;flex-shrink:0;">3:00 PM</div>
                  <div style="width:28px;height:28px;border-radius:50%;background:var(--coral-pale);color:var(--coral);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">P</div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:11px;font-weight:600;color:var(--charcoal);">Priya R.</div>
                    <div style="font-size:9px;color:var(--gray);">Anxiety · Session 4</div>
                  </div>
                  <div style="background:#1A7F7A;color:white;font-size:8px;font-weight:700;padding:3px 8px;border-radius:8px;cursor:pointer;white-space:nowrap;">Join</div>
                </div>
                <div style="padding:8px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(26,127,122,.06);">
                  <div style="font-size:9px;color:var(--gray);font-weight:600;width:36px;flex-shrink:0;">4:30 PM</div>
                  <div style="width:28px;height:28px;border-radius:50%;background:var(--green-pale);color:var(--green);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">K</div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:11px;font-weight:600;color:var(--charcoal);">Karan M.</div>
                    <div style="font-size:9px;color:var(--gray);">Depression · Session 11</div>
                  </div>
                  <div style="background:rgba(26,127,122,.1);color:#1A7F7A;font-size:8px;font-weight:700;padding:3px 8px;border-radius:8px;white-space:nowrap;">Prep</div>
                </div>
                <div style="padding:8px 12px;display:flex;align-items:center;gap:8px;">
                  <div style="font-size:9px;color:var(--gray);font-weight:600;width:36px;flex-shrink:0;">6:00 PM</div>
                  <div style="width:28px;height:28px;border-radius:50%;background:#EEF0FB;color:#7B7FCC;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">A</div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:11px;font-weight:600;color:var(--charcoal);">Aditya S.</div>
                    <div style="font-size:9px;color:var(--coral);">Work stress · ⚠️ Flag</div>
                  </div>
                  <div style="background:var(--coral-pale);color:var(--coral);font-size:8px;font-weight:700;padding:3px 8px;border-radius:8px;white-space:nowrap;">Review</div>
                </div>
              </div>

              <!-- AI alert + mood summary -->
              <div style="display:flex;flex-direction:column;gap:8px;">
                <div style="background:#FFF3F1;border-radius:12px;padding:12px;border:1px solid rgba(200,85,61,.18);">
                  <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;">
                    <span style="font-size:12px;">⚠️</span>
                    <span style="font-size:8px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--coral);">AI flag · Aditya</span>
                  </div>
                  <div style="font-size:11px;color:var(--charcoal);line-height:1.5;">Mood dropped 3 days running. Journal themes: <strong>overwhelm, isolation.</strong></div>
                  <div style="margin-top:6px;font-size:9px;color:var(--coral);font-weight:600;cursor:pointer;">→ See full brief</div>
                </div>
                <div style="background:white;border-radius:12px;padding:12px;border:1px solid rgba(26,127,122,.1);flex:1;">
                  <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gray);margin-bottom:8px;">Patient mood overview</div>
                  <div style="display:flex;flex-direction:column;gap:5px;">
                    <div style="display:flex;align-items:center;gap:6px;">
                      <span style="font-size:10px;color:var(--charcoal);width:20px;font-weight:600;">P</span>
                      <div style="flex:1;height:5px;border-radius:5px;background:var(--gray-l);overflow:hidden;"><div class="gc-grow" style="width:72%;height:100%;background:var(--coral);border-radius:5px;"></div></div>
                      <span style="font-size:9px;color:var(--coral);font-weight:700;">7.2</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                      <span style="font-size:10px;color:var(--charcoal);width:20px;font-weight:600;">K</span>
                      <div style="flex:1;height:5px;border-radius:5px;background:var(--gray-l);overflow:hidden;"><div class="gc-grow gc-d1" style="width:68%;height:100%;background:var(--green);border-radius:5px;"></div></div>
                      <span style="font-size:9px;color:var(--green);font-weight:700;">6.8</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                      <span style="font-size:10px;color:var(--charcoal);width:20px;font-weight:600;">A</span>
                      <div style="flex:1;height:5px;border-radius:5px;background:var(--gray-l);overflow:hidden;"><div class="gc-grow gc-d2" style="width:41%;height:100%;background:var(--gold);border-radius:5px;"></div></div>
                      <span style="font-size:9px;color:var(--gold);font-weight:700;">4.1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 3: pre-session brief -->
            <div style="background:white;border-radius:12px;padding:12px;border:1px solid rgba(26,127,122,.1);">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gray);">AI pre-session brief · Priya R. · 3:00 PM</div>
                <span style="font-size:8px;background:var(--green-pale);color:var(--green);padding:2px 8px;border-radius:10px;font-weight:700;">Session 4 · CBT</span>
              </div>
              <div style="font-size:11px;color:var(--charcoal);line-height:1.6;font-weight:300;">Week 4. Notable themes: <strong style="font-weight:600;">boundary-setting, reduced self-criticism</strong>. Mood peak Thursday. Anxiety down 18% vs last week. Recommend continuing reframing on workplace relationships. Patient noted "not spiralling" as a win, worth acknowledging.</div>
              <div style="margin-top:8px;display:flex;gap:6px;">
                <span style="font-size:8px;padding:2px 8px;border-radius:10px;background:var(--green-pale);color:var(--green);font-weight:700;">Progress ↑</span>
                <span style="font-size:8px;padding:2px 8px;border-radius:10px;background:#EEF0FB;color:#7B7FCC;font-weight:700;">4 journal entries</span>
                <span style="font-size:8px;padding:2px 8px;border-radius:10px;background:var(--coral-pale);color:var(--coral);font-weight:700;">Anxiety ↓ 18%</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    <div class="reveal d2">
      <div class="sec-label" style="margin-bottom:12px;color:#1A7F7A;">Therapist experience</div>
      <h3 style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:clamp(28px,3vw,40px);color:var(--charcoal);letter-spacing:-1px;transform:scaleX(.9);transform-origin:left;margin-bottom:14px;line-height:1.05;">Clinical tools that let you focus on what matters.</h3>
      <p style="font-size:16px;font-weight:300;color:var(--charcoal-l);line-height:1.75;margin-bottom:28px;">Every therapist on getCalmly gets a powerful portal, patient mood history, AI-generated pre-session briefs, structured session notes, and referral tracking. Less admin. Better care.</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:28px;height:28px;border-radius:50%;background:#E5F4EE;color:#1A7F7A;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">1</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:2px;">AI pre-session briefs</div><div style="font-size:13px;color:var(--gray);font-weight:300;">Patient mood, journal themes and flags, summarised before each session.</div></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:28px;height:28px;border-radius:50%;background:#E5F4EE;color:#1A7F7A;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">2</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:2px;">Risk flagging & mood alerts</div><div style="font-size:13px;color:var(--gray);font-weight:300;">AI monitors patient patterns between sessions and alerts you when needed.</div></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:28px;height:28px;border-radius:50%;background:#E5F4EE;color:#1A7F7A;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">3</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:2px;">Hospital-ready reporting</div><div style="font-size:13px;color:var(--gray);font-weight:300;">Structured notes, referral letters and progress reports, exportable instantly.</div></div>
        </div>
      </div>
      <a href="/for-therapists" class="btn-hero outline" style="border-color:rgba(61,158,114,.35);color:#3D9E72;display:inline-flex;" onmouseover="this.style.background='rgba(61,158,114,.06)'" onmouseout="this.style.background='transparent'">Join our expert team →</a>
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
        <a class="assess-big-btn" href="/assess"><span>✦</span> Book your first session</a>
        <div class="assess-note">Trusted by 40,000+ people · Completely confidential</div>
      </div>
    </div>
  </div>
</section>

<!-- ── COMMUNITY ── -->
<section class="comm-section" id="community">
  <div class="comm-layout">
    <div class="comm-right reveal">
      <div class="sec-label">Community</div>
      <h2 class="sec-h2">You're not alone<br>in <span>any of this.</span></h2>
      <p class="sec-p">A safe, moderated community of people who truly get it. Share, listen, and find support that only comes from lived experience.</p>
      <div class="comm-groups">
        <div class="cg"><div class="cg-icon" style="background:var(--coral-pale);"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8553D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><rect x="7" y="6" width="10" height="11" rx="4"/><line x1="12" y1="6" x2="12" y2="17"/></svg></div><div><div class="cg-t">Anxiety Warriors</div><div class="cg-s">Coping strategies & lived experiences</div></div><div class="cg-ct">1.2k members</div></div>
        <div class="cg"><div class="cg-icon" style="background:#FFF8E7;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9973A" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg></div><div><div class="cg-t">Work Wellness</div><div class="cg-s">Burnout, stress & setting boundaries</div></div><div class="cg-ct">876 members</div></div>
        <div class="cg"><div class="cg-icon" style="background:var(--green-pale);"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D9E72" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z"/><line x1="8" y1="16" x2="15" y2="9"/></svg></div><div><div class="cg-t">Mindfulness & Meditation</div><div class="cg-s">Daily practices & guided sessions</div></div><div class="cg-ct">3.4k members</div></div>
      </div>
      <a href="/community" class="btn-primary">Join the community →</a>
    </div>
    <div class="comm-posts reveal d1">
      <div class="comm-post"><div class="cp-top"><div class="cp-av">M</div><div><div class="cp-nm">meera_k</div><div class="cp-grp">Anxiety Warriors</div></div></div><div class="cp-text">I had my first panic attack in months yesterday. Instead of hating myself for it, I used what my therapist taught me and just breathed through it. It passed. That feels like a win I never thought I'd have 🌿</div><div class="cp-acts"><span class="cp-act liked"><svg width="13" height="13" viewBox="0 0 24 24" fill="#C8553D" style="vertical-align:middle;display:inline-block"><path d="M12 20S4 15 4 9.5C4 6.5 6.5 5 9 6.2 10.2 6.8 11.6 8 12 8s1.8-1.2 3-1.8C17.5 5 20 6.5 20 9.5 20 15 12 20 12 20Z"/></svg> 34</span><span class="cp-act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8E9EAE" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"/></svg> 12 replies</span><span class="cp-act">↗ Share</span></div></div>
      <div class="comm-post"><div class="cp-top"><div class="cp-av" style="background:var(--green-pale);color:var(--green);">A</div><div><div class="cp-nm">arjun_22</div><div class="cp-grp">Work Wellness</div></div></div><div class="cp-text">First time opening up about my burnout out loud. I've been pretending I'm fine for two years. Typing this is terrifying but I'm so tired of carrying it alone 🙌</div><div class="cp-acts"><span class="cp-act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8E9EAE" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M12 20S4 15 4 9.5C4 6.5 6.5 5 9 6.2 10.2 6.8 11.6 8 12 8s1.8-1.2 3-1.8C17.5 5 20 6.5 20 9.5 20 15 12 20 12 20Z"/></svg> 58</span><span class="cp-act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8E9EAE" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"/></svg> 7 replies</span><span class="cp-act">↗ Share</span></div></div>
      <div class="comm-post"><div class="cp-top"><div class="cp-av" style="background:#EEF0FB;color:#7B7FCC;">S</div><div><div class="cp-nm">shruti.m</div><div class="cp-grp">Depression Support Circle</div></div></div><div class="cp-text">3 months in and I actually laughed at something today, really laughed. I'd forgotten what that felt like. To anyone in the dark right now: it doesn't stay this heavy forever 🕊️</div><div class="cp-acts"><span class="cp-act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8E9EAE" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M12 20S4 15 4 9.5C4 6.5 6.5 5 9 6.2 10.2 6.8 11.6 8 12 8s1.8-1.2 3-1.8C17.5 5 20 6.5 20 9.5 20 15 12 20 12 20Z"/></svg> 142</span><span class="cp-act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8E9EAE" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"/></svg> 31 replies</span><span class="cp-act">↗ Share</span></div></div>
    </div>
  </div>
</section>

<!-- ── TESTIMONIALS ── -->
<section class="testi-section">
  <div class="sec-label reveal">Real people. Real change.</div>
  <h2 class="sec-h2 reveal">You already met Priya.<br><span>Here's who else.</span></h2>
  <div class="t3-grid">
    <div class="testi-card reveal" style="border-color:rgba(200,85,61,.15);"><div class="stars">★★★★★</div><div class="testi-q">I'd been carrying something heavy for so long I forgot it was there. Dr. Ananya helped me put it down. And when I reached out to Calm AI at midnight not knowing what to say, it already knew exactly where I was.</div><div class="testi-auth"><div class="testi-av">P</div><div><div class="testi-nm">Priya R., 28</div><div class="testi-dt">Software engineer · 4 months in</div></div></div></div>
    <div class="testi-card reveal d1"><div class="stars">★★★★★</div><div class="testi-q">I didn't believe app-based therapy could be real. Then Dr. Rohan read my journal brief before our second session and opened with exactly the right question. That was it for me.</div><div class="testi-auth"><div class="testi-av" style="background:var(--green-pale);color:var(--green);">K</div><div><div class="testi-nm">Karan M., 34</div><div class="testi-dt">Finance · 7 months in</div></div></div></div>
    <div class="testi-card reveal d2"><div class="stars">★★★★★</div><div class="testi-q">Week 3, getCalmly flagged that my anxiety spiked every Sunday. I knew something was off on Sundays. I just didn't know that's what it was. Seeing it in data made it real, and fixable.</div><div class="testi-auth"><div class="testi-av" style="background:#EEF0FB;color:#7B7FCC;">A</div><div><div class="testi-nm">Aditya S., 26</div><div class="testi-dt">Design student · 2 months in</div></div></div></div>
  </div>
</section>

<!-- ── APP ── -->
<section class="app-section" style="background:#1C2B3A;padding:96px 6% 80px;overflow:hidden;">
  <div class="app-grid" style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;">
    <div>
      <div class="sec-label" style="color:#1FB6A8;">The getCalmly app</div>
      <h2 class="sec-h2" style="color:#fff;margin-bottom:16px;">Your care,<br><span style="color:var(--coral-l);">in your pocket.</span></h2>
      <p style="font-size:16px;color:rgba(255,255,255,.66);line-height:1.7;margin-bottom:22px;font-weight:300;">Your care really comes alive in the app. Check in each day, talk to Calm whenever you need to, journal, and join sessions, all in one calm place. Because it is right there with you, the gentle reminders and personalised nudges land exactly when they help.</p>
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
          <iframe src="/mockups/app-mock.html?screen=home" title="The GetCalmly app home screen" loading="lazy" scrolling="no" style="display:block;width:375px;height:812px;border:none;transform:scale(0.6667);transform-origin:top left;"></iframe>
        </div>
      </div>
    </div>
  </div>
</section>
`;
