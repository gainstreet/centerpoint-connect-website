/* ROOFTOP 0.8 — optional 3D moisture-mapping side objective with mobile scanner HUD. */
'use strict';
(()=>{
 const previous=window.createRoofUpgrades;
 if(typeof previous!=='function')return;
 window.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),{world,renderer}=api;
  const state=()=>api.get(),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),money=v=>'$'+Math.round(v||0).toLocaleString();
  const targets=[
   {id:'north',name:'North parapet anomaly',x:36.5,z:-37.4},
   {id:'mid',name:'Mid-roof anomaly',x:50.8,z:-25.7},
   {id:'east',name:'East drainage anomaly',x:62.5,z:-43.2}
  ];
  let scanBtn=null,overlay=null,lockBtn=null,signalFill=null,signalText=null,heading=null,countEl=null,observer=null,lastHudStamp='',pulseAt=0,audioCtx=null;

  function ensureProfile(){
   const p=state().profile;
   if(!Number.isFinite(p.scans))p.scans=0;
   if(!Array.isArray(p.badges))p.badges=[];
   return p;
  }
  function ensureRun(){
   const r=state().run;if(!r)return null;
   if(!r.scanV8||r.scanV8.version!==1)r.scanV8={version:1,active:false,found:[],rewarded:false,bonus:125};
   if(!Array.isArray(r.scanV8.found))r.scanV8.found=[];
   return r.scanV8;
  }
  function buzz(pattern){try{navigator.vibrate?.(pattern)}catch{}}
  function beep(freq=520,duration=.07,gain=.025){
   const p=ensureProfile();if(!p.sound)return;
   try{
    if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended')audioCtx.resume();
    const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime;
    o.type='sine';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);
    o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+duration+.02);
   }catch{}
  }
  function scanVisuals(){
   if(world.scanV8)return world.scanV8;
   const markers={};
   for(const t of targets){
    const d=[];
    R3.cylinder(d,0,.04,0,.78,.08,'#f0d265',20);
    R3.cylinder(d,0,.13,0,.46,.11,'#24485b',18);
    R3.box(d,0,.29,0,.055,.32,.055,'#f0d265');
    const n=R3.node(renderer.mesh(d),t.x,world.roofY+.055,t.z);n.visible=false;world.nodes.push(n);markers[t.id]=n;
   }
   world.scanV8={markers};return world.scanV8;
  }
  function syncVisuals(){
   const x=ensureRun(),v=scanVisuals();if(!x)return;
   for(const t of targets)v.markers[t.id].visible=x.found.includes(t.id);
  }
  function ensureUI(){
   if(!scanBtn){
    scanBtn=document.createElement('button');scanBtn.id='scanButton';scanBtn.className='scan-button hidden';scanBtn.innerHTML='<span>⌁</span><b>MOISTURE MAP</b><small id="scanCount">0 / 3</small>';scanBtn.onclick=toggleScanner;document.getElementById('hud')?.appendChild(scanBtn);
   }
   if(!overlay){
    overlay=document.createElement('div');overlay.id='scanOverlay';overlay.className='scan-overlay hidden';overlay.innerHTML=`<div class="scan-topline"><span>FIELD SCANNER / FICTIONAL</span><b id="scanSignalText">SEARCHING</b></div><div class="scan-rings"><i></i><i></i><i></i><div id="scanHeading" class="scan-heading">▲</div><div class="scan-cross">+</div></div><div class="scan-meter"><span>SIGNAL</span><div><i id="scanSignalFill"></i></div><b id="scanDistance">—</b></div><p>Walk the roof. Strong signal = get closer. Lock only inside the target zone.</p><button id="scanLock" class="scan-lock" disabled>LOCK READING</button><button id="scanClose" class="scan-close">EXIT SCANNER</button>`;
    document.getElementById('hud')?.appendChild(overlay);
    lockBtn=$('scanLock');signalFill=$('scanSignalFill');signalText=$('scanSignalText');heading=$('scanHeading');countEl=$('scanCount');
    $('scanClose').onclick=()=>setActive(false);lockBtn.onclick=lockReading;
   }
   if(!countEl)countEl=$('scanCount');
  }
  function available(){
   const s=state(),x=ensureRun();return !!(s.started&&s.run&&s.run.onRoof&&!s.run.complete&&!s.photoMode&&!s.modal&&x);
  }
  function setActive(on){
   const x=ensureRun();if(!x)return;
   x.active=!!on&&available();
   overlay?.classList.toggle('hidden',!x.active);
   scanBtn?.classList.toggle('active',x.active);
   if(x.active){api.toast('Scanner online. Sweep the roof for three hidden anomalies.');buzz(12);beep(460,.06,.02)}
   api.save();
  }
  function toggleScanner(){const x=ensureRun();if(!x)return;if(!available()){api.toast('Moisture Map is available while you are walking the inspection roof.');return}setActive(!x.active)}
  function nearest(){
   const s=state(),x=ensureRun();if(!s.player||!x)return null;
   let best=null;
   for(const t of targets){if(x.found.includes(t.id))continue;const d=Math.hypot(s.player.x-t.x,s.player.z-t.z);if(!best||d<best.d)best={...t,d}}
   return best;
  }
  function reading(){
   const s=state(),n=nearest();if(!n||!s.player)return null;
   const strength=clamp(1-n.d/10,0,1),dx=n.x-s.player.x,dz=n.z-s.player.z;
   const worldAngle=Math.atan2(dx,dz),relative=Math.atan2(Math.sin(worldAngle-(s.player.yaw||0)),Math.cos(worldAngle-(s.player.yaw||0)));
   return {...n,strength,relative};
  }
  function updateScanner(now=performance.now()){
   const x=ensureRun();if(!x||!x.active||!overlay||overlay.classList.contains('hidden'))return;
   const q=reading();
   if(!q){signalFill.style.width='0%';signalText.textContent='MAP COMPLETE';heading.style.opacity='.25';lockBtn.disabled=true;return}
   const pct=Math.round(q.strength*100);signalFill.style.width=pct+'%';heading.style.transform=`translate(-50%,-50%) rotate(${q.relative}rad)`;heading.style.opacity=String(.35+.65*q.strength);
   const label=q.strength>.78?'LOCK ZONE':q.strength>.55?'STRONG':q.strength>.3?'MEDIUM':'WEAK';signalText.textContent=label;
   const d=$('scanDistance');if(d)d.textContent=q.d<2.2?'TARGET':Math.ceil(q.d)+'m';
   lockBtn.disabled=q.strength<.78;lockBtn.textContent=q.strength>=.78?'LOCK READING':'MOVE CLOSER';
   overlay.classList.toggle('hot',q.strength>.78);
   const interval=900-q.strength*650;if(q.strength>.18&&now-pulseAt>interval){pulseAt=now;beep(360+q.strength*420,.045,.012+q.strength*.012);if(q.strength>.65)buzz(8)}
  }
  function lockReading(){
   const x=ensureRun(),q=reading();if(!x||!q||q.strength<.78)return;
   if(x.found.includes(q.id))return;
   x.found.push(q.id);syncVisuals();api.save();api.chime();buzz([12,22,12]);beep(880,.11,.04);
   overlay?.classList.add('scan-hit');setTimeout(()=>overlay?.classList.remove('scan-hit'),360);
   api.toast(q.name+' mapped · '+x.found.length+'/3');
   if(x.found.length>=3)completeScan();
  }
  function completeScan(){
   const x=ensureRun(),p=ensureProfile();if(!x||x.rewarded)return;
   x.rewarded=true;x.active=false;p.cash+=x.bonus;p.rep=clamp((Number(p.rep)||0)+2,0,100);p.scans+=1;if(!p.badges.includes('leak-detective'))p.badges.push('leak-detective');
   api.saveProfile();api.save();api.updateStats();api.chime();buzz([25,35,25,35,60]);syncUI();
   api.show('SIDE OBJECTIVE COMPLETE / MOISTURE MAP','Three anomalies triangulated.',`<div class="scan-complete-card"><span>FIELD SURVEY BONUS</span><b>+${money(x.bonus)}</b><small>+2 reputation · Leak Detective badge unlocked</small></div><div class="scan-map-summary">${targets.map(t=>`<div><i>✓</i><span>${t.name}</span></div>`).join('')}</div><p>You used the fictional scanner to explore beyond the obvious visual findings. The survey bonus is separate from your inspection score.</p><p class="note">Arcade mechanic only. This is not a real moisture-mapping or leak-detection method.</p>`,[{label:'BACK TO INSPECTION',fn:()=>api.close()}]);
  }
  function syncUI(){
   ensureUI();const s=state(),x=ensureRun(),p=ensureProfile();if(!x)return;
   if(!available()&&x.active)x.active=false;
   scanBtn?.classList.toggle('hidden',!available()&&!(x.active&&s.run?.onRoof));
   overlay?.classList.toggle('hidden',!x.active);
   scanBtn?.classList.toggle('active',x.active);
   if(countEl)countEl.textContent=x.found.length+' / 3';
   scanBtn?.classList.toggle('complete',x.rewarded);
   if(x.rewarded&&scanBtn){scanBtn.querySelector('b').textContent='MAP COMPLETE';scanBtn.disabled=true}else if(scanBtn){scanBtn.querySelector('b').textContent='MOISTURE MAP';scanBtn.disabled=false}
   let strip=$('careerStrip');if(strip&&!$('scanStat')){const e=document.createElement('span');e.id='scanStat';strip.appendChild(e)}
   if($('scanStat'))$('scanStat').innerHTML=`<b>${p.scans}</b> SURVEYS`;
  }
  function injectResult(){
   const s=state(),x=ensureRun(),body=$('sheetBody');if(!s.run?.complete||!x?.rewarded||!body||body.querySelector('.scan-result-card'))return;
   const resultsText=body.textContent||'';if(!/SHIFT|SCORE|inspection|ROOF-SHARP|SOLID FIRST SHIFT|BACK TO THE FIELD/i.test(resultsText))return;
   const card=document.createElement('div');card.className='scan-result-card';card.innerHTML=`<span><small>MOISTURE MAP</small><strong>3 / 3 ANOMALIES</strong></span><b>+${money(x.bonus)}</b>`;body.prepend(card);
  }
  function onStart(){base.onStart?.();const x=ensureRun();ensureProfile();scanVisuals();syncVisuals();ensureUI();if(x)x.active=false;syncUI();setTimeout(injectResult,0)}
  function finished(){base.finished?.();ensureProfile();ensureRun();syncVisuals();syncUI();setTimeout(injectResult,0)}
  function hud(){base.hud?.();const s=state(),x=ensureRun();if(!x)return;const stamp=[s.run?.id,s.run?.onRoof,s.run?.complete,s.photoMode,s.modal,x.active,x.found.length,x.rewarded].join('|');if(stamp!==lastHudStamp){lastHudStamp=stamp;syncUI();setTimeout(injectResult,0)}}
  function frame(dt,t){base.frame?.(dt,t);updateScanner(performance.now());const v=world.scanV8;if(v){for(const t of targets){const n=v.markers[t.id];if(n.visible)n.y=world.roofY+.055+Math.sin(t*2.4+targets.indexOf(t))*.025}}}
  function garage(back){return base.garage?.(back)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}

  scanVisuals();ensureUI();syncUI();
  const sheet=$('sheet');if(sheet&&window.MutationObserver){observer=new MutationObserver(()=>injectResult());observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))window.__ROOFTOP_V8={toggleScanner,setActive,reading,lockReading,completeScan,state:()=>state(),targets,ensureRun,syncUI};}catch{}
  return {...base,onStart,finished,hud,frame,garage,scoreCard,nextTarget,photoBlocked};
 };
})();
