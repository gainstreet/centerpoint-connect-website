/* ROOFTOP 0.7 — awarded quotes become playable repair runs with touch-first field mini-games. */
'use strict';
(()=>{
 const previous=window.createRoofUpgrades;
 if(typeof previous!=='function')return;
 window.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),{world,renderer}=api;
  const state=()=>api.get(),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),money=v=>'$'+Math.round(v||0).toLocaleString();
  let observer=null,qaTimer=0,qaStarted=0,qaPhase=0,lastStamp='';

  function ensureProfile(){const p=state().profile;if(!Number.isFinite(p.delivered))p.delivered=0;if(!Number.isFinite(p.deliveryValue))p.deliveryValue=0;if(!Array.isArray(p.badges))p.badges=[];return p}
  function ensureRun(){
   const r=state().run;if(!r)return null;
   if(!r.repairV7||r.repairV7.version!==1)r.repairV7={version:1,active:false,complete:false,stage:'',drainDone:false,seamDone:false,qaDone:false,fastDrain:false,qaMisses:0,qaHits:0,balanceApplied:false,balance:0,bonus:0};
   return r.repairV7;
  }
  function quote(){return state().run?.quoteV6||null}
  function eligible(){const r=state().run,q=quote(),x=ensureRun();return !!(r?.complete&&q?.resolved&&q.accepted&&x&&!x.complete)}
  function buzz(pattern){try{navigator.vibrate?.(pattern)}catch{}}
  function scope(){
   const r=state().run||{},out=[];
   if(r.findings?.drain?.rec==='maintenance')out.push({id:'drain',name:'Clear and service roof drain'});
   if(r.findings?.seam?.rec==='repair')out.push({id:'seam',name:'Prep and reinforce open seam'});
   if(!out.length)out.push({id:'survey',name:'Targeted leak-source field verification'});
   out.push({id:'qa',name:'QA moisture scan and closeout'});return out;
  }
  function repairVisuals(){
   if(world.repairV7)return world.repairV7;
   const seamData=[];R3.box(seamData,0,.025,0,5.3,.05,.58,'#607f83');R3.box(seamData,0,.065,0,4.9,.035,.16,'#c7d6cd');
   const seam=R3.node(renderer.mesh(seamData),43,world.roofY+.085,-30);seam.visible=false;
   const drainData=[];R3.cylinder(drainData,0,.06,0,.93,.12,'#87a2a3',18);R3.cylinder(drainData,0,.14,0,.56,.09,'#263c47',18);
   const drain=R3.node(renderer.mesh(drainData),58,world.roofY+.12,-40);drain.visible=false;
   const flagData=[];R3.box(flagData,0,.7,0,.07,1.4,.07,'#d8c46e');R3.box(flagData,.42,1.15,0,.85,.48,.06,'#f0d265');
   const flag=R3.node(renderer.mesh(flagData),46,world.roofY+.03,-28);flag.visible=false;
   world.nodes.push(seam,drain,flag);world.repairV7={seam,drain,flag};return world.repairV7;
  }
  function syncVisuals(){const r=ensureRun(),v=repairVisuals();if(!r)return;v.seam.visible=!!r.seamDone;v.drain.visible=!!r.drainDone;v.flag.visible=!!r.complete}
  function updateDeliveryStats(){
   const p=ensureProfile();let strip=$('careerStrip');if(strip&&!$('deliveredStat')){const e=document.createElement('span');e.id='deliveredStat';strip.appendChild(e)}
   if($('deliveredStat'))$('deliveredStat').innerHTML=`<b>${p.delivered}</b> DELIVERED`;
   let pill=$('deliveryPill');if(!pill){pill=document.createElement('div');pill.id='deliveryPill';pill.className='delivery-pill hidden';document.getElementById('hud')?.appendChild(pill)}
   if(pill){pill.classList.toggle('hidden',!eligible());pill.textContent=eligible()?'CONTRACT READY TO DELIVER':''}
  }
  function titleResume(){
   let btn=$('repairContinue');if(!btn){btn=document.createElement('button');btn.id='repairContinue';btn.className='repair-continue hidden';btn.textContent='▰ RESUME CONTRACT →';document.querySelector('#titleScreen .start-row')?.appendChild(btn);btn.onclick=()=>api.start(true,false)}
   try{const s=JSON.parse(localStorage.getItem('rooftop-v3-run')||'null'),pending=s?.complete&&s?.quoteV6?.resolved&&s.quoteV6.accepted&&!(s.repairV7?.complete);btn?.classList.toggle('hidden',!pending)}catch{btn?.classList.add('hidden')}
  }
  function injectRepairCTA(){
   const r=state().run,x=ensureRun();if(!r||!x)return;syncVisuals();updateDeliveryStats();
   const body=$('sheetBody'),actions=$('sheetActions');if(!body||!actions)return;
   if(x.complete){
    if(!body.querySelector('.delivery-result-card')&&(body.querySelector('.quote-result-card')||body.querySelector('.contract-stamp'))){const card=document.createElement('div');card.className='delivery-result-card';card.innerHTML=`<span><small>FOLLOW-UP WORK</small><strong>DELIVERED · ${money(x.balance+x.bonus)}</strong></span><b>✓ CLOSED</b>`;body.prepend(card)}
    actions.querySelectorAll('[data-repair-action]').forEach(n=>n.remove());return;
   }
   if(!eligible())return;
   const isAccepted=body.textContent.includes('CONTRACT AWARDED')||body.textContent.includes('ACCEPTED')||body.querySelector('.contract-stamp.won');
   if(!isAccepted||actions.querySelector('[data-repair-action]'))return;
   const b=document.createElement('button');b.className='primary repair-action';b.dataset.repairAction='1';b.textContent='MOBILIZE REPAIR CREW →';b.onclick=mobilize;actions.prepend(b);
  }
  function show(tag,title,body,buttons){clearInterval(qaTimer);qaTimer=0;api.show(tag,title,body,buttons);setTimeout(injectRepairCTA,0)}
  function mobilize(){
   const q=quote(),x=ensureRun(),items=scope();if(!q?.accepted||!x)return api.toast('Win a follow-up contract before mobilizing repair work.');
   if(x.complete)return deliveryComplete();
   x.active=true;x.stage='mobilize';api.save();
   show('REPAIR RUN / WESTGATE','You sold the work. Now deliver it.',`<div class="mobilize-card"><span>CONTRACT VALUE</span><b>${money(q.price)}</b><small>${money(q.deposit)} deposit received · ${money(q.price-q.deposit)} due on completion</small></div><div class="repair-scope"><small>FIELD-VERIFIED WORK ORDER</small>${items.map((x,i)=>`<p><b>${String(i+1).padStart(2,'0')}</b> ${x.name}</p>`).join('')}</div><p class="note">Touch-first arcade simulation. Fictional pricing and simplified work steps — not installation or safety training.</p>`,[{label:'LOAD MATERIALS & START →',fn:startRepair},{label:'BACK TO RESULTS',secondary:true,fn:api.results}]);
  }
  function startRepair(){const x=ensureRun();if(!x)return;x.active=true;const tasks=scope().map(x=>x.id);if(tasks.includes('drain')&&!x.drainDone)return drainStage();if(tasks.includes('seam')&&!x.seamDone)return seamStage();return qaStage()}
  function drainStage(){
   const x=ensureRun();x.stage='drain';api.save();const start=performance.now();
   show('REPAIR RUN / TASK 1','Clean Sweep: service the drain.',`<p>Tap every piece of debris around the drain. Clear it in under <strong>12 seconds</strong> for a workmanship bonus.</p><div id="drainGame" class="drain-game" aria-label="Roof drain debris clearing game"><div class="drain-core"><span>ROOF<br>DRAIN</span></div>${Array.from({length:9},(_,i)=>`<button class="debris d${i}" aria-label="Remove debris ${i+1}">◆</button>`).join('')}</div><div class="repair-meter"><span id="drainProgress">0 / 9 CLEARED</span><b id="drainClock">12.0</b></div>`,[{label:'BACK TO CONTRACT',secondary:true,fn:mobilize}]);
   let cleared=0,done=false;const timer=setInterval(()=>{if(done){clearInterval(timer);return}const left=Math.max(0,12-(performance.now()-start)/1000);if($('drainClock'))$('drainClock').textContent=left.toFixed(1)},80);
   document.querySelectorAll('#drainGame .debris').forEach(b=>b.onclick=()=>{if(done||b.classList.contains('gone'))return;b.classList.add('gone');cleared++;buzz(15);if($('drainProgress'))$('drainProgress').textContent=cleared+' / 9 CLEARED';if(cleared===9){done=true;clearInterval(timer);x.fastDrain=(performance.now()-start)<12000;x.drainDone=true;x.stage='';syncVisuals();api.save();api.chime();buzz([18,35,18]);setTimeout(()=>scope().some(t=>t.id==='seam')&&!x.seamDone?seamStage():qaStage(),350)}});
  }
  function seamStage(){
   const x=ensureRun();x.stage='seam';api.save();
   show('REPAIR RUN / TASK '+(x.drainDone?'2':'1'),'Roll the seam.',`<p>Press the roller and drag all the way across the repair strip. Complete <strong>three clean passes</strong>.</p><div class="seam-game"><div id="seamTrack" class="seam-track"><div id="seamFill" class="seam-fill"></div><div id="roller" class="roller">▣</div></div><div class="pass-dots"><i></i><i></i><i></i><span id="passText">PASS 1 / 3</span></div></div><p class="note">Tip: drag left-to-right. Lift your finger after each pass.</p>`,[{label:'BACK TO CONTRACT',secondary:true,fn:mobilize}]);
   const track=$('seamTrack'),roller=$('roller'),fill=$('seamFill');if(!track)return;let pointer=null,passes=0,max=.03;
   const reset=()=>{max=.03;roller.style.left='3%';fill.style.width='3%'};reset();
   track.onpointerdown=e=>{pointer=e.pointerId;try{track.setPointerCapture?.(e.pointerId)}catch{}move(e)};
   track.onpointermove=e=>{if(pointer===e.pointerId)move(e)};
   track.onpointerup=track.onpointercancel=e=>{if(pointer!==e.pointerId)return;pointer=null;if(max>=.92){passes++;buzz(20);[...document.querySelectorAll('.pass-dots i')].forEach((n,i)=>n.classList.toggle('done',i<passes));if(passes>=3){x.seamDone=true;x.stage='';syncVisuals();api.save();api.chime();setTimeout(qaStage,330);return}if($('passText'))$('passText').textContent='PASS '+(passes+1)+' / 3'}reset()};
   function move(e){const b=track.getBoundingClientRect(),p=clamp((e.clientX-b.left)/Math.max(1,b.width),.03,.97);max=Math.max(max,p);roller.style.left=(p*100)+'%';fill.style.width=(p*100)+'%'}
  }
  function qaStage(){
   const x=ensureRun();x.stage='qa';api.save();qaStarted=performance.now();qaPhase=Math.random()*Math.PI*2;
   show('REPAIR RUN / FINAL QA','Lock three dry readings.',`<p>Run a simplified moisture scan over the repaired area. Tap <strong>LOCK READING</strong> while the scanner is inside the yellow target zone.</p><div class="qa-game"><div class="qa-track"><div class="qa-zone"></div><div id="qaCursor" class="qa-cursor"></div></div><div class="qa-readings"><span id="qaHits">0 / 3 LOCKED</span><span id="qaMisses">0 MISSES</span></div><button id="lockReading" class="qa-lock">LOCK READING</button></div><p class="note">This is a fictional arcade meter, not a moisture-testing procedure.</p>`,[{label:'BACK TO CONTRACT',secondary:true,fn:mobilize}]);
   const pos=()=>50+45*Math.sin((performance.now()-qaStarted)/620+qaPhase);qaTimer=setInterval(()=>{const p=pos();if($('qaCursor'))$('qaCursor').style.left=p+'%'},30);
   $('lockReading').onclick=()=>{const p=pos(),hit=p>=41&&p<=59;if(hit){x.qaHits++;api.chime();buzz([12,20,12])}else{x.qaMisses++;buzz(35)}if($('qaHits'))$('qaHits').textContent=x.qaHits+' / 3 LOCKED';if($('qaMisses'))$('qaMisses').textContent=x.qaMisses+' MISSES';if(x.qaHits>=3){clearInterval(qaTimer);qaTimer=0;x.qaDone=true;x.stage='';api.save();setTimeout(finishRepair,350)}};
  }
  function finishRepair(){
   const s=state(),r=s.run,p=ensureProfile(),x=ensureRun(),q=quote();if(!r||!x||!q?.accepted)return;
   if(!x.balanceApplied){x.balanceApplied=true;x.complete=true;x.active=false;x.balance=Math.max(0,q.price-q.deposit);x.bonus=x.fastDrain&&x.qaMisses<=1?100:0;p.cash+=x.balance+x.bonus;p.rep=clamp(p.rep+4,0,100);p.delivered+=1;p.deliveryValue+=q.price;if(!p.badges.includes('first-delivery'))p.badges.push('first-delivery');if(x.bonus&&!p.badges.includes('clean-closeout'))p.badges.push('clean-closeout');api.saveProfile();api.save();api.updateStats();api.chime();buzz([25,35,25,35,65])}
   syncVisuals();updateDeliveryStats();deliveryComplete();
  }
  function deliveryComplete(){
   const x=ensureRun(),q=quote();if(!x?.complete||!q)return;
   show('CONTRACT CLOSED / WESTGATE','Work delivered. Balance collected.',`<div class="delivery-stamp">REPAIR COMPLETE</div><div class="delivery-money"><span>CONTRACT BALANCE</span><b>${money(x.balance)}</b></div>${x.bonus?`<div class="delivery-bonus"><b>+$${x.bonus}</b><span>CLEAN CLOSEOUT BONUS</span></div>`:''}<div class="after-work"><div><small>DRAIN</small><b>${x.drainDone?'CLEARED':'VERIFIED'}</b></div><div><small>SEAM</small><b>${x.seamDone?'ROLLED':'VERIFIED'}</b></div><div><small>QA</small><b>${x.qaMisses<=1?'CLEAN':'COMPLETE'}</b></div></div><p>You inspected it, sold it, and delivered it. That closes the loop from service call to paid contract.</p><p class="note">Fictional arcade economics. Real roofing work requires trained crews, site-specific procedures and applicable safety requirements.</p>`,[{label:'BACK TO SHIFT RESULTS',fn:api.results},{label:'PLAY ANOTHER SHIFT',secondary:true,fn:()=>{api.close();api.start(false,false)}}]);
  }
  function onStart(){base.onStart?.();ensureProfile();ensureRun();syncVisuals();updateDeliveryStats();setTimeout(injectRepairCTA,0)}
  function finished(){base.finished?.();ensureProfile();ensureRun();syncVisuals();updateDeliveryStats();setTimeout(injectRepairCTA,0)}
  function hud(){base.hud?.();const s=state(),x=ensureRun();if(!x)return;const stamp=[s.run?.id,x.complete,x.stage,s.modal].join('|');if(stamp!==lastStamp){lastStamp=stamp;syncVisuals();updateDeliveryStats();setTimeout(injectRepairCTA,0)}}
  function frame(dt,t){base.frame?.(dt,t);const v=world.repairV7;if(v?.flag?.visible)v.flag.y=world.roofY+.03+Math.sin(t*2.2)*.025}
  function garage(back){return base.garage?.(back)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}

  repairVisuals();titleResume();updateDeliveryStats();
  const sheet=$('sheet');if(sheet&&window.MutationObserver){observer=new MutationObserver(()=>injectRepairCTA());observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))window.__ROOFTOP_V7={mobilize,startRepair,drainStage,seamStage,qaStage,finishRepair,eligible,state:()=>state(),injectRepairCTA};}catch{}
  return {...base,onStart,finished,hud,frame,garage,scoreCard,nextTarget,photoBlocked,mobilize};
 };
})();
