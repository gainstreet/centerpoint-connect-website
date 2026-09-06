/* ROOFTOP 0.22 — evidence camera quality / steady-lock inspection gameplay. */
'use strict';
((g)=>{
 const LOCK_SCORE=68;
 const LOCK_SECONDS=.42;
 const MASTER_AVG=82;
 const BONUS=85;
 function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v))}
 function scoreFrame(point,width,height){
  if(!point||!point.visible||!Number.isFinite(point.x)||!Number.isFinite(point.y)||width<=0||height<=0)return 0;
  const nx=(point.x-width/2)/(width*.5),ny=(point.y-height/2)/(height*.5),rad=Math.hypot(nx,ny);
  const center=clamp(1-rad/.92);
  const edgeX=clamp((1-Math.abs(nx))/.24),edgeY=clamp((1-Math.abs(ny))/.24);
  const edge=Math.min(edgeX,edgeY);
  return Math.round(100*clamp(center*.84+edge*.16));
 }
 function averageScores(scores){const vals=Object.values(scores||{}).filter(Number.isFinite);return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0}
 function qualityLabel(score,locked=false){if(locked)return 'LOCKED';if(score>=LOCK_SCORE)return 'HOLD STEADY';if(score>=46)return 'CENTER DETAIL';return 'FIND DETAIL'}
 g.ROOFTOP_V22_HELPERS={LOCK_SCORE,LOCK_SECONDS,MASTER_AVG,BONUS,clamp,scoreFrame,averageScores,qualityLabel};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get();
  let card=null,grid=null,chip=null,observer=null,target=null,lastMode=false,score=0,lock=0,locked=false,pendingQuality=null,lastGateToast=0,toneCtx=null;
  function ensureRun(){
   const r=state().run;if(!r)return null;
   if(!r.cameraQaV22||r.cameraQaV22.version!==1)r.cameraQaV22={version:1,scores:{},banked:false,applied:false,announced:false};
   if(!r.cameraQaV22.scores||typeof r.cameraQaV22.scores!=='object')r.cameraQaV22.scores={};
   return r.cameraQaV22;
  }
  function vibrate(pattern){try{navigator.vibrate?.(pattern)}catch{}}
  function beep(freq=660,d=.055,gain=.035){
   if(!state().profile?.sound)return;
   try{if(!toneCtx)toneCtx=new (g.AudioContext||g.webkitAudioContext)();if(toneCtx.state==='suspended')toneCtx.resume();const o=toneCtx.createOscillator(),v=toneCtx.createGain(),t=toneCtx.currentTime;o.type='sine';o.frequency.value=freq;o.connect(v);v.connect(toneCtx.destination);v.gain.setValueAtTime(.001,t);v.gain.linearRampToValueAtTime(gain,t+.008);v.gain.exponentialRampToValueAtTime(.001,t+d);o.start(t);o.stop(t+d+.02)}catch{}
  }
  function nearestFocus(){
   const s=state();if(!s.photoMode||!s.player)return null;let best=null,d=Infinity;
   for(const f of api.conditions||[]){const n=Math.hypot(s.player.x-f.x,s.player.z-f.z);if(n<d){d=n;best=f}}
   return d<4.2?best:null;
  }
  function ensureUI(){
   if(!card){
    card=document.createElement('div');card.id='evidenceCameraV22';card.className='evidence-camera-v22 hidden';
    card.innerHTML='<div class="evidence-camera-top-v22"><span>FIELD CAMERA QA</span><b id="evidenceTargetV22">ROOF DETAIL</b></div><div class="evidence-score-row-v22"><strong id="evidenceScoreV22">0</strong><div><small id="evidenceLabelV22">FIND DETAIL</small><div class="evidence-lockbar-v22"><i id="evidenceLockV22"></i></div></div></div><p id="evidenceTipV22">Drag to frame the condition.</p>';
    document.getElementById('hud')?.appendChild(card);
   }
   if(!grid){
    grid=document.createElement('div');grid.id='evidenceGridV22';grid.className='evidence-grid-v22 hidden';grid.setAttribute('aria-hidden','true');grid.innerHTML='<i></i><i></i><i></i><i></i><span class="third-v22 a"></span><span class="third-v22 b"></span><span class="third-v22 c"></span><span class="third-v22 d"></span>';
    document.body.appendChild(grid);
   }
   if(!chip){
    chip=document.createElement('div');chip.id='evidenceChipV22';chip.className='evidence-chip-v22 hidden';chip.innerHTML='<span>◎</span><b>EVIDENCE QA</b><em id="evidenceChipScoreV22">0 / 3</em>';
    document.getElementById('hud')?.appendChild(chip);
   }
   const action=$('action');
   if(action&&!action.dataset.qaGateV22){action.dataset.qaGateV22='1';action.addEventListener('click',gateShutter,true)}
   if(!g.__ROOFTOP_V22_KEY_GATE){g.__ROOFTOP_V22_KEY_GATE=true;g.addEventListener('keydown',gateKey,true)}
  }
  function projection(){
   target=nearestFocus();if(!target)return null;
   try{return api.renderer.project([target.x,api.world.roofY+.2,target.z])}catch{return null}
  }
  function compute(){
   const canvas=api.renderer?.canvas||$('game'),box=canvas?.getBoundingClientRect?.();if(!box)return 0;return scoreFrame(projection(),box.width,box.height)
  }
  function ready(){return locked&&score>=LOCK_SCORE&&!!target}
  function gate(reason){
   if(ready()){pendingQuality=Math.max(score,pendingQuality||0);beep(920,.07,.045);vibrate(12);return true}
   const now=performance.now();if(now-lastGateToast>900){lastGateToast=now;api.toast(score>=LOCK_SCORE?'Hold steady until the camera locks.':'Center the roof detail before taking the evidence photo.');beep(240,.06,.025);vibrate(18)}
   reason?.preventDefault?.();reason?.stopImmediatePropagation?.();return false;
  }
  function gateShutter(e){const s=state();if(!s.photoMode||s.modal)return;gate(e)}
  function gateKey(e){const s=state();if(e.code!=='KeyE'||!s.photoMode||s.modal)return;gate(e)}
  function updateCard(){
   ensureUI();const s=state(),qa=ensureRun(),active=!!(s.started&&s.photoMode&&!s.modal&&target);
   card?.classList.toggle('hidden',!active);grid?.classList.toggle('hidden',!active);document.body.classList.toggle('evidence-qa-active-v22',active);
   if(active){
    const lab=qualityLabel(score,locked),tip=locked?'Evidence frame locked. Capture when ready.':score>=LOCK_SCORE?'Keep the phone steady for a clean evidence frame.':score>=46?'Move the condition closer to the center reticle.':'Drag around the detail until it is clearly framed.';
    $('evidenceTargetV22').textContent=target.title.toUpperCase();$('evidenceScoreV22').textContent=score;$('evidenceLabelV22').textContent=lab;$('evidenceTipV22').textContent=tip;$('evidenceLockV22').style.width=Math.round(lock*100)+'%';card.style.setProperty('--qa-score-v22',String(score/100));card.classList.toggle('locked-v22',locked);
   }
   const count=Object.keys(qa?.scores||{}).length,avg=averageScores(qa?.scores);chip?.classList.toggle('hidden',!(s.started&&s.run?.onRoof&&!s.photoMode&&count>0));if($('evidenceChipScoreV22'))$('evidenceChipScoreV22').textContent=count+' / 3'+(count===3?' · '+avg+' AVG':'');
  }
  function annotateCaptureSheet(){
   const s=state(),body=$('sheetBody'),tag=$('sheetTag');if(!s.modal||!s.photoMode||!body||!tag?.textContent?.startsWith('PHOTO CAPTURED')||body.querySelector('.evidence-capture-v22'))return;
   const q=Math.max(0,Math.round(pendingQuality||score||0)),badge=document.createElement('div');badge.className='evidence-capture-v22';badge.innerHTML=`<span>FIELD CAMERA QA</span><b>${q} / 100 · ${q>=MASTER_AVG?'PRO-GRADE FRAME':q>=LOCK_SCORE?'USABLE EVIDENCE':'WEAK FRAME'}</b><small>${q>=MASTER_AVG?'Centered, steady documentation.':q>=LOCK_SCORE?'Clear enough for the field report.':'Consider retaking for stronger documentation.'}</small>`;body.prepend(badge)
  }
  function maybeBankMastery(){
   const qa=ensureRun(),s=state();if(!qa||qa.banked)return;const vals=Object.values(qa.scores).filter(Number.isFinite);if(vals.length<3)return;const avg=averageScores(qa.scores);if(avg<MASTER_AVG)return;qa.banked=true;if(!Array.isArray(s.profile.badges))s.profile.badges=[];if(!s.profile.badges.includes('evidence-pro'))s.profile.badges.push('evidence-pro');api.saveProfile();api.save();api.toast(`EVIDENCE PRO · ${avg} average. $${BONUS} quality bonus banked for closeout.`);api.chime();vibrate([12,18,12,18,34]);
  }
  function recorded(f){
   base.recorded?.(f);const qa=ensureRun();if(!qa||!f)return;const q=Math.max(LOCK_SCORE,Math.round(pendingQuality||score||LOCK_SCORE));qa.scores[f.id]=Math.max(Number(qa.scores[f.id])||0,q);pendingQuality=null;api.save();maybeBankMastery();updateCard();
  }
  function applyReward(){
   const s=state(),r=s.run,qa=ensureRun();if(!r||!qa?.banked||qa.applied)return;qa.applied=true;s.profile.cash=(Number(s.profile.cash)||0)+BONUS;s.profile.rep=Math.min(100,(Number(s.profile.rep)||0)+1);r.pay=(Number(r.pay)||0)+BONUS;api.saveProfile();api.save();api.updateStats();
  }
  function injectResult(){
   const s=state(),qa=ensureRun(),body=$('sheetBody');if(!s.run?.complete||!qa||!body||body.querySelector('.evidence-closeout-v22'))return;const count=Object.keys(qa.scores).length;if(!count)return;const avg=averageScores(qa.scores),card=document.createElement('div');card.className='evidence-closeout-v22';card.innerHTML=`<span>EVIDENCE CAMERA QA</span><b>${count} / 3 PHOTOS · ${avg} AVG</b><em>${qa.banked?`+$${BONUS} QUALITY BONUS`:'PRO-GRADE TARGET · 82 AVG'}</em><small>${qa.banked?'Evidence Pro badge unlocked · +1 reputation':'Recheck details next shift and hold steady for cleaner documentation.'}</small>`;body.prepend(card)
  }
  function sync(){
   ensureUI();const s=state(),qa=ensureRun();if(!qa)return;
   if(s.photoMode&&!qa.announced){qa.announced=true;api.save();setTimeout(()=>api.toast('FIELD CAMERA QA · Center the detail, then hold steady until the frame locks.'),250)}
   updateCard();annotateCaptureSheet();
  }
  function onStart(){base.onStart?.();ensureRun();target=null;score=0;lock=0;locked=false;pendingQuality=null;lastMode=false;document.body.classList.remove('evidence-qa-active-v22');card?.classList.add('hidden');grid?.classList.add('hidden');sync()}
  function finished(){base.finished?.();applyReward();document.body.classList.remove('evidence-qa-active-v22');card?.classList.add('hidden');grid?.classList.add('hidden');setTimeout(injectResult,0)}
  function hud(){
   base.hud?.();const s=state();target=nearestFocus();sync();const action=$('action');if(action&&s.photoMode&&!s.modal){const ok=ready();action.disabled=!ok;$('actionText').textContent=ok?'SHUTTER':'HOLD STEADY';$('actionIcon').textContent=ok?'◎':'◉';action.classList.toggle('evidence-ready-v22',ok)}else action?.classList.remove('evidence-ready-v22');setTimeout(annotateCaptureSheet,0);setTimeout(injectResult,0)
  }
  function frame(dt,t){
   base.frame?.(dt,t);const s=state(),active=!!(s.started&&s.photoMode&&!s.modal);if(!active){if(lastMode){lastMode=false;target=null;score=0;lock=0;locked=false;updateCard()}return}
   if(!lastMode){lastMode=true;lock=0;locked=false;pendingQuality=null}
   target=nearestFocus();score=compute();if(score>=LOCK_SCORE){lock=clamp(lock+dt/LOCK_SECONDS)}else{lock=clamp(lock-dt*2.8)}
   if(lock>=1&&!locked){locked=true;beep(760,.08,.04);vibrate([8,16,18])}if(score<LOCK_SCORE-10&&locked){locked=false;lock=Math.min(lock,.55)}
   if(card)card.style.setProperty('--qa-breathe-v22',String(.5+.5*Math.sin(t*4.4)));updateCard();
  }
  function garage(back){document.body.classList.remove('evidence-qa-active-v22');return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}
  function nextTarget(){return base.nextTarget?.()}
  function photoBlocked(eye,t){return base.photoBlocked?.(eye,t)||false}
  ensureUI();const sheet=$('sheet');if(sheet&&g.MutationObserver){observer=new MutationObserver(()=>{annotateCaptureSheet();injectResult()});observer.observe(sheet,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V22={scoreFrame,averageScores,qualityLabel,ensureRun,nearestFocus,state:()=>state(),ready:()=>ready(),metrics:()=>({score,lock,locked,target:target?.id,pendingQuality})};}catch{}
  return {...base,onStart,recorded,finished,hud,frame,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
