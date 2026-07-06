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

  // Priya journey chapter player: auto-advance via the progress bar's
  // animationend (so pausing the bar pauses everything). Click to jump.
  var chSteps=[].slice.call(document.querySelectorAll('.how-step'));
  var chCards=[].slice.call(document.querySelectorAll('.chap-card'));
  var chSec=document.querySelector('.how-section');
  if(chSteps.length && chCards.length && chSec && !reduce){
    var chI=0;
    function chGo(i){
      chI=((i%chSteps.length)+chSteps.length)%chSteps.length;
      chSteps.forEach(function(s,j){
        s.classList.toggle('chap-on', j===chI);
        var b=s.querySelector('.hs-bar span');
        if(b){ b.style.animation='none'; }
      });
      chCards.forEach(function(c,j){ c.classList.toggle('chap-show', j===chI); });
      var bar=chSteps[chI].querySelector('.hs-bar span');
      if(bar){ void bar.offsetWidth; bar.style.animation=''; }
    }
    chSteps.forEach(function(s,i){
      s.addEventListener('click',function(){ chGo(i); });
      var b=s.querySelector('.hs-bar span');
      if(b){ b.addEventListener('animationend',function(){
        if(s.classList.contains('chap-on')) chGo(chI+1);
      }); }
    });
    // pause while off-screen or while the reader hovers the section
    var chObs=new IntersectionObserver(function(es){
      es.forEach(function(e){ chSec.classList.toggle('chap-paused', !e.isIntersecting); });
    },{threshold:.2});
    chObs.observe(chSec);
    var chLayout=chSec.querySelector('.how-layout');
    if(chLayout){
      chLayout.addEventListener('mouseenter',function(){ chSec.classList.add('chap-paused'); });
      chLayout.addEventListener('mouseleave',function(){ chSec.classList.remove('chap-paused'); });
    }
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
