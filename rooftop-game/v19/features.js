/* ROOFTOP 0.19 — commercial roof authenticity pass + cinematic roof arrival. */
'use strict';
((g)=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const ROOF_INTEL={system:'60 MIL TPO',age:'11 YRS',area:'32,000 SQ FT',zone:'WESTGATE PLAZA'};
 g.ROOFTOP_V19_HELPERS={clamp,ROOF_INTEL};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer}=api;
  let intel=null,arrival=null,authNodes=[],roofWasActive=false,arrivalTimer=0;

  function nodeFrom(build){const d=[];build(d);const n=R3.node(renderer.mesh(d));world.nodes.push(n);authNodes.push(n);return n}
  function box(d,x,y,z,w,h,depth,color,yaw=0){R3.box(d,x,y,z,w,h,depth,color,yaw)}
  function cyl(d,x,y,z,r,h,color,segments=10,r2=r){R3.cylinder(d,x,y,z,r,h,color,segments,r2)}
  function makeRoofAuthenticity(){
   if(world.v19RoofAuthenticity){authNodes=world.v19RoofAuthenticity;return authNodes}
   const y=world.roofY;
   // Walkway pads from hatch toward the service zone.
   for(const [x,z,w,d] of [[35,-22,4.5,1.15],[39.5,-22,4,1.15],[44,-24,1.15,4.8],[44,-28.3,1.15,3.6],[46.8,-30,4.4,1.15]]){
    const n=nodeFrom(g=>box(g,0,.025,0,w,.035,d,'#7e8b86'));n.x=x;n.y=y+.035;n.z=z;
   }
   // Contrasting hatch landing and caution corners.
   const landing=nodeFrom(g=>{
    box(g,0,.02,0,4.3,.035,3.6,'#9ba39c');
    const c='#e6c75c';
    box(g,-1.7,.055,-1.35,.72,.04,.12,c,.55);box(g,1.7,.055,-1.35,.72,.04,.12,c,-.55);
    box(g,-1.7,.055,1.35,.72,.04,.12,c,-.55);box(g,1.7,.055,1.35,.72,.04,.12,c,.55);
   });landing.x=33.3;landing.y=y+.04;landing.z=-21.8;
   // Skylights with raised curbs, safely outside the core inspection targets.
   for(const [x,z] of [[36.5,-35],[62,-32.5]]){
    const n=nodeFrom(g=>{box(g,0,.18,0,3.2,.34,2.15,'#6e7f82');box(g,0,.39,0,2.72,.16,1.68,'#a9c3c8');box(g,0,.49,0,2.45,.05,1.42,'#d3e3e1')});n.x=x;n.y=y;n.z=z;
   }
   // Plumbing vents and rain caps.
   for(const [x,z] of [[62,-45],[36,-27],[64,-22.5],[40,-47]]){
    const n=nodeFrom(g=>{cyl(g,0,.58,0,.19,1.05,'#4c616b',10);cyl(g,0,1.11,0,.34,.10,'#9aa9aa',12,.24);cyl(g,0,1.19,0,.25,.05,'#c1cbca',12,.34)});n.x=x;n.y=y+.05;n.z=z;
   }
   // Yellow gas line / pipe supports near mechanical units.
   const gas=nodeFrom(g=>{
    const c='#d3a83d';
    box(g,0,.24,0,9.2,.12,.12,c);box(g,4.55,.24,2.2,.12,.12,4.4,c);
    for(const x of [-4,-2,0,2,4]){box(g,x,.105,0,.35,.18,.42,'#59676b');box(g,x,.20,0,.15,.18,.15,c)}
    for(const z of [.6,1.6,2.7,3.7]){box(g,4.55,.105,z,.35,.18,.42,'#59676b');box(g,4.55,.20,z,.15,.18,.15,c)}
   });gas.x=48;gas.y=y+.02;gas.z=-36.2;
   // Small roof-maintenance staging area: pavers, repair roll, bucket and cone.
   const staging=nodeFrom(g=>{
    for(const [x,z] of [[-.75,-.55],[.05,-.55],[-.75,.2],[.05,.2]])box(g,x,.04,z,.68,.08,.68,'#777f7d');
    cyl(g,.85,.32,.25,.28,.58,'#c8cbc2',12);cyl(g,.85,.63,.25,.30,.05,'#3b4d55',12);
    cyl(g,-.15,.34,.85,.28,.62,'#d6d7cd',12);cyl(g,-.15,.66,.85,.30,.05,'#4e6269',12);
    cyl(g,1.35,.42,-.65,.34,.74,'#d88a49',7,.07);cyl(g,1.35,.49,-.65,.21,.11,'#f1ead0',7,.14);
   });staging.x=62.8;staging.y=y+.04;staging.z=-37.5;
   // Low perimeter coping accents make the roof edge read more clearly at a glance.
   const coping=nodeFrom(g=>{const c='#aebbb8';box(g,0,.12,-15.05,36.1,.12,.20,c);box(g,0,.12,15.05,36.1,.12,.20,c);box(g,-18.05,.12,0,.20,.12,30.1,c);box(g,18.05,.12,0,.20,.12,30.1,c)});coping.x=48;coping.y=y+.37;coping.z=-34;
   world.v19RoofAuthenticity=authNodes;
   return authNodes;
  }

  function ensureHUD(){
   if(intel)return;
   intel=document.createElement('div');intel.id='roofIntelV19';intel.className='roof-intel-v19 hidden';
   intel.innerHTML='<small>ROOF SYSTEM</small><b>60 MIL TPO</b><span>11 YRS · 32,000 SQ FT</span>';
   document.body.appendChild(intel);
   arrival=document.createElement('div');arrival.id='roofArrivalV19';arrival.className='roof-arrival-v19 hidden';
   arrival.innerHTML='<div class="roof-arrival-rule-v19"></div><small>ACTIVE COMMERCIAL ROOF</small><h2>WESTGATE PLAZA</h2><p>60 MIL TPO <i>·</i> 32,000 SQ FT <i>·</i> YEAR 11</p><span>DOCUMENT THE CONDITION. MAKE THE CALL.</span>';
   document.body.appendChild(arrival);
  }
  function showArrival(){
   ensureHUD();clearTimeout(arrivalTimer);arrival.classList.remove('hidden','out-v19');void arrival.offsetWidth;arrival.classList.add('in-v19');
   arrivalTimer=setTimeout(()=>{arrival.classList.add('out-v19');setTimeout(()=>arrival.classList.add('hidden'),480)},2600);
  }
  function sync(){
   ensureHUD();const s=state(),run=s.run,onRoof=!!(s.started&&run?.onRoof&&!run.complete&&!s.photoMode);
   intel.classList.toggle('hidden',!onRoof);
   if(onRoof&&!roofWasActive)showArrival();
   roofWasActive=onRoof;
  }
  function onStart(){base.onStart?.();makeRoofAuthenticity();roofWasActive=false;sync()}
  function hud(){base.hud?.();sync()}
  function frame(dt,t){base.frame?.(dt,t);sync();if(authNodes.length){const s=state(),visible=!!(s.started&&s.run?.onRoof);for(const n of authNodes)n.visible=visible}}
  function recorded(f){base.recorded?.(f);sync()}
  function finished(){base.finished?.();if(intel)intel.classList.add('hidden');if(arrival)arrival.classList.add('hidden');for(const n of authNodes)n.visible=false}
  function garage(back){if(intel)intel.classList.add('hidden');if(arrival)arrival.classList.add('hidden');for(const n of authNodes)n.visible=false;return base.garage?.(back)}
  function nextTarget(){return base.nextTarget?.()}function scoreCard(){return base.scoreCard?.()}function photoBlocked(eyePos,targetPos){return base.photoBlocked?.(eyePos,targetPos)||false}
  ensureHUD();makeRoofAuthenticity();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V19={helpers:g.ROOFTOP_V19_HELPERS,nodes:()=>authNodes,sync,showArrival};}catch{}
  return {...base,onStart,hud,frame,recorded,finished,garage,nextTarget,scoreCard,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
