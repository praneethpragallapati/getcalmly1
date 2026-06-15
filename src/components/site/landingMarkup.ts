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
        <span class="light">You've been saying</span>
        you're fine.<br>
        <span class="accent">You don't have to.</span>
      </h1>
      <p class="hero-sub">getCalmly matches you with an RCI-verified therapist, understands your patterns with AI, and walks forward with you — starting with a free session.</p>
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

<!-- ── THE PROBLEM ── -->
<div class="problem-strip reveal">
  <div class="problem-inner">
    <span class="prob-stat"><span class="prob-n">60%</span><span class="prob-l">treatment gap in India</span></span>
    <span class="prob-divider"></span>
    <span class="prob-stat"><span class="prob-n">0.75</span><span class="prob-l">psychiatrists per 100,000 people</span></span>
    <span class="prob-divider"></span>
    <span class="prob-stat"><span class="prob-n">Months</span><span class="prob-l">of waiting for a first appointment</span></span>
    <span class="prob-divider"></span>
    <p class="prob-mission">We built getCalmly to change all three.</p>
  </div>
</div>

<!-- ── HOW IT WORKS ── -->
<section class="how-section" id="how">
  <div class="sec-label reveal">How it works</div>
  <h2 class="sec-h2 reveal">Priya's story.<br><span>And maybe yours.</span></h2>
  <p class="sec-p reveal" style="margin-bottom:48px;">She'd been fine for a long time — officially. Here's what changed.</p>
  <div class="how-layout">
    <div class="how-steps">
      <div class="how-step reveal"><div class="hs-n">01</div><div><div class="hs-t">Take the free assessment</div><div class="hs-d">Priya did this at 11 PM, from her couch. 12 clinically validated questions. No login, no judgment, no obligation — just honest answers and an instant wellness profile.</div></div></div>
      <div class="how-step reveal d1"><div class="hs-n">02</div><div><div class="hs-t">We match you — you don't browse</div><div class="hs-d">She didn't scroll through profiles hoping. We matched her with Dr. Ananya — a CBT-trained psychologist who specialises in the exact thing Priya was carrying.</div></div></div>
      <div class="how-step reveal d2"><div class="hs-n">03</div><div><div class="hs-t">Your first session. Free.</div><div class="hs-d">Session one was free. By session three, Priya had words for feelings she'd been suppressing for two years. Between sessions, Calm AI checked in every morning.</div></div></div>
      <div class="how-step reveal d3"><div class="hs-n">04</div><div><div class="hs-t">The data shows what you feel</div><div class="hs-d">Week 8: sleep up 3 nights running, mood trend +18%, journal streak. Priya didn't just feel better — she could see why. That's the difference between therapy and getCalmly.</div></div></div>
    </div>
    <div class="how-visual reveal d1">
      <!-- Therapist match card (illustrated) -->
      <div class="how-card" style="padding:0;overflow:hidden;background:transparent;border:none;box-shadow:none;">
        <div class="therapist-match-card">
          <div class="tmc-label">✦ Your match · Based on your assessment</div>
          <div class="tmc-portrait">
            <!-- Illustrated portrait: Dr. Ananya Sharma -->
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
              <defs>
                <linearGradient id="pt-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFF0ED"/><stop offset="100%" stop-color="#E5F4EE"/></linearGradient>
                <clipPath id="pt-clip"><rect width="200" height="200"/></clipPath>
              </defs>
              <g clip-path="url(#pt-clip)">
                <rect width="200" height="200" fill="url(#pt-bg)"/>
                <circle cx="100" cy="85" r="72" fill="rgba(200,85,61,.05)"/>
                <!-- white coat body -->
                <path d="M0,200 L0,160 Q40,140 70,138 L85,134 Q100,130 115,134 L130,138 Q160,140 200,160 L200,200Z" fill="white"/>
                <!-- coat collar -->
                <path d="M85,134 L95,155 L100,148 L105,155 L115,134 Q100,145 85,134Z" fill="#E5F4EE"/>
                <!-- stethoscope -->
                <path d="M86,148 Q72,165 70,180" stroke="#1A7F7A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                <circle cx="69" cy="183" r="7" fill="none" stroke="#1A7F7A" stroke-width="2.5"/>
                <!-- neck -->
                <ellipse cx="100" cy="122" rx="13" ry="16" fill="#C07850"/>
                <!-- head -->
                <ellipse cx="100" cy="88" rx="42" ry="46" fill="#C07850"/>
                <!-- hair top -->
                <path d="M58,80 Q60,44 100,38 Q140,44 142,80 Q136,55 100,52 Q64,55 58,80Z" fill="#140A02"/>
                <ellipse cx="100" cy="42" rx="24" ry="14" fill="#140A02"/>
                <!-- hair sides -->
                <ellipse cx="60" cy="90" rx="7" ry="20" fill="#140A02"/>
                <ellipse cx="140" cy="90" rx="7" ry="20" fill="#140A02"/>
                <!-- bindi -->
                <circle cx="100" cy="71" r="2.5" fill="#C8553D"/>
                <!-- eyebrows -->
                <path d="M82,82 Q89,78 96,82" stroke="#140A02" stroke-width="2" fill="none" stroke-linecap="round"/>
                <path d="M104,82 Q111,78 118,82" stroke="#140A02" stroke-width="2" fill="none" stroke-linecap="round"/>
                <!-- eyes -->
                <ellipse cx="88" cy="92" rx="7.5" ry="8" fill="white"/>
                <ellipse cx="112" cy="92" rx="7.5" ry="8" fill="white"/>
                <circle cx="89" cy="93" r="5" fill="#140A02"/>
                <circle cx="113" cy="93" r="5" fill="#140A02"/>
                <circle cx="91" cy="90" r="1.6" fill="white" opacity="0.85"/>
                <circle cx="115" cy="90" r="1.6" fill="white" opacity="0.85"/>
                <!-- nose subtle -->
                <path d="M97,106 Q100,111 103,106" stroke="#9A6040" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <!-- warm smile -->
                <path d="M86,116 Q100,127 114,116" stroke="#8A4030" stroke-width="2" fill="none" stroke-linecap="round"/>
                <path d="M90,118 Q100,126 110,118" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="3" stroke-linecap="round"/>
              </g>
            </svg>
          </div>
          <div class="tmc-body">
            <div class="tmc-badge">✓ RCI Verified · Clinical Psychologist</div>
            <div class="tmc-name">Dr. Ananya Sharma</div>
            <div class="tmc-meta">8 years · CBT · Anxiety & Work Stress</div>
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
            <a href="/assess" class="tmc-btn">Book your free session →</a>
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
      <div class="sec-label reveal">What getCalmly actually does</div>
      <h2 class="sec-h2 reveal">Not just an app.<br><span>A care system.</span></h2>
    </div>
    <p class="sec-p reveal">Every feature exists because a patient or therapist needed it. Here's what that looks like in practice.</p>
  </div>
  <div class="feat-grid">
    <div class="feat-card dk reveal"><span class="feat-icon">🤖</span><div class="feat-t">Calm AI — checks in, doesn't check out</div><div class="feat-d">At 1 AM when Priya couldn't sleep, Calm AI noticed she hadn't journaled in 3 days and her mood had dipped. It didn't give advice — it asked one question. That's the difference.</div><span class="feat-badge fb-dk">Powered by Claude</span></div>
    <div class="feat-card reveal d1"><span class="feat-icon">📊</span><div class="feat-t">Mood, energy & sleep — tracked together</div><div class="feat-d">Priya didn't know her Sundays were the problem until she saw the data. Mood, energy and sleep tracked daily, patterns surfaced weekly — for her and for Dr. Ananya.</div><span class="feat-badge fb-c">Science-backed</span></div>
    <div class="feat-card reveal d2"><span class="feat-icon">📓</span><div class="feat-t">Journal that reads between the lines</div><div class="feat-d">Write whatever comes. getCalmly reads for themes — self-criticism, boundary patterns, progress moments — and adds them to the brief Dr. Ananya reads before every session.</div><span class="feat-badge fb-c">Pattern detection</span></div>
    <div class="feat-card reveal"><span class="feat-icon">🩺</span><div class="feat-t">RCI-verified. Not wellness coaches.</div><div class="feat-d">Every therapist on getCalmly holds a Rehabilitation Council of India registration. Psychiatrists are NMC-registered. Verified credentials, not just good reviews.</div><span class="feat-badge fb-g">Clinically verified</span></div>
    <div class="feat-card reveal d1"><span class="feat-icon">🏥</span><div class="feat-t">Care that follows you if it needs to</div><div class="feat-d">When something needs more than therapy, getCalmly connects you to hospital partners. Referral letters, session notes, and progress reports are structured for clinical handoff.</div><span class="feat-badge fb-c">Hospital-ready</span></div>
    <div class="feat-card reveal d2"><span class="feat-icon">👥</span><div class="feat-t">A community, not a forum</div><div class="feat-d">Shruti typed "I actually laughed today" in the Depression Support Circle after 3 months. 142 people hit ❤️. Human moderation means it stays safe. Crisis support is built in.</div><span class="feat-badge fb-g">Safe & moderated</span></div>
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

<!-- ── 8 WEEKS ── -->
<section class="eight-weeks-section">
  <div class="sec-label reveal">The transformation</div>
  <h2 class="sec-h2 reveal">What 8 weeks looks like<br><span>for most people.</span></h2>
  <p class="sec-p reveal" style="margin-bottom:52px;">Based on how patients on getCalmly actually progress — not projections, just patterns we've observed.</p>
  <div class="weeks-track reveal">
    <div class="wk-line"></div>
    <div class="wk-item">
      <div class="wk-dot" style="background:var(--coral-pale);border:2px solid var(--coral);"></div>
      <div class="wk-label">Week 1</div>
      <div class="wk-card">
        <div class="wk-tag" style="color:var(--gray);background:var(--bg-warm);">Getting started</div>
        <div class="wk-title">Assessment complete. Matched with Dr. Ananya.</div>
        <div class="wk-body">"I didn't know what I was feeling had a name. The assessment gave me one."</div>
      </div>
    </div>
    <div class="wk-item">
      <div class="wk-dot" style="background:var(--coral-pale);border:2px solid var(--coral);"></div>
      <div class="wk-label">Week 3</div>
      <div class="wk-card">
        <div class="wk-tag" style="color:var(--coral);background:var(--coral-pale);">First shift</div>
        <div class="wk-title">Sleep tracking reveals a pattern. CBT framework introduced.</div>
        <div class="wk-body">"I never connected Sunday anxiety to Monday mornings until I saw the chart."</div>
      </div>
    </div>
    <div class="wk-item">
      <div class="wk-dot" style="background:rgba(61,158,114,.15);border:2px solid var(--green);"></div>
      <div class="wk-label">Week 6</div>
      <div class="wk-card">
        <div class="wk-tag" style="color:var(--green);background:var(--green-pale);">Building momentum</div>
        <div class="wk-title">Journal streak: 14 days. Mood trend: +12%.</div>
        <div class="wk-body">"Calm AI caught that I hadn't eaten properly two days in a row. My therapist had already flagged it."</div>
      </div>
    </div>
    <div class="wk-item">
      <div class="wk-dot" style="background:var(--green-pale);border:2px solid var(--green);"></div>
      <div class="wk-label">Week 8</div>
      <div class="wk-card" style="border-color:rgba(61,158,114,.25);">
        <div class="wk-tag" style="color:var(--green);background:var(--green-pale);">↑ Measurable change</div>
        <div class="wk-title">Sleep avg 7.5h. Mood +18%. "I actually laughed today."</div>
        <div class="wk-body">"I don't know when it shifted. The data does."</div>
      </div>
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
  <div class="sec-label reveal">Real people. Real change.</div>
  <h2 class="sec-h2 reveal">You already met Priya.<br><span>Here's who else.</span></h2>
  <div class="t3-grid">
    <div class="testi-card reveal" style="border-color:rgba(200,85,61,.15);"><div class="stars">★★★★★</div><div class="testi-q">I'd been carrying something heavy for so long I forgot it was there. Dr. Ananya helped me put it down. Calm AI checked in on the days I forgot to check in on myself.</div><div class="testi-auth"><div class="testi-av">P</div><div><div class="testi-nm">Priya R., 28</div><div class="testi-dt">Software engineer · 4 months in</div></div></div></div>
    <div class="testi-card reveal d1"><div class="stars">★★★★★</div><div class="testi-q">I didn't believe app-based therapy could be real. Then Dr. Rohan read my journal brief before our second session and opened with exactly the right question. That was it for me.</div><div class="testi-auth"><div class="testi-av" style="background:var(--green-pale);color:var(--green);">K</div><div><div class="testi-nm">Karan M., 34</div><div class="testi-dt">Finance · 7 months in</div></div></div></div>
    <div class="testi-card reveal d2"><div class="stars">★★★★★</div><div class="testi-q">Week 3, getCalmly flagged that my anxiety spiked every Sunday. I knew something was off on Sundays. I just didn't know that's what it was. Seeing it in data made it real — and fixable.</div><div class="testi-auth"><div class="testi-av" style="background:#EEF0FB;color:#7B7FCC;">A</div><div><div class="testi-nm">Aditya S., 26</div><div class="testi-dt">Design student · 2 months in</div></div></div></div>
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
