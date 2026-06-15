// Interactions ported verbatim from the brand mockup, run via an injected <script>.
export const LANDING_SCRIPT = `
function switchTab(id, el) {
  document.querySelectorAll('.preview-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
  document.getElementById('pane-' + id).classList.add('active');
  el.classList.add('active');
  document.querySelectorAll('#pane-' + id + ' .reveal').forEach(r => {
    r.classList.remove('in');
    setTimeout(() => r.classList.add('in'), 60);
  });
}

window.addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('stuck',scrollY>40));

const obs=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('in');}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

function selOpt(el){el.closest('.quiz-opts').querySelectorAll('.quiz-opt').forEach(o=>o.classList.remove('sel'));el.classList.add('sel');}

const Qs=[
  {q:"In the past two weeks, how often have you felt down, depressed, or hopeless?",opts:["Not at all","Several days","More than half the days","Nearly every day"]},
  {q:"How often have you had little interest or pleasure in doing things you used to enjoy?",opts:["Not at all","Several days","More than half the days","Nearly every day"]},
  {q:"How often have you felt nervous, anxious, or on edge?",opts:["Not at all","Several days","More than half the days","Nearly every day"]},
  {q:"How difficult has it been to control your worrying?",opts:["Not difficult","Somewhat difficult","Very difficult","Extremely difficult"]},
  {q:"How would you describe your sleep over the past month?",opts:["Generally restful","Occasionally disrupted","Frequently disturbed","Severely affected"]},
  {q:"How often does stress from work or responsibilities feel overwhelming?",opts:["Rarely","Sometimes","Often","Almost always"]},
  {q:"How connected do you feel to the people in your life right now?",opts:["Very connected","Mostly connected","Somewhat isolated","Very isolated"]},
  {q:"How often do you have moments of genuine calm or peace?",opts:["Most days","A few times a week","Rarely","Almost never"]},
  {q:"How confident are you in managing difficult emotions when they arise?",opts:["Very confident","Somewhat confident","Not very confident","Not at all"]},
  {q:"Have you experienced major life stressors in the past 6 months?",opts:["No significant changes","One significant event","Multiple events","Ongoing major crisis"]},
  {q:"How would you describe your relationship with your own thoughts?",opts:["Generally peaceful","Occasional rumination","Frequent negativity","Constant mental noise"]},
  {q:"What are you most hoping getCalmly can help you with?",opts:["Managing anxiety","Improving mood","Navigating relationships","Building resilience"]},
];
let cur=0;const ans=[];

function openModal(){cur=0;ans.length=0;renderQ();document.getElementById('modalOverlay').classList.add('open');document.body.style.overflow='hidden';}
function closeModal(){document.getElementById('modalOverlay').classList.remove('open');document.body.style.overflow='';}
function closeBg(e){if(e.target===document.getElementById('modalOverlay'))closeModal();}

function renderQ(){
  const q=Qs[cur];
  document.getElementById('pFill').style.width=((cur+1)/Qs.length*100)+'%';
  document.getElementById('mEye').textContent=\`Free Mental Wellness Assessment · Question \${cur+1} of 12\`;
  const mq=document.getElementById('mQ');
  mq.style.cssText='opacity:0;transform:translateY(8px)';
  setTimeout(()=>{mq.textContent=q.q;mq.style.cssText='opacity:1;transform:translateY(0);transition:all .25s';},60);
  const mo=document.getElementById('mOpts');
  mo.style.opacity='0';
  setTimeout(()=>{
    mo.innerHTML=q.opts.map((o,i)=>\`<div class="modal-opt\${ans[cur]===i?' sel':''}" onclick="selA(this,\${i})">\${o}</div>\`).join('');
    mo.style.opacity='1';mo.style.transition='opacity .2s';
  },100);
  document.querySelector('.modal-back').style.opacity=cur===0?'0.3':'1';
  document.querySelector('.modal-back').disabled=cur===0;
  document.getElementById('mNext').textContent=cur===Qs.length-1?'See my results →':'Continue →';
}

function selA(el,i){ans[cur]=i;document.querySelectorAll('.modal-opt').forEach(o=>o.classList.remove('sel'));el.classList.add('sel');}
function nextQ(){
  if(ans[cur]===undefined){document.getElementById('mOpts').style.animation='shake .3s ease';setTimeout(()=>document.getElementById('mOpts').style.animation='',300);return;}
  if(cur<Qs.length-1){cur++;renderQ();}else showResults();
}
function prevQ(){if(cur>0){cur--;renderQ();}}

function showResults(){
  const score=ans.reduce((a,b)=>a+b,0);
  const level=score<=8?'Low':score<=18?'Moderate':'High';
  const c={Low:'#3D9E72',Moderate:'#C9973A',High:'#C8553D'}[level];
  document.getElementById('modal').innerHTML=\`
    <button class="modal-x" onclick="closeModal()">×</button>
    <div style="text-align:center;padding-top:8px;">
      <div style="font-size:42px;margin-bottom:10px;">✦</div>
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--coral);margin-bottom:10px;">Assessment complete</div>
      <div style="font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:28px;color:var(--charcoal);margin-bottom:6px;transform:scaleX(.9);transform-origin:center;display:block;letter-spacing:-.5px;">Your wellness profile is ready.</div>
      <p style="font-size:14px;color:var(--gray);margin-bottom:22px;line-height:1.6;">Based on your responses, here's what we found:</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:22px;">
        <div style="background:var(--bg-warm);border-radius:13px;padding:14px;border:1.5px solid var(--border);">
          <div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:5px;">Stress level</div>
          <div style="font-size:20px;font-weight:700;color:\${c};">\${level}</div>
        </div>
        <div style="background:var(--bg-warm);border-radius:13px;padding:14px;border:1.5px solid var(--border);">
          <div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:5px;">Recommended</div>
          <div style="font-size:13px;font-weight:600;color:var(--charcoal);">Weekly sessions</div>
        </div>
        <div style="background:var(--bg-warm);border-radius:13px;padding:14px;border:1.5px solid var(--border);">
          <div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:5px;">Matches found</div>
          <div style="font-size:13px;font-weight:600;color:var(--charcoal);">3 therapists</div>
        </div>
      </div>
      <p style="font-size:13px;color:var(--charcoal-l);background:var(--coral-pale);padding:13px 15px;border-radius:12px;margin-bottom:20px;line-height:1.6;text-align:left;">Your personalised care plan includes therapist matches, a suggested daily routine, and your first steps forward. Create your free account to unlock everything.</p>
      <button onclick="closeModal()" style="width:100%;padding:15px;border-radius:13px;background:var(--coral);color:white;border:none;font-size:15px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 6px 20px rgba(200,85,61,.32);">Create free account → See my full plan</button>
      <div style="font-size:11px;color:var(--gray);margin-top:10px;">No credit card required · Takes 30 seconds</div>
    </div>\`;
}
`;
