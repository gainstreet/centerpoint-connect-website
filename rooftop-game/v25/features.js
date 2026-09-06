/* ROOFTOP 0.25 — service-truck hero art pass + proximity/drive feedback. */
'use strict';
((g)=>{
 const PROXIMITY=9.5;
 const INTRO_MS=4200;
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const distance=(a,b)=>Math.hypot((a?.x||0)-(b?.x||0),(a?.z||0)-(b?.z||0));
 function flashPhase(t=0){const p=((Number(t)||0)*3.6)%2;return p<.32?0:p<.64?1:-1}
 function lampIntensity(driving,t=0){if(!driving)return .12;return .72+Math.sin((Number(t)||0)*5.2)*.18}
 g.ROOFTOP_V25_HELPERS={PROXIMITY,INTRO_MS,clamp,distance,flashPhase,lampIntensity};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer}=api;
  let ui=null,truckKit=null,lastMode='',introTimer=0,proximityRun='',keyflashUntil=0;

  function panelTexture(){
   const c=document.createElement('canvas');c.width=768;c.height=224;const x=c.getContext('2d');
   x.fillStyle='#142d3d';x.fillRect(0,0,c.width,c.height);x.fillStyle='#f0d265';x.fillRect(0,0,20,c.height);
   x.fillStyle='#f7f2dc';x.font='900 58px Arial';x.textBaseline='middle';x.fillText('ROOFTOP',48,82);
   x.fillStyle='#afc2c7';x.font='800 28px Arial';x.fillText('OWNER OPERATOR',50,137);
   x.fillStyle='#f0d265';x.font='900 22px Arial';x.fillText('COMMERCIAL ROOF SERVICE',50,184);
   return renderer.texture(c);
  }
  function addNode(parent,data,x=0,y=0,z=0,yaw=0){const n=R3.node(renderer.mesh(data),x,y,z);n.yaw=yaw;parent.children.push(n);return n}
  function boxNode(parent,x,y,z,w,h,d,color,yaw=0){const q=[];R3.box(q,0,0,0,w,h,d,color,yaw);return addNode(parent,q,x,y,z)}
  function cylinderNode(parent,x,y,z,r,h,color,s=10,r2=r){const q=[];R3.cylinder(q,0,0,0,r,h,color,s,r2);return addNode(parent,q,x,y,z)}
  function signNode(parent,side){
   const q=[];R3.quad(q,[-1.02,-.32,0],[1.02,-.32,0],[1.02,.32,0],[-1.02,.32,0],'#ffffff');
   const n=R3.node(renderer.mesh(q,panelTexture()),side*1.235,1.22,.28);n.yaw=side>0?Math.PI/2:-Math.PI/2;parent.children.push(n);return n;
  }
  function buildTruckKit(){
   if(world.v25TruckKit)return world.v25TruckKit;
   const truck=world.vehicle;if(!truck||!Array.isArray(truck.children))return null;
   const parts=[],amber=[],head=[],tail=[];
   // Contractor rack: four uprights, cross rails and side rails.
   for(const sx of [-1,1])for(const zz of [-1.34,1.25])parts.push(boxNode(truck,sx*1.03,2.46,zz,.11,1.62,.11,'#9bafb4'));
   for(const zz of [-1.34,1.25])parts.push(boxNode(truck,0,3.27,zz,2.28,.1,.12,'#b3c1c2'));
   for(const sx of [-1,1])parts.push(boxNode(truck,sx*1.04,3.02,-.05,.1,.1,3.35,'#9bafb4'));
   // Extension ladder: yellow rails and silver rungs, mounted high on passenger side.
   const ladder=R3.node(null,.68,3.36,-.08);truck.children.push(ladder);parts.push(ladder);
   for(const sx of [-1,1])boxNode(ladder,sx*.27,0,0,.09,.09,3.95,'#e8c34f');
   for(let z=-1.72;z<=1.73;z+=.39)boxNode(ladder,0,.015,z,.63,.07,.07,'#d9e0d8');
   // Bed-side toolboxes and recovery gear.
   for(const sx of [-1,1]){parts.push(boxNode(truck,sx*.9,1.55,-1.13,.56,.52,1.45,'#d6ddda'));parts.push(boxNode(truck,sx*.9,1.83,-1.13,.6,.07,1.48,'#293f4c'))}
   parts.push(cylinderNode(truck,-.68,1.48,-1.78,.24,.5,'#cf7b44',8,.15));
   parts.push(cylinderNode(truck,-.2,1.48,-1.78,.24,.5,'#cf7b44',8,.15));
   // Brand panels on both doors.
   parts.push(signNode(truck,-1));parts.push(signNode(truck,1));
   // Cab lightbar and marker pods.
   parts.push(boxNode(truck,0,3.07,.39,1.18,.08,.18,'#283d49'));
   amber.push(boxNode(truck,-.34,3.13,.39,.42,.08,.16,'#f1b94f'));
   amber.push(boxNode(truck,.34,3.13,.39,.42,.08,.16,'#f1b94f'));
   amber.push(boxNode(truck,-1.18,1.26,2.45,.13,.12,.09,'#f1b94f'));
   amber.push(boxNode(truck,1.18,1.26,2.45,.13,.12,.09,'#f1b94f'));
   // Headlights and tails make the truck read instantly at dusk/post-storm.
   for(const sx of [-1,1]){
    head.push(boxNode(truck,sx*.78,1.03,2.56,.52,.25,.08,'#fff3bd'));
    tail.push(boxNode(truck,sx*.83,1.05,-2.57,.36,.3,.08,'#c95a4e'));
   }
   world.v25TruckKit={parts,amber,head,tail,ladder};return world.v25TruckKit;
  }
  function ensureUI(){
   if(ui)return ui;
   ui=document.createElement('div');ui.id='serviceTruckV25';ui.className='service-truck-v25 hidden';
   ui.innerHTML='<div class="truck-kicker-v25"><span>UNIT 01</span><b>READY</b></div><div class="truck-title-v25">OWNER-OPERATOR SERVICE TRUCK</div><div class="truck-spec-v25"><span>▱ EXTENSION LADDER</span><span>▣ TOOL STORAGE</span><span>✦ WARNING LIGHTS</span></div>';
   document.getElementById('hud')?.appendChild(ui);return ui;
  }
  function showIntro(){
   ensureUI();if(!ui)return;clearTimeout(introTimer);ui.classList.remove('hidden');ui.classList.add('show-v25');
   introTimer=setTimeout(()=>{ui?.classList.remove('show-v25');setTimeout(()=>ui?.classList.add('hidden'),230)},INTRO_MS);
  }
  function vibrate(p){try{navigator.vibrate?.(p)}catch{}}
  function activateKeyflash(){
   const s=state();if(!s.run||proximityRun===s.run.id)return;proximityRun=s.run.id;keyflashUntil=performance.now()+1900;api.chime();vibrate([8,30,8]);
   api.toast('UNIT 01 READY · Ladder, tools and warning lights loaded.');showIntro();
  }
  function syncVisibility(){
   const kit=buildTruckKit(),s=state();if(!kit)return;
   const visible=!!s.started;for(const n of kit.parts)n.visible=visible;
  }
  function updateLights(t){
   const kit=truckKit||buildTruckKit(),s=state();if(!kit)return;truckKit=kit;
   const driving=!!(s.started&&s.run?.mode==='drive'&&!s.run?.complete),flash=flashPhase(t),key=performance.now()<keyflashUntil;
   kit.amber.forEach((n,i)=>n.visible=!!s.started&&(driving?((Math.floor(t*5)+i)%2===0):key?(flash===i%2):false));
   kit.head.forEach(n=>n.visible=driving);kit.tail.forEach(n=>n.visible=driving);
   if(kit.ladder)kit.ladder.rz=Math.sin(t*1.7)*.006;
  }
  function onStart(){base.onStart?.();truckKit=buildTruckKit();lastMode='';proximityRun='';keyflashUntil=0;syncVisibility();const s=state();if(s.started&&s.run?.mode==='walk'&&!s.run?.onRoof)setTimeout(showIntro,350)}
  function hud(){base.hud?.();const s=state();if(!s.started||!s.run)return;const mode=s.run.mode||'';if(mode!==lastMode){lastMode=mode;if(mode==='drive')showIntro()}}
  function frame(dt,t){
   base.frame?.(dt,t);const s=state();if(!s.started)return;updateLights(t);
   if(s.run?.mode==='walk'&&!s.run?.onRoof&&!s.modal&&!s.photoMode&&distance(s.player,s.truck)<=PROXIMITY)activateKeyflash();
  }
  function finished(){base.finished?.();clearTimeout(introTimer);ui?.classList.add('hidden');if(truckKit){truckKit.amber.forEach(n=>n.visible=false);truckKit.head.forEach(n=>n.visible=false);truckKit.tail.forEach(n=>n.visible=false)}}
  function garage(back){return base.garage?.(back)}function recorded(f){return base.recorded?.(f)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  truckKit=buildTruckKit();ensureUI();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V25={helpers:g.ROOFTOP_V25_HELPERS,truckKit:()=>({parts:truckKit?.parts?.length||0,amber:truckKit?.amber?.length||0,head:truckKit?.head?.length||0,tail:truckKit?.tail?.length||0}),updateLights};}catch{}
  return {...base,onStart,hud,frame,finished,garage,recorded,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
