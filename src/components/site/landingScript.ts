// Landing interactions ported from the brand mockup, minus the assessment modal
// (we route to the older multi-step /assess flow instead). Runs via an injected
// <script> so the inline onclick handlers in the markup resolve against globals.
export const LANDING_SCRIPT = `
(function(){
  var nav=document.getElementById('nav');
  if(nav){window.addEventListener('scroll',function(){nav.classList.toggle('stuck',window.scrollY>40);});}

  var obs=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting)x.target.classList.add('in');});},{threshold:.1});
  document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});

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

  // Priya scrollytelling: pinned, scroll-driven with damping (lerp).
  // A continuous position (0..n-1) follows the scroll with easing; every
  // frame each step/card gets opacity+translate from its distance to that
  // position — no snapping, everything glides.
  var steps=[].slice.call(document.querySelectorAll('.how-step'));
  var cards=[].slice.call(document.querySelectorAll('.scly-card'));
  var scroller=document.querySelector('.scly-scroller');
  var desktop=window.matchMedia('(min-width: 861px)');
  if(steps.length && cards.length && scroller && !reduce){
    var n=steps.length, pos=0, target=0, raf=null;
    function apply(el, d, drift){
      // d = distance from the current position (0 = fully active)
      var a=Math.max(0, 1-Math.abs(d)*1.45);           // opacity falloff
      a=a*a*(3-2*a);                                    // smoothstep
      el.style.opacity=a;
      el.style.transform='translateY('+(d*drift)+'px)';
      el.style.pointerEvents=a>0.6?'auto':'none';
    }
    function frame(){
      pos+=(target-pos)*0.085;                          // damping
      if(Math.abs(target-pos)<0.0005) pos=target;
      for(var i=0;i<n;i++){
        apply(steps[i], i-pos, -64);                    // steps drift up & away
        apply(cards[i], i-pos, -84);                    // cards drift a bit more (parallax)
      }
      raf=(pos!==target)?requestAnimationFrame(frame):null;
    }
    function onScrollScly(){
      if(!desktop.matches){
        for(var i=0;i<n;i++){ steps[i].style.cssText=''; cards[i].style.cssText=''; }
        return;
      }
      var r=scroller.getBoundingClientRect();
      var total=scroller.offsetHeight-window.innerHeight;
      var p=total>0?Math.min(1,Math.max(0,(-r.top)/total)):0;
      // small plateaus at each step so every pair gets a moment to rest
      target=Math.min(n-1, Math.max(0, p*(n-0.4)));
      if(raf===null) raf=requestAnimationFrame(frame);
    }
    window.addEventListener('scroll',onScrollScly,{passive:true});
    window.addEventListener('resize',onScrollScly);
    onScrollScly(); pos=target; if(desktop.matches){ frame(); }
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
