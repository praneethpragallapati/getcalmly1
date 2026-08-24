// Landing interactions ported from the brand mockup, minus the assessment modal
// (we route to the older multi-step /assess flow instead). Runs via an injected
// <script> so the inline onclick handlers in the markup resolve against globals.
export const LANDING_SCRIPT = `
(function(){
  var nav=document.getElementById('nav');
  if(nav){window.addEventListener('scroll',function(){nav.classList.toggle('stuck',window.scrollY>40);});}

  // Mark the page as reveal-capable ONLY once the observer is actually attached.
  // Until then the stylesheet runs a slow fade-in fallback, so a script error or
  // a browser without IntersectionObserver can never leave content stuck at
  // opacity:0 — which is what the CSS default is.
  var page=document.querySelector('.lp-page');
  try{
    var obs=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting)x.target.classList.add('in');});},{threshold:.1});
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(function(el){obs.observe(el);});
    if(page)page.classList.add('reveal-ready');
  }catch(err){
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(function(el){el.classList.add('in');});
  }
  // Safety net: if the observer misses an element that's already at/above the
  // fold on load (fast paint, tab restore), reveal it so nothing stays stuck at
  // opacity:0. Below-fold elements are left to animate on scroll as normal.
  setTimeout(function(){
    document.querySelectorAll('.reveal:not(.in), .reveal-l:not(.in), .reveal-r:not(.in)').forEach(function(el){
      if(el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    });
  },1400);

  window.switchTab=function(id, el){
    document.querySelectorAll('.preview-pane').forEach(function(p){p.classList.remove('active');});
    document.querySelectorAll('.ptab').forEach(function(t){t.classList.remove('active');});
    var pane=document.getElementById('pane-'+id); if(pane)pane.classList.add('active');
    el.classList.add('active');
    document.querySelectorAll('#pane-'+id+' .reveal').forEach(function(r){r.classList.remove('in');setTimeout(function(){r.classList.add('in');},60);});
  };

  window.selOpt=function(el){
    el.closest('.quiz-opts').querySelectorAll('.quiz-opt').forEach(function(o){o.classList.remove('sel');});
    el.classList.add('sel');
  };

  window.toggleFaq=function(btn){
    var item=btn.closest('.faq-item'); if(!item)return;
    var open=item.classList.contains('open');
    var list=item.closest('.faq-list');
    if(list){list.querySelectorAll('.faq-item.open').forEach(function(o){
      o.classList.remove('open');
      var b=o.querySelector('.faq-q'); if(b)b.setAttribute('aria-expanded','false');
    });}
    if(!open){item.classList.add('open');btn.setAttribute('aria-expanded','true');}
  };

  /* ── Animations ── */
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress bar
  var prog=document.createElement('div'); prog.id='gc-prog'; document.body.appendChild(prog);
  function onScroll(){
    var d=document.documentElement, max=d.scrollHeight-d.clientHeight;
    prog.style.width=(max>0?(d.scrollTop/max*100):0)+'%';
    if(!reduce){
      var y=window.scrollY;
      var o1=document.querySelector('.orb-1'); if(o1)o1.style.transform='translateY('+(y*0.18)+'px)';
      var o2=document.querySelector('.orb-2'); if(o2)o2.style.transform='translateY('+(y*-0.12)+'px)';
    }
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // Hero headline line-reveal
  var h1=document.querySelector('.hero-h1');
  if(h1){ requestAnimationFrame(function(){ h1.classList.add('reveal-in'); }); }

  // Hero kinetic line: swap the second line's phrase in place. The line has a
  // fixed row + the grid track is minmax(0,1fr), so nothing around it (or the
  // phone) reflows when the phrase changes.
  var heroRot=document.getElementById('heroRot');
  if(heroRot && !reduce){
    var heroPhrases=[
      'the mask you wear at work.',
      'the \\u201cI\\u2019m fine\\u201d you keep saying.',
      'the panic before the meeting.',
      'the worry that won\\u2019t switch off.',
      'the guilt that follows you home.',
      'the heaviness of every morning.'
    ];
    var hpi=0;
    setInterval(function(){
      hpi=(hpi+1)%heroPhrases.length;
      heroRot.classList.remove('swap');
      void heroRot.offsetWidth;
      heroRot.textContent=heroPhrases[hpi];
      heroRot.classList.add('swap');
      // 4.5s, matching the AI-insight card in the phone beside it: three items
      // on a 13.5s cycle, 4.5s each (.gc-cyc-item in landing.css). The two are
      // read together, and at 2.6s the headline was visibly racing the phone.
    },4500);
  }

  // Magnetic buttons
  if(!reduce){
    document.querySelectorAll('.btn-hero, .assess-big-btn').forEach(function(b){
      b.addEventListener('pointermove',function(e){
        var r=b.getBoundingClientRect();
        b.style.transform='translate('+((e.clientX-r.left-r.width/2)*0.2)+'px,'+((e.clientY-r.top-r.height/2)*0.32)+'px)';
      });
      b.addEventListener('pointerleave',function(){ b.style.transform=''; });
    });
  }

  // How-it-works journey: hover/click sync. The section stays still; pointing at
  // (or tapping) a step cross-fades the right-hand card to match.
  var chSteps=[].slice.call(document.querySelectorAll('.how-step'));
  var chCards=[].slice.call(document.querySelectorAll('.chap-card'));
  if(chSteps.length && chCards.length && !reduce){
    function chGo(i){
      chSteps.forEach(function(s,j){ s.classList.toggle('chap-on', j===i); });
      chCards.forEach(function(c,j){ c.classList.toggle('chap-show', j===i); });
    }
    chSteps.forEach(function(s,i){
      s.addEventListener('mouseenter',function(){ chGo(i); });
      s.addEventListener('click',function(){ chGo(i); });
    });
    chGo(0);
  }

  // Testimonials auto-scroll marquee: duplicate cards for a seamless loop
  var track=document.getElementById('testi-track');
  if(track){
    track.querySelectorAll('.testi-card').forEach(function(c){ c.classList.add('in'); });
    if(!reduce){
      var originals=[].slice.call(track.children);
      originals.forEach(function(c){ var cl=c.cloneNode(true); cl.setAttribute('aria-hidden','true'); track.appendChild(cl); });
    }
  }
})();
`;
