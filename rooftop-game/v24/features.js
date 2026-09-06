/* ROOFTOP 0.24 — live rooftop mechanical equipment + optional mechanical walkdown. */
'use strict';
((g)=>{
 const BONUS=60;
 const SCAN_RANGE=4.8;
 const HUD_RANGE=10.5;
 const UNITS=[
  {id:'RTU-1',x:49,z:-43,w:4.5,d:3.5,fans:2,label:'AISLE 6 RTU'},
  {id:'RTU-2',x:53,z:-31,w:3.3,d:3.6,fans:2,label:'CENTER RTU'},
  {id:'RTU-3',x:39,z:-41,w:3,d:3,fans:2,label:'WEST RTU'}
 ];
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const distance=(a,b)=>Math.hypot((a?.x||0)-b.x,(a?.z||0)-b.z);
 function nearestUnit(pos){return UNITS.map((u,i)=>({unit:u,index:i,distance:distance(pos,u)})).sort((a,b)=>a.distance-b.distance)[0]||null}
 function fanSpeed(index,t=0){return 5.4+(index%3)*.75+Math.sin((Number(t)||0)*.45+index)*.45}
 function simulatedNoise(d){return Math.round(clamp(77-(Number(d)||0)*2.25,54,76))}
 g.ROOFTOP_V24_HELPERS={BONUS,SCAN_RANGE,HUD_RANGE,UNITS,clamp,distance,nearestUnit,fanSpeed,simulatedNoise};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer}=api;
  let card=null,fans=[],leds=[],roofActive=false,humCtx=null,humOscA=null,humOscB=null,humGain=null,lastHud='',observer=null;

  function ensureRun(){
   const r=state().run;if(!r)return null;
   if(!r.mechanicalV24||r.mechanicalV24.version!==1)r.mechanicalV24={version:1,scanned:[],complete:false,applied:false,announced:false};
   if(!Array.isArray(r.mechanicalV24.scanned))r.mechanicalV24.scanned=[];
   return r.mechanicalV24;
  }
  function buildFan(unit,fanIndex){
   const geom=[],side=fanIndex===0?-1:1,fx=unit.x+side*unit.w*.225,fy=world.roofY+1.91,fz=unit.z;
   R3.cylinder(geom,0,.018,0,.17,.055,'#273944',12,.17);
   for(let i=0;i<4;i++)R3.box(geom,0,.03,0,.12,.035,1.02,i%2?'#475d66':'#344a55',i*Math.PI/2+Math.PI/4);
   const n=R3.node(renderer.mesh(geom),fx,fy,fz);world.nodes.push(n);return n;
  }
  function buildLed(unit){
   const geom=[];R3.box(geom,0,0,0,.16,.09,.035,'#e6ba4f');
   const n=R3.node(renderer.mesh(geom),unit.x,world.roofY+1.34,unit.z+unit.d/2+.031);world.nodes.push(n);return n;
  }
  function makeMechanical(){
   if(world.v24Mechanical){fans=world.v24Mechanical.fans||[];leds=world.v24Mechanical.leds||[];return}
   try{
    fans=[];leds=[];for(const u of UNITS){for(let i=0;i<u.fans;i++)fans.push(buildFan(u,i));leds.push(buildLed(u))}
    world.v24Mechanical={fans,leds};
   }catch{}
  }
  function ensureUI(){
   if(card)return card;
   card=document.createElement('div');card.id='mechanicalHudV24';card.className='mechanical-hud-v24 hidden';
   card.innerHTML='<div class="mech-head-v24"><span><i class="mech-fan-v24">✣</i> MECHANICAL LIVE</span><b id="mechProgressV24">0 / 3</b></div><div class="mech-main-v24"><div><small id="mechUnitV24">RTU-1</small><strong id="mechLabelV24">AISLE 6 RTU</strong></div><div class="mech-status-v24"><b>RUNNING</b><span id="mechDistanceV24">— M</span></div></div><div class="mech-meter-v24"><i id="mechMeterV24"></i></div><div class="mech-foot-v24"><span id="mechNoiseV24">SIM NOISE 54 dBA</span><b id="mechScanV24">WALK CLOSER TO LOG</b></div>';
   document.getElementById('hud')?.appendChild(card);return card;
  }
  function vibrate(p){try{navigator.vibrate?.(p)}catch{}}
  function stopHum(){try{humOscA?.stop();humOscB?.stop()}catch{}humOscA=humOscB=humGain=null}
  function syncHum(d){
   const s=state();if(!roofActive||!s.profile?.sound||!Number.isFinite(d)||d>HUD_RANGE)return stopHum();
   try{
    if(!humCtx)humCtx=new (g.AudioContext||g.webkitAudioContext)();if(humCtx.state==='suspended')humCtx.resume();
    if(!humGain){
     humGain=humCtx.createGain();humGain.gain.value=.001;humGain.connect(humCtx.destination);
     humOscA=humCtx.createOscillator();humOscB=humCtx.createOscillator();humOscA.type='sawtooth';humOscB.type='sine';humOscA.frequency.value=58;humOscB.frequency.value=116;humOscA.connect(humGain);humOscB.connect(humGain);humOscA.start();humOscB.start();
    }
    const closeness=1-clamp((d-2)/(HUD_RANGE-2));humGain.gain.value=.002+closeness*.012;
   }catch{}
  }
  function applyScan(unit){
   const x=ensureRun();if(!x||x.scanned.includes(unit.id))return;
   x.scanned.push(unit.id);x.scanned=x.scanned.slice(0,UNITS.length);x.complete=x.scanned.length>=UNITS.length;api.save();api.chime();vibrate([10,22,10]);
   api.toast(x.complete?`MECHANICAL WALKDOWN COMPLETE · ${UNITS.length}/${UNITS.length} RTUs logged. $${BONUS} closeout bonus banked.`:`${unit.id} LOGGED · ${x.scanned.length}/${UNITS.length} rooftop units checked.`);
  }
  function updateCard(pos){
   const x=ensureRun(),near=nearestUnit(pos);if(!card||!x||!near)return;
   const show=roofActive&&near.distance<=HUD_RANGE;card.classList.toggle('hidden',!show);if(!show){syncHum(Infinity);return}
   const logged=x.scanned.includes(near.unit.id),ratio=1-clamp(near.distance/HUD_RANGE);
   $('mechProgressV24').textContent=`${x.scanned.length} / ${UNITS.length}`;$('mechUnitV24').textContent=near.unit.id;$('mechLabelV24').textContent=near.unit.label;$('mechDistanceV24').textContent=`${near.distance.toFixed(1)} M`;
   $('mechNoiseV24').textContent=`SIM NOISE ${simulatedNoise(near.distance)} dBA`;$('mechMeterV24').style.width=`${Math.round(18+ratio*82)}%`;
   $('mechScanV24').textContent=logged?'✓ LOGGED':near.distance<=SCAN_RANGE?'AUTO-LOGGING…':'WALK CLOSER TO LOG';card.classList.toggle('logged-v24',logged);card.classList.toggle('scan-v24',!logged&&near.distance<=SCAN_RANGE);
   if(!logged&&near.distance<=SCAN_RANGE)applyScan(near.unit);syncHum(near.distance);
  }
  function syncVisibility(){
   ensureUI();makeMechanical();const s=state();roofActive=!!(s.started&&s.run?.onRoof&&!s.run?.complete&&!s.photoMode);
   const low=!!s.profile?.low;fans.forEach((n,i)=>n.visible=roofActive&&!low);leds.forEach(n=>n.visible=roofActive);if(!roofActive){card?.classList.add('hidden');stopHum()}
  }
  function injectCloseout(){
   const s=state(),x=ensureRun(),body=$('sheetBody');if(!s.run?.complete||!x?.complete||!body||body.querySelector('.mechanical-closeout-v24'))return;
   const el=document.createElement('div');el.className='mechanical-closeout-v24';el.innerHTML=`<span>MECHANICAL WALKDOWN</span><b>✓ ${UNITS.length}/${UNITS.length} RTUs LOGGED</b><em>+$${BONUS} FIELD BONUS</em>`;body.prepend(el);
  }
  function applyReward(){
   const s=state(),r=s.run,p=s.profile,x=ensureRun();if(!r||!p||!x||!x.complete||x.applied)return;
   x.applied=true;p.cash=(Number(p.cash)||0)+BONUS;p.rep=Math.min(100,(Number(p.rep)||0)+1);r.pay=(Number(r.pay)||0)+BONUS;
   if(!Array.isArray(p.badges))p.badges=[];if(!p.badges.includes('mechanical-eyes'))p.badges.push('mechanical-eyes');api.saveProfile();api.save();api.updateStats();
  }
  function onStart(){base.onStart?.();ensureRun();ensureUI();makeMechanical();lastHud='';syncVisibility()}
  function hud(){base.hud?.();const s=state(),x=ensureRun();if(!x)return;const stamp=[s.run?.id,s.started,s.run?.onRoof,s.run?.complete,s.photoMode,s.profile?.sound,s.profile?.low,x.scanned.join(',')].join('|');if(stamp!==lastHud){lastHud=stamp;syncVisibility();setTimeout(injectCloseout,0)}}
  function frame(dt,t){
   base.frame?.(dt,t);if(!roofActive)return;
   if(!state().profile?.low)fans.forEach((n,i)=>{n.yaw=(n.yaw||0)+Math.min(.05,Math.max(0,dt))*fanSpeed(i,t)});
   leds.forEach((n,i)=>n.visible=roofActive&&(Math.sin(t*3.2+i*1.7)>.05));updateCard(world.player);
  }
  function recorded(f){base.recorded?.(f);syncVisibility()}
  function finished(){base.finished?.();applyReward();roofActive=false;card?.classList.add('hidden');fans.forEach(n=>n.visible=false);leds.forEach(n=>n.visible=false);stopHum();setTimeout(injectCloseout,0)}
  function garage(back){roofActive=false;card?.classList.add('hidden');fans.forEach(n=>n.visible=false);leds.forEach(n=>n.visible=false);stopHum();return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureUI();makeMechanical();const sheet=$('sheet');if(sheet&&g.MutationObserver){observer=new MutationObserver(()=>injectCloseout());observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V24={helpers:g.ROOFTOP_V24_HELPERS,state:()=>state(),ensureRun,updateCard,applyReward,mechanical:()=>({fans:fans.length,leds:leds.length,active:roofActive})};}catch{}
  return {...base,onStart,hud,frame,recorded,finished,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
