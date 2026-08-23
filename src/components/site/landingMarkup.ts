// Faithful section markup ported from getcalmly-landing-v2.html (nav, footer,
// therapists, enterprise & modal removed; CTAs routed to /assess).
export const LANDING_MARKUP = `<!-- ── HERO ── -->
<section class="hero" id="home">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="hero-layout">

    <!-- LEFT: headline + CTA -->
    <div class="hero-left">
      <div class="hero-pill"><span class="pill-dot"></span>Your first session, just ₹799</div>
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
        <a href="#how" class="btn-hero outline">See how it works</a>
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
              <div class="ps-card-title">Dr. Ananya Sharma · 3:00 PM</div>
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
  <div class="sec-label reveal">How it works</div>
  <h2 class="sec-h2 reveal">This might sound familiar.<br><span>Here's how it changes.</span></h2>
  <p class="sec-p reveal" style="margin-bottom:48px;">For a lot of us, "I'm fine" is a reflex, not the truth. Here's what shifts the night you finally stop saying it.</p>
  <div class="how-layout">
    <div class="how-steps">
      <div class="how-step"><div class="hs-n">01</div><div><div class="hs-t">The night you stop saying "I'm fine"</div><div class="hs-d">11 PM, thumb hovering over the close button. Twelve honest questions later, no login, no judgement, you finally have a name for what you've been carrying, and a therapist who fits.</div><div class="hs-bar"><span></span></div></div></div>
      <div class="how-step"><div class="hs-n">02</div><div><div class="hs-t">The first session feels like being seen</div><div class="hs-d">Not a stranger reading a script. Your therapist has already read your week before "hello". By the third session, you're saying things out loud you've never told anyone.</div><div class="hs-bar"><span></span></div></div></div>
      <div class="how-step"><div class="hs-n">03</div><div><div class="hs-t">The same face, every single week</div><div class="hs-d">No re-explaining, no starting over. Your therapist and your whole history stay with you, so every session picks up exactly where the last one ended.</div><div class="hs-bar"><span></span></div></div></div>
      <div class="how-step"><div class="hs-n">04</div><div><div class="hs-t">3 AM finally has someone in it</div><div class="hs-d">The hardest nights don't wait for appointments. getCalmly's AI already knows your last session, your mood dip, your journal, so it meets you right there, then hands the context straight back to your therapist.</div><div class="hs-bar"><span></span></div></div></div>
      <div class="how-step"><div class="hs-n">05</div><div><div class="hs-t">You feel better, and you see why.</div><div class="hs-d">Sleep steadies. Mood climbs. And for the first time, the pattern is on a screen in front of you, not a weight you carry alone. That's what makes it last.</div><div class="hs-bar"><span></span></div></div></div>
    </div>
    <div class="how-visual reveal d1">
      <div class="chap-stack">
      <!-- 01 · Assessment -->
      <div class="chap-card">
      <div class="how-card">
        <div class="hc-badge">Assessment · just now</div>
        <div class="hc-title">Twelve gentle questions. No login.</div>
        <div class="hc-sub">A name for what you've been carrying, and a match who can help.</div>
        <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;">
          <span style="font-size:9px;padding:3px 9px;border-radius:20px;background:rgba(200,85,61,.15);color:var(--coral-l);font-weight:700;">Anxiety</span>
          <span style="font-size:9px;padding:3px 9px;border-radius:20px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.72);font-weight:600;">Work stress</span>
          <span style="font-size:9px;padding:3px 9px;border-radius:20px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.72);font-weight:600;">Sleep</span>
        </div>
      </div>
      </div>
      <!-- 02 · Therapist match card (no portrait, monogram only) -->
      <div class="chap-card">
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
      </div>
      <!-- 03 · Weekly continuity -->
      <div class="chap-card">
      <div class="how-card">
        <div class="hc-badge">Your therapist · every week</div>
        <div class="hc-title">Never starting over.</div>
        <div class="hc-sub">Same face, every session. Your history and your patterns already in the room before you say hello, so each conversation picks up exactly where the last one ended.</div>
      </div>
      </div>
      <!-- 04 · Journal entry card -->
      <div class="chap-card">
      <div class="how-card">
        <div class="hc-badge">Your journal · Thursday, 8:42 PM</div>
        <div class="hc-title">Today was hard but I didn't spiral. That's new.</div>
        <div class="hc-sub">getCalmly detected 3 themes: <span style="color:var(--coral-l);font-weight:600;">self-compassion · boundary-setting · resilience</span></div>
        <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;">
          <span style="font-size:9px;padding:3px 9px;border-radius:20px;background:rgba(200,85,61,.15);color:var(--coral-l);font-weight:700;">Growth moment ✦</span>
          <span style="font-size:9px;padding:3px 9px;border-radius:20px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.72);font-weight:600;">Shared with Dr. Ananya</span>
        </div>
      </div>
      </div>
      <!-- 05 · Week 8 result card -->
      <div class="chap-card">
      <div class="how-card">
        <div class="hc-badge">Week 8 · Your progress</div>
        <div class="hc-title">Sleep: 3 nights at 7+ hours. Mood up 18%.</div>
        <div class="hc-sub" style="margin-bottom:10px;">Calm AI flagged the pattern before you'd have noticed it yourself.</div>
        <div class="hc-metrics">
          <div class="hc-m"><span class="hc-mn" style="color:#7FD4A8;">+18%</span><span class="hc-ml">Mood trend</span></div>
          <div class="hc-m"><span class="hc-mn" style="color:var(--coral-l);">7.5h</span><span class="hc-ml">Avg sleep</span></div>
          <div class="hc-m"><span class="hc-mn" style="color:#B8B4D4;">21</span><span class="hc-ml">Journals</span></div>
        </div>
      </div>
      </div>
      </div>
    </div>
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
    <div class="feat-card reveal"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.5v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10v-5L12 3Z"/><polyline points="9,12 11,14 15,10"/></svg></span><div class="feat-t">Real experts, verified for real</div><div class="feat-d">Every therapist and psychiatrist on getCalmly is licensed and background-checked before they ever meet you. Credentials we verify ourselves, not five stars a stranger left online.</div><span class="feat-badge fb-g">Verified, not vibes</span></div>
    <div class="feat-card reveal d1"><span class="feat-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A8432D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20S4 15 4 9.5C4 6.5 6.5 5 9 6.2 10.2 6.8 11.6 8 12 8s1.8-1.2 3-1.8C17.5 5 20 6.5 20 9.5 20 15 12 20 12 20Z"/><line x1="12" y1="10.4" x2="12" y2="14"/><line x1="10.2" y1="12.2" x2="13.8" y2="12.2"/></svg></span><div class="feat-t">You'll never outgrow getCalmly</div><div class="feat-d">If talking isn't enough on its own, our own psychiatrists step in for medical support, no starting over, no new waitlist. And if a hard moment ever turns into a real crisis, a built-in safety protocol and a real human step in right away. One place, one history, whatever it takes.</div><span class="feat-badge fb-c">Whatever it takes</span></div>
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
      <div style="border-radius:16px;overflow:hidden;border:1.5px solid rgba(0,0,0,.08);box-shadow:var(--sh-lg);">
        <div style="background:#EEF0F3;padding:9px 12px;display:flex;gap:6px;align-items:center;">
          <span style="width:9px;height:9px;border-radius:50%;background:#E2856F;"></span>
          <span style="width:9px;height:9px;border-radius:50%;background:#E8C16A;"></span>
          <span style="width:9px;height:9px;border-radius:50%;background:#8FCBA3;"></span>
        </div>
        <img src="/mockups/patient-dashboard.png" alt="getCalmly patient dashboard" loading="lazy" style="display:block;width:100%;height:auto;">
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
      <div style="border-radius:16px;overflow:hidden;border:1.5px solid rgba(0,0,0,.08);box-shadow:var(--sh-lg);">
        <div style="background:#EEF0F3;padding:9px 12px;display:flex;gap:6px;align-items:center;">
          <span style="width:9px;height:9px;border-radius:50%;background:#E2856F;"></span>
          <span style="width:9px;height:9px;border-radius:50%;background:#E8C16A;"></span>
          <span style="width:9px;height:9px;border-radius:50%;background:#8FCBA3;"></span>
        </div>
        <img src="/mockups/doctor-dashboard.png" alt="getCalmly therapist dashboard" loading="lazy" style="display:block;width:100%;height:auto;">
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
      <a href="/for-therapists" class="btn-hero outline" style="border-color:rgba(61,158,114,.45);color:#2F7D5A;display:inline-flex;" onmouseover="this.style.background='rgba(61,158,114,.06)'" onmouseout="this.style.background='transparent'">Join our expert team →</a>
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

<!-- ── COMMUNITY ── -->
<section class="comm-section" id="community">
  <div class="comm-layout">
    <div class="comm-right reveal">
      <div class="sec-label">Community</div>
      <h2 class="sec-h2">You're not alone<br>in <span>any of this.</span></h2>
      <p class="sec-p">One safe, moderated feed of people who truly get it, where verified clinicians join the conversation. Post anonymously, tag your topic, and the replies that actually help rise to the top.</p>
      <div class="comm-groups">
        <div class="cg"><div class="cg-icon" style="background:var(--coral-pale);"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8553D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M12 3l7 2.5v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10v-5L12 3Z"/><polyline points="9,12 11,14 15,10"/></svg></div><div><div class="cg-t">Clinicians reply, not just peers</div><div class="cg-s">Verified therapists &amp; psychiatrists weigh in on threads</div></div><div class="cg-ct">Verified</div></div>
        <div class="cg"><div class="cg-icon" style="background:var(--gold-pale);"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9973A" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z"/><circle cx="7.5" cy="7.5" r="1.2" fill="#C9973A"/></svg></div><div><div class="cg-t">Tag your topic, find your people</div><div class="cg-s">#anxiety · #sleep · #postpartum · #burnout</div></div><div class="cg-ct">Topics</div></div>
        <div class="cg"><div class="cg-icon" style="background:var(--green-pale);"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D9E72" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="m18 15-6-6-6 6"/><line x1="12" y1="9" x2="12" y2="20" opacity=".45"/></svg></div><div><div class="cg-t">Upvotes surface what helped</div><div class="cg-s">Human-moderated, with crisis support built in</div></div><div class="cg-ct">Moderated</div></div>
      </div>
      <a href="/community" class="btn-primary">Join the community →</a>
    </div>
    <div class="comm-posts reveal d1">
      <div class="comm-post"><div class="cp-top"><div class="cp-av">M</div><div><div class="cp-nm">Meera K. <span style="font-size:9px;font-weight:800;color:var(--gold-ink);background:var(--gold-pale);padding:2px 7px;border-radius:20px;margin-left:4px;">Paid Member</span></div><div class="cp-grp">8 months in · 2 hours ago</div></div></div><div style="font-size:14px;font-weight:700;color:var(--charcoal);margin-bottom:5px;">Catastrophising every night, anyone found a way through?</div><div class="cp-text">Around 10pm my brain switches into worst-case-scenario mode. Journaling makes me spiral more. Has anything actually broken the loop for you?</div><div style="display:flex;gap:6px;margin-top:9px;flex-wrap:wrap;"><span style="font-size:10px;font-weight:600;color:var(--coral-d);background:var(--coral-pale);padding:2px 8px;border-radius:20px;">#anxiety</span><span style="font-size:10px;font-weight:600;color:var(--coral-d);background:var(--coral-pale);padding:2px 8px;border-radius:20px;">#sleep</span></div><div class="cp-acts"><span class="cp-act liked"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8553D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="m18 15-6-6-6 6"/></svg> 47 upvotes</span><span class="cp-act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5F6E7D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"/></svg> 18 replies</span></div></div>
      <div class="comm-post"><div class="cp-top"><div class="cp-av" style="background:var(--coral-pale);color:var(--coral);">S</div><div><div class="cp-nm">Dr. Shruti A. <span style="font-size:9px;font-weight:800;color:#fff;background:var(--coral-cta);padding:2px 7px;border-radius:20px;margin-left:4px;">Therapist ✓</span></div><div class="cp-grp">Clinician · Yesterday</div></div></div><div style="font-size:14px;font-weight:700;color:var(--charcoal);margin-bottom:5px;">A gentle reminder for the 10pm spiral</div><div class="cp-text">When racing thoughts keep you up, try naming five things you can see. It pulls the mind out of the loop and back into the room. Reply if you'd like the full grounding sequence 🌿</div><div style="display:flex;gap:6px;margin-top:9px;flex-wrap:wrap;"><span style="font-size:10px;font-weight:600;color:var(--coral-d);background:var(--coral-pale);padding:2px 8px;border-radius:20px;">#sleep</span><span style="font-size:10px;font-weight:600;color:var(--coral-d);background:var(--coral-pale);padding:2px 8px;border-radius:20px;">#grounding</span></div><div class="cp-acts"><span class="cp-act liked"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8553D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="m18 15-6-6-6 6"/></svg> 126 upvotes</span><span class="cp-act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5F6E7D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"/></svg> 9 replies</span></div></div>
      <div class="comm-post"><div class="cp-top"><div class="cp-av" style="background:var(--green-pale);color:var(--green);">A</div><div><div class="cp-nm">Arjun S. <span style="font-size:9px;font-weight:800;color:var(--charcoal);background:rgba(28,43,58,.07);padding:2px 7px;border-radius:20px;margin-left:4px;">Member</span></div><div class="cp-grp">3 days ago</div></div></div><div style="font-size:14px;font-weight:700;color:var(--charcoal);margin-bottom:5px;">First time saying my burnout out loud</div><div class="cp-text">I've pretended I'm fine for two years. Typing this is terrifying, but I'm so tired of carrying it alone. Thanks for being a place I could finally say it 🙌</div><div style="display:flex;gap:6px;margin-top:9px;flex-wrap:wrap;"><span style="font-size:10px;font-weight:600;color:var(--coral-d);background:var(--coral-pale);padding:2px 8px;border-radius:20px;">#burnout</span><span style="font-size:10px;font-weight:600;color:var(--coral-d);background:var(--coral-pale);padding:2px 8px;border-radius:20px;">#work</span></div><div class="cp-acts"><span class="cp-act liked"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8553D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="m18 15-6-6-6 6"/></svg> 58 upvotes</span><span class="cp-act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5F6E7D" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"/></svg> 7 replies</span></div></div>
    </div>
  </div>
</section>

<!-- ── TESTIMONIALS ── -->
<section class="testi-section">
  <div class="sec-label reveal">Real people. Real change.</div>
  <h2 class="sec-h2 reveal">Don't take our word for it.<br><span>Take theirs.</span></h2>
  <div class="testi-marquee reveal">
  <div class="t3-grid" id="testi-track">
    <div class="testi-card reveal" style="border-color:rgba(200,85,61,.15);"><div class="stars">★★★★★</div><div class="testi-q">I'd been carrying something heavy for so long I forgot it was there. Dr. Ananya helped me put it down. And when I reached out to Calm AI at midnight not knowing what to say, it already knew exactly where I was.</div><div class="testi-auth"><div class="testi-av">S</div><div><div class="testi-nm">Sana R., 28</div><div class="testi-dt">Software engineer · 4 months in</div></div></div></div>
    <div class="testi-card reveal d1"><div class="stars">★★★★★</div><div class="testi-q">I didn't believe app-based therapy could be real. Then Dr. Rohan read my journal brief before our second session and opened with exactly the right question. That was it for me.</div><div class="testi-auth"><div class="testi-av" style="background:var(--green-pale);color:var(--green);">K</div><div><div class="testi-nm">Karan M., 34</div><div class="testi-dt">Finance · 7 months in</div></div></div></div>
    <div class="testi-card reveal d2"><div class="stars">★★★★★</div><div class="testi-q">Week 3, getCalmly flagged that my anxiety spiked every Sunday. I knew something was off on Sundays. I just didn't know that's what it was. Seeing it in data made it real, and fixable.</div><div class="testi-auth"><div class="testi-av" style="background:#EEF0FB;color:#7B7FCC;">A</div><div><div class="testi-nm">Aditya S., 26</div><div class="testi-dt">Design student · 2 months in</div></div></div></div>
    <div class="testi-card reveal d3"><div class="stars">★★★★★</div><div class="testi-q">The first honest hour I'd had in years. I stopped performing "fine" for everyone, and for once someone actually stayed with me through it.</div><div class="testi-auth"><div class="testi-av" style="background:var(--coral-pale);color:var(--coral);">N</div><div><div class="testi-nm">Neha T., 31</div><div class="testi-dt">Teacher · 5 months in</div></div></div></div>
  </div>
  </div>
</section>

<!-- ── APP ── -->
<section class="app-section" style="background:radial-gradient(ellipse 60% 55% at 90% 6%,rgba(200,85,61,.28),transparent 55%),radial-gradient(ellipse 45% 50% at 4% 65%,rgba(200,85,61,.12),transparent 60%),#141E29;padding:96px 6% 80px;overflow:hidden;">
  <div class="app-grid" style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;">
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
