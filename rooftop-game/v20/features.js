/* ROOFTOP 0.20 — Cause & Origin diagnostic decision challenge. */
'use strict';
((g)=>{
 const BONUS=125;
 const CORRECT='investigate';
 const CHOICES=[
  {id:'seam',label:'The open membrane seam caused the leak.',tone:'suspect'},
  {id:'drain',label:'The blocked drain caused the leak.',tone:'suspect'},
  {id:'patch',label:'The previous repair failed again.',tone:'suspect'},
  {id:'investigate',label:'Not proven yet — document suspects and recommend further investigation.',tone:'pro'}
 ];
 function evaluate(choice){return {choice,correct:choice===CORRECT,bonus:choice===CORRECT?BONUS:0}}
 g.ROOFTOP_V20_HELPERS={BONUS,CORRECT,CHOICES,evaluate};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get();
  let entry=null,observer=null,lastStamp='',toneCtx=null;
  function ensureRun(){
   const r=state().run;if(!r)return null;
   if(!r.diagnosticV20||r.diagnosticV20.version!==1)r.diagnosticV20={version:1,attempted:false,choice:null,correct:null,bonus:0,applied:false,announced:false};
   return r.diagnosticV20;
  }
  function findingsReady(){const r=state().run;return !!(r&&Object.keys(r.findings||{}).length>=3)}
  function vibrate(p){try{navigator.vibrate?.(p)}catch{}}
  function tone(success){
   const s=state();if(!s.profile?.sound)return;
   try{
    if(!toneCtx)toneCtx=new (g.AudioContext||g.webkitAudioContext)();if(toneCtx.state==='suspended')toneCtx.resume();
    const now=toneCtx.currentTime,notes=success?[523,659,784]:[330,277];
    notes.forEach((freq,i)=>{const o=toneCtx.createOscillator(),gain=toneCtx.createGain();o.type='sine';o.frequency.value=freq;o.connect(gain);gain.connect(toneCtx.destination);const t=now+i*.09;gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(.055,t+.018);gain.gain.exponentialRampToValueAtTime(.001,t+.22);o.start(t);o.stop(t+.24)});
   }catch{}
  }
  function ensureUI(){
   if(entry)return entry;
   entry=document.createElement('button');entry.id='diagnosticEntryV20';entry.className='diagnostic-entry-v20 hidden';entry.innerHTML='<span class="diag-pulse-v20">◇</span><span><small>CAUSE + ORIGIN</small><b>CALL THE SOURCE</b></span><em>+$125</em>';
   entry.onclick=openDiagnostic;document.getElementById('hud')?.appendChild(entry);return entry;
  }
  function choiceMarkup(c){return `<button class="diagnostic-choice-v20 ${c.tone==='pro'?'pro-v20':''}" data-diag-choice="${c.id}"><span>${c.id==='investigate'?'04':'0'+(CHOICES.indexOf(c)+1)}</span><b>${c.label}</b><i>${c.id==='investigate'?'PRO CALL':'CLAIM SOURCE'}</i></button>`}
  function evidenceMarkup(){
   return '<div class="diagnostic-evidence-v20"><div><small>01 / DRAIN</small><b>OBSTRUCTED</b><span>Maintenance condition</span></div><div><small>02 / SEAM</small><b>OPEN LAP</b><span>Repair condition</span></div><div><small>03 / PATCH</small><b>SOUND</b><span>Monitor condition</span></div></div>';
  }
  function openDiagnostic(){
   const x=ensureRun(),s=state();if(!x||!findingsReady()||s.run?.complete)return;
   api.show('FIELD DIAGNOSTIC / WESTGATE','Jordan asks: “So what caused the leak?”',`${evidenceMarkup()}<div class="diagnostic-brief-v20"><span>CAUSE + ORIGIN CHECK</span><p>You found real roof conditions, but a visible defect is not automatically proof of the reported interior leak source. Make the owner-operator call.</p></div><div id="diagnosticChoicesV20" class="diagnostic-choices-v20">${CHOICES.map(choiceMarkup).join('')}</div><p class="note">This is a game decision, not a substitute for a real diagnostic protocol.</p>`,[{label:'BACK TO ROOF',secondary:true,fn:api.close}]);
   document.querySelectorAll('[data-diag-choice]').forEach(b=>b.onclick=()=>submitChoice(b.dataset.diagChoice));sync();
  }
  function resultBody(out){
   if(out.correct)return `${evidenceMarkup()}<div class="diagnostic-result-v20 won-v20"><span>✓</span><div><small>OWNER-OPERATOR CALL</small><b>NO GUESSWORK.</b><p>You separated observed conditions from proven cause. Document the suspects and recommend targeted further investigation before naming the leak source.</p></div><em>+$${BONUS}<small>DIAGNOSTIC BONUS BANKED</small></em></div>`;
   const picked=CHOICES.find(c=>c.id===out.choice)?.label||'A roof condition was named as the source.';
   return `${evidenceMarkup()}<div class="diagnostic-result-v20 missed-v20"><span>△</span><div><small>CAUSE NOT PROVEN</small><b>DON’T OUTRUN THE EVIDENCE.</b><p>${picked} That may be a valid condition to address, but this inspection alone does not prove it caused the reported interior leak.</p></div><em>CORE PAY SAFE<small>NO BONUS</small></em></div><p class="diagnostic-coach-v20">Best call: document suspect conditions and recommend further investigation rather than invent certainty.</p>`;
  }
  function submitChoice(choice){
   const x=ensureRun();if(!x||x.attempted)return;const out=evaluate(choice);x.attempted=true;x.choice=choice;x.correct=out.correct;x.bonus=out.bonus;api.save();tone(out.correct);vibrate(out.correct?[15,28,15,28,40]:[28,36,28]);
   api.show('FIELD DIAGNOSTIC / DECISION',out.correct?'That’s the professional call.':'That conclusion is too certain.',resultBody(out),[{label:'RETURN TO FIELD REPORT',fn:()=>{api.close();api.toast(out.correct?'DIAGNOSTIC COMPLETE · $125 bonus banked for closeout.':'DIAGNOSTIC COMPLETE · Core inspection pay is unchanged.')}}]);
   sync();
  }
  function sync(){
   ensureUI();const s=state(),x=ensureRun();if(!entry||!x)return;
   const show=!!(s.started&&s.run?.onRoof&&!s.run?.complete&&!s.photoMode&&!s.modal&&findingsReady()&&!x.attempted);
   entry.classList.toggle('hidden',!show);
  }
  function injectResult(){
   const s=state(),x=ensureRun(),body=$('sheetBody');if(!s.run?.complete||!x?.attempted||!body||body.querySelector('.diagnostic-closeout-v20'))return;
   const card=document.createElement('div');card.className='diagnostic-closeout-v20 '+(x.correct?'won-v20':'missed-v20');
   card.innerHTML=x.correct?`<span>CAUSE + ORIGIN</span><b>✓ NO GUESSWORK</b><em>+$${BONUS} DIAGNOSTIC</em>`:'<span>CAUSE + ORIGIN</span><b>△ SOURCE NOT PROVEN</b><em>CORE PAY SAFE</em>';
   body.prepend(card);
  }
  function applyReward(){
   const s=state(),r=s.run,p=s.profile,x=ensureRun();if(!r||!p||!x||x.applied||!x.correct)return;
   x.applied=true;p.cash=(Number(p.cash)||0)+BONUS;p.rep=Math.min(100,(Number(p.rep)||0)+2);r.pay=(Number(r.pay)||0)+BONUS;
   if(!Array.isArray(p.badges))p.badges=[];if(!p.badges.includes('no-guesswork'))p.badges.push('no-guesswork');
   api.saveProfile();api.save();api.updateStats();api.chime();vibrate([12,22,12,22,42]);
  }
  function onStart(){base.onStart?.();ensureRun();ensureUI();lastStamp='';sync()}
  function recorded(f){base.recorded?.(f);const x=ensureRun();sync();if(findingsReady()&&x&&!x.attempted&&!x.announced){x.announced=true;api.save();setTimeout(()=>api.toast('CAUSE + ORIGIN UNLOCKED · Call the source for a $125 diagnostic bonus.'),420)}}
  function finished(){base.finished?.();applyReward();sync();setTimeout(injectResult,0)}
  function hud(){base.hud?.();const s=state(),x=ensureRun();if(!x)return;const stamp=[s.run?.id,s.run?.onRoof,s.run?.complete,s.photoMode,s.modal,Object.keys(s.run?.findings||{}).length,x.attempted,x.correct].join('|');if(stamp!==lastStamp){lastStamp=stamp;sync();setTimeout(injectResult,0)}}
  function frame(dt,t){base.frame?.(dt,t);if(entry&&!entry.classList.contains('hidden'))entry.style.setProperty('--diag-pulse-v20',String(.58+.42*Math.sin(t*3.4)))}
  function garage(back){if(entry)entry.classList.add('hidden');return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureUI();
  const sheet=$('sheet');if(sheet&&g.MutationObserver){observer=new MutationObserver(()=>injectResult());observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V20={evaluate,ensureRun,openDiagnostic,submitChoice,sync,state:()=>state()};}catch{}
  return {...base,onStart,recorded,finished,hud,frame,garage,scoreCard,nextTarget,photoBlocked,openDiagnostic};
 };
})(typeof window!=='undefined'?window:globalThis);
