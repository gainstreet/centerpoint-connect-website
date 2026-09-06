/* ROOFTOP 0.11 — Dispatch Board: selectable service-call contracts that turn existing field systems into replayable missions. */
'use strict';
(()=>{
 const previous=window.createRoofUpgrades;
 if(typeof previous!=='function')return;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const JOBS=[
  {id:'leak',kicker:'SERVICE CALL',name:'Leak Investigation',fee:0,rank:'OPEN',icon:'◉',copy:'Run the core Westgate inspection. Document the roof, make the calls, and protect the relationship.',goal:'Submit a 70+ inspection.',check:r=>({ok:(r.score||0)>=70,items:[[(r.score||0)>=70,'70+ inspection score']]})},
  {id:'maintenance',kicker:'MAINTENANCE',name:'Preventive Sweep',fee:250,rank:'FIELD PRO',icon:'⌁',copy:'The client wants the roof left better than you found it. Inspect, document and clear every debris pickup.',goal:'70+ score · 12/12 Clean Sweep · 3 findings.',check:r=>{const score=(r.score||0)>=70,sweep=(r.bonusV5?.collected?.length||0)>=12,findings=Object.keys(r.findings||{}).length>=3;return {ok:score&&sweep&&findings,items:[[score,'70+ inspection score'],[findings,'3 documented findings'],[sweep,'12/12 Clean Sweep']]}}},
  {id:'audit',kicker:'QUALITY AUDIT',name:'Documentation Audit',fee:300,rank:'ROOF BOSS',icon:'▣',copy:'A property group is auditing field documentation. Bring back three usable evidence photos and a strong report.',goal:'80+ score · 3 photos rated 2★ or better.',check:r=>{const score=(r.score||0)>=80,grades=r.photoV9?.grades||{},ids=['drain','seam','patch'],photos=ids.every(id=>(grades[id]?.stars||0)>=2);return {ok:score&&photos,items:[[score,'80+ inspection score'],[photos,'3 usable evidence photos (2★+)']]}}}
 ];
 function evaluate(jobId,run){const job=JOBS.find(j=>j.id===jobId)||JOBS[0],result=job.check(run||{});return {job,ok:!!result.ok,items:result.items||[]}}
 window.ROOFTOP_V11_HELPERS={JOBS:JOBS.map(({check,...j})=>j),evaluate};
 window.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get();
  let pendingJob=null,jobButton=null,hudChip=null,lastStamp='',observer=null;
  function ensureProfile(){const p=state().profile;if(!Number.isFinite(p.dispatchJobs))p.dispatchJobs=0;if(!Number.isFinite(p.dispatchStreak))p.dispatchStreak=0;if(!Number.isFinite(p.dispatchBest))p.dispatchBest=0;return p}
  function ensureRun(){const r=state().run;if(!r)return null;if(!r.dispatchV11||r.dispatchV11.version!==1){const id=pendingJob||'leak';r.dispatchV11={version:1,job:id,applied:false,success:null,bonus:0};pendingJob=null}return r.dispatchV11}
  function money(v){return '$'+Math.round(v||0).toLocaleString()}
  function job(){const x=ensureRun();return JOBS.find(j=>j.id===x?.job)||JOBS[0]}
  function ensureUI(){
   if(!jobButton){jobButton=document.createElement('button');jobButton.id='dispatchEntry';jobButton.className='dispatch-entry';jobButton.innerHTML='<span>▤</span><b>DISPATCH BOARD</b><small>3 JOB TYPES</small>';jobButton.onclick=dispatchBoard;const garage=$('garageEntry');garage?.insertAdjacentElement('afterend',jobButton)}
   if(!hudChip){hudChip=document.createElement('div');hudChip.id='dispatchChip';hudChip.className='dispatch-chip hidden';hudChip.innerHTML='<span>DISPATCH</span><b>LEAK INVESTIGATION</b><small>CORE SERVICE CALL</small>';document.getElementById('hud')?.appendChild(hudChip)}
  }
  function cardMarkup(j,p){const unlocked=j.id==='leak'||p.best>=(j.id==='maintenance'?70:80);return `<button class="dispatch-card ${unlocked?'':'locked'}" data-job="${j.id}" ${unlocked?'':'disabled'}><span class="dispatch-icon">${j.icon}</span><span class="dispatch-copy"><small>${j.kicker} · ${j.rank}</small><strong>${j.name}</strong><em>${j.copy}</em><i>${j.goal}</i></span><span class="dispatch-pay">${j.fee?'+$'+j.fee:'CORE'}<small>${j.fee?'BONUS':'JOB'}</small></span></button>`}
  function dispatchBoard(){
   const p=ensureProfile();api.show('DISPATCH / WESTGATE DISTRICT','Pick the kind of call you want to run.',`<div class="dispatch-summary"><span><b>${p.dispatchJobs}</b> dispatch jobs cleared</span><span><b>${p.dispatchStreak}</b> current streak</span><span><b>${p.dispatchBest}</b> best streak</span></div><div id="dispatchJobs">${JOBS.map(j=>cardMarkup(j,p)).join('')}</div><p class="note">Dispatch bonuses are fictional. Missing a challenge never reduces the normal inspection payout or core score.</p>`,[{label:'BACK',secondary:true,fn:api.close}]);
   document.querySelectorAll('.dispatch-card[data-job]').forEach(b=>b.onclick=()=>selectJob(b.dataset.job));
  }
  function selectJob(id){const j=JOBS.find(x=>x.id===id)||JOBS[0];pendingJob=j.id;api.close();api.start(false,true);setTimeout(()=>api.toast(j.name+' · '+j.goal),80)}
  function syncHUD(){ensureUI();const s=state(),r=s.run,x=ensureRun();if(!s.started||!r||r.complete){hudChip.classList.add('hidden');return}const j=job();hudChip.classList.remove('hidden');hudChip.querySelector('b').textContent=j.name.toUpperCase();hudChip.querySelector('small').textContent=j.fee?j.goal.toUpperCase():'CORE SERVICE CALL';hudChip.classList.toggle('challenge',j.id!=='leak')}
  function injectResult(){const s=state(),r=s.run,x=ensureRun(),body=$('sheetBody');if(!r?.complete||!x||x.success===null||!body||body.querySelector('.dispatch-result'))return;const outcome=evaluate(x.job,r),j=outcome.job;const card=document.createElement('div');card.className='dispatch-result '+(x.success?'won':'missed');card.innerHTML=`<div><small>DISPATCH / ${j.kicker}</small><strong>${j.name}</strong><span>${outcome.items.map(([ok,label])=>`${ok?'✓':'○'} ${label}`).join(' · ')}</span></div><b>${x.success&&j.fee?'+'+money(j.fee):x.success?'CLEARED':'CORE PAY SAFE'}</b>`;body.prepend(card)}
  function onStart(){base.onStart?.();ensureProfile();const x=ensureRun();ensureUI();lastStamp='';syncHUD();if(x&&x.job!=='leak'){const j=job();setTimeout(()=>api.toast('DISPATCH: '+j.name+' · '+j.goal),260)}}
  function finished(){base.finished?.();const s=state(),r=s.run,p=ensureProfile(),x=ensureRun();if(!r||!x)return;if(!x.applied){const result=evaluate(x.job,r);x.applied=true;x.success=result.ok;x.bonus=result.ok?result.job.fee:0;if(result.ok){if(result.job.fee){p.cash+=result.job.fee;r.pay=(Number(r.pay)||0)+result.job.fee}p.dispatchJobs+=1;p.dispatchStreak+=1;p.dispatchBest=Math.max(p.dispatchBest,p.dispatchStreak);if(!p.badges.includes('dispatcher'))p.badges.push('dispatcher');api.chime();try{navigator.vibrate?.([18,30,18,30,45])}catch{}}else if(result.job.id!=='leak'){p.dispatchStreak=0}api.saveProfile();api.save();api.updateStats()}syncHUD();setTimeout(injectResult,0)}
  function hud(){base.hud?.();const s=state(),x=ensureRun();if(!x)return;const stamp=[s.run?.id,s.run?.complete,s.modal,s.photoMode,x.job,x.success].join('|');if(stamp!==lastStamp){lastStamp=stamp;syncHUD();setTimeout(injectResult,0)}}
  function frame(dt,t){base.frame?.(dt,t);if(hudChip&&!hudChip.classList.contains('hidden')&&job().id!=='leak')hudChip.style.setProperty('--dispatch-pulse',String(.55+.45*Math.sin(t*2.2)))}
  function recorded(f){base.recorded?.(f)}function garage(back){return base.garage?.(back)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureProfile();ensureUI();
  if($('quickStart')){$('quickStart').textContent='CHOOSE A JOB →';$('quickStart').onclick=dispatchBoard}
  const sheet=$('sheet');if(sheet&&window.MutationObserver){observer=new MutationObserver(()=>injectResult());observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))window.__ROOFTOP_V11={evaluate,JOBS,dispatchBoard,selectJob,state:()=>state(),ensureRun}}catch{}
  return {...base,onStart,finished,hud,frame,recorded,garage,scoreCard,nextTarget,photoBlocked,dispatchBoard};
 };
})();
