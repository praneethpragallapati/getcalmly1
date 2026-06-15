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
      <div class="hero-pill"><span class="pill-dot"></span>First free session · No card needed</div>
      <h1 class="hero-h1">
        <span class="light">Your mind</span>
        deserves<br>
        <span class="accent">real care.</span>
      </h1>
      <p class="hero-sub">RCI-verified therapists, AI that understands your patterns, and a community that gets it — all in one calm space.</p>
      <div class="hero-actions">
        <a href="/assess" class="btn-hero fill">✦ Book a free session</a>
        <a href="#how" class="btn-hero outline">See how it works</a>
      </div>
      <div class="hero-trust">
        <span class="ht">First session free</span>
        <span class="ht">RCI-verified therapists</span>
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
                  <div class="ps-card-title">Mondays tend to weigh on you — and that's okay.</div>
                  <div class="ps-card-sub">A 5-min breathing exercise before your first call may help. Tap to try it.</div>
                </div>
                <div class="gc-cyc-item">
                  <div class="ps-card-title">Your sleep improved 3 nights running.</div>
                  <div class="ps-card-sub">Mood tends to follow your rest — keep protecting that wind-down hour.</div>
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
              <div class="ps-card-sub">Clinical Psychologist · ✓ RCI Verified · Google Meet</div>
            </div>
            <div class="ps-card">
              <div class="ps-badge">Your week so far</div>
              <div class="ps-metrics">
                <div class="ps-m"><span class="ps-mn" style="color:var(--coral-l);">7</span><span class="ps-ml">Day streak 🔥</span></div>
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
  <h2 class="sec-h2 reveal">Your path to calm,<br><span>step by step.</span></h2>
  <div class="how-layout">
    <div class="how-steps">
      <div class="how-step reveal"><div class="hs-n">01</div><div><div class="hs-t">Take the free assessment</div><div class="hs-d">Answer 12 clinically validated questions. Our AI instantly builds a personalised mental wellness profile — no login required, no obligation.</div></div></div>
      <div class="how-step reveal d1"><div class="hs-n">02</div><div><div class="hs-t">Get matched with the right therapist</div><div class="hs-d">No endless directories to scroll. We match you with the right RCI-verified clinical psychologist or psychiatrist for your needs — every expert credentialled, reviewed, and ready when you are.</div></div></div>
      <div class="how-step reveal d2"><div class="hs-n">03</div><div><div class="hs-t">Begin your calm space</div><div class="hs-d">Attend sessions via Google Meet. Between sessions, your AI companion Calm checks in daily, tracks your mood, and offers personalised coping strategies.</div></div></div>
      <div class="how-step reveal d3"><div class="hs-n">04</div><div><div class="hs-t">Watch yourself grow</div><div class="hs-d">Mood trends, pattern detection, streak tracking, and weekly AI insight reports — quietly building evidence of the progress you're making, one day at a time.</div></div></div>
    </div>
    <div class="how-visual reveal d1">
      <!-- Journal entry card -->
      <div class="how-card">
        <div class="hc-badge">Journal · Thursday, 8:42 PM</div>
        <div class="hc-title">Today was hard but I didn't spiral. That's new.</div>
        <div class="hc-sub">getCalmly detected 3 themes: <span style="color:var(--coral-l);font-weight:600;">self-compassion · boundary-setting · resilience</span></div>
        <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;">
          <span style="font-size:9px;padding:3px 9px;border-radius:20px;background:rgba(200,85,61,.15);color:var(--coral-l);font-weight:700;">Growth moment ✦</span>
          <span style="font-size:9px;padding:3px 9px;border-radius:20px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.4);font-weight:600;">Added to weekly report</span>
        </div>
      </div>
      <!-- Mood trend card -->
      <div class="how-card">
        <div class="hc-badge">Mood intelligence · this month</div>
        <div class="hc-title" style="margin-bottom:12px;">Your anxiety peaks on Sunday evenings.</div>
        <div class="gc-bars" style="display:flex;align-items:flex-end;gap:4px;height:36px;margin-bottom:8px;">
          <div style="flex:1;background:rgba(200,85,61,.25);border-radius:3px 3px 0 0;height:60%;"></div>
          <div style="flex:1;background:rgba(200,85,61,.35);border-radius:3px 3px 0 0;height:80%;"></div>
          <div style="flex:1;background:rgba(200,85,61,.2);border-radius:3px 3px 0 0;height:40%;"></div>
          <div style="flex:1;background:rgba(200,85,61,.15);border-radius:3px 3px 0 0;height:30%;"></div>
          <div style="flex:1;background:rgba(200,85,61,.55);border-radius:3px 3px 0 0;height:100%;position:relative;">
            <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:7px;color:var(--coral-l);white-space:nowrap;font-weight:700;">Sun ↑</div>
          </div>
          <div style="flex:1;background:rgba(200,85,61,.2);border-radius:3px 3px 0 0;height:35%;"></div>
          <div style="flex:1;background:rgba(61,158,114,.4);border-radius:3px 3px 0 0;height:25%;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="font-size:8px;color:rgba(255,255,255,.25);">Mon</span>
          <span style="font-size:8px;color:rgba(255,255,255,.25);">Tue</span>
          <span style="font-size:8px;color:rgba(255,255,255,.25);">Wed</span>
          <span style="font-size:8px;color:rgba(255,255,255,.25);">Thu</span>
          <span style="font-size:8px;color:var(--coral-l);font-weight:700;">Sun</span>
          <span style="font-size:8px;color:rgba(255,255,255,.25);">Mon</span>
          <span style="font-size:8px;color:#7FD4A8;">Tue</span>
        </div>
      </div>
      <!-- Session prep card -->
      <div class="how-card">
        <div class="hc-badge">Session prep · tomorrow 3 PM</div>
        <div class="hc-title">Dr. Ananya has reviewed your week.</div>
        <div class="hc-sub" style="margin-bottom:10px;">She's noted your journal entries and mood dips. Tomorrow's session is already tailored to you.</div>
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.05);border-radius:10px;border:1px solid rgba(255,255,255,.08);">
          <span style="font-size:16px;">👩‍⚕️</span>
          <div>
            <div style="font-size:11px;font-weight:600;color:var(--white);">Dr. Ananya Sharma</div>
            <div style="font-size:10px;color:rgba(255,255,255,.35);">Prepared · Google Meet ready</div>
          </div>
          <div style="margin-left:auto;width:8px;height:8px;border-radius:50%;background:var(--green);flex-shrink:0;"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── FEATURES ── -->
<section class="features-section" id="features">
  <div class="feat-header">
    <div>
      <div class="sec-label reveal">Advanced features</div>
      <h2 class="sec-h2 reveal">Everything you need.<br><span>Nothing you don't.</span></h2>
    </div>
    <p class="sec-p reveal">getCalmly combines clinical-grade therapy with AI intelligence — designed to feel like having a brilliant, caring expert in your corner at all times.</p>
  </div>
  <div class="feat-grid">
    <div class="feat-card dk reveal"><span class="feat-icon">🤖</span><div class="feat-t">Calm AI — your 24/7 companion</div><div class="feat-d">An empathetic AI that learns your patterns, checks in every morning, and offers coping strategies drawn from your actual therapy sessions and journal history.</div><span class="feat-badge fb-dk">Powered by Claude</span></div>
    <div class="feat-card reveal d1"><span class="feat-icon">📊</span><div class="feat-t">Mood intelligence engine</div><div class="feat-d">Three-dimensional daily tracking — mood, energy, sleep — building a rich picture over time that reveals patterns neither you nor your therapist could see alone.</div><span class="feat-badge fb-c">Science-backed</span></div>
    <div class="feat-card reveal d2"><span class="feat-icon">📓</span><div class="feat-t">Smart journaling & AI insights</div><div class="feat-d">Write freely. getCalmly detects recurring themes, emotional triggers, and growth moments — then surfaces them in a clear weekly insight report.</div><span class="feat-badge fb-c">Pattern detection</span></div>
    <div class="feat-card reveal"><span class="feat-icon">👩‍⚕️</span><div class="feat-t">RCI-verified clinical therapists</div><div class="feat-d">Every therapist is registered with the Rehabilitation Council of India. Verified credentials, structured sessions, and real clinical outcomes — not wellness coaches.</div><span class="feat-badge fb-g">Clinically verified</span></div>
    <div class="feat-card reveal d1"><span class="feat-icon">🏥</span><div class="feat-t">Hospital & enterprise integration</div><div class="feat-d">Session notes, referral tracking, and progress reports structured for hospital workflows and corporate wellness programs. Clinical-grade from the ground up.</div><span class="feat-badge fb-c">Enterprise ready</span></div>
    <div class="feat-card reveal d2"><span class="feat-icon">👥</span><div class="feat-t">Moderated peer community</div><div class="feat-d">A safe, human-moderated space to share, listen, and find people who truly understand. Crisis support is built in from the ground up — not bolted on.</div><span class="feat-badge fb-g">Safe & moderated</span></div>
  </div>
</section>



<!-- ── DASHBOARD PREVIEW ── -->
<section class="preview-section" id="preview">
  <div class="sec-label reveal">See it in action</div>
  <h2 class="sec-h2 reveal">Built for both sides<br>of the <span>care equation.</span></h2>
  <p class="sec-p reveal" style="margin-bottom:40px;">getCalmly gives patients a calm, intelligent space — and gives therapists the clinical tools they need to deliver better care. See both.</p>

  <div class="preview-tabs reveal">
    <div class="ptab active" onclick="switchTab('patient',this)">👤 Patient view</div>
    <div class="ptab" onclick="switchTab('doctor',this)">👩‍⚕️ Therapist view</div>
  </div>

  <!-- PATIENT PANE -->
  <div class="preview-pane active" id="pane-patient">
    <div class="reveal">
      <!-- Full patient dashboard: sidebar + main content -->
      <div style="display:flex;border-radius:20px;overflow:hidden;box-shadow:var(--sh-lg);border:1.5px solid var(--border);background:var(--bg-warm);font-size:12px;">

        <!-- Sidebar -->
        <div style="width:56px;background:var(--charcoal);display:flex;flex-direction:column;align-items:center;padding:16px 0;gap:6px;flex-shrink:0;">
          <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:16px;color:var(--coral);transform:scaleX(.63);transform-origin:center;letter-spacing:-1px;margin-bottom:12px;">C.</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(200,85,61,.2);display:flex;align-items:center;justify-content:center;font-size:15px;" title="Home">🏠</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:15px;" title="Mood">📊</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:15px;" title="Journal">📓</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:15px;" title="Sessions">🗓️</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:15px;" title="Community">👥</div>
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
              <div style="background:var(--coral-pale);color:var(--coral);font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;display:flex;align-items:center;gap:4px;"><span style="width:5px;height:5px;background:var(--coral);border-radius:50%;display:inline-block;"></span>14-day streak 🔥</div>
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
                  <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#FFF0ED,#F5D8D1);font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">👩‍⚕️</div>
                  <div>
                    <div style="font-size:11px;font-weight:600;color:var(--white);line-height:1.2;">Dr. Ananya</div>
                    <div style="font-size:9px;color:rgba(255,255,255,.4);">Today · 3:00 PM</div>
                  </div>
                </div>
                <div style="font-size:9px;color:rgba(255,255,255,.4);background:rgba(255,255,255,.05);border-radius:8px;padding:6px 8px;">📋 Pre-session brief ready</div>
                <button style="width:100%;padding:7px;border-radius:8px;background:var(--coral);color:white;border:none;font-size:10px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">Join session →</button>
              </div>
            </div>

            <!-- Row 3: AI insight + journal -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <!-- Calm AI -->
              <div style="background:linear-gradient(135deg,rgba(200,85,61,.08),rgba(200,85,61,.03));border-radius:12px;padding:12px;border:1.5px solid rgba(200,85,61,.15);">
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:7px;">
                  <span style="font-size:12px;">🤖</span>
                  <span style="font-size:8px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--coral);">Calm AI</span>
                </div>
                <div style="font-size:11px;color:var(--charcoal);line-height:1.55;font-weight:400;">You've journaled 4 days in a row. Less self-criticism this week — that's real progress.</div>
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
      <p style="font-size:16px;font-weight:300;color:var(--charcoal-l);line-height:1.75;margin-bottom:28px;">Track your mood daily. Journal freely. Get AI-powered insights. Book and attend sessions — all from one dashboard designed to feel as calm as getCalmly's name promises.</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:28px;height:28px;border-radius:50%;background:var(--coral-pale);color:var(--coral);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">1</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:2px;">3-dimensional mood tracking</div><div style="font-size:13px;color:var(--gray);font-weight:300;">Mood, energy and sleep — tracked daily, visualised clearly.</div></div>
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
      <a href="/assess" class="btn-hero fill">✦ Try it free</a>
    </div>
  </div>

  <!-- DOCTOR PANE -->
  <div class="preview-pane" id="pane-doctor">
    <div class="reveal">
      <!-- Full therapist portal: sidebar + main -->
      <div style="display:flex;border-radius:20px;overflow:hidden;box-shadow:var(--sh-lg);border:1.5px solid rgba(26,127,122,.2);background:#EEF3F8;font-size:12px;">

        <!-- Sidebar -->
        <div style="width:56px;background:#1A7F7A;display:flex;flex-direction:column;align-items:center;padding:16px 0;gap:6px;flex-shrink:0;">
          <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:16px;color:rgba(255,255,255,.9);transform:scaleX(.63);transform-origin:center;letter-spacing:-1px;margin-bottom:12px;">C.</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:15px;">🏠</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:15px;">👥</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:15px;">🗓️</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:15px;">📋</div>
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:15px;">📊</div>
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
              <div style="font-size:11px;color:var(--charcoal);line-height:1.6;font-weight:300;">Week 4. Notable themes: <strong style="font-weight:600;">boundary-setting, reduced self-criticism</strong>. Mood peak Thursday. Anxiety down 18% vs last week. Recommend continuing reframing on workplace relationships. Patient noted "not spiralling" as a win — worth acknowledging.</div>
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
      <p style="font-size:16px;font-weight:300;color:var(--charcoal-l);line-height:1.75;margin-bottom:28px;">Every therapist on getCalmly gets a powerful portal — patient mood history, AI-generated pre-session briefs, structured session notes, and referral tracking. Less admin. Better care.</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:28px;height:28px;border-radius:50%;background:#E5F4EE;color:#1A7F7A;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">1</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:2px;">AI pre-session briefs</div><div style="font-size:13px;color:var(--gray);font-weight:300;">Patient mood, journal themes and flags — summarised before each session.</div></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:28px;height:28px;border-radius:50%;background:#E5F4EE;color:#1A7F7A;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">2</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:2px;">Risk flagging & mood alerts</div><div style="font-size:13px;color:var(--gray);font-weight:300;">AI monitors patient patterns between sessions and alerts you when needed.</div></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:28px;height:28px;border-radius:50%;background:#E5F4EE;color:#1A7F7A;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">3</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:2px;">Hospital-ready reporting</div><div style="font-size:13px;color:var(--gray);font-weight:300;">Structured notes, referral letters and progress reports — exportable instantly.</div></div>
        </div>
      </div>
      <a href="/for-therapists" class="btn-hero outline" style="border-color:rgba(26,127,122,.3);color:#1A7F7A;display:inline-flex;" onmouseover="this.style.background='rgba(26,127,122,.06)'" onmouseout="this.style.background='transparent'">Join as a therapist →</a>
    </div>
  </div>
</section>

<!-- ── ASSESSMENT BREAK ── -->
<section class="assess-break">
  <div class="assess-layout">
    <div class="assess-left reveal">
      <div class="sec-label">Free for everyone</div>
      <h2 class="sec-h2">Not sure<br>where to start?<br><span>Let's find out.</span></h2>
      <p class="sec-p">12 carefully crafted questions. A personalised mental wellness plan, therapist matches, and your first steps — ready in 5 minutes.</p>
      <div class="assess-stats">
        <div class="as-stat"><span class="as-n">40K+</span><span class="as-l">People assessed</span></div>
        <div class="as-stat"><span class="as-n">5 min</span><span class="as-l">To complete</span></div>
        <div class="as-stat"><span class="as-n">₹0</span><span class="as-l">Always free</span></div>
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
        <a class="assess-big-btn" href="/assess"><span>✦</span> Book your free session</a>
        <div class="assess-note">Trusted by 40,000+ people · Completely confidential</div>
      </div>
    </div>
  </div>
</section>

<!-- ── PRICING ── -->
<section class="pricing-section" id="pricing">
  <div class="sec-label reveal">Pricing</div>
  <h2 class="sec-h2 reveal">Your mental health<br>shouldn't cost <span>the earth.</span></h2>
  <p class="sec-p reveal">Your first session is free. Pay only for the sessions you book — no subscriptions, no lock-in. The assessment, mood tracking, journaling and community are always free.</p>
  <div class="price-grid">
    <div class="plan reveal">
      <div class="plan-name">Free</div>
      <div class="plan-pr"><span class="plan-cur">₹</span><span class="plan-amt">0</span></div>
      <div class="plan-period">Always free, no card needed</div>
      <div class="plan-div"></div>
      <div class="plan-feats">
        <div class="plan-feat"><span class="ck">✓</span>Free mental wellness assessment</div>
        <div class="plan-feat"><span class="ck">✓</span>Daily 3-dimensional mood check-in</div>
        <div class="plan-feat"><span class="ck">✓</span>Smart journaling with AI insights</div>
        <div class="plan-feat"><span class="ck">✓</span>Calm AI companion</div>
        <div class="plan-feat"><span class="ck">✓</span>Moderated community access</div>
      </div>
      <a class="plan-btn pb-ol" href="/assess" style="display:block;text-align:center;text-decoration:none;">Get started free</a>
    </div>
    <div class="plan pro reveal d1">
      <div class="plan-tag">First session free</div>
      <div class="plan-name">Therapy session</div>
      <div class="plan-pr"><span class="plan-cur" style="color:rgba(255,255,255,.7)">From ₹</span><span class="plan-amt">999</span></div>
      <div class="plan-period">per session · first one free</div>
      <div class="plan-div"></div>
      <div class="plan-feats">
        <div class="plan-feat"><span class="ck">✓</span>50-min session with an RCI-verified therapist</div>
        <div class="plan-feat"><span class="ck">✓</span>Matched to your needs — we find the right fit</div>
        <div class="plan-feat"><span class="ck">✓</span>Secure video via Google Meet</div>
        <div class="plan-feat"><span class="ck">✓</span>AI pre-session brief shared with your therapist</div>
        <div class="plan-feat"><span class="ck">✓</span>Book one at a time — no commitment</div>
      </div>
      <a class="plan-btn pb-dk" href="/assess" style="display:block;text-align:center;text-decoration:none;">Book your free session</a>
    </div>
    <div class="plan reveal d2">
      <div class="plan-name">Psychiatry session</div>
      <div class="plan-pr"><span class="plan-cur">From ₹</span><span class="plan-amt">1,299</span></div>
      <div class="plan-period">per session · with a psychiatrist</div>
      <div class="plan-div"></div>
      <div class="plan-feats">
        <div class="plan-feat"><span class="ck">✓</span>Consultation with an RCI-verified psychiatrist</div>
        <div class="plan-feat"><span class="ck">✓</span>Medication review &amp; management</div>
        <div class="plan-feat"><span class="ck">✓</span>Secure video via Google Meet</div>
        <div class="plan-feat"><span class="ck">✓</span>Coordinated with your therapist when needed</div>
        <div class="plan-feat"><span class="ck">✓</span>Hospital referral when clinically required</div>
      </div>
      <a class="plan-btn pb-ol" href="/assess" style="display:block;text-align:center;text-decoration:none;">Book a consultation</a>
    </div>
  </div>
</section>

<!-- ── COMMUNITY ── -->
<section class="comm-section" id="community">
  <div class="comm-layout">
    <div class="comm-posts reveal">
      <div class="comm-post"><div class="cp-top"><div class="cp-av">M</div><div><div class="cp-nm">meera_k</div><div class="cp-grp">Anxiety Warriors</div></div></div><div class="cp-text">I had my first panic attack in months yesterday. Instead of hating myself for it, I used what my therapist taught me and just breathed through it. It passed. That feels like a win I never thought I'd have 🌿</div><div class="cp-acts"><span class="cp-act liked">❤️ 34</span><span class="cp-act">💬 12 replies</span><span class="cp-act">↗ Share</span></div></div>
      <div class="comm-post"><div class="cp-top"><div class="cp-av" style="background:var(--green-pale);color:var(--green);">A</div><div><div class="cp-nm">arjun_22</div><div class="cp-grp">Work Wellness</div></div></div><div class="cp-text">First time opening up about my burnout out loud. I've been pretending I'm fine for two years. Typing this is terrifying but I'm so tired of carrying it alone 🙌</div><div class="cp-acts"><span class="cp-act">❤️ 58</span><span class="cp-act">💬 7 replies</span><span class="cp-act">↗ Share</span></div></div>
      <div class="comm-post"><div class="cp-top"><div class="cp-av" style="background:#EEF0FB;color:#7B7FCC;">S</div><div><div class="cp-nm">shruti.m</div><div class="cp-grp">Depression Support Circle</div></div></div><div class="cp-text">3 months in and I actually laughed at something today — really laughed. I'd forgotten what that felt like. To anyone in the dark right now: it doesn't stay this heavy forever 🕊️</div><div class="cp-acts"><span class="cp-act">❤️ 142</span><span class="cp-act">💬 31 replies</span><span class="cp-act">↗ Share</span></div></div>
    </div>
    <div class="comm-right reveal d2">
      <div class="sec-label">Community</div>
      <h2 class="sec-h2">You're not alone<br>in <span>any of this.</span></h2>
      <p class="sec-p">A safe, moderated community of people who truly get it. Share, listen, and find support that only comes from lived experience.</p>
      <div class="comm-groups">
        <div class="cg"><div class="cg-icon" style="background:var(--coral-pale);">😰</div><div><div class="cg-t">Anxiety Warriors</div><div class="cg-s">Coping strategies & lived experiences</div></div><div class="cg-ct">1.2k members</div></div>
        <div class="cg"><div class="cg-icon" style="background:#FFF8E7;">💼</div><div><div class="cg-t">Work Wellness</div><div class="cg-s">Burnout, stress & setting boundaries</div></div><div class="cg-ct">876 members</div></div>
        <div class="cg"><div class="cg-icon" style="background:var(--green-pale);">🧘</div><div><div class="cg-t">Mindfulness & Meditation</div><div class="cg-s">Daily practices & guided sessions</div></div><div class="cg-ct">3.4k members</div></div>
      </div>
      <a href="/community" class="btn-primary">Join the community free →</a>
    </div>
  </div>
</section>

<!-- ── TESTIMONIALS ── -->
<section class="testi-section">
  <div class="sec-label reveal">Real stories</div>
  <h2 class="sec-h2 reveal">What people say about<br><span>getting calm.</span></h2>
  <div class="t3-grid">
    <div class="testi-card reveal"><div class="stars">★★★★★</div><div class="testi-q">getCalmly made therapy feel accessible for the first time. The AI check-ins between sessions made me feel held even on the hardest days.</div><div class="testi-auth"><div class="testi-av">P</div><div><div class="testi-nm">Priya R.</div><div class="testi-dt">Using getCalmly for 4 months</div></div></div></div>
    <div class="testi-card reveal d1"><div class="stars">★★★★★</div><div class="testi-q">I was sceptical of app-based therapy. Dr. Rohan completely changed my mind. Most professional mental health experience I've ever had.</div><div class="testi-auth"><div class="testi-av" style="background:var(--green-pale);color:var(--green);">K</div><div><div class="testi-nm">Karan M.</div><div class="testi-dt">Using getCalmly for 7 months</div></div></div></div>
    <div class="testi-card reveal d2"><div class="stars">★★★★★</div><div class="testi-q">The mood tracking opened my eyes to patterns I'd never noticed. I didn't realise how much Sundays were weighing on my whole week until I saw the data.</div><div class="testi-auth"><div class="testi-av" style="background:#EEF0FB;color:#7B7FCC;">A</div><div><div class="testi-nm">Aditya S.</div><div class="testi-dt">Using getCalmly for 2 months</div></div></div></div>
  </div>
</section>

<!-- ── FINAL CTA ── -->
<section class="final-cta">
  <div class="fcta">
    <div class="sec-label">Begin today</div>
    <h2 class="sec-h2 reveal">Your first session<br>is <span>on us.</span></h2>
    <p class="sec-p reveal">No card. No commitment. Start with the free 5-minute assessment, get matched with the right expert, and have your first session free — just an honest look at how you're doing, and a clear path forward.</p>
    <div class="fcta-btns reveal">
      <a class="btn-xl c" href="/assess">✦ Book a free session</a>
      <a href="#how" class="btn-xl o">See how it works</a>
    </div>
    <div class="fcta-trust reveal">
      <span class="fti">🔒 100% confidential</span>
      <span class="fti">✓ RCI-verified therapists</span>
      <span class="fti">💙 Free to start</span>
      <span class="fti">🇮🇳 Made in India</span>
    </div>
  </div>
</section>`;
