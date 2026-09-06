/* ROOFTOP 0.21 — mobile thermal roof sweep mini-game. */
'use strict';
((g)=>{
 const BONUS=110;
 const BATTERY=35;
 const BASE_HOTSPOTS=[
  {id:'a',x:.27,y:.64,label:'ZONE A',note:'Field anomaly'},
  {id:'b',x:.52,y:.39,label:'ZONE B',note:'Seam-side anomaly'},
  {id:'c',x:.78,y:.69,label:'ZONE C',note:'Drain-side anomaly'}
 ];
 function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
 function layoutFor(runId){
  const mode=hash(String(runId||'shift'))%4;
  return BASE_HOTSPOTS.map(p=>({...p,x:(mode===1||mode===3)?1-p.x:p.x,y:(mode===2||mode===3)?1-p.y:p.y}));
 }
 function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
 function nearest(pointer,spots,found=[]){
  let best=null,d=Infinity;for(const s of spots){if(found.includes(s.id))continue;const n=distance(pointer,s);if(n<d){d=n;best=s}}
  return {spot:best,distance:d,ready:!!best&&d<=.105};
 }
 g.ROOFTOP_V21_HELPERS={BONUS,BATTERY,BASE_HOTSPOTS,hash,layoutFor,distance,nearest};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get();
  let entry=null,overlay=null,canvas=null,ctx=null,captureBtn=null,statusEl=null,batteryEl=null,readingEl=null,chip=null,observer=null;
  let active=false,timeLeft=BATTERY,pointer={x:.5,y:.5},spots=[],rafStamp='',toneCtx=null,humOsc=null,humGain=null;
  function ensureProfile(){const p=state().profile;if(!Number.isFinite(p.thermalSweeps))p.thermalSweeps=0;if(!Array.isArray(p.badges))p.badges=[];return p}
  function ensureRun(){
   const r=state().run;if(!r)return null;
   if(!r.thermalV21||r.thermalV21.version!==1)r.thermalV21={version:1,complete:false,banked:false,applied:false,attempts:0,bestTime:null,found:[],announced:false};
   if(!Array.isArray(r.thermalV21.found))r.thermalV21.found=[];
   return r.thermalV21;
  }
  function vib(p){try{navigator.vibrate?.(p)}catch{}}
  function beep(freq=520,d=.08,gain=.045){
   if(!state().profile?.sound)return;
   try{if(!toneCtx)toneCtx=new (g.AudioContext||g.webkitAudioContext)();if(toneCtx.state==='suspended')toneCtx.resume();const o=toneCtx.createOscillator(),v=toneCtx.createGain(),t=toneCtx.currentTime;o.type='sine';o.frequency.value=freq;o.connect(v);v.connect(toneCtx.destination);v.gain.setValueAtTime(.001,t);v.gain.linearRampToValueAtTime(gain,t+.012);v.gain.exponentialRampToValueAtTime(.001,t+d);o.start(t);o.stop(t+d+.02)}catch{}
  }
  function startHum(){
   if(!state().profile?.sound)return;
   try{if(!toneCtx)toneCtx=new (g.AudioContext||g.webkitAudioContext)();if(toneCtx.state==='suspended')toneCtx.resume();stopHum();humOsc=toneCtx.createOscillator();humGain=toneCtx.createGain();humOsc.type='triangle';humOsc.frequency.value=74;humGain.gain.value=.012;humOsc.connect(humGain);humGain.connect(toneCtx.destination);humOsc.start()}catch{}
  }
  function stopHum(){try{humOsc?.stop()}catch{}humOsc=null;humGain=null}
  function ensureUI(){
   if(!entry){
    entry=document.createElement('button');entry.id='thermalEntryV21';entry.className='thermal-entry-v21 hidden';entry.innerHTML='<span class="thermal-icon-v21">⌁</span><span><small>OPTIONAL FIELD TOOL</small><b>THERMAL SWEEP</b></span><em>+$110</em>';entry.onclick=openScanner;document.getElementById('hud')?.appendChild(entry);
   }
   if(!chip){chip=document.createElement('div');chip.id='thermalChipV21';chip.className='thermal-chip-v21 hidden';chip.innerHTML='<span>⌁</span><b>THERMAL 3/3</b>';document.getElementById('hud')?.appendChild(chip)}
   if(!overlay){
    overlay=document.createElement('section');overlay.id='thermalOverlayV21';overlay.className='thermal-overlay-v21 hidden';overlay.setAttribute('aria-label','Thermal roof sweep');
    overlay.innerHTML='<div class="thermal-shell-v21"><header><div><small>WESTGATE / NON-DESTRUCTIVE SCREEN</small><h2>THERMAL SWEEP</h2></div><div class="thermal-battery-v21"><span>BATTERY</span><b id="thermalBatteryV21">35.0s</b></div></header><div class="thermal-instruction-v21">Drag the reticle across the roof plan. Lock three elevated thermal signatures before battery runs out.</div><div class="thermal-stage-v21"><canvas id="thermalCanvasV21" width="720" height="480" aria-label="Interactive thermal roof plan"></canvas><div class="thermal-reticle-v21"><i></i><i></i><span></span></div><div class="thermal-readout-v21"><small>SENSOR ΔT</small><b id="thermalReadingV21">+0.4°</b></div></div><div class="thermal-bottom-v21"><div class="thermal-progress-v21"><span data-thermal-dot="a">A</span><span data-thermal-dot="b">B</span><span data-thermal-dot="c">C</span><b id="thermalStatusV21">0 / 3 SIGNATURES LOCKED</b></div><button id="thermalCaptureV21" class="thermal-capture-v21" disabled>MOVE OVER A SIGNATURE</button><button id="thermalExitV21" class="thermal-exit-v21">EXIT TOOL</button></div><p class="thermal-note-v21">Game mechanic only. A thermal anomaly is not proof of moisture or leak source; real investigations require appropriate equipment, conditions, verification and safety procedures.</p></div>';
    document.body.appendChild(overlay);canvas=$('thermalCanvasV21');ctx=canvas.getContext('2d');captureBtn=$('thermalCaptureV21');statusEl=$('thermalStatusV21');batteryEl=$('thermalBatteryV21');readingEl=$('thermalReadingV21');captureBtn.onclick=captureReading;$('thermalExitV21').onclick=closeScanner;
    const move=e=>{if(!active)return;const b=canvas.getBoundingClientRect();pointer.x=Math.max(0,Math.min(1,(e.clientX-b.left)/b.width));pointer.y=Math.max(0,Math.min(1,(e.clientY-b.top)/b.height));updateReticle();updateReadout();draw()};
    canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture?.(e.pointerId);move(e)});canvas.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')move(e)});
   }
   return overlay;
  }
  function resizeCanvas(){if(!canvas)return;const b=canvas.getBoundingClientRect(),d=Math.min(1.5,g.devicePixelRatio||1),w=Math.max(320,Math.round(b.width*d)),h=Math.max(220,Math.round(b.height*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}}
  function openScanner(){
   const s=state(),x=ensureRun();if(!x||!s.run?.onRoof||s.run?.complete||s.photoMode||s.modal)return;
   ensureUI();spots=layoutFor(s.run.id);active=true;timeLeft=BATTERY;x.attempts=(x.attempts||0)+1;pointer={x:.5,y:.5};overlay.classList.remove('hidden');document.body.classList.add('thermal-active-v21');startHum();beep(420,.12,.035);vib(12);api.save();updateReticle();updateReadout();draw();
  }
  function closeScanner(){if(!active)return;active=false;overlay?.classList.add('hidden');document.body.classList.remove('thermal-active-v21');stopHum();sync()}
  function updateReticle(){const ret=overlay?.querySelector('.thermal-reticle-v21');if(!ret)return;ret.style.left=(pointer.x*100)+'%';ret.style.top=(pointer.y*100)+'%'}
  function current(){const x=ensureRun();return nearest(pointer,spots,x?.found||[])}
  function updateReadout(){
   const x=ensureRun(),n=current(),found=x?.found||[];let delta=.35;
   for(const s of spots){const d=distance(pointer,s),heat=Math.max(0,1-d/.30);delta=Math.max(delta,.4+heat*7.8)}
   if(readingEl)readingEl.textContent='+'+delta.toFixed(1)+'°';
   if(captureBtn){captureBtn.disabled=!n.ready;captureBtn.textContent=n.ready?'LOCK '+n.spot.label+' READING':'MOVE OVER A SIGNATURE';captureBtn.classList.toggle('ready-v21',n.ready)}
   if(statusEl)statusEl.textContent=found.length+' / 3 SIGNATURES LOCKED';
   overlay?.querySelectorAll('[data-thermal-dot]').forEach(el=>el.classList.toggle('done-v21',found.includes(el.dataset.thermalDot)));
  }
  function captureReading(){
   if(!active)return;const x=ensureRun(),n=current();if(!x||!n.ready){beep(250,.12,.035);vib(24);return}
   if(!x.found.includes(n.spot.id))x.found.push(n.spot.id);api.save();beep(740,.14,.06);vib([12,18,26]);updateReadout();draw();
   if(x.found.length>=spots.length){x.complete=true;x.banked=true;x.bestTime=x.bestTime==null?+(BATTERY-timeLeft).toFixed(1):Math.min(x.bestTime,+(BATTERY-timeLeft).toFixed(1));ensureProfile().thermalSweeps+=1;if(!state().profile.badges.includes('heat-signature'))state().profile.badges.push('heat-signature');api.saveProfile();api.save();beep(980,.22,.075);vib([15,24,15,24,46]);setTimeout(()=>{closeScanner();api.toast('THERMAL SWEEP COMPLETE · $110 field bonus banked for closeout.')},360)}
  }
  function draw(){
   if(!active||!ctx||!canvas)return;resizeCanvas();const w=canvas.width,h=canvas.height,d=state().profile?.low?1:.82;ctx.clearRect(0,0,w,h);ctx.fillStyle='#071923';ctx.fillRect(0,0,w,h);
   const pad=w*.065,top=h*.09,rw=w-pad*2,rh=h*.79;ctx.fillStyle='#102b36';ctx.fillRect(pad,top,rw,rh);ctx.strokeStyle='rgba(203,229,220,.28)';ctx.lineWidth=Math.max(1,w/700);ctx.strokeRect(pad,top,rw,rh);
   ctx.strokeStyle='rgba(124,176,178,.12)';ctx.lineWidth=1;for(let i=1;i<8;i++){ctx.beginPath();ctx.moveTo(pad+rw*i/8,top);ctx.lineTo(pad+rw*i/8,top+rh);ctx.stroke()}for(let i=1;i<6;i++){ctx.beginPath();ctx.moveTo(pad,top+rh*i/6);ctx.lineTo(pad+rw,top+rh*i/6);ctx.stroke()}
   const equip=[{x:.34,y:.24,w:.14,h:.13},{x:.62,y:.23,w:.15,h:.12},{x:.40,y:.73,w:.12,h:.10}];ctx.fillStyle='rgba(7,21,28,.82)';ctx.strokeStyle='rgba(165,190,187,.28)';for(const e of equip){const ex=pad+e.x*rw,ey=top+e.y*rh,ew=e.w*rw,eh=e.h*rh;ctx.fillRect(ex-ew/2,ey-eh/2,ew,eh);ctx.strokeRect(ex-ew/2,ey-eh/2,ew,eh)}
   for(const s of spots){const cx=pad+s.x*rw,cy=top+s.y*rh,found=ensureRun()?.found.includes(s.id);const rr=Math.min(w,h)*(found?.055:.11);const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);grd.addColorStop(0,found?'rgba(240,210,101,.88)':'rgba(245,148,71,.78)');grd.addColorStop(.34,found?'rgba(240,210,101,.34)':'rgba(221,93,65,.34)');grd.addColorStop(1,'rgba(20,54,69,0)');ctx.fillStyle=grd;ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.fill();if(found){ctx.strokeStyle='rgba(240,210,101,.95)';ctx.lineWidth=Math.max(2,w/360);ctx.beginPath();ctx.arc(cx,cy,rr*.42,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f0d265';ctx.font=`900 ${Math.max(10,w/58)}px Arial`;ctx.fillText('LOCKED',cx-rr*.38,cy-rr*.52)}}
   if(d<1){ctx.fillStyle='rgba(4,14,20,.08)';for(let y=0;y<h;y+=4){ctx.fillRect(0,y,w,1)}}
  }
  function sync(){
   ensureUI();const s=state(),x=ensureRun();if(!x)return;const count=Object.keys(s.run?.findings||{}).length,show=!!(s.started&&s.run?.onRoof&&!s.run?.complete&&!s.photoMode&&!s.modal&&count>=1&&!x.complete&&!active);entry?.classList.toggle('hidden',!show);chip?.classList.toggle('hidden',!(s.started&&s.run?.onRoof&&x.complete));
   if(count>=1&&!x.complete&&!x.announced){x.announced=true;api.save();setTimeout(()=>api.toast('FIELD TOOL UNLOCKED · Run an optional thermal sweep for a $110 bonus.'),420)}
  }
  function applyReward(){
   const s=state(),r=s.run,p=ensureProfile(),x=ensureRun();if(!r||!x?.complete||x.applied)return;x.applied=true;p.cash=(Number(p.cash)||0)+BONUS;p.rep=Math.min(100,(Number(p.rep)||0)+1);r.pay=(Number(r.pay)||0)+BONUS;api.saveProfile();api.save();api.updateStats();api.chime();
  }
  function injectResult(){
   const s=state(),x=ensureRun(),body=$('sheetBody');if(!s.run?.complete||!x?.complete||!body||body.querySelector('.thermal-closeout-v21'))return;const card=document.createElement('div');card.className='thermal-closeout-v21';card.innerHTML=`<span>THERMAL SWEEP</span><b>✓ 3 / 3 SIGNATURES MAPPED</b><em>+$${BONUS} FIELD BONUS</em><small>${x.bestTime?.toFixed?.(1)||x.bestTime||'—'}s sweep · anomaly ≠ confirmed moisture</small>`;body.prepend(card)
  }
  function onStart(){base.onStart?.();ensureProfile();ensureRun();active=false;stopHum();document.body.classList.remove('thermal-active-v21');overlay?.classList.add('hidden');sync()}
  function recorded(f){base.recorded?.(f);sync()}
  function finished(){base.finished?.();closeScanner();applyReward();sync();setTimeout(injectResult,0)}
  function hud(){base.hud?.();const s=state(),x=ensureRun(),stamp=[s.run?.id,s.run?.onRoof,s.run?.complete,s.photoMode,s.modal,Object.keys(s.run?.findings||{}).length,x?.complete,x?.found?.length,active].join('|');if(stamp!==rafStamp){rafStamp=stamp;sync();setTimeout(injectResult,0)}}
  function frame(dt,t){base.frame?.(dt,t);if(!active)return;timeLeft=Math.max(0,timeLeft-dt);if(batteryEl)batteryEl.textContent=timeLeft.toFixed(1)+'s';if(entry)entry.style.setProperty('--thermal-pulse-v21',String(.55+.45*Math.sin(t*3.2)));updateReadout();if((Math.floor(t*18)%2)===0)draw();if(timeLeft<=0){beep(220,.18,.05);vib([35,45,35]);closeScanner();api.toast('THERMAL BATTERY DEPLETED · Reopen the tool to continue your mapped readings.')}}
  function garage(back){closeScanner();return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}
  function nextTarget(){return base.nextTarget?.()}
  function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureUI();const sheet=$('sheet');if(sheet&&g.MutationObserver){observer=new MutationObserver(()=>injectResult());observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V21={layoutFor,nearest,ensureRun,openScanner,captureReading,sync,state:()=>state()};}catch{}
  return {...base,onStart,recorded,finished,hud,frame,garage,scoreCard,nextTarget,photoBlocked,openThermalSweep:openScanner};
 };
})(typeof window!=='undefined'?window:globalThis);
