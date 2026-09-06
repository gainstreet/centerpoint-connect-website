/* ROOFTOP 0.17 — interactive roof navigator + tap-to-pin inspection routing. */
'use strict';
((g)=>{
 const SIZE=420,PAD=34;
 const BOUNDS=g.ROOFTOP_V16_HELPERS?.BOUNDS||{minX:29.85,maxX:66.15,minZ:-49.15,maxZ:-18.85};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const mapPoint=(p,size=SIZE,pad=PAD,b=BOUNDS)=>({x:pad+(p.x-b.minX)/(b.maxX-b.minX)*(size-pad*2),y:pad+(p.z-b.minZ)/(b.maxZ-b.minZ)*(size-pad*2)});
 const nearest=(player,items)=>{let best=null,d=Infinity;for(const f of items){const n=Math.hypot(f.x-player.x,f.z-player.z);if(n<d){d=n;best=f}}return best?{condition:best,distance:d}:null};
 const chooseNext=(player,conditions,findings={},currentId='')=>{
  const missing=conditions.filter(f=>!findings[f.id]);if(!missing.length)return null;
  if(currentId&&missing.some(f=>f.id===currentId))return missing.find(f=>f.id===currentId);
  return nearest(player,missing)?.condition||missing[0];
 };
 const hitTarget=(x,y,conditions,radius=34)=>{let best=null,d=radius;for(const f of conditions){const p=mapPoint(f),n=Math.hypot(p.x-x,p.y-y);if(n<=d){d=n;best=f}}return best};
 g.ROOFTOP_V17_HELPERS={BOUNDS,mapPoint,nearest,chooseNext,hitTarget};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer,conditions}=api;
  let panel=null,nextButton=null,canvas=null,ctx=null,beacon=null,lastTargetId='',lastPulse=0;

  function missing(){const s=state();return conditions.filter(f=>!s.run?.findings?.[f.id])}
  function target(){const s=state(),run=s.run;if(!run)return null;const chosen=chooseNext(s.player,conditions,run.findings||{},run.navTargetV17||'');if(chosen&&run.navTargetV17!==chosen.id){run.navTargetV17=chosen.id;api.save?.()}return chosen}
  function setTarget(id,announce=true){const s=state(),run=s.run;if(!run)return null;const f=conditions.find(x=>x.id===id&&!run.findings?.[x.id]);if(!f)return null;run.navTargetV17=f.id;api.save?.();sync(true);if(announce){try{navigator.vibrate?.(10)}catch{};api.toast?.('Pinned '+f.title+'. Follow the gold route marker.')}return f}
  function cycleTarget(){const s=state(),run=s.run;if(!run)return;const m=missing();if(!m.length){api.toast?.('All core inspection details are documented.');return}const i=Math.max(-1,m.findIndex(f=>f.id===run.navTargetV17));setTarget(m[(i+1)%m.length].id)}

  function ensureHUD(){
   if(panel)return;
   panel=document.createElement('div');panel.id='roofNavV17';panel.className='roof-nav-v17 hidden';panel.innerHTML='<div class="roof-nav-copy-v17"><small>ACTIVE ROOF TARGET</small><b id="roofNavTitleV17">—</b><span id="roofNavMetaV17">Tap the roof map to pin a detail</span></div><button id="roofNavNextV17" type="button">NEXT</button>';
   document.body.appendChild(panel);nextButton=$('roofNavNextV17');nextButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();cycleTarget()});
  }
  function ensureMapTap(){
   canvas=$('roofRadarV16');if(!canvas||canvas.dataset.v17Tap==='1')return;
   canvas.dataset.v17Tap='1';ctx=canvas.getContext('2d');
   canvas.addEventListener('pointerup',e=>{
    const s=state();if(!s.started||!s.run?.onRoof||s.photoMode||s.modal)return;
    const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
    const x=(e.clientX-r.left)/r.width*canvas.width,y=(e.clientY-r.top)/r.height*canvas.height;
    const f=hitTarget(x,y,conditions,40);
    if(!f)return;
    e.preventDefault();e.stopPropagation();
    if(s.run.findings?.[f.id]){api.toast?.(f.title+' is already documented.');try{navigator.vibrate?.(6)}catch{};return}
    setTarget(f.id);
   });
  }
  function makeBeacon(){
   if(world.v17TargetBeacon){beacon=world.v17TargetBeacon;return beacon}
   const d=[];
   R3.box(d,0,.18,0,.12,.36,.12,'#f0d265');
   R3.box(d,0,.48,0,.72,.08,.12,'#fff0a6');R3.box(d,0,.48,0,.12,.08,.72,'#fff0a6');
   R3.box(d,0,.78,0,.48,.07,.10,'#f0d265');R3.box(d,0,.78,0,.10,.07,.48,'#f0d265');
   beacon=R3.node(renderer.mesh(d));beacon.visible=false;world.nodes.push(beacon);world.v17TargetBeacon=beacon;return beacon;
  }
  function drawSelection(){
   ensureMapTap();if(!canvas||!ctx)return;const s=state(),run=s.run;if(!s.started||!run?.onRoof||run.complete||s.photoMode)return;
   const f=target();if(!f)return;const p=mapPoint(f,canvas.width,PAD),now=performance.now(),pulse=6+3*(.5+.5*Math.sin(now/170));
   ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,24+pulse,0,Math.PI*2);ctx.strokeStyle='rgba(255,241,169,.92)';ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,32+pulse,0,Math.PI*2);ctx.strokeStyle='rgba(240,210,101,.22)';ctx.lineWidth=5;ctx.stroke();ctx.restore();
  }
  function sync(force=false){
   ensureHUD();ensureMapTap();const s=state(),run=s.run,onRoof=!!(s.started&&run?.onRoof&&!run.complete&&!s.photoMode);panel.classList.toggle('hidden',!onRoof);
   const b=makeBeacon();b.visible=false;if(!onRoof)return;
   const f=target();if(!f){$('roofNavTitleV17').textContent='ROOF COMPLETE';$('roofNavMetaV17').textContent='All core details documented';nextButton.disabled=true;return}
   nextButton.disabled=missing().length<2;
   const d=Math.hypot(f.x-s.player.x,f.z-s.player.z);$('roofNavTitleV17').textContent=f.title.toUpperCase();$('roofNavMetaV17').textContent=Math.round(d)+'m · TAP MAP MARKERS TO RE-ROUTE';
   b.x=f.x;b.z=f.z;b.y=world.roofY+.13+Math.sin(performance.now()/220)*.06;b.yaw=performance.now()/900;b.visible=true;
   if(force||lastTargetId!==f.id){panel.classList.remove('target-pop-v17');void panel.offsetWidth;panel.classList.add('target-pop-v17');lastTargetId=f.id}
   drawSelection();
  }
  function onStart(){base.onStart?.();ensureHUD();ensureMapTap();makeBeacon();sync(true)}
  function hud(){base.hud?.();sync()}
  function frame(dt,t){base.frame?.(dt,t);const s=state();if(s.started&&s.run?.onRoof&&!s.photoMode&&!s.run.complete){const b=makeBeacon(),f=target();if(f){b.x=f.x;b.z=f.z;b.y=world.roofY+.13+Math.sin(t*4.2)*.06;b.yaw=t*.9;b.visible=true}if(t-lastPulse>.12){lastPulse=t;drawSelection()}}else if(beacon)beacon.visible=false}
  function recorded(f){base.recorded?.(f);const s=state(),run=s.run;if(run&&run.navTargetV17===f?.id){run.navTargetV17='';const next=chooseNext(s.player,conditions,run.findings||{},'');if(next){run.navTargetV17=next.id;api.save?.();setTimeout(()=>api.toast?.('Evidence logged. Next target: '+next.title+'.'),120)}else{api.save?.();setTimeout(()=>api.toast?.('Roof grid complete. Open FIELD REPORT when ready.'),120)}}sync(true)}
  function finished(){base.finished?.();if(beacon)beacon.visible=false;sync()}
  function garage(back){if(beacon)beacon.visible=false;return base.garage?.(back)}
  function nextTarget(){const s=state(),run=s.run;if(s.started&&run?.onRoof&&!run.complete){const f=target();if(f)return f}return base.nextTarget?.()}
  function scoreCard(){return base.scoreCard?.()}function photoBlocked(eyePos,targetPos){return base.photoBlocked?.(eyePos,targetPos)||false}
  ensureHUD();makeBeacon();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V17={helpers:g.ROOFTOP_V17_HELPERS,target:()=>target(),setTarget,cycleTarget,beacon:()=>beacon,sync};}catch{}
  return {...base,onStart,hud,frame,recorded,finished,garage,nextTarget,scoreCard,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
