/* ROOFTOP 0.13 — Drone Survey: mobile-first aerial roof reconnaissance mini-mission. */
'use strict';
((g)=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const dist=(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0));
 const checkpointHit=(drone,point,r=24)=>dist(drone,point)<=r;
 const batteryAfter=(battery,dt,active=true)=>clamp(Number(battery||0)-(active?Math.max(0,dt):0),0,45);
 const CHECKPOINTS=[
  {id:'northwest',x:76,y:83,label:'NW PARAPET'},
  {id:'northeast',x:316,y:90,label:'HVAC OVERVIEW'},
  {id:'southeast',x:322,y:242,label:'DRAIN FIELD'},
  {id:'southwest',x:84,y:247,label:'SEAM RUN'}
 ];
 g.ROOFTOP_V13_HELPERS={clamp,dist,checkpointHit,batteryAfter,CHECKPOINTS};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get();
  let entry=null,hudChip=null,observer=null,raf=0,last=0,active=false,input={x:0,y:0,id:null},ctx=null,canvas=null,hum=null,audio=null;
  const PAD={x:198,y:286};
  function ensureProfile(){const p=state().profile;if(!Number.isFinite(p.droneSurveys))p.droneSurveys=0;if(!Array.isArray(p.badges))p.badges=[];return p}
  function ensureRun(){const r=state().run;if(!r)return null;if(!r.droneV13||r.droneV13.version!==1)r.droneV13={version:1,complete:false,applied:false,captured:[],battery:45};return r.droneV13}
  function ensureUI(){
   if(!entry){entry=document.createElement('button');entry.id='droneEntryV13';entry.className='drone-entry-v13 hidden';entry.innerHTML='<span>⌁</span><b>DRONE</b><small>SURVEY</small>';entry.onclick=openSurvey;const report=$('reportButton');report?.insertAdjacentElement('afterend',entry)}
   if(!hudChip){hudChip=document.createElement('div');hudChip.id='droneChipV13';hudChip.className='drone-chip-v13 hidden';hudChip.innerHTML='<span>DRONE SURVEY</span><b>0 / 4</b><small>AERIAL COVERAGE</small>';document.getElementById('hud')?.appendChild(hudChip)}
  }
  function canLaunch(){const s=state(),r=s.run;return !!(s.started&&r?.onRoof&&!r.complete&&!s.photoMode&&!s.modal)}
  function syncHUD(){ensureUI();const s=state(),r=s.run,d=ensureRun(),show=!!(s.started&&r?.onRoof&&!r.complete&&!s.photoMode);entry.classList.toggle('hidden',!show);if(!d){hudChip.classList.add('hidden');return}hudChip.classList.toggle('hidden',!show);hudChip.querySelector('b').textContent=(d.captured?.length||0)+' / 4';hudChip.querySelector('small').textContent=d.complete?'AERIAL COVERAGE COMPLETE':'AERIAL COVERAGE';hudChip.classList.toggle('complete',!!d.complete);entry.disabled=!!d.complete;entry.querySelector('small').textContent=d.complete?'DONE':'SURVEY'}
  function startHum(){if(!state().profile.sound)return;try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();hum=audio.createOscillator();const gain=audio.createGain();hum.type='sawtooth';hum.frequency.value=116;gain.gain.value=.012;hum.connect(gain);gain.connect(audio.destination);hum.start()}catch{}}
  function stopHum(){try{hum?.stop()}catch{}hum=null}
  function briefing(){const p=ensureProfile(),d=ensureRun();api.show('AERIAL / WESTGATE ROOF','Launch a quick drone survey.',`<div class="drone-brief-v13"><div class="drone-icon-v13">⌁</div><div><b>${d.complete?'SURVEY COMPLETE':'4 COVERAGE POINTS + RETURN TO PAD'}</b><p>Drag anywhere on the flight deck to steer. Fly through all four marked viewpoints, then return to the launch pad before the battery reaches zero.</p></div></div><div class="drone-stats-v13"><span><b>${p.droneSurveys}</b> surveys completed</span><span><b>+$90</b> fictional field bonus</span><span><b>+1</b> reputation</span></div><p class="note">Optional gameplay only. Drone rules, certifications and site requirements vary in real life; this is not operating guidance.</p>`,d.complete?[{label:'BACK TO ROOF',fn:api.close}]:[{label:'LAUNCH DRONE →',fn:launch},{label:'BACK TO ROOF',secondary:true,fn:api.close}])}
  function openSurvey(){if(!canLaunch()){api.toast('Get onto the roof and finish any open menu before launching.');return}briefing()}
  function launch(){
   const d=ensureRun();if(!d||d.complete)return;d.battery=45;d.captured=[];d.drone={x:PAD.x,y:PAD.y};api.save();
   api.show('DRONE SURVEY / WESTGATE','Build the aerial coverage map.',`<div class="drone-console-v13"><div class="drone-top-v13"><span>BATTERY <b id="droneBatteryV13">45</b>s</span><span>COVERAGE <b id="droneCoverageV13">0 / 4</b></span></div><canvas id="droneCanvasV13" width="400" height="320" aria-label="Top-down drone survey flight deck"></canvas><div class="drone-help-v13"><b>DRAG TO FLY</b><span>Hit all four rings, then return to the yellow H pad.</span></div></div>`,[{label:'LAND / EXIT',secondary:true,fn:()=>{stopFlight();api.close();syncHUD()}}]);
   document.getElementById('sheet')?.classList.add('drone-mode-v13');canvas=$('droneCanvasV13');ctx=canvas?.getContext('2d');if(!canvas||!ctx){api.toast('Drone display unavailable on this device.');return}
   input={x:0,y:0,id:null};active=true;last=performance.now();
   const steer=(e)=>{const r=canvas.getBoundingClientRect(),cx=(e.clientX-r.left)/r.width*canvas.width,cy=(e.clientY-r.top)/r.height*canvas.height,d=ensureRun()?.drone||PAD,dx=cx-d.x,dy=cy-d.y,m=Math.hypot(dx,dy)||1;input.x=dx/m;input.y=dy/m};
   canvas.onpointerdown=e=>{e.preventDefault();input.id=e.pointerId;canvas.setPointerCapture?.(e.pointerId);steer(e);startHum()};
   canvas.onpointermove=e=>{if(input.id===e.pointerId)steer(e)};
   const release=e=>{if(input.id===e.pointerId){input={x:0,y:0,id:null};stopHum()}};
   canvas.onpointerup=release;canvas.onpointercancel=release;canvas.onlostpointercapture=release;
   raf=requestAnimationFrame(tick);
  }
  function stopFlight(){active=false;cancelAnimationFrame(raf);raf=0;stopHum();document.getElementById('sheet')?.classList.remove('drone-mode-v13');input={x:0,y:0,id:null}}
  function draw(d,t){
   const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#101c25';ctx.fillRect(0,0,w,h);
   const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#203847');sky.addColorStop(1,'#172833');ctx.fillStyle=sky;ctx.fillRect(18,22,364,278);
   ctx.fillStyle='#cfd9d1';ctx.fillRect(42,48,316,222);ctx.strokeStyle='#8ea29e';ctx.lineWidth=3;ctx.strokeRect(42,48,316,222);
   ctx.strokeStyle='rgba(56,82,85,.24)';ctx.lineWidth=1;for(let x=72;x<350;x+=36){ctx.beginPath();ctx.moveTo(x,50);ctx.lineTo(x,268);ctx.stroke()}for(let y=76;y<265;y+=38){ctx.beginPath();ctx.moveTo(44,y);ctx.lineTo(356,y);ctx.stroke()}
   const units=[[236,75,58,34],[206,139,43,35],[101,94,42,36]];for(const [x,y,ww,hh] of units){ctx.fillStyle='#81979a';ctx.fillRect(x,y,ww,hh);ctx.fillStyle='#38515d';ctx.fillRect(x+8,y+7,ww-16,hh-14)}
   ctx.fillStyle='#5a6f6d';ctx.beginPath();ctx.arc(305,221,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#536966';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(145,170);ctx.lineTo(205,170);ctx.stroke();
   ctx.fillStyle='#e9c95c';ctx.beginPath();ctx.arc(PAD.x,PAD.y,20,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1b2b36';ctx.font='900 18px Arial';ctx.textAlign='center';ctx.fillText('H',PAD.x,PAD.y+6);
   CHECKPOINTS.forEach((p,i)=>{const done=d.captured.includes(p.id),pulse=3+Math.sin(t*.006+i)*3;ctx.beginPath();ctx.arc(p.x,p.y,done?12:19+pulse,0,Math.PI*2);ctx.strokeStyle=done?'#6cc692':'#f0d265';ctx.lineWidth=done?4:3;ctx.stroke();ctx.fillStyle=done?'#6cc692':'#f4e6a5';ctx.font='800 10px Arial';ctx.fillText(done?'✓':String(i+1),p.x,p.y+3);});
   ctx.strokeStyle='rgba(240,210,101,.24)';ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(PAD.x,PAD.y);for(const p of CHECKPOINTS)ctx.lineTo(p.x,p.y);ctx.stroke();ctx.setLineDash([]);
   const q=d.drone||PAD;ctx.save();ctx.translate(q.x,q.y);ctx.strokeStyle='#10202a';ctx.lineWidth=4;for(const [x,y] of [[-10,-10],[10,-10],[-10,10],[10,10]]){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.arc(x,y,5+Math.sin(t*.03)*1.3,0,Math.PI*2);ctx.stroke()}ctx.fillStyle='#f0d265';ctx.fillRect(-6,-5,12,10);ctx.restore();
  }
  function award(d){if(d.applied)return;const p=ensureProfile();d.complete=true;d.applied=true;p.cash+=90;p.rep=clamp((Number(p.rep)||0)+1,0,100);p.droneSurveys+=1;if(!p.badges.includes('eyes-in-sky'))p.badges.push('eyes-in-sky');api.saveProfile();api.save();api.updateStats();api.chime();try{navigator.vibrate?.([22,30,22,30,70])}catch{};stopFlight();api.close();syncHUD();api.toast('AERIAL COVERAGE COMPLETE · +$90 · +1 REP')}
  function tick(now){
   if(!active)return;const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;const d=ensureRun();if(!d)return stopFlight();d.battery=batteryAfter(d.battery,dt,true);const q=d.drone||(d.drone={x:PAD.x,y:PAD.y});const speed=112;q.x=clamp(q.x+input.x*speed*dt,28,372);q.y=clamp(q.y+input.y*speed*dt,34,298);
   for(const p of CHECKPOINTS){if(!d.captured.includes(p.id)&&checkpointHit(q,p,25)){d.captured.push(p.id);api.chime();try{navigator.vibrate?.(18)}catch{};api.toast('AERIAL POINT '+d.captured.length+'/4 · '+p.label);}}
   const returned=d.captured.length===CHECKPOINTS.length&&checkpointHit(q,PAD,24);if(returned)return award(d);
   if(d.battery<=0){stopFlight();api.save();api.toast('DRONE BATTERY EMPTY · LAND AND RETRY');document.getElementById('sheetTitle').textContent='Battery empty. No core pay lost.';document.getElementById('sheetBody').innerHTML='<div class="drone-fail-v13"><b>0:00</b><p>The drone returned to its launch point. Retry the optional aerial survey whenever you are ready.</p></div>';document.getElementById('sheetActions').innerHTML='';const b=document.createElement('button');b.className='primary';b.textContent='RETRY SURVEY';b.onclick=launch;document.getElementById('sheetActions').appendChild(b);const c=document.createElement('button');c.className='secondary';c.textContent='BACK TO ROOF';c.onclick=()=>{api.close();syncHUD()};document.getElementById('sheetActions').appendChild(c);return}
   draw(d,now);const bat=$('droneBatteryV13'),cov=$('droneCoverageV13');if(bat)bat.textContent=Math.ceil(d.battery);if(cov)cov.textContent=d.captured.length+' / 4';raf=requestAnimationFrame(tick)
  }
  function injectResult(){const s=state(),r=s.run,d=ensureRun(),body=$('sheetBody');if(!r?.complete||!d?.complete||!body||body.querySelector('.drone-result-v13'))return;const card=document.createElement('div');card.className='drone-result-v13';card.innerHTML='<span>⌁</span><div><small>AERIAL SURVEY</small><strong>4/4 COVERAGE + SAFE RETURN</strong><em>Eyes in the Sky badge · +$90 · +1 reputation</em></div><b>COMPLETE</b>';body.prepend(card)}
  function onStart(){base.onStart?.();ensureProfile();ensureRun();ensureUI();syncHUD()}
  function finished(){base.finished?.();stopFlight();syncHUD();setTimeout(injectResult,0)}
  function hud(){base.hud?.();syncHUD();setTimeout(injectResult,0)}
  function frame(dt,t){base.frame?.(dt,t)}
  function recorded(f){base.recorded?.(f)}function garage(back){return base.garage?.(back)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureProfile();ensureUI();
  const sheet=$('sheet');if(sheet&&window.MutationObserver){observer=new MutationObserver(()=>{if(!active)document.getElementById('sheet')?.classList.remove('drone-mode-v13');injectResult()});observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))window.__ROOFTOP_V13={state:()=>state(),CHECKPOINTS,openSurvey,launch,checkpointHit,batteryAfter}}catch{}
  return {...base,onStart,finished,hud,frame,recorded,garage,scoreCard,nextTarget,photoBlocked,droneSurvey:openSurvey};
 };
})(typeof window!=='undefined'?window:globalThis);
