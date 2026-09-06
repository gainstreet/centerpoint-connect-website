/* ROOFTOP 0.15 — rooftop awareness HUD + operator art pass. */
'use strict';
((g)=>{
 const TAU=Math.PI*2;
 const ROOF_BOUNDS={minX:29.85,maxX:66.15,minZ:-49.15,maxZ:-18.85};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const normDeg=d=>((d%360)+360)%360;
 const headingDeg=yaw=>normDeg((Math.PI-yaw)*180/Math.PI);
 const bearingDeg=(from,to)=>normDeg(Math.atan2(to.x-from.x,-(to.z-from.z))*180/Math.PI);
 const signedDelta=(a,b)=>{let d=normDeg(a-b);return d>180?d-360:d};
 const edgeDistance=(p,b=ROOF_BOUNDS)=>Math.max(0,Math.min(p.x-b.minX,b.maxX-p.x,p.z-b.minZ,b.maxZ-p.z));
 const edgeState=d=>d<1.25?'danger':d<2.5?'caution':'safe';
 g.ROOFTOP_V15_HELPERS={ROOF_BOUNDS,headingDeg,bearingDeg,signedDelta,edgeDistance,edgeState};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer,conditions}=api;
  let compass=null,edge=null,operatorKit=null,perimeter=null,lastEdge='safe',lastBuzz=0,audio=null;

  function ensureHUD(){
   if(!compass){
    compass=document.createElement('div');compass.id='roofCompassV15';compass.className='roof-compass-v15 hidden';compass.innerHTML='<div class="compass-track-v15"><i data-dir="W">W</i><i data-dir="N">N</i><i data-dir="E">E</i><i data-dir="S">S</i><span class="compass-center-v15"></span><div id="compassTargetsV15"></div></div><div class="compass-readout-v15"><b id="headingV15">000°</b><span id="targetReadoutV15">ROOF AWARENESS</span></div>';
    document.body.appendChild(compass);
   }
   if(!edge){
    edge=document.createElement('div');edge.id='edgeWatchV15';edge.className='edge-watch-v15 hidden';edge.innerHTML='<span class="edge-icon-v15">◇</span><div><small>EDGE WATCH</small><b id="edgeTextV15">CLEAR</b></div><em id="edgeMetersV15">—</em>';
    document.body.appendChild(edge);
   }
  }
  function makeOperatorKit(){
   if(world.v15OperatorKit){operatorKit=world.v15OperatorKit;return operatorKit}
   const d=[];
   // Tool belt, knee pads, boot caps and a chest radio give the owner-operator a more readable silhouette.
   R3.box(d,0,1.18,0,.72,.14,.42,'#172a36');
   R3.box(d,-.37,1.15,.02,.18,.32,.28,'#8f6740');R3.box(d,.37,1.15,.02,.18,.32,.28,'#8f6740');
   R3.box(d,-.18,.64,.27,.23,.23,.09,'#243946');R3.box(d,.18,.64,.27,.23,.23,.09,'#243946');
   R3.box(d,-.19,.18,.25,.34,.15,.52,'#1d3039');R3.box(d,.19,.18,.25,.34,.15,.52,'#1d3039');
   R3.box(d,.29,1.73,.34,.18,.29,.08,'#263f4e');R3.box(d,.29,1.83,.39,.055,.11,.025,'#f0d265');
   // Tablet clipped at the hip.
   R3.box(d,-.46,1.05,.18,.32,.47,.07,'#152936');R3.box(d,-.46,1.05,.225,.25,.36,.018,'#88a4ae');
   const root=R3.node(renderer.mesh(d));root.visible=false;world.nodes.push(root);world.v15OperatorKit=root;operatorKit=root;return root;
  }
  function makePerimeter(){
   if(world.v15Perimeter){perimeter=world.v15Perimeter;return perimeter}
   const d=[],y=world.roofY+.055,inset=.95,w=ROOF_BOUNDS.maxX-ROOF_BOUNDS.minX-2*inset,depth=ROOF_BOUNDS.maxZ-ROOF_BOUNDS.minZ-2*inset,cx=(ROOF_BOUNDS.minX+ROOF_BOUNDS.maxX)/2,cz=(ROOF_BOUNDS.minZ+ROOF_BOUNDS.maxZ)/2;
   R3.box(d,cx,y,ROOF_BOUNDS.minZ+inset,w,.035,.10,'#d7b94f');R3.box(d,cx,y,ROOF_BOUNDS.maxZ-inset,w,.035,.10,'#d7b94f');
   R3.box(d,ROOF_BOUNDS.minX+inset,y,cz,.10,.035,depth,'#d7b94f');R3.box(d,ROOF_BOUNDS.maxX-inset,y,cz,.10,.035,depth,'#d7b94f');
   perimeter=R3.node(renderer.mesh(d));perimeter.visible=false;world.nodes.push(perimeter);world.v15Perimeter=perimeter;return perimeter;
  }
  function syncOperator(t){
   const s=state(),kit=makeOperatorKit(),p=s.player;if(!kit||!p)return;kit.x=p.x;kit.y=p.y;kit.z=p.z;kit.yaw=p.yaw;kit.visible=!!(s.started&&p.visible&&!s.photoMode);
   if(kit.visible&&!s.profile?.low)kit.y=Math.max(kit.y,p.y)+(Math.sin(t*2.2)*.012);
  }
  function beepDanger(){
   const s=state();if(!s.profile?.sound)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=audio||new AC();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),gain=audio.createGain();o.type='sine';o.frequency.setValueAtTime(760,audio.currentTime);o.frequency.setValueAtTime(980,audio.currentTime+.08);gain.gain.setValueAtTime(.0001,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.035,audio.currentTime+.012);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.18);o.connect(gain);gain.connect(audio.destination);o.start();o.stop(audio.currentTime+.19)}catch{}
  }
  function syncAwareness(){
   ensureHUD();const s=state(),run=s.run,p=s.player,onRoof=!!(s.started&&run?.onRoof&&!run.complete&&!s.photoMode);
   compass.classList.toggle('hidden',!onRoof);edge.classList.toggle('hidden',!onRoof);makePerimeter().visible=onRoof;
   if(!onRoof){lastEdge='safe';return}
   const hdg=headingDeg(p.yaw);$('headingV15').textContent=String(Math.round(hdg)).padStart(3,'0')+'°';
   const dirs={N:0,E:90,S:180,W:270};for(const el of compass.querySelectorAll('[data-dir]')){const diff=signedDelta(dirs[el.dataset.dir],hdg);el.style.left=(50+clamp(diff/90,-1,1)*44)+'%';el.style.opacity=Math.abs(diff)>95?'.16':'1'}
   const missing=conditions.filter(f=>!run.findings?.[f.id]);const targets=$('compassTargetsV15');targets.innerHTML='';let nearest=null,best=Infinity;
   for(const f of missing){const d=Math.hypot(f.x-p.x,f.z-p.z);if(d<best){best=d;nearest=f}const diff=signedDelta(bearingDeg(p,f),hdg),m=document.createElement('span');m.className='compass-target-v15';m.style.left=(50+clamp(diff/75,-1,1)*43)+'%';m.style.opacity=Math.abs(diff)>100?'.25':'1';m.textContent=f.id==='drain'?'D':f.id==='seam'?'S':'P';m.title=f.title;targets.appendChild(m)}
   $('targetReadoutV15').textContent=nearest?nearest.title.toUpperCase()+' · '+Math.round(best)+'m':'ALL CORE DETAILS LOGGED';
   const d=edgeDistance(p),es=edgeState(d);edge.dataset.state=es;$('edgeMetersV15').textContent=d.toFixed(1)+'m';$('edgeTextV15').textContent=es==='danger'?'BACK FROM EDGE':es==='caution'?'EDGE NEAR':'CLEAR';
   if(es==='danger'&&lastEdge!=='danger'&&performance.now()-lastBuzz>2500){lastBuzz=performance.now();try{navigator.vibrate?.([18,35,18])}catch{};beepDanger();api.toast('Edge nearby. Re-center on the roof before continuing.')}
   lastEdge=es;
  }
  function onStart(){base.onStart?.();ensureHUD();makeOperatorKit();makePerimeter();lastEdge='safe';syncAwareness()}
  function hud(){base.hud?.();syncAwareness()}
  function frame(dt,t){base.frame?.(dt,t);syncOperator(t);if((Math.floor(t*10)%2)===0)syncAwareness()}
  function recorded(f){base.recorded?.(f);syncAwareness()}
  function finished(){base.finished?.();syncAwareness()}
  function garage(back){return base.garage?.(back)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eyePos,target){return base.photoBlocked?.(eyePos,target)||false}
  ensureHUD();makeOperatorKit();makePerimeter();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V15={helpers:g.ROOFTOP_V15_HELPERS,state:()=>state(),operatorKit:()=>operatorKit,perimeter:()=>perimeter,syncAwareness};}catch{}
  return {...base,onStart,hud,frame,recorded,finished,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
